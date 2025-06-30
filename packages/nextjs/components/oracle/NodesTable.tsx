import TooltipInfo from "../TooltipInfo";
import { NodeRow } from "./NodeRow";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const NodesTable = () => {
  const { data: nodeAddresses } = useScaffoldReadContract({
    contractName: "StakeBasedOracle",
    functionName: "getNodeAddresses",
  });

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Oracle Nodes</h2>
      <div className="bg-base-100 rounded-lg p-4 relative">
        <TooltipInfo top={0} right={0} infoText="TODO: Update this tooltip" />
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Node Address</th>
                <th>Staked Amount (ETH)</th>
                <th>Last Reported Price (USD)</th>
                <th>ORC Balance</th>
                <th>Skip Probability</th>
                <th>Price Variance</th>
              </tr>
            </thead>
            <tbody>
              {nodeAddresses?.map((address: string, index: number) => <NodeRow key={index} address={address} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
