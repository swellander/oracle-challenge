const { expect } = require("chai");
const { ethers } = require("hardhat");

async function mineBlock(timestamp) {
  await ethers.provider.send("evm_mine", timestamp ? [timestamp] : []);
}

describe("MedianOracle", function () {
  let medianOracle;
  let owner;
  let nonOwner;
  let simpleOracleFactory;

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    const MedianOracleFactory = await ethers.getContractFactory("MedianOracle");
    simpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    medianOracle = await MedianOracleFactory.deploy();
    await mineBlock();
  });

  it("Should deploy and set owner", async function () {
    expect(await medianOracle.owner()).to.equal(owner.address);
  });

  it("Should allow owner to add and remove oracles", async function () {
    const oracle = await simpleOracleFactory.deploy(owner.address);
    await mineBlock();

    await medianOracle.addOracle(oracle.target);
    await mineBlock();

    expect(await medianOracle.oracles(0)).to.equal(oracle.target);

    await medianOracle.removeOracle(0);
    await mineBlock();

    await expect(medianOracle.oracles(0)).to.be.reverted;
  });

  it("Should revert getPrice if no oracles", async function () {
    await expect(medianOracle.getPrice()).to.be.revertedWith("No oracles available");
  });

  it("Should return correct price with one oracle", async function () {
    const oracle = await simpleOracleFactory.deploy(owner.address);
    const now = Math.floor(Date.now() / 1000);
    
    await medianOracle.addOracle(oracle.target);
    await mineBlock();
    
    await oracle.connect(owner).setPrice(1000n);
    await mineBlock();
    await mineBlock();
    
    const price = await medianOracle.getPrice();
    expect(price).to.equal(1000n);
  });

  it("Should return correct median price with multiple oracles", async function () {
    const oracle1 = await simpleOracleFactory.deploy(owner.address);
    await mineBlock();
    const oracle2 = await simpleOracleFactory.deploy(owner.address);
    await mineBlock();
    const oracle3 = await simpleOracleFactory.deploy(owner.address);
    await mineBlock();
    
    await medianOracle.addOracle(oracle1.target);
    await mineBlock();
    await medianOracle.addOracle(oracle2.target);
    await mineBlock();
    await medianOracle.addOracle(oracle3.target);
    await mineBlock();
    
    const price1 = 1000n;
    const price2 = 3000n;
    const price3 = 2000n;
    
    await oracle1.connect(owner).setPrice(price1);
    await mineBlock();
    
    await oracle2.connect(owner).setPrice(price2);
    await mineBlock();
    
    await oracle3.connect(owner).setPrice(price3);
    await mineBlock();
    
    const medianPrice = await medianOracle.getPrice();
    expect(medianPrice).to.equal(2000n);
  });
}); 