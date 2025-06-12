import { HighlightedCell } from "./HighlightedCell";
import { ProbabilitySlider } from "./ProbabilitySlider";
import { useNodeData } from "./hooks/useNodeData";
import { NodeRowProps } from "./types";
import { formatEther, formatUnits } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const NodeRow = ({ address }: NodeRowProps) => {
  const { nodeInfo, highlights } = useNodeData(address);

  const { data = [] } = useScaffoldReadContract({
    contractName: "StakeBasedOracle",
    functionName: "nodes",
    args: [address],
  });

  const { data: orcBalance } = useScaffoldReadContract({
    contractName: "ORC",
    functionName: "balanceOf",
    args: [address],
  });

  const [_, stakedAmount, lastReportedPrice] = data;

  return (
    <tr>
      <td>
        <Address address={address} />
      </td>
      <HighlightedCell highlight={highlights.price}>
        {stakedAmount !== undefined ? formatEther(stakedAmount) : "Loading..."}
      </HighlightedCell>
      <HighlightedCell highlight={highlights.price}>
        {lastReportedPrice !== undefined ? formatUnits(lastReportedPrice, 6) : "No price reported"}
      </HighlightedCell>
      <HighlightedCell highlight={highlights.orcBalance}>
        {orcBalance !== undefined ? formatEther(orcBalance) : "Loading..."}
      </HighlightedCell>
      <ProbabilitySlider nodeAddress={address} />
    </tr>
  );
};
