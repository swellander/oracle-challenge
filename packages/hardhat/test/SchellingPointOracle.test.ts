// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { time } = require("@nomicfoundation/hardhat-network-helpers");

// describe("SchellingPointOracle", function () {
//   let schellingPointOracle;
//   let owner;
//   let addr1;
//   let addr2;
//   let addr3;
//   let addrs;

//   const MINIMUM_STAKE = ethers.parseEther("100");
//   const ONE_ETHER = ethers.parseEther("1");
//   const TEN_ETHER = ethers.parseEther("10");

//   beforeEach(async function () {
//     // Create necessary mock contracts or dependencies

//     // Deploy the SchellingPointOracle contract
//     const SchellingPointOracle = await ethers.getContractFactory("SchellingPointOracle");
//     [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
//     schellingPointOracle = await SchellingPointOracle.deploy();
//   });

//   describe("Node Registration", function () {
//     it("Should register a node with sufficient stake", async function () {
//       await expect(schellingPointOracle.connect(addr1).registerNode({ value: MINIMUM_STAKE }))
//         .to.emit(schellingPointOracle, "NodeRegistered")
//         .withArgs(addr1.address, MINIMUM_STAKE);

//       const node = await schellingPointOracle.nodes(addr1.address);
//       expect(node.nodeAddress).to.equal(addr1.address);
//       expect(node.stakedAmount).to.equal(MINIMUM_STAKE);
//       expect(node.lastReportedPrice).to.equal(0);
//       expect(node.lastReportedTimestamp).to.equal(0);
//     });

//     it("Should fail to register with insufficient stake", async function () {
//       const insufficientStake = ethers.parseEther("99");
//       await expect(schellingPointOracle.connect(addr1).registerNode({ value: insufficientStake })).to.be.revertedWith(
//         "Insufficient stake",
//       );
//     });

//     it("Should register multiple nodes", async function () {
//       await schellingPointOracle.connect(addr1).registerNode({ value: MINIMUM_STAKE });
//       await schellingPointOracle.connect(addr2).registerNode({ value: MINIMUM_STAKE });

//       const node1 = await schellingPointOracle.nodes(addr1.address);
//       const node2 = await schellingPointOracle.nodes(addr2.address);

//       expect(node1.nodeAddress).to.equal(addr1.address);
//       expect(node2.nodeAddress).to.equal(addr2.address);

//       expect(await schellingPointOracle.nodeAddresses(0)).to.equal(addr1.address);
//       expect(await schellingPointOracle.nodeAddresses(1)).to.equal(addr2.address);
//     });
//   });

//   describe("Price Reporting", function () {
//     beforeEach(async function () {
//       // Register test nodes
//       await schellingPointOracle.connect(addr1).registerNode({ value: MINIMUM_STAKE });
//       await schellingPointOracle.connect(addr2).registerNode({ value: MINIMUM_STAKE });
//       await schellingPointOracle.connect(addr3).registerNode({ value: MINIMUM_STAKE });
//     });

//     it("Should allow a registered node to report price", async function () {
//       const price = ethers.parseUnits("1500", 0); // Representing $1500

//       await expect(schellingPointOracle.connect(addr1).reportPrice(price))
//         .to.emit(schellingPointOracle, "PriceReported")
//         .withArgs(addr1.address, price);

//       const node = await schellingPointOracle.nodes(addr1.address);
//       expect(node.lastReportedPrice).to.equal(price);
//       expect(node.lastReportedTimestamp).to.not.equal(0);
//     });

//     it("Should not allow unregistered nodes to report prices", async function () {
//       const unregistered = addrs[0];
//       const price = ethers.parseUnits("1500", 0);

//       await expect(
//         schellingPointOracle.connect(unregistered).reportPrice(price)
//       ).to.be.revertedWith("Not a registered node");
//     });
//   });

//   describe("Price Aggregation and Slashing", function () {
//     beforeEach(async function () {
//       // Register and fund test nodes
//       await schellingPointOracle.connect(addr1).registerNode({ value: MINIMUM_STAKE });
//       await schellingPointOracle.connect(addr2).registerNode({ value: MINIMUM_STAKE });
//       await schellingPointOracle.connect(addr3).registerNode({ value: MINIMUM_STAKE });

//       // Report initial prices
//       await schellingPointOracle.connect(addr1).reportPrice(1500);
//       await schellingPointOracle.connect(addr2).reportPrice(1520);
//       await schellingPointOracle.connect(addr3).reportPrice(1480);
//     });

//     it.only("Should calculate the median price correctly", async function () {
//       const txResponse = await schellingPointOracle.getPrice();
//       const price = txResponse.value;

//       expect(price).to.equal(1500);
//     });

//     it("Should slash nodes with outlier prices", async function () {
//       // Report a significantly outlier price from addr3
//       await schellingPointOracle.connect(addr3).reportPrice(3000);

//       // Get the node data before slashing
//       const nodeBefore = await schellingPointOracle.nodes(addr3.address);

