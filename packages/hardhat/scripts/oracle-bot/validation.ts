import { HardhatRuntimeEnvironment } from "hardhat/types";
import oracleDeployment from "../../deployments/localhost/StakingOracle.json";

const { abi, address } = oracleDeployment as { abi: any; address: `0x${string}` };

export const validateNodes = async (hre: HardhatRuntimeEnvironment) => {
  const [account] = await hre.viem.getWalletClients();

  try {
    return await account.writeContract({
      address,
      abi,
      functionName: "validateNodes",
      args: [],
    });
  } catch (error) {
    console.error("Error validating nodes:", error);
  }
};
