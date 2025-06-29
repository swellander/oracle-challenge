import { ConfigSlider } from "./ConfigSlider";
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

  const { data: minimumStake } = useScaffoldReadContract({
    contractName: "StakeBasedOracle",
    functionName: "MINIMUM_STAKE",
    args: undefined,
  });

  const [_, stakedAmount, lastReportedPrice] = data;

  const stakedAmountFormatted = stakedAmount !== undefined ? formatEther(stakedAmount) : "Loading...";
  const lastReportedPriceFormatted =
    lastReportedPrice !== undefined ? formatUnits(lastReportedPrice, 6) : "No price reported";
  const orcBalanceFormatted = orcBalance !== undefined ? formatEther(orcBalance) : "Loading...";

  // Check if staked amount is below minimum requirement
  const isInsufficientStake = stakedAmount !== undefined && minimumStake !== undefined && stakedAmount < minimumStake;

  return (
    <tr className={isInsufficientStake ? "bg-gray-300 opacity-50" : ""}>
      <td>
        <Address address={address} />
      </td>
      <HighlightedCell value={stakedAmountFormatted}>{stakedAmountFormatted}</HighlightedCell>
      <HighlightedCell value={lastReportedPriceFormatted}>{lastReportedPriceFormatted}</HighlightedCell>
      <HighlightedCell value={orcBalanceFormatted}>{orcBalanceFormatted}</HighlightedCell>
      <ConfigSlider nodeAddress={address.toLowerCase()} endpoint="skip-probability" label="skip rate" />
      <ConfigSlider nodeAddress={address.toLowerCase()} endpoint="price-variance" label="variance" />
    </tr>
  );
};
