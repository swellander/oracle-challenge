import { ethers } from "hardhat";
import { Contract, formatEther } from "ethers";
import CONFIG from "./config.json";
import { Config } from "./types";
import { getRandomPrice } from "./price";

const config = CONFIG as Config;

export const reportPrices = async () => {
  const signers = await ethers.getSigners();
  const oracleNodeAccounts = signers.slice(1, 11);

  try {
    // First get all oracle contract instances to avoid delay in sequential access
    const oracleContracts = await Promise.all(
      oracleNodeAccounts.map(account => ethers.getContract<Contract>("StakeBasedOracle", account.address)),
    );

    // Submit all price reports in parallel
    return Promise.all(
      oracleNodeAccounts.map(async (account, i) => {
        const nodeConfig = config.NODE_CONFIGS[account.address] || config.NODE_CONFIGS.default;
        const shouldReport = Math.random() > nodeConfig.PROBABILITY_OF_SKIPPING_REPORT;

        if (shouldReport) {
          const oracle = oracleContracts[i];
          const price = getRandomPrice(account.address);
          console.log(`Reporting price ${price} from ${account.address}`);
          return await oracle.reportPrice(price);
        } else {
          console.log(`Skipping price report from ${account.address}`);
          return Promise.resolve();
        }
      })
    );

  } catch (error) {
    console.error("Error reporting prices:", error);
  }
};
