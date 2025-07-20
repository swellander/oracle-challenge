import TooltipInfo from "~~/components/TooltipInfo";
import { AddOracleButton } from "~~/components/oracle/whitelist/AddOracleButton";
import { WhitelistRow } from "~~/components/oracle/whitelist/WhitelistRow";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const LoadingRow = () => {
  return (
    <tr>
      <td className="animate-pulse">
        <div className="h-8 bg-secondary rounded w-32"></div>
      </td>
      <td className="animate-pulse">
        <div className="h-8 bg-secondary rounded w-20"></div>
      </td>
      <td className="animate-pulse">
        <div className="h-8 bg-secondary rounded w-24"></div>
      </td>
    </tr>
  );
};

const NoNodesRow = () => {
  return (
    <tr>
      <td colSpan={6} className="text-center">
        No nodes found
      </td>
    </tr>
  );
};

export const WhitelistTable = () => {
  const { data: oraclesAdded, isLoading: isLoadingOraclesAdded } = useScaffoldEventHistory({
    contractName: "WhitelistOracle",
    eventName: "OracleAdded",
    fromBlock: 0n,
    watch: true,
  });

  const { data: oraclesRemoved, isLoading: isLoadingOraclesRemoved } = useScaffoldEventHistory({
    contractName: "WhitelistOracle",
    eventName: "OracleRemoved",
    fromBlock: 0n,
    watch: true,
  });

  const isLoading = isLoadingOraclesAdded || isLoadingOraclesRemoved;
  const oracleAddresses = oraclesAdded
    ?.filter(
      oracle => !oraclesRemoved?.some(removedOracle => removedOracle.args.oracleAddress === oracle.args.oracleAddress),
    )
    .map(oracle => oracle.args.oracleAddress as string);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-between">
        <h2 className="text-xl font-bold">Oracle Nodes</h2>
        <AddOracleButton />
      </div>
      <div className="bg-base-100 rounded-lg p-4 relative">
        <TooltipInfo top={0} right={0} infoText="TODO: Update this tooltip" />
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Node Address</th>
                <th>Last Reported Price (USD)</th>
                <th>Last Reported Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingRow />
              ) : oracleAddresses?.length === 0 ? (
                <NoNodesRow />
              ) : (
                oracleAddresses?.map((address: string, index: number) => (
                  <WhitelistRow key={index} index={index} address={address} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
