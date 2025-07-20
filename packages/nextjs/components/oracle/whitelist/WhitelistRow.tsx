import { useEffect, useState } from "react";
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
  const contractNameSuffix = index !== undefined && index > 0 ? `_${index + 1}` : "";
  const contractName = `SimpleOracle${contractNameSuffix}` as ContractName;
  const [isActive, setIsActive] = useState(true);

  const { data } = useReadContract({
    address: address,
    abi: simpleOracleAbi,
    functionName: "getPrice",
  });

  const { data: medianPrice } = useScaffoldReadContract({
    contractName: "WhitelistOracle",
    functionName: "getPrice",
    watch: true,
  }) as { data: bigint | undefined };

  const lastReportedPriceFormatted =
    data !== undefined ? Number(parseFloat(formatEther(data[0])).toFixed(2)) : "Not reported";
  const lastReportedTime = data !== undefined ? new Date(Number(data[1]) * 1000).toLocaleTimeString() : "Not reported";

  // Check if the node is active every 5 seconds
  useEffect(() => {
    const checkActive = () => {
      const currentTime = new Date().getTime() / 1000;
      // - 10 seconds, because the oracle is active for 10 seconds after reporting
      const active = data !== undefined && data[1] !== undefined ? data[1] > currentTime - 10 : false;
      setIsActive(active);
    };

    // Check immediately
    checkActive();

    // Set up interval to check every 5 seconds
    const interval = setInterval(checkActive, 5000);

    // Cleanup interval on component unmount or data change
    return () => clearInterval(interval);
  }, [data]);

  return (
    <tr className={`table-fixed ${isActive ? "" : "opacity-40"}`}>
      <td>
        <Address address={address} size="sm" format="short" onlyEnsOrAddress={true} />
      </td>
      <EditableCell
        value={lastReportedPriceFormatted}
        contractName={contractName}
        highlightColor={getHighlightColorForPrice(data?.[0], medianPrice)}
      />
      <HighlightedCell value={lastReportedTime} highlightColor="bg-success">
        {lastReportedTime}
      </HighlightedCell>
    </tr>
  );
};
