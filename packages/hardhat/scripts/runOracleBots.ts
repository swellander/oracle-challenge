import { reportPrices } from "./oracle-bot/reporting";
import { validateNodes } from "./oracle-bot/validation";
import { ethers } from "hardhat";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const runCycle = async () => {
  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`\n[Block ${blockNumber}] Starting new oracle cycle...`);

    await reportPrices();
    await ethers.provider.send("evm_mine", []);

    await validateNodes();
    await ethers.provider.send("evm_mine", []);

  } catch (error) {
    console.error("Error in oracle cycle:", error);
  }
};

const run = async () => {
  console.log("Starting oracle bot system...");

  while (true) {
    await runCycle();
    await sleep(3000);
  }
};

// Add proper error handling for the main loop
process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

run().catch(error => {
  console.error("Fatal error in oracle bot system:", error);
  process.exit(1);
});
