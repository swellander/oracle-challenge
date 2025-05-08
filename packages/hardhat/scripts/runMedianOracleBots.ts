import { ethers } from "hardhat";
import { SimpleOracle__factory } from "../typechain-types";
import fs from "fs";
import path from "path";

async function getDeployedOracles() {
  const deploymentsDir = path.join(__dirname, "../deployments/localhost");
  const deployedOracles: Array<{ address: string; owner: string }> = [];

  fs.readdirSync(deploymentsDir).forEach(file => {
    if (file.startsWith("SimpleOracle") && file.endsWith(".json")) {
      const contractData = JSON.parse(fs.readFileSync(path.join(deploymentsDir, file), "utf-8"));
      deployedOracles.push({
        address: contractData.address,
        owner: contractData.args[0],
      });
    }
  });

  return deployedOracles;
}

function getRandomPrice(): number {
  // Random price between 1990 and 2010
  return Math.floor(Math.random() * 21) + 1990;
}

async function run() {
  const oracles = await getDeployedOracles();
  console.log(`Found ${oracles.length} SimpleOracle contracts`);

  const signers = await ethers.getSigners();

  const signerMap = new Map();
  for (const signer of signers) {
    signerMap.set(await signer.getAddress(), signer);
  }

  for (const oracle of oracles) {
    try {
      const ownerSigner = signerMap.get(oracle.owner);

      if (!ownerSigner) {
        console.warn(`Could not find signer for owner ${oracle.owner} of oracle at ${oracle.address}`);
        continue;
      }

      const oracleContract = SimpleOracle__factory.connect(oracle.address, ownerSigner);

      const randomPrice = getRandomPrice();
      console.log(`Setting price for oracle at ${oracle.address} to ${randomPrice}`);

      const tx = await oracleContract.setPrice(randomPrice);
      await tx.wait();
      console.log(`Transaction confirmed: ${tx.hash}`);
    } catch (error) {
      console.error(`Error updating oracle at ${oracle.address}:`, error);
    }
  }
}

setInterval(() => {
  run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}, 5000);
