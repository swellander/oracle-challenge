import { parseUnits } from "viem";
import CONFIG from "./config.json";
import { Config } from "./types";
import { getRandomPrice } from "./price";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import oracleDeployment from "../../deployments/localhost/StakeBasedOracle.json";

const config = CONFIG as Config;
const { abi, address } = oracleDeployment as { abi: any; address: `0x${string}` };

export const reportPrices = async (hre: HardhatRuntimeEnvironment) => {
  const accounts = await hre.viem.getWalletClients();
  const oracleNodeAccounts = accounts.slice(1, 11);

  try {
    return Promise.all(
      oracleNodeAccounts.map(async account => {
        const nodeConfig = config.NODE_CONFIGS[account.account.address] || config.NODE_CONFIGS.default;
        const shouldReport = Math.random() > nodeConfig.PROBABILITY_OF_SKIPPING_REPORT;

        if (shouldReport) {
          const price = parseUnits(getRandomPrice(account.account.address).toString(), 6);
          console.log(`Reporting price ${price} from ${account.account.address}`);
          return await account.writeContract({
            address,
            abi,
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
