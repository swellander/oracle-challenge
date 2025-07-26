"use client";

import { OORowProps } from "../types";
import { formatEther } from "viem";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const StatusBadge = ({ status, timeLeft }: { status: "active" | "ended" | "disputed"; timeLeft?: string }) => {
  if (status === "active" && timeLeft) {
    return (
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-base-content">{timeLeft}</span>
        <div className="w-24 h-1 bg-error rounded-full mt-1"></div>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-error">Ended</span>
        <div className="w-24 h-1 bg-error rounded-full mt-1"></div>
      </div>
    );
  }

  if (status === "disputed") {
    return <span className="text-sm font-medium text-warning">Disputed</span>;
  }

  return null;
};

export const ProposedCard = ({ assertionId, handleRowClick }: OORowProps) => {
  const { data: assertionData } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "getAssertion",
    args: [BigInt(assertionId)],
  });

  if (!assertionData) return null;

  return (
    <tr
      key={assertionId}
      className={`group border-b border-base-300 cursor-pointer`}
      onClick={() => handleRowClick({ ...assertionData, assertionId })}
    >
      {/* Query Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="group-hover:text-error font-medium text-base-content mb-1 truncate">
            {assertionData?.description}
          </div>
        </div>
      </td>

      {/* Proposal Column */}
      <td className="px-6 py-4">
        <span className="font-medium">{assertionData?.proposedOutcome.toString()}</span>
      </td>

      {/* Bond Column */}
      <td className="px-6 py-4">
        <span className="font-medium">{formatEther(assertionData?.bond)} ETH</span>
      </td>

      {/* Challenge Period Column */}
      <td className="px-6 py-4 text-right">
        {/* <StatusBadge status={assertionData?.state} timeLeft={assertionData?.timeLeft} /> */}
      </td>

      {/* Chevron Column */}
      <td className="">
        <div className="w-6 h-6 rounded-full border-error border flex items-center justify-center hover:bg-base-200 group-hover:bg-error transition-colors mx-auto">
          <ChevronRightIcon className="w-4 h-4 text-error group-hover:text-white stroke-2 transition-colors" />
        </div>
      </td>
    </tr>
  );
};
