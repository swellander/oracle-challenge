const { expect } = require("chai");
const { ethers } = require("hardhat");

async function mineBlock(timestamp) {
  await ethers.provider.send("evm_mine", timestamp ? [timestamp] : []);
}

describe("SimpleOracle", function () {
  let oracle;
  let owner;
  let nonOwner;

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    oracle = await SimpleOracleFactory.deploy(owner.address);
    await mineBlock();
  });

  it("Should deploy successfully", async function () {
    expect(oracle.target).to.not.be.undefined;
  });

  it("Should set the correct owner", async function () {
    const contractOwner = await oracle.owner();
    expect(contractOwner).to.equal(owner.address);
  });

  it("Should initialize price and timestamp to zero", async function () {
    const price = await oracle.price();
    const timestamp = await oracle.timestamp();

    expect(price).to.equal(0n);
    expect(timestamp).to.equal(0n);
  });

  it("Should allow owner to set price", async function () {
    const newPrice = 1500n;
    await oracle.connect(owner).setPrice(newPrice);
    await mineBlock();
    const price = await oracle.price();
    expect(price).to.equal(newPrice);
  });

  it("Should reject setPrice from non-owner", async function () {
    const newPrice = 1500n;
    expect(
      oracle.connect(nonOwner).setPrice(newPrice)
    ).to.be.revertedWith("Not the owner");
    await mineBlock();
  });

  it("Should emit PriceUpdated event", async function () {
    const newPrice = 1500n;
    const tx = await oracle.connect(owner).setPrice(newPrice);
    expect(tx)
      .to.emit(oracle, "PriceUpdated")
      .withArgs(newPrice);
    await mineBlock();
  });

  it("Should return correct price and timestamp from getPrice", async function () {
    const newPrice = 1500n;
    const timestamp = 1751478751694;
    await mineBlock(timestamp);
    await oracle.connect(owner).setPrice(newPrice);
    await mineBlock();
    const [retrievedPrice, retrievedTimestamp] = await oracle.getPrice();
    expect(retrievedPrice).to.equal(newPrice);
    expect(retrievedTimestamp).to.be.closeTo(timestamp, 1);
  });
}); 
