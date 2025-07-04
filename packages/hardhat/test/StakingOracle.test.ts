// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { time } = require("@nomicfoundation/hardhat-network-helpers");

// describe.only("StakingOracle", function () {
//   let StakingOracle;
//   let oracle;
//   let orcToken;
//   let owner;
//   let node1;
//   let node2;
//   let node3;
//   let addrs;

//   const MINIMUM_STAKE = ethers.parseEther("10");
//   const STALE_DATA_WINDOW = 10; // 10 seconds

//   beforeEach(async function () {
//     // Deploy the contracts
//     [owner, node1, node2, node3, ...addrs] = await ethers.getSigners();

//     // Deploy the oracle contract (which will also deploy the ORC token)
//     const StakingOracleFactory = await ethers.getContractFactory("StakingOracle");
//     oracle = await StakingOracleFactory.deploy();

//     // Get the ORC token instance
//     const orcTokenAddress = await oracle.oracleToken();
//     orcToken = await ethers.getContractAt("ORC", orcTokenAddress);
//   });

//   describe("Node Registration", function () {
//     it("Should allow nodes to register with minimum stake", async function () {
//       await expect(oracle.connect(node1).registerNode({ value: MINIMUM_STAKE }))
//         .to.emit(oracle, "NodeRegistered")
//         .withArgs(node1.address, MINIMUM_STAKE);

//       const nodeInfo = await oracle.nodes(node1.address);
//       expect(nodeInfo.nodeAddress).to.equal(node1.address);
//       expect(nodeInfo.stakedAmount).to.equal(MINIMUM_STAKE);
//       expect(nodeInfo.lastReportedPrice).to.equal(0);
//       expect(nodeInfo.lastReportedTimestamp).to.equal(0);

//       expect(await oracle.nodeAddresses(0)).to.equal(node1.address);
//     });

//     it("Should reject registration with insufficient stake", async function () {
//       const insufficientStake = ethers.parseEther("5");
//       await expect(
//         oracle.connect(node1).registerNode({ value: insufficientStake })
//       ).to.be.revertedWith("Insufficient stake");
//     });
//   });

//   describe("Price Reporting", function () {
//     beforeEach(async function () {
//       // Register node1
//       await oracle.connect(node1).registerNode({ value: MINIMUM_STAKE });
//     });

//     it("Should allow registered nodes to report prices", async function () {
//       const price = 1500; // Raw price value

//       await expect(oracle.connect(node1).reportPrice(price))
//         .to.emit(oracle, "PriceReported")
//         .withArgs(node1.address, price);

//       const nodeInfo = await oracle.nodes(node1.address);
//       expect(nodeInfo.lastReportedPrice).to.equal(price);
//       expect(nodeInfo.lastReportedTimestamp).to.be.gt(0);
//     });

//     it("Should reject price reports from unregistered nodes", async function () {
//       const price = 1500;

//       await expect(
//         oracle.connect(node2).reportPrice(price)
//       ).to.be.revertedWith("Not a registered node");
//     });
//   });

//   describe("Price Aggregation and Node Management", function () {
//     beforeEach(async function () {
//       // Register multiple nodes
//       await oracle.connect(node1).registerNode({ value: MINIMUM_STAKE });
//       await oracle.connect(node2).registerNode({ value: MINIMUM_STAKE });
//       await oracle.connect(node3).registerNode({ value: MINIMUM_STAKE });

//       // Report initial prices
//       await oracle.connect(node1).reportPrice(1450);
//       await oracle.connect(node2).reportPrice(1500);
//       await oracle.connect(node3).reportPrice(1550);
//     });

//     it("Should correctly calculate median price", async function () {
//       const price = await oracle.getPrice();
//       expect(price).to.equal(1500); // Median of [1450, 1500, 1550]
//     });

//     it("Should slash stale nodes", async function () {
//       // Advance time by more than the stale data window
//       await time.increase(STALE_DATA_WINDOW + 1);

//       // Only node1 reports a new price
//       await oracle.connect(node1).reportPrice(1600);

//       // Call validateNodes which will slash stale nodes
//       await oracle.validateNodes();

//       // Check node1 was not slashed
//       const node1Info = await oracle.nodes(node1.address);
//       expect(node1Info.stakedAmount).to.equal(MINIMUM_STAKE);

//       // Check node2 and node3 were slashed
//       const node2Info = await oracle.nodes(node2.address);
//       const node3Info = await oracle.nodes(node3.address);

//       // Each node should lose 1 ETH
//       const expectedSlashedAmount = MINIMUM_STAKE - ethers.parseEther("1");
//       expect(node2Info.stakedAmount).to.equal(expectedSlashedAmount);
//       expect(node3Info.stakedAmount).to.equal(expectedSlashedAmount);
//     });

//     it("Should reward fresh nodes with ORC tokens", async function () {
//       // All nodes report fresh prices
//       await oracle.connect(node1).reportPrice(1475);
//       await oracle.connect(node2).reportPrice(1500);
//       await oracle.connect(node3).reportPrice(1525);

//       // Call validateNodes which will reward fresh nodes
//       await oracle.validateNodes();

//       // Check all nodes received ORC tokens (10 tokens each)
//       const expectedReward = ethers.parseUnits("10", 18);
//       const node1Balance = await orcToken.balanceOf(node1.address);
//       const node2Balance = await orcToken.balanceOf(node2.address);
//       const node3Balance = await orcToken.balanceOf(node3.address);

//       expect(node1Balance).to.equal(expectedReward);
//       expect(node2Balance).to.equal(expectedReward);
//       expect(node3Balance).to.equal(expectedReward);
//     });
//   });
// });
