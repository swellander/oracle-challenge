interface NodeConfig {
  PROBABILITY_OF_SKIPPING_REPORT: number;
  PROBABILITY_OF_OUTLIER_PRICE: number;
}

interface PriceRange {
  MIN: number;
  MAX: number;
}

export interface Config {
  PRICE_RANGE: {
    NORMAL: PriceRange;
    OUTLIER: PriceRange;
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
