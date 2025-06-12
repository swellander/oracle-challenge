import { ProbabilitySlider } from "./ProbabilitySlider";
import { NodeRowProps } from "./types";
import { formatEther, formatUnits } from "viem";
import { HighlightedCell } from "~~/components/oracle/HighlightedCell";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const NodeRow = ({ address }: NodeRowProps) => {
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

  const stakedAmountFormatted = stakedAmount !== undefined ? formatEther(stakedAmount) : "Loading...";
  const lastReportedPriceFormatted =
    lastReportedPrice !== undefined ? formatUnits(lastReportedPrice, 6) : "No price reported";
  const orcBalanceFormatted = orcBalance !== undefined ? formatEther(orcBalance) : "Loading...";

  return (
    <tr>
      <td>
        <Address address={address} />
      </td>
      <HighlightedCell value={stakedAmountFormatted}>{stakedAmountFormatted}</HighlightedCell>
      <HighlightedCell value={lastReportedPriceFormatted}>{lastReportedPriceFormatted}</HighlightedCell>
      <HighlightedCell value={orcBalanceFormatted}>{orcBalanceFormatted}</HighlightedCell>
      <td>
        <ProbabilitySlider nodeAddress={address.toLowerCase()} />
      </td>
    </tr>
  );
};
