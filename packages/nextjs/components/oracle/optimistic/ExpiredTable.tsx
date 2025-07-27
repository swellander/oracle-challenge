"use client";

import { OOTableProps } from "../types";
import { ExpiredRow } from "./ExpiredRow";

export const ExpiredTable = ({ assertions }: OOTableProps) => {
  return (
    <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <table className="w-full table-fixed">
        {/* Header */}
        <thead>
          <tr className="bg-base-300">
            <th className="px-6 py-4 text-left font-semibold text-base-content w-5/12">Description</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-3/12">Asserter</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Reward</th>
            <th className="px-6 py-4 text-left font-semibold text-base-content w-2/12">Claim Refund</th>
          </tr>
        </thead>

        <tbody>
          {assertions.map(assertion => (
            <ExpiredRow key={assertion.assertionId} assertionId={assertion.assertionId} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
