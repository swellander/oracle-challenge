import { Config } from "./types";
import fs from "fs";
import path from "path";

const getConfig = (): Config => {
  const configPath = path.join(__dirname, "config.json");
  const configContent = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(configContent) as Config;
};

export const getRandomPrice = (nodeAddress: string): number => {
  const config = getConfig();
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
