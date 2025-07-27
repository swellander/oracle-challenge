import { AssertionWithId } from "../types";
import { TimeLeft } from "./TimeLeft";
import { formatEther } from "viem";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const AssertedRow = ({
  assertionId,
  handleRowClick,
}: {
  assertionId: number;
  handleRowClick: (assertion: AssertionWithId) => void;
}) => {
  const { data: assertionData } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "getAssertion",
    args: [BigInt(assertionId)],
  });

  if (!assertionData) return null;

  return (
    <tr
      key={assertionId}
      onClick={() => handleRowClick({ ...assertionData, assertionId })}
      className={`group border-b border-base-300 cursor-pointer`}
    >
      {/* Description Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="group-hover:text-error">{assertionData.description}</div>
          </div>
        </div>
      </td>

      {/* Bond Column */}
      <td className="px-6 py-4">{formatEther(assertionData.bond)} ETH</td>

      {/* Reward Column */}
      <td className="px-6 py-4">{formatEther(assertionData.reward)} ETH</td>

      {/* Time Left Column */}
      <td className="px-6 py-4">
        <TimeLeft startTime={assertionData.startTime} endTime={assertionData.endTime} />
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
