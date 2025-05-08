"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";
import { useState, useEffect, useRef } from "react";


const PriceWidget = () => {
  const [highlight, setHighlight] = useState(false);
  const prevPrice = useRef<bigint | undefined>(undefined);

  const { data: currentPrice } = useScaffoldReadContract({
    contractName: "StakeBasedOracle",
    functionName: "getPrice",
  });

  useEffect(() => {
    if (currentPrice !== undefined && prevPrice.current !== undefined && currentPrice !== prevPrice.current) {
      setHighlight(true);
      setTimeout(() => setHighlight(false), 2000);
    }
    prevPrice.current = currentPrice;
  }, [currentPrice]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Current Price</h2>
      <div className="bg-base-100 rounded-lg p-4 inline-block">
        <div className={`p-4 rounded-lg transition-colors duration-1000 ${highlight ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}>
          <div className="text-2xl font-bold">
            {currentPrice !== undefined ? currentPrice.toString() : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
};

const NodeRow = ({ address }: { address: string }) => {
  const [stakedAmount, setStakedAmount] = useState<bigint | undefined>();
  const [lastReportedPrice, setLastReportedPrice] = useState<bigint | undefined>();
  const [highlightStaked, setHighlightStaked] = useState(false);
  const [highlightPrice, setHighlightPrice] = useState(false);
  const prevStakedAmount = useRef<bigint | undefined>(undefined);
  const prevLastReportedPrice = useRef<bigint | undefined>(undefined);

  const { data: nodeInfo } = useScaffoldReadContract({
    contractName: "StakeBasedOracle",
    functionName: "nodes",
    args: [address],
  });

  // Update state when nodeInfo changes
  useEffect(() => {
    if (nodeInfo) {
      const newStakedAmount = nodeInfo[1];
      const newLastReportedPrice = nodeInfo[2];

      // Check if values have changed
      if (prevStakedAmount.current !== undefined && newStakedAmount !== prevStakedAmount.current) {
        setHighlightStaked(true);
        setTimeout(() => setHighlightStaked(false), 2000);
      }
      if (prevLastReportedPrice.current !== undefined && newLastReportedPrice !== prevLastReportedPrice.current) {
        setHighlightPrice(true);
        setTimeout(() => setHighlightPrice(false), 2000);
      }

      // Update current values
      setStakedAmount(newStakedAmount);
      setLastReportedPrice(newLastReportedPrice);
      prevStakedAmount.current = newStakedAmount;
      prevLastReportedPrice.current = newLastReportedPrice;
    }
  }, [nodeInfo]);

  // Listen for NodeSlashed events
  useScaffoldWatchContractEvent({
    contractName: "StakeBasedOracle",
    eventName: "NodeSlashed",
    onLogs: logs => {
      logs.forEach(log => {
        const [node, amount] = log.args;
        if (node.toLowerCase() === address.toLowerCase()) {
          setStakedAmount(prev => {
            const newAmount = prev ? prev - amount : undefined;
            if (prev !== newAmount) {
              setHighlightStaked(true);
              setTimeout(() => setHighlightStaked(false), 2000);
            }
            return newAmount;
          });
        }
      });
    },
  });

  // Listen for PriceReported events
  useScaffoldWatchContractEvent({
    contractName: "StakeBasedOracle",
    eventName: "PriceReported",
    onLogs: logs => {
      logs.forEach(log => {
        const [node, price] = log.args;
        if (node.toLowerCase() === address.toLowerCase()) {
          setLastReportedPrice(prev => {
            if (prev !== price) {
              setHighlightPrice(true);
              setTimeout(() => setHighlightPrice(false), 2000);
            }
            return price;
          });
        }
      });
    },
  });

  return (
    <tr>
      <td>
        <Address address={address} />
      </td>
      <td className={`transition-colors duration-1000 ${highlightStaked ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}>
        {stakedAmount ? formatEther(stakedAmount) : "Loading..."}
      </td>
      <td className={`transition-colors duration-1000 ${highlightPrice ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}>
        {lastReportedPrice ? lastReportedPrice.toString() : "No price reported"}
      </td>
    </tr>
  );
};

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: nodeAddresses } = useScaffoldReadContract({
    contractName: "StakeBasedOracle",
    functionName: "getNodeAddresses",
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-5xl mx-auto">
          <div className="flex flex-col gap-8">
            <div className="w-full">
              <PriceWidget />
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">Oracle Nodes</h2>
                <div className="bg-base-100 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Node Address</th>
                          <th>Staked Amount (ETH)</th>
                          <th>Last Reported Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nodeAddresses?.map((address: string, index: number) => (
                          <NodeRow key={index} address={address} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
