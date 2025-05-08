import { ethers } from "hardhat";
import { Contract } from "ethers";

const validateNodes = async () => {
  const signers = await ethers.getSigners();
  const oracleAdminAccount = signers[0];
  const oracle = await ethers.getContract<Contract>("StakeBasedOracle", oracleAdminAccount.address);
  console.log("Validating nodes...");
  oracle.validateNodes();
};

const getRandomPrice = () => {
  // Random price between 1990 and 2010
  return Math.floor(Math.random() * 21) + 1990;
};

const reportPrices = async () => {
  const signers = await ethers.getSigners();
  const oracleNodeAccounts = signers.slice(1, 11);
  Promise.all(
    oracleNodeAccounts.map(async account => {
      const oracle = await ethers.getContract<Contract>("StakeBasedOracle", account.address);
      const price = getRandomPrice();
      console.log(`Reporting price ${price} from ${account.address}`);
      return oracle.reportPrice(price);
    }),
  );
};

const run = () => {
  setInterval(() => {
    reportPrices();
  }, 2000);

  setInterval(() => {
    validateNodes();
  }, 2000);
};

run();
