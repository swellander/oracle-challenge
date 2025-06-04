import { ethers } from "hardhat";
import { Contract } from "ethers";

export const validateNodes = async () => {
  const [signer] = await ethers.getSigners();

  try {
    const oracleContract = await ethers.getContract<Contract>("StakeBasedOracle", signer.address);
    return await oracleContract.validateNodes();

  } catch (error) {
    console.error("Error validating nodes:", error);
  }
};
