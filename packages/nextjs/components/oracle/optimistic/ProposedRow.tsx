"use client";

import { OORowProps } from "../types";
import { TimeLeft } from "./TimeLeft";
import { formatEther } from "viem";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const ProposedRow = ({ assertionId, handleRowClick }: OORowProps) => {
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
          <div className="group-hover:text-error truncate">{assertionData?.description}</div>
        </div>
      </td>

      {/* Proposal Column */}
      <td className="px-6 py-4">{assertionData?.proposedOutcome.toString()}</td>

      {/* Bond Column */}
      <td className="px-6 py-4">{formatEther(assertionData?.bond)} ETH</td>

      {/* Challenge Period Column */}
      <td className="px-6 py-4">
        <TimeLeft startTime={assertionData?.startTime} endTime={assertionData?.endTime} />
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
