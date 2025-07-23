import { useEffect, useRef } from "react";
import { parseEther } from "viem";
import { hardhat } from "viem/chains";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export const MonitorAndTriggerTx = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const prevTimestampRef = useRef<bigint | null>(null);
  const currentTimestampRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (!publicClient || !walletClient) return;
    if (!isLocalNetwork) return;

    const pollBlock = async () => {
      try {
        const block = await publicClient.getBlock();
        const newTimestamp = block.timestamp;

        const prev = prevTimestampRef.current;
        const current = currentTimestampRef.current;

        if (prev && newTimestamp === prev) {
          try {
            await walletClient.sendTransaction({
              to: walletClient.account.address,
              value: parseEther("0.0000001"),
            });
          } catch (err) {
            console.log("Failed to send tx");
          }
        }

        // Update refs
        prevTimestampRef.current = current;
        currentTimestampRef.current = newTimestamp;
      } catch (err) {
        console.log("Polling error");
      }
    };

    const interval = setInterval(pollBlock, 5000);
    pollBlock(); // Initial call

    return () => clearInterval(interval);
  }, [publicClient, walletClient, isLocalNetwork]);

  return null;
};
