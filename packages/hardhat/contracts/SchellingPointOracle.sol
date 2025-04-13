// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/Math.sol";


contract SchellingPointOracle {
    struct OracleNode {
        address nodeAddress;
        uint256 stakedAmount;
        uint256 lastReportedPrice;
        uint256 lastReportedTimestamp;
    }

    mapping(address => OracleNode) public nodes;

    uint256 public constant MINIMUM_STAKE = 100 ether;
    uint256 public constant NUM_STD_DEVIATIONS = 2;

    event NodeRegistered(address indexed node, uint256 stakedAmount);
    event PriceReported(address indexed node, uint256 price);
    event NodeSlashed(address indexed node, uint256 amount);

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

    function calculateMedianPrice() public view returns (uint256) {
        // Similar median calculation as previous contract
        // But now with more complex validation
    }

    function slashNode(address nodeToSlash, uint256 penalty) internal {
        OracleNode storage node = nodes[nodeToSlash];
        
        // Reduce stake
        require(node.stakedAmount >= penalty, "Penalty exceeds stake");
        node.stakedAmount -= penalty;

        // Reduce reputation
        node.reputation = node.reputation > REPUTATION_DECAY_FACTOR 
            ? node.reputation - REPUTATION_DECAY_FACTOR 
            : 0;

        emit NodeSlashed(nodeToSlash, penalty);
    }

    function getRecentNodes() internal pure returns (OracleNode[]) {
        OracleNode[] memory recentReports = new OracleNode[](nodeAddresses.length);
        uint256 count = 0;
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            OracleNode storage node = nodes[nodeAddresses[i]];
            if (currentTime - node.lastReportedTimestamp <= 2 minutes) {
                recentReports[count] = node;
                count++;
            }
        }

        // Resize the array to the number of recent reports
        OracleNode[] memory filteredReports = new OracleNode[](count);
        for (uint256 j = 0; j < count; j++) {
            filteredReports[j] = recentReports[j];
        }

        return filteredReports;
    }

    function getPricesFromNodes(OracleNode[] nodes) internal pure returns (uint256[]) {
        uint256[] memory prices = new uint256[](nodes.length);
        for (uint256 i = 0; i < nodes.length; i++) {
            prices[i] = nodes[i].lastReportedPrice;
        }
        return prices;
    }

    function validateAndSlashNodes() public {
        OracleNode[] recentNodes = getRecentNodes(); 
        uint256[] recentPrices = getPricesFromNodes(recentNodes);
        uint256 mean = getMean(recentPrices);
        uint256 stdDeviation = getStdDeviation(recentPrices, mean);
        uint256 allowedDeviation = NUM_STD_DEVIATIONS * stdDeviations;

        for (uint i = 0; i < recentNodes.length; i++) {
            OracleNode memory node = nodes[i];
            
            // Slashing Condition 1: Significant Deviation from Consensus
            uint256 nodePrice = node.lastReportedPrice;
            uint256 priceDifference = abs(mean - nodePrice);
            
            if (priceDifference > allowedDeviation) {
                slashNode(node.nodeAddress, 10 ether);
            }
        }
    }

    function abs(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a - b : b - a;
    }

    function getMean(uint256[] values) internal pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < values.length; i++) {
            sum += values[i];
        }
        return sum / values.length;
    }

    function getStdDeviation(uint256[] values, uint256 mean) internal pure returns (uint256) {
        // Calculate variance (sum of squared differences from the mean)
        uint256 varianceSum = 0;
        for (uint i = 0; i < values.length; i++) {
            if (values[i] > mean) {
                varianceSum += (values[i] - mean) ** 2;
            } else {
                varianceSum += (mean - values[i]) ** 2;
            }
        }
        uint256 variance = varianceSum / values.length;
        
        // Calculate standard deviation (square root of variance)
        return Math.sqrt(variance);
    }
}
