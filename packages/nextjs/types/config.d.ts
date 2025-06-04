declare interface OracleConfig {
  PROBABILITY_OF_SKIPPING_REPORT: number;
  PROBABILITY_OF_OUTLIER_PRICE: number;
  PRICE_RANGE: {
    NORMAL: {
      MIN: number;
      MAX: number;
    };
    OUTLIER: {
      MIN: number;
      MAX: number;
    };
  };
  INTERVALS: {
    PRICE_REPORT: number;
    VALIDATION: number;
  };
}

declare module "*/config.json" {
  const config: OracleConfig;
  export default config;
}
