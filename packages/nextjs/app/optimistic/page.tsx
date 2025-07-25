"use client";

import type { NextPage } from "next";
import { AssertedTable } from "~~/components/oracle/optimistic/AssertedTable";
import { ProposedTable } from "~~/components/oracle/optimistic/ProposedTable";
import { SubmitAssertionButton } from "~~/components/oracle/optimistic/SubmitAssertionButton";

const Home: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Submit Assertion Button with Modal */}
      <SubmitAssertionButton />

      {/* Tables */}
      {/* Give a header to the tables */}
      <h2 className="text-2xl font-bold my-4">Asserted</h2>
      <AssertedTable />
      <h2 className="text-2xl font-bold mt-12 mb-4">Proposed</h2>
      <ProposedTable />
    </div>
  );
};

export default Home;
