"use client";

import { useState } from "react";
import { IntegerInput } from "~~/components/scaffold-eth";
import { InputBase } from "~~/components/scaffold-eth/Input/InputBase";

export const SubmitAssertionButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [bond, setBond] = useState<string>("");
  const [reward, setReward] = useState<string>("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form when closing
    setDescription("");
    setBond("");
    setReward("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }

    // if (!bond || bond <= 0) {
    //   alert("Please enter a valid bond amount");
    //   return;
    // }

    // if (!reward || reward <= 0) {
    //   alert("Please enter a valid reward amount");
    //   return;
    // }

    // Call onSubmit callback if provided
    // if (onSubmit) {
    //   onSubmit({
    //     description: description.trim(),
    //     bond: Number(bond),
    //     reward: Number(reward)
    //   });
    // }

    // Close modal and reset form
    closeModal();
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

          {/* Modal Content */}
          <div className="">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Submit New Assertion</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Description Input */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <InputBase
                  name="description"
                  value={description}
                  onChange={newValue => setDescription(newValue)}
                  placeholder="Enter assertion description..."
                />
              </div>

              {/* Bond and Reward Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Bond (ETH)</span>
                  </label>
                  {/* <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="0.0"
                    value={bond}
                    onChange={e => setBond(e.target.value ? Number(e.target.value) : "")}
                    min="0"
                    step="0.01"
                    required
                  /> */}
                  <IntegerInput
                    name="bond"
                    placeholder="0.05"
                    value={bond}
                    onChange={newValue => setBond(newValue)}
                    disableMultiplyBy1e18
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Reward (ETH)</span>
                  </label>
                  <IntegerInput
                    name="reward"
                    placeholder="0.1"
                    value={reward}
                    onChange={newValue => setReward(newValue)}
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
