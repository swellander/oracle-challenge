"use client";

import { useState } from "react";
import { AssertionWithId, OOTableProps } from "../types";
import { AssertedRow } from "./AssertedRow";
import { AssertionModal } from "./AssertionModal";

export const AssertedTable = ({ assertions }: OOTableProps) => {
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
    <div className="bg-base-100 rounded-lg shadow-lg overflow-x-auto">
      <table className="w-full table-auto [&_th]:px-6 [&_th]:py-4 [&_td]:px-6 [&_td]:py-4">
        {/* Header */}
        <thead>
          <tr className="bg-base-300">
            <th className="text-left font-semibold w-5/12">Description</th>
            <th className="text-left font-semibold w-2/12">Bond</th>
            <th className="text-left font-semibold w-2/12">Reward</th>
            <th className="text-left font-semibold w-2/12">Time Left</th>
            <th className="text-left font-semibold w-1/12">{/* Icon column */}</th>
          </tr>
        </thead>

        <tbody>
          {assertions.map(assertion => (
            <AssertedRow
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
