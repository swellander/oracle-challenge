export interface NodeRowProps {
  address: string;
  index: number;
}

export interface WhitelistRowProps extends NodeRowProps {
  isActive: boolean;
}

export interface NodeInfo {
  stakedAmount: bigint | undefined;
  lastReportedPrice: bigint | undefined;
  orcBalance: bigint | undefined;
}

export interface HighlightState {
  staked: boolean;
  price: boolean;
  orcBalance: boolean;
}

export interface Assertion {
  asserter: string;
  proposer: string;
  disputer: string;
  proposedOutcome: boolean;
  resolvedOutcome: boolean;
  reward: bigint;
  bond: bigint;
  startTime: bigint;
  endTime: bigint;
  claimed: boolean;
  winner: string;
  description: string;
}

export interface AssertionWithId extends Assertion {
  assertionId: number;
}

export interface AssertionModalProps {
  assertion: AssertionWithId;
  isOpen: boolean;
  onClose: () => void;
}
