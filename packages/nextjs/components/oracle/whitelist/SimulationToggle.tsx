import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useGlobalState } from "~~/services/store/store";
import { INITIAL_ETH_PRICE, SIMPLE_ORACLE_ABI } from "~~/utils/constants";
import { getParsedError } from "~~/utils/scaffold-eth/getParsedError";
import { notification } from "~~/utils/scaffold-eth/notification";

export const SimulationToggle = ({
  oracleAddresses,
}: {
  oracleAddresses: { address: string; originalIndex: number }[];
}) => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const publicClient = usePublicClient();
  const { address: connectedAddress } = useAccount();

  const { writeContractAsync } = useWriteContract();

  const handlePriceUpdate = async (address: string, nonce: number) => {
    try {
      const variances = [5, 10, 20, 200, 500];
      const variance = variances[Math.floor(Math.random() * variances.length)];
      // Apply variance to price: random offset in [-variance, +variance]
      const basePrice = nativeCurrencyPrice > 0 ? nativeCurrencyPrice : INITIAL_ETH_PRICE;
      const randomOffset = Math.floor(Math.random() * (2 * variance + 1)) - variance;
      const randomPrice = parseEther(String(basePrice + randomOffset));

      await writeContractAsync({
        abi: SIMPLE_ORACLE_ABI,
        address: address,
        functionName: "setPrice",
        args: [randomPrice],
        nonce: nonce,
      });
      console.log(`Oracle ${address} updated price to ${randomPrice}`);
    } catch (error: any) {
      // Handle nonce errors more gracefully
      if (error?.message?.includes("nonce") || error?.message?.includes("Nonce")) {
        console.log(`Nonce conflict for oracle ${address}, will retry on next cycle`);
      } else if (error?.message?.includes("enough funds")) {
        notification.error("Not enough funds to update price");
        setIsSimulating(false);
      } else {
        notification.error(`Error updating price for oracle ${address}: ${getParsedError(error)}`);
      }
    }
  };

  // Set up simulation with 4-second intervals
  useEffect(() => {
    if (!isSimulating) return;

    let intervalId: NodeJS.Timeout | null = null;

    // Update prices for all oracles with staggered timing
    const updateAllOracles = async () => {
      if (!oracleAddresses || oracleAddresses.length === 0 || !connectedAddress || !publicClient) return;
      const latestNonce = await publicClient.getTransactionCount({
        address: connectedAddress,
        blockTag: "latest",
      });

      console.log(`🔄 Starting oracle update cycle for ${oracleAddresses.length} oracles`);
      let nonce = latestNonce;
      oracleAddresses.forEach(oracle => {
        // 40% chance to skip reporting (simulate oracle not responding)
        if (Math.random() < 0.4) {
          console.log(`Oracle ${oracle.address} skipped reporting this cycle (60% chance)`);
        } else {
          handlePriceUpdate(oracle.address, nonce);
          nonce++;
        }
      });
    };

    // Start immediately without initial delay
    updateAllOracles();

    // Set up recurring updates every 4 seconds
    intervalId = setInterval(() => {
      updateAllOracles();
    }, 4000); // Fixed 4-second interval

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulating]);

  const toggleSimulation = async () => {
    setIsSimulating(!isSimulating);
  };

  return (
    <div className={`${isSimulating ? "bg-success/50" : "bg-base-100"} rounded-lg p-2 transition-colors duration-200`}>
      <div className="flex items-center justify-center gap-4">
        <h3 className="text-lg mb-0 font-bold text-base-content">Simulation</h3>
        <input type="checkbox" className="toggle toggle-success" onChange={toggleSimulation} checked={isSimulating} />
      </div>
    </div>
  );
};
