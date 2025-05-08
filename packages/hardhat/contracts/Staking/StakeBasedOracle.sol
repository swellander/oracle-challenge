// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { Arrays } from "@openzeppelin/contracts/utils/Arrays.sol";
import "./OracleToken.sol";

contract StakeBasedOracle {
    ORC public oracleToken;

    struct OracleNode {
        address nodeAddress;
        uint256 stakedAmount;
        uint256 lastReportedPrice;
        uint256 lastReportedTimestamp;
    }

    mapping(address => OracleNode) public nodes;
    address[] public nodeAddresses;

    uint256 public constant MINIMUM_STAKE = 100 ether;
    uint256 public constant STALE_DATA_WINDOW = 5 seconds;

    event NodeRegistered(address indexed node, uint256 stakedAmount);
    event PriceReported(address indexed node, uint256 price);

    event NodeSlashed(address indexed node, uint256 amount);
    event NodeRewarded(address indexed node, uint256 amount);

    address public oracleTokenAddress;

    constructor() {
        oracleToken = new ORC();
    }

    /* ========== Oracle Node Operation Functions ========== */
    function registerNode() public payable {
        require(msg.value >= MINIMUM_STAKE, "Insufficient stake");

        nodes[msg.sender] = OracleNode({
            nodeAddress: msg.sender,
            stakedAmount: msg.value,
            lastReportedPrice: 0,
            lastReportedTimestamp: 0
        });

        nodeAddresses.push(msg.sender);

        emit NodeRegistered(msg.sender, msg.value);
    }

    function reportPrice(uint256 price) public {
        OracleNode storage node = nodes[msg.sender];
        require(node.stakedAmount >= MINIMUM_STAKE, "Not a registered node");

        node.lastReportedPrice = price;
        node.lastReportedTimestamp = block.timestamp;

        emit PriceReported(msg.sender, price);
    }

    /* ========== Price Calculation Functions ========== */
    function filterStaleNodes(address[] memory nodesToFilter, bool returnStaleNodes) internal view returns (address[] memory) {
        address[] memory filteredNodeAddresses = new address[](nodesToFilter.length);

        for (uint i = 0; i < nodesToFilter.length; i++) {
            address nodeAddress = nodesToFilter[i];
            OracleNode memory node = nodes[nodeAddress];
            uint256 timeElapsed = block.timestamp - node.lastReportedTimestamp;
            bool dataIsStale = timeElapsed > STALE_DATA_WINDOW;

            if (dataIsStale == returnStaleNodes) {
                filteredNodeAddresses[i] = nodeAddress;
            }
        }

        return filteredNodeAddresses;
    }

    function getPricesFromAddresses(address[] memory addresses) internal view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](addresses.length);

        for (uint256 i = 0; i < addresses.length; i++) {
            OracleNode memory node = nodes[addresses[i]];
            prices[i] = node.lastReportedPrice;
        }

        return prices;
    }

    function getPrice() public view returns (uint256) {
        address[] memory validAddresses = filterStaleNodes(nodeAddresses, false);
        uint256[] memory validPrices = getPricesFromAddresses(validAddresses);
        Arrays.sort(validPrices);
        return _getMedian(validPrices);
    }

    function rewardNode(address nodeAddress, uint256 reward) internal {
        oracleToken.mint(nodeAddress, reward);
        emit NodeRewarded(nodeAddress, reward);
    }

    function slashNode(address nodeToSlash, uint256 penalty) internal {
        OracleNode storage node = nodes[nodeToSlash];

        require(node.stakedAmount >= penalty, "Penalty exceeds stake");
        node.stakedAmount -= penalty;

        emit NodeSlashed(nodeToSlash, penalty);
    }

    function _getMedian(uint256[] memory arr) internal pure returns (uint256) {
        uint256 length = arr.length;
        if (length % 2 == 0) {
            return (arr[length / 2 - 1] + arr[length / 2]) / 2;
        } else {
            return arr[length / 2];
        }
    }
}
