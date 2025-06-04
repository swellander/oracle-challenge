export interface NodeRowProps {
  address: string;
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
