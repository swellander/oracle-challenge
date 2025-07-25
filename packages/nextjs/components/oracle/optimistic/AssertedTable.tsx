"use client";

import { useState } from "react";
import { ChallengeModal } from "./ChallengeModal";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

interface ProposedChallenge {
  id: string;
  description: string;
  bond: number;
  reward: number;
}

const mockProposedChallenges: ProposedChallenge[] = [
  {
    id: "1",
    description: "Bitcoin all time high by December 31?",
    bond: 750,
    reward: 5,
  },
  {
    id: "2",
    description: "Bitcoin all time high by September 30?",
    bond: 750,
    reward: 5,
  },
  {
    id: "3",
    description: "Bitcoin all time high by July 31?",
    bond: 750,
    reward: 5,
  },
  {
    id: "4",
    description: "Will Trump Media buy more Bitcoin in 2025?",
    bond: 750,
    reward: 5,
  },
];

export const AssertedTable = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<ProposedChallenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (challenge: ProposedChallenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChallenge(null);
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <table className="w-full table-fixed">
        {/* Header */}
        <thead>
          <tr className="bg-base-300">
            <th className="px-6 py-4 text-left font-semibold text-base-content w-6/12">Description</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-3/12">Bond</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Reward</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-1/12">{/* Icon column */}</th>
          </tr>
        </thead>

        <tbody>
          {mockProposedChallenges.map((challenge, index) => (
            <tr
              key={challenge.id}
              onClick={() => handleRowClick(challenge)}
              className={`group border-b border-base-300 cursor-pointer ${
                index === mockProposedChallenges.length - 1 ? "border-b-0" : ""
              }`}
            >
              {/* Description Column */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium mb-1 text-base-content group-hover:text-error">
                      {challenge.description}
                    </div>
                  </div>
                </div>
              </td>

              {/* Bond Column */}
              <td className="px-6 py-4">
                <span className="font-medium">{challenge.bond} ETH</span>
              </td>

              {/* Reward Column */}
              <td className="px-6 py-4">
                <span className="font-medium">{challenge.reward} ETH</span>
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

      {/* Single Modal Component */}
      <ChallengeModal challenge={selectedChallenge} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};
