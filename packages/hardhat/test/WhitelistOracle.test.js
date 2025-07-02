const { expect } = require("chai");
const { ethers } = require("hardhat");

async function mineBlock(timestamp) {
  await ethers.provider.send("evm_mine", timestamp ? [timestamp] : []);
}

describe("WhitelistOracle", function () {
  let whitelistOracle;
  let owner;
  let nonOwner;
  let simpleOracleFactory;

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    const WhitelistOracleFactory = await ethers.getContractFactory("WhitelistOracle");
    simpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    whitelistOracle = await WhitelistOracleFactory.deploy();
    await mineBlock();
  });

  it("Should deploy and set owner", async function () {
    expect(await whitelistOracle.owner()).to.equal(owner.address);
  });

  it("Should allow owner to add and remove oracles", async function () {
    const oracle = await simpleOracleFactory.deploy(owner.address);
    await mineBlock();

    await whitelistOracle.addOracle(oracle.target);
    await mineBlock();

    expect(await whitelistOracle.oracles(0)).to.equal(oracle.target);

    await whitelistOracle.removeOracle(0);
    await mineBlock();

    await expect(whitelistOracle.oracles(0)).to.be.reverted;
  });

  it("Should revert getPrice if no oracles", async function () {
    await expect(whitelistOracle.getPrice()).to.be.revertedWith("No oracles available");
  });

  it("Should return correct price with one oracle", async function () {
    const oracle = await simpleOracleFactory.deploy(owner.address);
    const now = Math.floor(Date.now() / 1000);
    
    await whitelistOracle.addOracle(oracle.target);
    await mineBlock();
    
    await oracle.connect(owner).setPrice(1000n);
    await mineBlock();
    await mineBlock();
    
    const price = await whitelistOracle.getPrice();
    expect(price).to.equal(1000n);
  });

  it("Should return correct median price with multiple oracles", async function () {
    const oracle1 = await simpleOracleFactory.deploy(owner.address);
    await mineBlock();
    const oracle2 = await simpleOracleFactory.deploy(owner.address);
    await mineBlock();
    const oracle3 = await simpleOracleFactory.deploy(owner.address);
    await mineBlock();
    
    await whitelistOracle.addOracle(oracle1.target);
    await mineBlock();
    await whitelistOracle.addOracle(oracle2.target);
    await mineBlock();
    await whitelistOracle.addOracle(oracle3.target);
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
    
    const medianPrice = await whitelistOracle.getPrice();
    expect(medianPrice).to.equal(2000n);
  });
}); 