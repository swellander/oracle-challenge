import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, ethers } from "ethers";

const deployStakingOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { ethers } = hre;

  console.log("Deploying Stake-based Oracle contract...");
  await deploy("StakeBasedOracle", {
    contract: "StakeBasedOracle",
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get contract instance
  const stakingOracle = await ethers.getContract<Contract>("StakeBasedOracle", deployer);

  // Get the ORC token address from the oracle contract
  const orcTokenAddress = await stakingOracle.oracleToken();
  console.log("ORC Token deployed at:", orcTokenAddress);

  // Get signers for node accounts
  const signers = await ethers.getSigners();
  const accounts = signers.slice(1, 11);

  // Register nodes with initial stake
  console.log("\nSubmitting node registration transactions...");
  for (const account of accounts) {
    const stakingOracle = await ethers.getContract<Contract>("StakeBasedOracle", account.address);
    console.log(`Submitting registration for ${account.address}...`);
    const tx = await stakingOracle.registerNode({ value: ethers.parseEther("50") });
    console.log(`Transaction hash: ${tx.hash}`);
  }

  // Add debugger statement here to inspect state after registrations
  console.log("\nPausing for inspection. In debug mode, you can now inspect the state.");
  debugger;

  // Mine the block
  console.log("\nMining block for registrations...");
  await ethers.provider.send("evm_mine", []);

  // Report initial prices
  console.log("\nSubmitting price reporting transactions...");
  for (const account of accounts) {
    const stakingOracle = await ethers.getContract<Contract>("StakeBasedOracle", account.address);
    console.log(`Submitting price report for ${account.address}...`);
    const tx = await stakingOracle.reportPrice(2000);
    console.log(`Transaction hash: ${tx.hash}`);
  }

  // Add debugger statement here to inspect state after price reports
  console.log("\nPausing for inspection. In debug mode, you can now inspect the state.");
  debugger;

  // Mine the block
  console.log("\nMining block for price reports...");
  await ethers.provider.send("evm_mine", []);

  console.log("\nDeployment completed:");
  console.log("- StakeBasedOracle deployed at:", stakingOracle.target);
  console.log("- ORC Token deployed at:", orcTokenAddress);
};

export default deployStakingOracle;
