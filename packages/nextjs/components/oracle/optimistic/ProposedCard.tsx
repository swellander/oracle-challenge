"use client";

interface OracleChallenge {
  id: string;
  description: string;
  category: string;
  proposal: string | number | boolean;
  bond: number;
  challengeStatus: "active" | "ended" | "disputed";
  timeLeft?: string;
}

interface ChallengeCardProps {
  challenge: OracleChallenge;
  isLast?: boolean;
}

const ProposalDisplay = ({ proposal }: { proposal: string | number | boolean }) => {
  if (typeof proposal === "boolean") {
    return <span className="font-medium">{proposal.toString()}</span>;
  }
  if (typeof proposal === "number") {
    return <span className="font-medium">{proposal}</span>;
  }
  return <span className="font-medium">{proposal}</span>;
};

const StatusBadge = ({ status, timeLeft }: { status: "active" | "ended" | "disputed"; timeLeft?: string }) => {
  if (status === "active" && timeLeft) {
    return (
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-base-content">{timeLeft}</span>
        <div className="w-24 h-1 bg-error rounded-full mt-1"></div>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-error">Ended</span>
        <div className="w-24 h-1 bg-error rounded-full mt-1"></div>
      </div>
    );
  }

  if (status === "disputed") {
    return <span className="text-sm font-medium text-warning">Disputed</span>;
  }

  return null;
};

const BondDisplay = ({ bond }: { bond: number }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <span className="text-xs text-primary-content font-bold">🪙</span>
      </div>
      <span className="font-medium">{bond}</span>
    </div>
  );
};

export const ProposedCard = ({ challenge, isLast = false }: ChallengeCardProps) => {
  return (
    <div
      className={`grid grid-cols-4 gap-4 px-6 py-4 border-b border-base-300 hover:bg-base-50 transition-colors ${isLast ? "border-b-0" : ""}`}
    >
      {/* Description Column */}
      <div className="flex items-center">
        <div>
          <div className="font-medium text-base-content mb-1">{challenge.description}</div>
        </div>
      </div>

      {/* Proposal Column */}
      <div className="flex items-center">
        <ProposalDisplay proposal={challenge.proposal} />
      </div>

      {/* Bond Column */}
      <div className="flex items-center">
        <BondDisplay bond={challenge.bond} />
      </div>

      {/* Challenge Period Column */}
      <div className="flex items-center justify-end">
        <StatusBadge status={challenge.challengeStatus} timeLeft={challenge.timeLeft} />
      </div>
    </div>
  );
};

export type { OracleChallenge };
