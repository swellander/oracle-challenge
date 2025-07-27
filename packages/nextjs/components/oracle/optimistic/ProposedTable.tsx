import { useState } from "react";
import { AssertionWithId, OOTableProps } from "../types";
import { ProposedModal } from "./ProposedModal";
import { ProposedRow } from "./ProposedRow";

export const ProposedTable = ({ assertions }: OOTableProps) => {
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
            <th className="px-6 py-4 text-left font-semibold text-base-content w-5/12">Description</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Proposal</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Bond</th>
            <th className="px-6 py-4 text-right font-semibold text-base-content w-2/12">Time Left</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-1/12">{/* Icon column */}</th>
          </tr>
        </thead>

        <tbody>
          {assertions.map(assertion => (
            <ProposedRow
              key={assertion.assertionId}
              assertionId={assertion.assertionId}
              handleRowClick={handleRowClick}
            />
          ))}
        </tbody>
      </table>

      {/* Single Modal Component */}
      {isModalOpen && selectedAssertion && (
        <ProposedModal assertion={selectedAssertion} isOpen={isModalOpen} onClose={closeModal} />
      )}
    </div>
  );
};
