"use client";

import { OOTableProps } from "../types";
import { SettledRow } from "./SettledRow";

export const SettledTable = ({ assertions }: OOTableProps) => {
  return (
    <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <table className="w-full table-fixed">
        {/* Header */}
        <thead>
          <tr className="bg-base-300">
            <th className="px-6 py-4 text-left font-semibold text-base-content w-4/12">Description</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-1/12">Result</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-3/12">Winner</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Reward</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Claim</th>
          </tr>
        </thead>

        <tbody>
          {assertions.map(assertion => (
            <SettledRow key={assertion.assertionId} assertionId={assertion.assertionId} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
