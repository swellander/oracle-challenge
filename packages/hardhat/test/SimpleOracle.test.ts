import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleOracle", function () {
  let oracle: any;
  let owner: any;
  let nonOwner: any;

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    oracle = await SimpleOracleFactory.deploy(owner.address);
  });

  it("Should deploy successfully", function () {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
    const price = await oracle.price();
    expect(price).to.equal(newPrice);
  });

  it("Should reject setPrice from non-owner", async function () {
    const newPrice = 1500n;
    await expect(oracle.connect(nonOwner).setPrice(newPrice)).to.be.revertedWith("Not the owner");
  });

  it("Should emit PriceUpdated event", async function () {
    const newPrice = 1500n;
    const tx = await oracle.connect(owner).setPrice(newPrice);
    expect(tx).to.emit(oracle, "PriceUpdated").withArgs(newPrice);
  });

  it("Should return correct price and timestamp from getPrice", async function () {
    const newPrice = 1500n;
    await oracle.connect(owner).setPrice(newPrice);
    const [retrievedPrice, retrievedTimestamp] = await oracle.getPrice();
    expect(retrievedPrice).to.equal(newPrice);
    expect(retrievedTimestamp).to.be.a("bigint");
    expect(retrievedTimestamp).to.be.greaterThan(0n);
  });
});
