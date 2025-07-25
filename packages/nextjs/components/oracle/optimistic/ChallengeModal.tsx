"use client";

interface ProposedChallenge {
  id: string;
  description: string;
  bond: number;
  reward: number;
}

interface ChallengeModalProps {
  challenge: ProposedChallenge | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengeModal = ({ challenge, isOpen, onClose }: ChallengeModalProps) => {
  if (!challenge) return null;

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
                  <span className="font-bold">Description:</span> {challenge.description}
                </p>

                <p className="text-base-content">
                  <span className="font-bold">Bond:</span> {challenge.bond} ETH
                </p>

                <p className="text-base-content">
                  <span className="font-bold">Reward:</span> {challenge.reward} ETH
                </p>
              </div>

              {/* Right Column */}
              <div className="space-y-4 text-center flex flex-col justify-center h-full">
                {/* Proposed Answer Section */}
                <div className="bg-base-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium">Propose Answer</span>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button className="btn btn-primary flex-1">True</button>
                    <button className="btn btn-primary flex-1">False</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
          </div>
        </label>
      </label>
    </>
  );
};
