import { useEffect, useRef, useState } from "react";
import { HighlightState, NodeInfo } from "../types";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

// Total bot cycle is ~4s (1.5s price report + 2s validation + transaction times)
const REFRESH_INTERVAL = 4000; // 4 seconds to match full bot cycle

export const useNodeData = (address: string) => {
  const [nodeInfo, setNodeInfo] = useState<NodeInfo>({
    stakedAmount: undefined,
    lastReportedPrice: undefined,
    orcBalance: undefined,
  });

  const [highlights, setHighlights] = useState<HighlightState>({
    staked: false,
    price: false,
    orcBalance: false,
  });

  const prevValues = useRef<NodeInfo>({
    stakedAmount: undefined,
    lastReportedPrice: undefined,
    orcBalance: undefined,
  });

  // Get contract info
  const { data: deployedContractData } = useDeployedContractInfo({
    contractName: "StakeBasedOracle",
  });

  // Get oracle token contract address
  const { data: oracleContract } = useScaffoldReadContract({
    contractName: "StakeBasedOracle",
    functionName: "oracleToken",
  });

  // Get node information using direct contract read
  const { data: nodeData } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "nodes",
    args: [address as `0x${string}`],
  });

  // Get ORC balance
  const { data: orcBalance } = useReadContract({
    address: oracleContract,
    abi: [
      {
        inputs: [{ internalType: "address", name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "balance", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  // Watch for NodesValidated event
  useWatchContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    eventName: "NodesValidated",
    onLogs: async () => {
      console.log("NodesValidated event received, updating data...");

      if (nodeData && orcBalance !== undefined) {
        // nodeData is [nodeAddress, stakedAmount, lastReportedPrice, lastReportedTimestamp]
        const [nodeAddress, newStakedAmount, newLastReportedPrice, newTimestamp] = nodeData as [string, bigint, bigint, bigint];
        const newOrcBalance = orcBalance;

        // Check what values have changed
        const changes = {
          staked: prevValues.current.stakedAmount !== undefined && 
                  newStakedAmount !== prevValues.current.stakedAmount,
          price: prevValues.current.lastReportedPrice !== undefined && 
                 newLastReportedPrice !== prevValues.current.lastReportedPrice,
          orcBalance: prevValues.current.orcBalance !== undefined && 
                     newOrcBalance !== prevValues.current.orcBalance,
        };

        console.log('Data update on validation:', {
          timestamp: new Date().toISOString(),
          node: address,
          newPrice: newLastReportedPrice.toString(),
          newBalance: newOrcBalance.toString(),
          prevPrice: prevValues.current.lastReportedPrice?.toString(),
          prevBalance: prevValues.current.orcBalance?.toString(),
          changes,
        });

        // Update state if any values changed
        if (changes.staked || changes.price || changes.orcBalance || !nodeInfo.stakedAmount) {
          // Update the displayed values
          setNodeInfo({
            stakedAmount: newStakedAmount,
            lastReportedPrice: newLastReportedPrice,
            orcBalance: newOrcBalance,
          });

          // Set highlights for changed values
          setHighlights({
            staked: changes.staked,
            price: changes.price,
            orcBalance: changes.orcBalance,
          });

          // Clear highlights after delay
          setTimeout(() => {
            setHighlights({
              staked: false,
              price: false,
              orcBalance: false,
            });
          }, 2000);

          // Update previous values
          prevValues.current = {
            stakedAmount: newStakedAmount,
            lastReportedPrice: newLastReportedPrice,
            orcBalance: newOrcBalance,
          };
        }
      }
    },
  });

  // Initial data load
  useEffect(() => {
    if (nodeData && orcBalance !== undefined && !nodeInfo.stakedAmount) {
      const [nodeAddress, newStakedAmount, newLastReportedPrice, newTimestamp] = nodeData as [string, bigint, bigint, bigint];
      setNodeInfo({
        stakedAmount: newStakedAmount,
        lastReportedPrice: newLastReportedPrice,
        orcBalance: orcBalance,
      });
      prevValues.current = {
        stakedAmount: newStakedAmount,
        lastReportedPrice: newLastReportedPrice,
        orcBalance: orcBalance,
      };
    }
  }, [nodeData, orcBalance, nodeInfo.stakedAmount]);

  return { nodeInfo, highlights };
};
