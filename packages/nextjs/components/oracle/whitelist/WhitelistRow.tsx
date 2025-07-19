import { EditableCell } from "../EditableCell";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { HighlightedCell } from "~~/components/oracle/HighlightedCell";
import { NodeRowProps } from "~~/components/oracle/types";
import { Address } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getHighlightColorForPrice } from "~~/utils/scaffold-eth/common";
import { ContractName } from "~~/utils/scaffold-eth/contract";

export const WhitelistRow = ({ address, index }: NodeRowProps) => {
  const simpleOracleAbi = deployedContracts[31337].SimpleOracle_1.abi; // TODO: fix this. Maybe put it in a separate file as a constant.

  const { data } = useReadContract({
    address: address,
    abi: simpleOracleAbi,
    functionName: "getPrice",
  });

  const { data: medianPrice } = useScaffoldReadContract({
    contractName: "WhitelistOracle",
    functionName: "getPrice",
  }) as { data: bigint | undefined };

  const lastReportedPriceFormatted =
    data !== undefined ? Number(parseFloat(formatEther(data[0])).toFixed(2)) : "No price reported";
  const lastReportedTime =
    data !== undefined ? new Date(Number(data[1]) * 1000).toLocaleTimeString() : "No time reported";

  const currentTime = new Date().getTime() / 1000;
  const isActive = data !== undefined && data[1] !== undefined ? data[1] > currentTime - 10 : true;

  return (
    <tr className={`table-fixed ${isActive ? "" : "bg-gray-300 opacity-50"}`}>
      <td>
        <Address address={address} size="sm" format="short" onlyEnsOrAddress={true} />
      </td>
      <EditableCell
        value={lastReportedPriceFormatted}
        contractName={`SimpleOracle_${index + 1}` as ContractName}
        highlightColor={getHighlightColorForPrice(data?.[0], medianPrice)}
      />
      <HighlightedCell value={lastReportedTime} highlightColor="bg-success">
        {lastReportedTime}
      </HighlightedCell>
    </tr>
  );
};
