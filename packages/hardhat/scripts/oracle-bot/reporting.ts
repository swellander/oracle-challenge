import { parseUnits, PublicClient } from "viem";
import { Config } from "./types";
import { getRandomPrice } from "./price";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import path from "path";
import { DeployedContract } from "hardhat-deploy/types";

const getConfig = (): Config => {
  const configPath = path.join(__dirname, "config.json");
  const configContent = fs.readFileSync(configPath, "utf-8");
  const config = JSON.parse(configContent) as Config;
  return config;
};

const getStakedAmount = async (
  publicClient: PublicClient,
  nodeAddress: `0x${string}`,
  StakeBasedOracle: DeployedContract,
) => {
  const nodeInfo = (await publicClient.readContract({
    address: StakeBasedOracle.address as `0x${string}`,
    abi: StakeBasedOracle.abi,
    functionName: "nodes",
    args: [nodeAddress],
  })) as any[];

  const [, stakedAmount] = nodeInfo;
  return stakedAmount as bigint;
};

export const reportPrices = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const StakeBasedOracle = await deployments.get("StakeBasedOracle");

  const config = getConfig();
  const accounts = await hre.viem.getWalletClients();
  const oracleNodeAccounts = accounts.slice(1, 11);
  const publicClient = await hre.viem.getPublicClient();

  // Get minimum stake requirement from contract
  const minimumStake = (await publicClient.readContract({
    address: StakeBasedOracle.address as `0x${string}`,
    abi: StakeBasedOracle.abi,
    functionName: "MINIMUM_STAKE",
    args: [],
  })) as unknown as bigint;

  try {
    return Promise.all(
      oracleNodeAccounts.map(async account => {
        const nodeConfig = config.NODE_CONFIGS[account.account.address] || config.NODE_CONFIGS.default;
        const shouldReport = Math.random() > nodeConfig.PROBABILITY_OF_SKIPPING_REPORT;
        const stakedAmount = await getStakedAmount(publicClient, account.account.address, StakeBasedOracle);
        if (stakedAmount < minimumStake) {
          console.log(`Insufficient stake for ${account.account.address} for price reporting`);
          return Promise.resolve();
        }

        if (shouldReport) {
          const price = parseUnits(getRandomPrice(account.account.address).toString(), 6);
          console.log(`Reporting price ${price} from ${account.account.address}`);
          return await account.writeContract({
            address: StakeBasedOracle.address as `0x${string}`,
            abi: StakeBasedOracle.abi,
            functionName: "reportPrice",
            args: [price],
          });
        } else {
          console.log(`Skipping price report from ${account.account.address}`);
          return Promise.resolve();
        }
      }),
    );
  } catch (error) {
    console.error("Error reporting prices:", error);
  }
};
