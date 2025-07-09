import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { formatEther, parseEther, parseUnits } from "viem";
import { fetchPriceFromUniswap } from "../scripts/fetchPriceFromUniswap";

const deployStakingOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { viem } = hre;

  console.log("Deploying Staking Oracle contract...");
  const deployment = await deploy("StakingOracle", {
    contract: "StakingOracle",
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const stakingOracleAddress = deployment.address as `0x${string}`;
  console.log("StakingOracle deployed at:", stakingOracleAddress);

  const accounts = await viem.getWalletClients();
  const nodeAccounts = accounts.slice(1, 11);

  const publicClient = await viem.getPublicClient();

  const orcTokenAddress = await publicClient.readContract({
    address: stakingOracleAddress,
    abi: deployment.abi,
    functionName: "oracleToken",
    args: [],
  });
  console.log("ORC Token deployed at:", orcTokenAddress);
  const initialPrice = Number(formatEther(await fetchPriceFromUniswap())).toFixed(0);

  await Promise.all(
    nodeAccounts.map(account => {
      return account.writeContract({
        address: stakingOracleAddress,
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
        address: stakingOracleAddress,
        abi: deployment.abi,
        functionName: "reportPrice",
        args: [parseUnits(initialPrice.toString(), 6)],
      });
    }),
  );

  await publicClient.transport.request({
    method: "evm_mine",
  });
};

export default deployStakingOracle;
