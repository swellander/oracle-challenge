import { ChevronRightIcon } from "@heroicons/react/24/solid";
import type { OracleChallenge } from "~~/components/oracle/optimistic/ProposedCard";

const mockChallenges: OracleChallenge[] = [
  {
    id: "1",
    description: "Verify MEV violations in ETHx staking pool",
    category: "ethereum",
    proposal: true,
    bond: 600,
    challengeStatus: "active",
    timeLeft: "5 h 55 m 5 s",
  },
  {
    id: "2",
    description: "Who will win: Connecticut vs Alabama?",
    category: "prediction",
    proposal: false,
    bond: 250,
    challengeStatus: "ended",
  },
  {
    id: "3",
    description: "Test market B?",
    category: "test",
    proposal: false,
    bond: 0,
    challengeStatus: "disputed",
  },
];

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

export const ProposedTable = () => {
  return (
    <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <table className="w-full table-fixed">
        {/* Header */}
        <thead>
          <tr className="bg-base-300">
            <th className="px-6 py-4 text-left font-semibold text-base-content w-5/12">Description</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Proposal</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Bond</th>
            <th className="px-6 py-4 text-right font-semibold text-base-content w-2/12">Challenge period left</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-1/12">{/* Icon column */}</th>
          </tr>
        </thead>

        <tbody>
          {mockChallenges.map((challenge, index) => (
            <tr
              key={challenge.id}
              className={`group border-b border-base-300 cursor-pointer ${
                index === mockChallenges.length - 1 ? "border-b-0" : ""
              }`}
            >
              {/* Query Column */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="group-hover:text-error font-medium text-base-content mb-1 truncate">
                    {challenge.description}
                  </div>
                </div>
              </td>

              {/* Proposal Column */}
              <td className="px-6 py-4">
                <span className="font-medium">{challenge.proposal.toString()}</span>
              </td>

              {/* Bond Column */}
              <td className="px-6 py-4">
                <span className="font-medium">{challenge.bond.toString()} ETH</span>
              </td>

              {/* Challenge Period Column */}
              <td className="px-6 py-4 text-right">
                <StatusBadge status={challenge.challengeStatus} timeLeft={challenge.timeLeft} />
              </td>

              {/* Chevron Column */}
              <td className="">
                <div className="w-6 h-6 rounded-full border-error border flex items-center justify-center hover:bg-base-200 group-hover:bg-error transition-colors mx-auto">
                  <ChevronRightIcon className="w-4 h-4 text-error group-hover:text-white stroke-2 transition-colors" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
