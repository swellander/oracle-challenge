import CONFIG from "./config.json";
import { Config } from "./types";

const config = CONFIG as Config;

export const getRandomPrice = (nodeAddress: string): number => {
  const nodeConfig = config.NODE_CONFIGS[nodeAddress] || config.NODE_CONFIGS.default;
  const isOutlier = Math.random() < nodeConfig.PROBABILITY_OF_OUTLIER_PRICE;

  if (isOutlier) {
    return (
      Math.floor(Math.random() * (config.PRICE_RANGE.OUTLIER.MAX - config.PRICE_RANGE.OUTLIER.MIN + 1)) +
      config.PRICE_RANGE.OUTLIER.MIN
    );
  }
  return (
    Math.floor(Math.random() * (config.PRICE_RANGE.NORMAL.MAX - config.PRICE_RANGE.NORMAL.MIN + 1)) +
    config.PRICE_RANGE.NORMAL.MIN
  );
};
