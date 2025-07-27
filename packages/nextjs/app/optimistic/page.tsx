"use client";

import { useEffect } from "react";
import type { NextPage } from "next";
import { useReadContracts } from "wagmi";
import { AssertedTable } from "~~/components/oracle/optimistic/AssertedTable";
import { DisputedTable } from "~~/components/oracle/optimistic/DisputedTable";
import { ExpiredTable } from "~~/components/oracle/optimistic/ExpiredTable";
import { ProposedTable } from "~~/components/oracle/optimistic/ProposedTable";
import { SettledTable } from "~~/components/oracle/optimistic/SettledTable";
import { SubmitAssertionButton } from "~~/components/oracle/optimistic/SubmitAssertionButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

const Home: NextPage = () => {
  const setRefetchAssertionStates = useGlobalState(state => state.setRefetchAssertionStates);

  const { data: nextAssertionId } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "nextAssertionId",
  });

  // get deployed contract address
  const { data: deployedContractAddress } = useDeployedContractInfo({
    contractName: "OptimisticOracle",
  });

  // Create contracts array to get state for all assertions from 1 to nextAssertionId-1
  const assertionContracts = nextAssertionId
    ? Array.from({ length: Number(nextAssertionId) - 1 }, (_, i) => ({
        address: deployedContractAddress?.address as `0x${string}`,
        abi: deployedContractAddress?.abi,
        functionName: "getState",
        args: [BigInt(i + 1)],
      })).filter(contract => contract.address && contract.abi)
    : [];

  const { data: assertionStates, refetch: refetchAssertionStates } = useReadContracts({
    contracts: assertionContracts,
  });

  // Set the refetch function in the global store
  useEffect(() => {
    if (refetchAssertionStates) {
      setRefetchAssertionStates(refetchAssertionStates);
    }
  }, [refetchAssertionStates, setRefetchAssertionStates]);

  // Map assertion IDs to their states and filter out expired ones (state 5)
  const assertionStateMap =
    nextAssertionId && assertionStates
      ? Array.from({ length: Number(nextAssertionId) - 1 }, (_, i) => ({
          assertionId: i + 1,
          state: (assertionStates[i]?.result as number) || 0, // Default to 0 (Invalid) if no result
        }))
      : []; // Filter out Expired (state 5)

  console.log("Assertion State Map (filtered):", assertionStateMap);

  // Also get the assertion data for each ID
  // const assertionDataContracts = nextAssertionId ?
  //   Array.from({ length: Number(nextAssertionId) - 1 }, (_, i) => ({
  //     address: deployedContractAddress?.address as `0x${string}`,
  //     abi: deployedContractAddress?.abi,
  //     functionName: "assertions",
  //     args: [BigInt(i + 1)],
  //   })).filter(contract => contract.address && contract.abi) : [];

  // const { data: assertionData } = useReadContracts({
  //   contracts: assertionDataContracts,
  // });

  // Log the results for debugging
  // console.log("Assertion States:", assertionStates);
  // console.log("Assertion Data:", assertionData);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Submit Assertion Button with Modal */}
      <SubmitAssertionButton />

      {/* Tables */}
      <h2 className="text-2xl font-bold my-4">Asserted</h2>
      <AssertedTable assertions={assertionStateMap.filter(assertion => assertion.state === 1)} />
      <h2 className="text-2xl font-bold mt-12 mb-4">Proposed</h2>
      <ProposedTable assertions={assertionStateMap.filter(assertion => assertion.state === 2)} />
      <h2 className="text-2xl font-bold mt-12 mb-4">Disputed</h2>
      <DisputedTable assertions={assertionStateMap.filter(assertion => assertion.state === 3)} />
      <h2 className="text-2xl font-bold mt-12 mb-4">Settled</h2>
      <SettledTable assertions={assertionStateMap.filter(assertion => assertion.state === 4)} />
      <h2 className="text-2xl font-bold mt-12 mb-4">Expired</h2>
      <ExpiredTable assertions={assertionStateMap.filter(assertion => assertion.state === 5)} />
    </div>
  );
};

export default Home;
