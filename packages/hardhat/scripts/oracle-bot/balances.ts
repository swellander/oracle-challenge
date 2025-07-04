import { ethers } from "hardhat";
import { formatEther } from "ethers";

export async function reportBalances() {
  try {
    // Get all signers (accounts)
    const signers = await ethers.getSigners();
    const oracleNodes = signers.slice(1, 11); // Get oracle node accounts

    // Get the StakingOracle contract
    const oracleContract = await ethers.getContract("StakingOracle");
    const oracle = await ethers.getContractAt("StakingOracle", oracleContract.target);

    // Get the ORC token address and create contract instance
    const orcTokenAddress = await oracle.oracleToken();
    const orcToken = await ethers.getContractAt("contracts/OracleToken.sol:ORC", orcTokenAddress);

    console.log("\nNode Balances:");
    for (const node of oracleNodes) {
      const nodeInfo = await oracle.nodes(node.address);
      const orcBalance = await orcToken.balanceOf(node.address);
      console.log(`\nNode ${node.address}:`);
      console.log(`  Staked ETH: ${formatEther(nodeInfo.stakedAmount)} ETH`);
      console.log(`  ORC Balance: ${formatEther(orcBalance)} ORC`);
    }
  } catch (error) {
    console.error("Error reporting balances:", error);
  }
}
