"use client";

import { useState } from "react";
import { AssertionWithId } from "../types";
import { AssertedCard } from "./AssertedCard";
import { AssertionModal } from "./AssertionModal";

interface AssertedTableProps {
  assertions: {
    assertionId: number;
    state: number;
  }[];
}

export const AssertedTable = ({ assertions }: AssertedTableProps) => {
  const [selectedAssertion, setSelectedAssertion] = useState<AssertionWithId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (assertion: AssertionWithId) => {
    setSelectedAssertion(assertion);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssertion(null);
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
          {assertions.map(assertion => (
            <AssertedCard
              key={assertion.assertionId}
              assertionId={assertion.assertionId}
              handleRowClick={handleRowClick}
            />
          ))}
        </tbody>
      </table>

      {/* Single Modal Component */}
      {selectedAssertion && (
        <AssertionModal assertion={selectedAssertion as AssertionWithId} isOpen={isModalOpen} onClose={closeModal} />
      )}
    </div>
  );
};
