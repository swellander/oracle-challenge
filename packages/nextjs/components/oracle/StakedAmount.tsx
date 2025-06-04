import { HighlightedCell } from "./HighlightedCell";
import { ProbabilitySlider } from "./ProbabilitySlider";
import { useNodeData } from "./hooks/useNodeData";
import { NodeRowProps } from "./types";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const StakedAmount = ({ address }: NodeRowProps) => {
  const {data: node} = useScaffoldReadContract({
    contractName: "StakeBasedOracle",
    functionName: "nodes",
    args: [address],
  });

  return (
    <HighlightedCell >
      <p>whoops</p>
      {/* {nodeInfo.stakedAmount ? formatEther(nodeInfo.stakedAmount) : "Loading..."} */}
    </HighlightedCell>
  );
};
