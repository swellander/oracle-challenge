import { ethers } from "hardhat";
import { Contract } from "ethers";

const validateNodes = async () => {
  const signers = await ethers.getSigners();
  const oracleAdminAccount = signers[0];
  const oracle = await ethers.getContract<Contract>("StakeBasedOracle", oracleAdminAccount.address);
  console.log("Validating nodes...");
  await oracle.validateNodes();
};

const getRandomPrice = () => {
  // Random price between 1990 and 2010
  return Math.floor(Math.random() * 21) + 1990;
};

const reportPrices = async () => {
  const signers = await ethers.getSigners();
  const oracleNodeAccounts = signers.slice(1, 11);
  try {
    await Promise.all(
      oracleNodeAccounts.map(async account => {
        const oracle = await ethers.getContract<Contract>("StakeBasedOracle", account.address);
        const price = getRandomPrice();
        console.log(`Reporting price ${price} from ${account.address}`);
        return oracle.reportPrice(price);
      }),
    );
  } catch (error) {
    console.error("Error reporting prices:", error);
  }
};

const run = async () => {
  // Initial price reports
  await reportPrices();
  
  // Set up intervals
  setInterval(async () => {
    await reportPrices();
  }, 2000);

  setInterval(async () => {
    await validateNodes();
  }, 5000);
};

run().catch(console.error);
