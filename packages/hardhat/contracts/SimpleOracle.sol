//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract SimpleOracle {
    address public immutable owner;
    uint256 public price;
    uint256 public timestamp;

    event PriceUpdated(uint256 newPrice);

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function setPrice(uint256 _newPrice) public onlyOwner {
        price = _newPrice;
        timestamp = block.timestamp;
        emit PriceUpdated(_newPrice);
    }

    function getPrice() public view returns (uint256, uint256) {
        return (price, timestamp);
    }
}
