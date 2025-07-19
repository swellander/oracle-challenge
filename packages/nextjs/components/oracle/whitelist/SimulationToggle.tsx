import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const SimulationToggle = ({
  oracleAddresses,
}: {
  oracleAddresses: { address: string; originalIndex: number }[];
}) => {
  const { data: price } = useScaffoldReadContract({
    contractName: "WhitelistOracle",
    functionName: "getPrice",
  }) as { data: bigint | undefined };

  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const abi_simple_oracle = deployedContracts[31337].SimpleOracle_1.abi;

  const { writeContractAsync } = useWriteContract();

  const handlePriceUpdate = async (index: number) => {
    // 40% chance to skip reporting (simulate oracle not responding)
    if (Math.random() < 0.4) {
      console.log(`Oracle ${index} skipped reporting this cycle (60% chance)`);
      return;
    }

    if (
      abi_simple_oracle === undefined ||
      !oracleAddresses ||
      index >= oracleAddresses.length ||
      !oracleAddresses[index] ||
      !oracleAddresses[index].address ||
      price === undefined
    ) {
      console.log(`Skipping price update for index ${index}: invalid oracle address`);
      return;
    }

    try {
      // Choose variance from 5, 10, 20, 200, 500
      const variances = [5, 10, 20, 200, 500];
      const variance = variances[Math.floor(Math.random() * variances.length)];
      // Apply variance to price: random offset in [-variance, +variance]
      const basePrice = Number(formatEther(price));
      const randomOffset = Math.floor(Math.random() * (2 * variance + 1)) - variance;
      const randomPrice = parseEther(String(basePrice + randomOffset));

      await writeContractAsync({
        abi: abi_simple_oracle,
        address: oracleAddresses[index].address,
        functionName: "setPrice",
        args: [randomPrice],
      });
      console.log(`Oracle ${index} updated price to ${randomPrice}`);
    } catch (error: any) {
      // Handle nonce errors more gracefully
      if (error?.message?.includes("nonce") || error?.message?.includes("Nonce")) {
        console.log(`Nonce conflict for oracle ${index}, will retry on next cycle`);
      } else {
        console.log(`Error updating price for oracle ${index}:`, error?.message || error);
      }
    }
  };

  // Update prices for all oracles with staggered timing
  const updateAllOracles = () => {
    if (!oracleAddresses || oracleAddresses.length === 0) return;
    if (price === undefined) return;

    console.log(`🔄 Starting oracle update cycle for ${oracleAddresses.length} oracles`);
    oracleAddresses.forEach((_, index) => {
      setTimeout(() => {
        handlePriceUpdate(index);
      }, index * 200); // 200ms delay between each oracle update
    });
  };

  // Set up simulation with 4-second intervals
  useEffect(() => {
    if (!isSimulating) return;

    let intervalId: NodeJS.Timeout | null = null;

    // Start immediately without initial delay
    updateAllOracles();

    // Set up recurring updates every 4 seconds
    intervalId = setInterval(() => {
      updateAllOracles();
    }, 4000); // Fixed 4-second interval

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulating, oracleAddresses]);

  const toggleSimulation = async () => {
    setIsSimulating(!isSimulating);
  };

  return (
    <div className="bg-base-100 rounded-lg p-2">
      <div className="flex items-center justify-center gap-4">
        <h3 className="text-lg mb-0 font-bold text-base-content">Simulation</h3>
        <input type="checkbox" className="toggle bg-white" onChange={toggleSimulation} checked={isSimulating} />
      </div>
    </div>
  );
};
