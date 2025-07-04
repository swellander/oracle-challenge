// import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { DeployFunction } from "hardhat-deploy/types";
// import { Contract } from "ethers";

// /**
//  * Deploys SimpleOracle instances and a WhitelistOracle contract
//  *
//  * @param hre HardhatRuntimeEnvironment object.
//  */
// const deployOracleContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
// const { deployer } = await hre.getNamedAccounts();
// const { deploy } = hre.deployments;
// const { ethers } = hre;
// console.log("Deploying Oracle contracts...");
// const signers = await ethers.getSigners();
// const accounts = signers.slice(0, 10);
// const simpleOracleAddresses: string[] = [];
// for (let i = 0; i < accounts.length; i++) {
//   const account = accounts[i];
//   console.log(`Deploying SimpleOracle ${i + 1}/10 from account: ${account.address}`);
//   const simpleOracle = await deploy(`SimpleOracle_${i + 1}`, {
//     contract: "SimpleOracle",
//     from: account.address,
//     args: [account.address], // Each oracle has its own owner
//     log: true,
//     autoMine: true,
//   });
//   simpleOracleAddresses.push(simpleOracle.address);
// }
// console.log("Deploying WhitelistOracle...");
// await deploy("WhitelistOracle", {
//   from: deployer,
//   args: [],
//   log: true,
//   autoMine: true,
// });
// const whitelistOracleContract = await ethers.getContract<Contract>("WhitelistOracle", deployer);
// console.log("Adding SimpleOracle instances to WhitelistOracle...");
// for (let i = 0; i < simpleOracleAddresses.length; i++) {
//   const oracleAddress = simpleOracleAddresses[i];
//   console.log(`Adding SimpleOracle ${i + 1}/10: ${oracleAddress}`);
//   await whitelistOracleContract.addOracle(oracleAddress);
// }
// console.log("Setting initial prices for each SimpleOracle...");
// for (let i = 0; i < accounts.length; i++) {
//   const oracleContract = await ethers.getContract<Contract>(`SimpleOracle_${i + 1}`, accounts[i]);
//   const initialPrice = 2000;
//   await oracleContract.setPrice(initialPrice);
//   console.log(`Set price for SimpleOracle_${i + 1} to: ${initialPrice.toString()}`);
// }
// console.log("Calculating initial median price...");
// const medianPrice = await whitelistOracleContract.getPrice();
// console.log(`Initial median price: ${medianPrice.toString()}`);
// console.log("All oracle contracts deployed and configured successfully!");
// };

// export default deployOracleContracts;
// deployOracleContracts.tags = ["Oracles"];
