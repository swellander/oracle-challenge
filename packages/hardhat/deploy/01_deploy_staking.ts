import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseEther, parseUnits } from "viem";

const deployStakingOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { viem } = hre;

  console.log("Deploying Stake-based Oracle contract...");
  const deployment = await deploy("StakeBasedOracle", {
    contract: "StakeBasedOracle",
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const stakeOracleAddress = deployment.address as `0x${string}`;
  console.log("StakeBasedOracle deployed at:", stakeOracleAddress);

  const accounts = await viem.getWalletClients();
  const nodeAccounts = accounts.slice(1, 11);

  const publicClient = await viem.getPublicClient();

  const orcTokenAddress = await publicClient.readContract({
    address: stakeOracleAddress,
    abi: deployment.abi,
    functionName: "oracleToken",
    args: [],
  });
  console.log("ORC Token deployed at:", orcTokenAddress);

  await Promise.all(
    nodeAccounts.map(account => {
      return account.writeContract({
        address: stakeOracleAddress,
        abi: deployment.abi,
        functionName: "registerNode",
        args: [],
        value: parseEther("15"),
      });
    }),
  );

  await publicClient.transport.request({
    method: "evm_mine",
  });

  await Promise.all(
    nodeAccounts.map(account => {
      return account.writeContract({
        address: stakeOracleAddress,
        abi: deployment.abi,
        functionName: "reportPrice",
        args: [parseUnits("2000", 6)],
      });
    }),
  );

  await publicClient.transport.request({
    method: "evm_mine",
  });
};

export default deployStakingOracle;
