"use client";

import { useState } from "react";
import { parseEther } from "viem";
import TooltipInfo from "~~/components/TooltipInfo";
import { IntegerInput } from "~~/components/scaffold-eth";
import { InputBase } from "~~/components/scaffold-eth/Input/InputBase";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

export const SubmitAssertionButton = () => {
  const { timestamp } = useGlobalState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "OptimisticOracle" });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form when closing
    setDescription("");
    setReward("");
    setStartTime("");
    setEndTime("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const startTimeFormatted = startTime.length === 0 ? 0n : BigInt(startTime);
      const endTimeFormatted = endTime.length === 0 ? 0n : BigInt(endTime);

      await writeContractAsync({
        functionName: "assertEvent",
        args: [description.trim(), startTimeFormatted, endTimeFormatted],
        value: parseEther(reward),
      });
      closeModal();
    } catch (error) {
      console.log("Error with submission", error);
    }
  };

  return (
    <>
      {/* Button */}
      <div className="my-8 flex justify-center">
        <button className="btn btn-primary btn-lg" onClick={openModal}>
          Submit New Assertion
        </button>
      </div>

      {/* Modal */}
      <input type="checkbox" id="assertion-modal" className="modal-toggle" checked={isModalOpen} readOnly />
      <label htmlFor="assertion-modal" className="modal cursor-pointer" onClick={closeModal}>
        <label className="modal-box relative max-w-md w-full bg-base-100" htmlFor="" onClick={e => e.stopPropagation()}>
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />

          {/* Close button */}
          <button onClick={closeModal} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </button>

          <div className="relative">
            <TooltipInfo
              top={-2}
              right={5}
              infoText="Create a new assertion with your reward stake. Leave timestamps blank to use default values."
            />
          </div>

          {/* Modal Content */}
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Submit New Assertion</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Description Input */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Description <span className="text-red-500">*</span>
                  </span>
                </label>
                <InputBase
                  name="description"
                  value={description}
                  onChange={newValue => setDescription(newValue)}
                  placeholder="Enter assertion description..."
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Reward (ETH) <span className="text-red-500">*</span>
                  </span>
                </label>
                <IntegerInput
                  name="reward"
                  placeholder="0.22"
                  value={reward}
                  onChange={newValue => setReward(newValue)}
                  disableMultiplyBy1e18
                />
              </div>
              {/* Start Time and End Time Inputs */}
              {timestamp && <div className="!mt-6 px-1 text-sm">Current Timestamp: {timestamp}</div>}
              <div className="grid grid-cols-2 gap-4 !mt-0">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Start Time</span>
                  </label>
                  <IntegerInput
                    name="startTime"
                    placeholder="0"
                    value={startTime}
                    onChange={newValue => setStartTime(newValue)}
                    disableMultiplyBy1e18
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">End Time</span>
                  </label>
                  <IntegerInput
                    name="endTime"
                    placeholder="0"
                    value={endTime}
                    onChange={newValue => setEndTime(newValue)}
                    disableMultiplyBy1e18
                  />
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </label>
      </label>
    </>
  );
};
