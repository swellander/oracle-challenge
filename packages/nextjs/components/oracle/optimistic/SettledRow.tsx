"use client";

import { useState } from "react";
import { SettledRowProps } from "../types";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ZERO_ADDRESS } from "~~/utils/scaffold-eth/common";

export const SettledRow = ({ assertionId }: SettledRowProps) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const { data: assertionData } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "getAssertion",
    args: [BigInt(assertionId)],
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "OptimisticOracle",
  });

  if (!assertionData) return null;

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      const functionName = assertionData?.winner === ZERO_ADDRESS ? "claimUndisputedReward" : "claimDisputedReward";
      await writeContractAsync({
        functionName,
        args: [BigInt(assertionId)],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaiming(false);
    }
  };

  const winner = assertionData?.winner === ZERO_ADDRESS ? assertionData?.proposer : assertionData?.winner;
  const outcome =
    assertionData?.winner === ZERO_ADDRESS ? assertionData?.proposedOutcome : assertionData?.resolvedOutcome;

  return (
    <tr key={assertionId} className={`border-b border-base-300`}>
      {/* Query Column */}
      <td className="px-6 py-4">
        <div className="font-medium text-base-content mb-1 truncate">{assertionData?.description}</div>
      </td>

      {/* Answer Column */}
      <td className="px-6 py-4">
        <span className="font-medium">{outcome ? "True" : "False"}</span>
      </td>

      {/* Winner Column */}
      <td className="px-6 py-4">
        <span className="font-medium">
          <Address address={winner} format="short" onlyEnsOrAddress disableAddressLink size="sm" />
        </span>
      </td>

      {/* Reward Column */}
      <td className="px-6 py-4">
        <span className="">{formatEther(assertionData?.reward)} ETH</span>
      </td>

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