//       // Call getPrice which also executes validateAndSlashNodes
//       await schellingPointOracle.getPrice();

//       // Get the node data after slashing
//       const nodeAfter = await schellingPointOracle.nodes(addr3.address);

//       // Verify that the node was slashed
//       expect(nodeAfter.stakedAmount).to.equal(nodeBefore.stakedAmount.sub(TEN_ETHER));
//     });

//     it("Should slash nodes that don't report prices in time", async function () {
//       // Advance time by more than 2 minutes
//       await time.increase(121);

//       // Get node data before slashing
//       const nodeBefore = await schellingPointOracle.nodes(addr1.address);

//       // Call getPrice which also executes validateAndSlashNodes
//       await schellingPointOracle.getPrice();

//       // Get the node data after slashing
//       const nodeAfter = await schellingPointOracle.nodes(addr1.address);

//       // Verify that the node was slashed
//       expect(nodeAfter.stakedAmount).to.equal(nodeBefore.stakedAmount.sub(ONE_ETHER));
//     });
//   });

//   describe("Edge Cases and Error Handling", function () {
//     beforeEach(async function () {
//       await schellingPointOracle.connect(addr1).registerNode({ value: MINIMUM_STAKE });
//     });

//     it("Should handle a node with insufficient stake for slashing", async function () {
//       // Report price to make the node active
//       await schellingPointOracle.connect(addr1).reportPrice(1500);

//       // Reduce stake to just above 10 ETH (the slashing amount for outliers)
//       const lowStake = ONE_ETHER.mul(11);
//       const nodeData = await schellingPointOracle.nodes(addr1.address);
//       const amountToWithdraw = nodeData.stakedAmount.sub(lowStake);

//       // Note: We would need a withdraw function in the contract to test this properly
//       // For this test we'll assume it exists or modify our approach

//       // Report an extreme outlier price to trigger slashing
//       await schellingPointOracle.connect(addr1).reportPrice(100000);

//       // This should work without reverting despite the low stake
//       await schellingPointOracle.getPrice();

//       // Get the node data after potential slashing
//       const nodeAfter = await schellingPointOracle.nodes(addr1.address);

//       // The node should have been slashed by 10 ETH or have 1 ETH remaining
//       expect(nodeAfter.stakedAmount).to.be.at.least(ONE_ETHER);
//     });

//     it("Should handle various price distributions correctly", async function () {
//       // Register more nodes and report various price patterns
//       await schellingPointOracle.connect(addr2).registerNode({ value: MINIMUM_STAKE });
//       await schellingPointOracle.connect(addr3).registerNode({ value: MINIMUM_STAKE });

//       // Scenario 1: All prices the same
//       await schellingPointOracle.connect(addr1).reportPrice(1500);
//       await schellingPointOracle.connect(addr2).reportPrice(1500);
//       await schellingPointOracle.connect(addr3).reportPrice(1500);

//       let price = await schellingPointOracle.getPrice();
//       expect(price).to.equal(1500);

//       // Scenario 2: Small spread
//       await schellingPointOracle.connect(addr1).reportPrice(1490);
//       await schellingPointOracle.connect(addr2).reportPrice(1500);
//       await schellingPointOracle.connect(addr3).reportPrice(1510);

//       price = await schellingPointOracle.getPrice();
//       expect(price).to.equal(1500);

//       // Scenario 3: One outlier (should be slashed but median still works)
//       await schellingPointOracle.connect(addr1).reportPrice(1490);
//       await schellingPointOracle.connect(addr2).reportPrice(1500);
//       await schellingPointOracle.connect(addr3).reportPrice(2500); // Outlier

//       price = await schellingPointOracle.getPrice();
//       expect(price).to.equal(1495); // Median of valid prices (1490, 1500)
//     });
//   });

//   describe("Helper functions", function() {
//     it("Should calculate mean correctly", async function() {
//       // We need to expose the mean function for testing or add a test-only view function
//       // For this example, we'll assume we can call it directly
//       // This would need to be modified based on your actual contract setup

//       // This is a placeholder - in a real test you'd need to find a way to test internal functions
//       const testValues = [1000, 2000, 3000];
//       const expectedMean = 2000;

//       // Ideally we'd have a test helper function in the contract
//       // const calculatedMean = await schellingPointOracle.testMean(testValues);
//       // expect(calculatedMean).to.equal(expectedMean);
//     });

//     it("Should calculate standard deviation correctly", async function() {
//       // Similar to the mean test, we need access to test the internal function
//       // This is a placeholder

//       // In a real test, you might:
//       // const values = [1400, 1500, 1600];
//       // const mean = 1500;
//       // const expectedStdDev = 81; // sqrt(6666.67)

//       // const calculatedStdDev = await schellingPointOracle.testGetStdDeviation(values, mean);
//       // expect(calculatedStdDev).to.equal(expectedStdDev);
//     });
//   });
// });
