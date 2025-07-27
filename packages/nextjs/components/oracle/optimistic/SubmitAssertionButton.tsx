"use client";

import { useState } from "react";
import { parseEther } from "viem";
import TooltipInfo from "~~/components/TooltipInfo";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { QUESTIONS_FOR_OO } from "~~/utils/constants";

interface SubmitAssertionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitAssertionModal = ({ isOpen, onClose }: SubmitAssertionModalProps) => {
  const { timestamp } = useGlobalState();

  const [description, setDescription] = useState("");
  const [reward, setReward] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "OptimisticOracle" });

  const handleRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * QUESTIONS_FOR_OO.length);
    setDescription(QUESTIONS_FOR_OO[randomIndex]);
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
      // Reset form after successful submission
      setDescription("");
      setReward("");
      setStartTime("");
      setEndTime("");
      onClose();
    } catch (error) {
      console.log("Error with submission", error);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setDescription("");
    setReward("");
    setStartTime("");
    setEndTime("");
  };

  if (!isOpen) return null;

  return (
    <>
      <input type="checkbox" id="assertion-modal" className="modal-toggle" checked={isOpen} readOnly />
      <label htmlFor="assertion-modal" className="modal cursor-pointer" onClick={handleClose}>
        <label className="modal-box relative max-w-md w-full bg-base-100" htmlFor="" onClick={e => e.stopPropagation()}>
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />

          {/* Close button */}
          <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
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
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <div className="flex border-2 border-base-300 bg-base-200 rounded-full text-accent">
                      <textarea
                        name="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Enter assertion description..."
                        className="input-ghost min-h-[60px] px-4 w-full font-medium placeholder:text-accent/70 text-base-content/70 focus:text-base-content/70 resize-none bg-transparent focus:outline-none focus:border-0"
                        rows={2}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRandomQuestion}
                    className="btn btn-secondary btn-sm"
                    title="Select random question"
                  >
                    🎲
                  </button>
                </div>
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

export const SubmitAssertionButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Button */}
      <div className="my-8 flex justify-center">
        <button className="btn btn-primary btn-lg" onClick={openModal}>
          Submit New Assertion
        </button>
      </div>

      {/* Modal - only mounted when open */}
      {isModalOpen && <SubmitAssertionModal isOpen={isModalOpen} onClose={closeModal} />}
    </>
  );
};
