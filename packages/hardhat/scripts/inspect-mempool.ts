import { ethers } from "hardhat";

async function main() {
  // Get the provider
  const provider = ethers.provider;

  console.log("\nChecking mempool state:");
  
  // Get pending transactions
  const pendingBlock = await provider.send("eth_getBlockByNumber", ["pending", true]);
  console.log(`Number of pending transactions: ${pendingBlock.transactions.length}`);
  
  if (pendingBlock.transactions.length > 0) {
    console.log("\nPending transactions:");
    for (const tx of pendingBlock.transactions) {
      console.log(`\nTransaction ${tx.hash}:`);
      console.log(`  From: ${tx.from}`);
      console.log(`  To: ${tx.to}`);
      console.log(`  Nonce: ${parseInt(tx.nonce, 16)}`);
      console.log(`  Value: ${ethers.formatEther(tx.value)} ETH`);
      console.log(`  Gas Price: ${ethers.formatUnits(tx.gasPrice, "gwei")} Gwei`);
      console.log(`  Data: ${tx.data}`);
    }
  }

  // Get pending transactions count for each account
  const signers = await ethers.getSigners();
  console.log("\nPending transaction counts by account:");
  for (const signer of signers.slice(0, 5)) {
    const pendingCount = await provider.getTransactionCount(signer.address, "pending");
    const latestCount = await provider.getTransactionCount(signer.address, "latest");
    console.log(`\nAccount ${signer.address}:`);
    console.log(`  Pending Count: ${pendingCount}`);
    console.log(`  Latest Count: ${latestCount}`);
    console.log(`  Transactions in mempool: ${pendingCount - latestCount}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 