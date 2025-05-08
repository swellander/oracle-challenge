import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployStakingOracle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { ethers } = hre;

  console.log("Deploying Stake-based Oracle contract...");

  const signers = await ethers.getSigners();
  const accounts = signers.slice(1, 11);

  await deploy("StakeBasedOracle", {
    contract: "StakeBasedOracle",
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  await Promise.all(
    accounts.map(async account => {
      const stakingOracle = await ethers.getContract<Contract>("StakeBasedOracle", account.address);
      console.log(`Adding account ${account.address} as a node...`);
      await stakingOracle.registerNode({ value: ethers.parseEther("50") });
    }),
  );

  await Promise.all(
    accounts.map(async account => {
      const stakingOracle = await ethers.getContract<Contract>("StakeBasedOracle", account.address);
      console.log(`${account.address} reporting price 1500...`);
      await stakingOracle.reportPrice(ethers.parseEther("1500"));
    }),
  );
};

export default deployStakingOracle;
