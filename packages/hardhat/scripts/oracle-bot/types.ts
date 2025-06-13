interface NodeConfig {
  PROBABILITY_OF_SKIPPING_REPORT: number;
  PRICE_VARIANCE: number; // Higher number means wider price range
}

interface PriceRange {
  MIN: number;
  MAX: number;
}

export interface Config {
  PRICE_RANGE: {
    BASE: PriceRange; // Base price range that will be modified by variance
  };
  INTERVALS: {
    PRICE_REPORT: number;
    VALIDATION: number;
  };
  NODE_CONFIGS: {
    [key: string]: NodeConfig;
    default: NodeConfig;
  };
}
