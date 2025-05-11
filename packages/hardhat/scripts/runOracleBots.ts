import { ethers } from "hardhat";
import { Contract } from "ethers";

const PROBABILITY_OF_PRICE_REPORT = 0.8;

const getRandomPrice = () => {
  // Random price between 1990 and 2010
  return Math.floor(Math.random() * 21) + 1990;
};

const validateNodes = async () => {
  const signers = await ethers.getSigners();
  const oracleAdminAccount = signers[0];
  const oracle = await ethers.getContract<Contract>("StakeBasedOracle", oracleAdminAccount.address);
  console.log("Validating nodes...");
  await oracle.validateNodes();
};

const reportPrices = async () => {
  const signers = await ethers.getSigners();
  const oracleNodeAccounts = signers.slice(1, 11);
  try {
    await Promise.all(
      oracleNodeAccounts.map(async account => {
        const shouldReport = Math.random() < PROBABILITY_OF_PRICE_REPORT;
        if (shouldReport) {
          const oracle = await ethers.getContract<Contract>("StakeBasedOracle", account.address);
          const price = getRandomPrice();
          console.log(`Reporting price ${price} from ${account.address}`);
          return oracle.reportPrice(price);
        } else {
          console.log(`Skipping price report from ${account.address}`);
          return Promise.resolve();
        }
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
  }, 1000);

  setInterval(async () => {
    await validateNodes();
  }, 5000);
};

run().catch(console.error);
