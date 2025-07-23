import { useEffect, useRef } from "react";
import { parseEther } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

export const MonitorAndTriggerTx = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const prevTimestampRef = useRef<bigint | null>(null);
  const currentTimestampRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (!publicClient || !walletClient) return;

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
            console.error("Failed to send tx:", err);
          }
        }

        // Update refs
        prevTimestampRef.current = current;
        currentTimestampRef.current = newTimestamp;
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const interval = setInterval(pollBlock, 5000);
    pollBlock(); // Initial call

    return () => clearInterval(interval);
  }, [publicClient, walletClient]);

  return null;
};
