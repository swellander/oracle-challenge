import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("StakingOracle", function () {
  let oracle: any;
  let orcToken: any;
  let node1: any;
  let node2: any;
  let node3: any;
  let node4: any;

  const MINIMUM_STAKE = ethers.parseEther("10");
  const STALE_DATA_WINDOW = 10; // 10 seconds

  beforeEach(async function () {
    [, node1, node2, node3, node4] = await ethers.getSigners();

    const StakingOracleFactory = await ethers.getContractFactory("StakingOracle");
    oracle = await StakingOracleFactory.deploy();

    const orcTokenAddress = await oracle.oracleToken();
    orcToken = await ethers.getContractAt("ORC", orcTokenAddress);
  });

  describe("constructor", function () {
    it("Should deploy an ORC token and set initial state", async function () {
      const StakingOracleFactory = await ethers.getContractFactory("StakingOracle");
      const newly_deployed_oracle = await StakingOracleFactory.deploy();
      const tokenAddress = await newly_deployed_oracle.oracleToken();
      const contractCode = await ethers.provider.getCode(tokenAddress);
      expect(contractCode).to.not.equal("0x");
    });
  });

  describe("getNodeAddresses", function () {
    it("Should return an empty array when no nodes are registered", async function () {
      const StakingOracleFactory = await ethers.getContractFactory("StakingOracle");
      const newOracle = await StakingOracleFactory.deploy();
      const nodeAddresses = await newOracle.getNodeAddresses();
      assert(Array.isArray(nodeAddresses), "nodeAddresses should be an array");
      assert(nodeAddresses.length === 0, "nodeAddresses should be empty");
    });

    it("Should return all registered node addresses in order", async function () {
      await oracle.connect(node1).registerNode({ value: MINIMUM_STAKE });
      await oracle.connect(node2).registerNode({ value: MINIMUM_STAKE });
      await oracle.connect(node3).registerNode({ value: MINIMUM_STAKE });
      const nodeAddresses = await oracle.getNodeAddresses();
      expect(nodeAddresses).to.deep.equal([node1.address, node2.address, node3.address]);
    });
  });

  describe("Node Registration", function () {
    it("Should allow nodes to register with minimum stake", async function () {
      await expect(oracle.connect(node1).registerNode({ value: MINIMUM_STAKE }))
        .to.emit(oracle, "NodeRegistered")
        .withArgs(node1.address, MINIMUM_STAKE);

      const nodeInfo = await oracle.nodes(node1.address);
      expect(nodeInfo.nodeAddress).to.equal(node1.address);
      expect(nodeInfo.stakedAmount).to.equal(MINIMUM_STAKE);
      expect(nodeInfo.lastReportedPrice).to.equal(0);
      expect(nodeInfo.lastReportedTimestamp).to.equal(0);

      expect(await oracle.nodeAddresses(0)).to.equal(node1.address);
    });

    it("Should emit NodeRegistered event on successful registration", async function () {
      await expect(oracle.connect(node1).registerNode({ value: MINIMUM_STAKE }))
        .to.emit(oracle, "NodeRegistered")
        .withArgs(node1.address, MINIMUM_STAKE);
    });

    it("Should reject registration with insufficient stake", async function () {
      const insufficientStake = ethers.parseEther("5");
      await expect(oracle.connect(node1).registerNode({ value: insufficientStake })).to.be.revertedWith(
        "Insufficient stake",
      );
    });
  });

  describe("Price Reporting", function () {
    beforeEach(async function () {
      await oracle.connect(node1).registerNode({ value: MINIMUM_STAKE });
    });

    it("Should record the reported price and timestamp in contract state", async function () {
      let nodeInfo = await oracle.nodes(node1.address);
      expect(nodeInfo.lastReportedPrice).to.equal(0);
      expect(nodeInfo.lastReportedTimestamp).to.equal(0);

      const price = 1500;
      const tx = await oracle.connect(node1).reportPrice(price);
      await tx.wait();

      nodeInfo = await oracle.nodes(node1.address);
      expect(nodeInfo.lastReportedPrice).to.equal(price);
      expect(nodeInfo.lastReportedTimestamp).to.be.gt(0);
    });

    it("Should emit PriceReported event when reporting price", async function () {
      const price = 1500;
      await expect(oracle.connect(node1).reportPrice(price))
        .to.emit(oracle, "PriceReported")
        .withArgs(node1.address, price);
    });

    it("Should reject price reports from unregistered nodes", async function () {
      const price = 1500;

      await expect(oracle.connect(node2).reportPrice(price)).to.be.revertedWith("Node not registered");
    });
    it("Should reject price reports from nodes with insufficient stake", async function () {
      await oracle.connect(node1).reportPrice(1500);
      await time.increase(STALE_DATA_WINDOW + 1);
      await oracle.validateNodes();

      const nodeInfo = await oracle.nodes(node1.address);
      const expectedSlashedAmount = MINIMUM_STAKE - ethers.parseEther("1");
      expect(nodeInfo.stakedAmount).to.equal(expectedSlashedAmount);
      expect(nodeInfo.stakedAmount).to.be.lt(MINIMUM_STAKE);

      await expect(oracle.connect(node1).reportPrice(1600)).to.be.revertedWith("Not enough stake");
    });
  });

  describe("Price Aggregation and Node Management", function () {
    beforeEach(async function () {
      await oracle.connect(node1).registerNode({ value: MINIMUM_STAKE });
      await oracle.connect(node2).registerNode({ value: MINIMUM_STAKE });
      await oracle.connect(node3).registerNode({ value: MINIMUM_STAKE });
      await oracle.connect(node1).reportPrice(1450);
      await oracle.connect(node2).reportPrice(1500);
      await oracle.connect(node3).reportPrice(1550);
    });

    it("Should reward fresh nodes with ORC tokens", async function () {
      await oracle.connect(node1).reportPrice(1475);
      await oracle.connect(node2).reportPrice(1500);
      await oracle.connect(node3).reportPrice(1525);

      await oracle.validateNodes();

      const expectedReward = ethers.parseUnits("10", 18);
      const node1Balance = await orcToken.balanceOf(node1.address);
      const node2Balance = await orcToken.balanceOf(node2.address);
      const node3Balance = await orcToken.balanceOf(node3.address);

      expect(node1Balance).to.equal(expectedReward);
      expect(node2Balance).to.equal(expectedReward);
      expect(node3Balance).to.equal(expectedReward);
    });

    it("Should emit NodeRewarded event for all fresh nodes", async function () {
      await oracle.connect(node1).reportPrice(1475);
      await oracle.connect(node2).reportPrice(1500);
      await oracle.connect(node3).reportPrice(1525);
      await expect(oracle.validateNodes())
        .to.emit(oracle, "NodeRewarded")
        .withArgs(node1.address, ethers.parseEther("10"))
        .and.to.emit(oracle, "NodeRewarded")
        .withArgs(node2.address, ethers.parseEther("10"))
        .and.to.emit(oracle, "NodeRewarded")
        .withArgs(node3.address, ethers.parseEther("10"));
    });

    it("Should slash stale nodes", async function () {
      await time.increase(STALE_DATA_WINDOW + 1);
      await oracle.connect(node1).reportPrice(1600);
      await oracle.validateNodes();

      const node1Info = await oracle.nodes(node1.address);
      expect(node1Info.stakedAmount).to.equal(MINIMUM_STAKE);

      const node2Info = await oracle.nodes(node2.address);
      const node3Info = await oracle.nodes(node3.address);

      const expectedSlashedAmount = MINIMUM_STAKE - ethers.parseEther("1");
      expect(node2Info.stakedAmount).to.equal(expectedSlashedAmount);
      expect(node3Info.stakedAmount).to.equal(expectedSlashedAmount);
    });

    it("Should emit NodeSlashed event for all stale nodes", async function () {
      await time.increase(STALE_DATA_WINDOW + 1);
      await oracle.connect(node1).reportPrice(1600);
      await expect(oracle.validateNodes())
        .to.emit(oracle, "NodeSlashed")
        .withArgs(node2.address, ethers.parseEther("1"))
        .and.to.emit(oracle, "NodeSlashed")
        .withArgs(node3.address, ethers.parseEther("1"));
    });

    it("Should emit NodesValidated event when validateNodes is called", async function () {
      await expect(oracle.validateNodes()).to.emit(oracle, "NodesValidated");
    });

    it("Should correctly calculate median price", async function () {
      let price = await oracle.getPrice();
      expect(price).to.equal(1500);

      await oracle.connect(node4).registerNode({ value: MINIMUM_STAKE });
      await oracle.connect(node4).reportPrice(1600);
      price = await oracle.getPrice();
      expect(price).to.equal(1525);
    });

    it("Should exclude stale price reports in the median calculation", async function () {
      let price = await oracle.getPrice();
      expect(price).to.equal(1500);

      await time.increase(STALE_DATA_WINDOW + 1);

      await oracle.connect(node2).reportPrice(2400);
      await oracle.connect(node3).reportPrice(2500);

      price = await oracle.getPrice();
      expect(price).to.equal(2450);

      await time.increase(STALE_DATA_WINDOW + 1);
      await oracle.connect(node1).reportPrice(1700);

      price = await oracle.getPrice();
      expect(price).to.equal(1700);
    });
  });
});
