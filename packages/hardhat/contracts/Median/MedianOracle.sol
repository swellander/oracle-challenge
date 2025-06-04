//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./SimpleOracle.sol";
import { Arrays } from "@openzeppelin/contracts/utils/Arrays.sol";

contract MedianOracle {
    address public owner;
    SimpleOracle[] public oracles;

    event OracleAdded(address oracleAddress);
    event OracleRemoved(address oracleAddress);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function addOracle(address oracle) public onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        oracles.push(SimpleOracle(oracle));
        emit OracleAdded(oracle);
    }

    function removeOracle(uint256 index) public onlyOwner {
        require(index < oracles.length, "Index out of bounds");

        address oracleAddress = address(oracles[index]);

        if (index != oracles.length - 1) {
            oracles[index] = oracles[oracles.length - 1];
        }

        oracles.pop();

        emit OracleRemoved(oracleAddress);
    }

    function getPrice() public view returns (uint256) {
        require(oracles.length > 0, "No oracles available");

        // Collect prices and timestamps from all oracles
        uint256[] memory prices = new uint256[](oracles.length);
        uint256 validCount = 0; // Count of valid prices
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < oracles.length; i++) {
            (uint256 price, uint256 timestamp) = oracles[i].getPrice();
            // Check if the timestamp is within the last 10 seconds
            if (currentTime - timestamp < 10) {
                prices[validCount] = price;
                validCount++;
            }
        }

        require(validCount > 0, "No valid prices available");

        Arrays.sort(prices);

        uint256 median;
        if (prices.length % 2 == 0) {
            uint256 midIndex = prices.length / 2;
            median = (prices[midIndex - 1] + prices[midIndex]) / 2;
        } else {
            median = prices[prices.length / 2];
        }

        return median;
    }
}
