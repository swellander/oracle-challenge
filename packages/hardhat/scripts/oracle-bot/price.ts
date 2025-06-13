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

  // Get base price range
  const baseMin = config.PRICE_RANGE.BASE.MIN;
  const baseMax = config.PRICE_RANGE.BASE.MAX;
  const basePrice = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;

  // Calculate variance range based on the node's PRICE_VARIANCE
  // PRICE_VARIANCE of 0 means no variance, higher values mean wider range
  const varianceRange = Math.floor(basePrice * nodeConfig.PRICE_VARIANCE);

  // Apply variance to the base price
  const finalPrice = basePrice + (Math.random() * 2 - 1) * varianceRange;

  // Round to nearest integer
  return Math.round(finalPrice);
};
