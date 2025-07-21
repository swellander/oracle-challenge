//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract SimpleOracle {
    uint256 public price;
    uint256 public timestamp;

    event PriceUpdated(uint256 newPrice);

    constructor() {}

    // Note: In a real oracle implementation, this function would typically have
    // an onlyOwner modifier to restrict who can update prices. We've removed
    // it here to make prices easily editable in the frontend.
    function setPrice(uint256 _newPrice) public {
        price = _newPrice;
        timestamp = block.timestamp;
        emit PriceUpdated(_newPrice);
    }

    function getPrice() public view returns (uint256, uint256) {
        return (price, timestamp);
    }
}
