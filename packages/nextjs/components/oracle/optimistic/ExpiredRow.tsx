import { useState } from "react";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const ExpiredRow = ({ assertionId }: { assertionId: number }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: assertionData } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "getAssertion",
    args: [BigInt(assertionId)],
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "OptimisticOracle",
  });

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await writeContractAsync({
        functionName: "claimRefund",
        args: [BigInt(assertionId)],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!assertionData) return null;

  return (
    <tr key={assertionId} className={`border-b border-base-300`}>
      {/* Description Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div>{assertionData.description}</div>
        </div>
      </td>

      {/* Asserter Column */}
      <td className="px-6 py-4">
        <Address address={assertionData.asserter} format="short" onlyEnsOrAddress disableAddressLink size="sm" />
      </td>

      {/* Reward Column */}
      <td className="px-6 py-4">{formatEther(assertionData.reward)} ETH</td>

      {/* Claimed Column */}
      <td className="px-6 py-4">
        {assertionData?.claimed ? (
          <button className="btn btn-primary btn-xs" disabled>
            Claimed
          </button>
        ) : (
          <button className="btn btn-primary btn-xs" onClick={handleClaim} disabled={isClaiming}>
            Claim
          </button>
        )}
      </td>
    </tr>
  );
};
