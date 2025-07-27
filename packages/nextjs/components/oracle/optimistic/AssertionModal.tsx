"use client";

import { useState } from "react";
import { AssertionModalProps } from "../types";
import { formatEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

export const AssertionModal = ({ assertion, isOpen, onClose }: AssertionModalProps) => {
  const [isProposing, setIsProposing] = useState(false);
  const { refetchAssertionStates } = useGlobalState();

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "OptimisticOracle",
  });

  const handleProposeOutcome = async (outcome: boolean) => {
    try {
      setIsProposing(true);
      await writeContractAsync({
        functionName: "proposeOutcome",
        args: [BigInt(assertion.assertionId), outcome],
        value: assertion.bond,
      });
      refetchAssertionStates();
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsProposing(false);
    }
  };

  return (
    <>
      <input type="checkbox" id="challenge-modal" className="modal-toggle" checked={isOpen} readOnly />
      <label htmlFor="challenge-modal" className="modal cursor-pointer" onClick={onClose}>
        <label
          className="modal-box relative max-w-2xl w-full bg-base-100"
          htmlFor=""
          onClick={e => e.stopPropagation()}
        >
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />

          {/* Close button */}
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </button>

          {/* Modal Content */}
          <div className="">
            {/* Header with Current State */}
            <div className="text-center mb-6">
              <h2 className="text-lg">
                Current State: <span className="font-bold">Asserted</span>
              </h2>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left Column - Description Area */}
              <div className="bg-base-200 rounded-lg p-4">
                <p className="text-base-content">
                  <span className="font-bold">Description:</span> {assertion.description}
                </p>

                <p className="text-base-content">
                  <span className="font-bold">Bond:</span> {formatEther(assertion.bond)} ETH
                </p>

                <p className="text-base-content">
                  <span className="font-bold">Reward:</span> {formatEther(assertion.reward)} ETH
                </p>

                <p className="text-base-content">
                  <span className="font-bold">Start Time:</span> {assertion.startTime}
                </p>

                <p className="text-base-content">
                  <span className="font-bold">Duration:</span> {assertion.endTime - assertion.startTime} seconds
                </p>
              </div>

              {/* Right Column */}
              <div className="space-y-4 text-center flex flex-col justify-center h-full">
                {/* Proposed Answer Section */}
                <div className="bg-base-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium">Propose Answer</span>
                  </div>
                  {isProposing && <span className="loading loading-spinner loading-xs"></span>}

                  <div className="flex justify-center gap-4">
                    <button
                      className="btn btn-primary flex-1"
                      onClick={() => handleProposeOutcome(true)}
                      disabled={isProposing}
                    >
                      True
                    </button>
                    <button
                      className="btn btn-primary flex-1"
                      onClick={() => handleProposeOutcome(false)}
                      disabled={isProposing}
                    >
                      False
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
