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
  oraBalance: bigint | undefined;
}

export interface HighlightState {
  staked: boolean;
  price: boolean;
  oraBalance: boolean;
}
