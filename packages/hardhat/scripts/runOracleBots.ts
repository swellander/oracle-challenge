import { ethers } from "hardhat";
import { Contract } from "ethers";

function getRandomPrice(): number {
  // Random price between 1990 and 2010
  return Math.floor(Math.random() * 21) + 1990;
}

async function reportPrices() {
  const signers = await ethers.getSigners();
  const accounts = signers.slice(0, 10);

  Promise.all(
    accounts.map(async account => {
      const oracle = await ethers.getContract<Contract>("StakeBasedOracle", account.address);
      const price = getRandomPrice();
      console.log(`Reporting price ${price} from ${account.address}`);
      return oracle.reportPrice(price);
    }),
  );
}

const run = () => {
  setInterval(() => {
    reportPrices().catch(error => {
      console.error(error);
      process.exitCode = 1;
    });
  }, 2000);
};

run();
