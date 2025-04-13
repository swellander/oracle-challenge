// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract StakeBasedOracle is Ownable {
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

    event NodeRegistered(address indexed node, uint256 stakedAmount);
    event PriceReported(address indexed node, uint256 price);
    event NodeSlashed(address indexed node, uint256 amount);

    address public oracleTokenAddress;

    function setOracleTokenAddress(address _oracleTokenAddress) public onlyOwner {
        oracleToken = new ORC(_oracleTokenAddress);
    }

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

    function calculateMedianPrice() public view returns (uint256) {}

    function slashNode(address nodeToSlash, uint256 penalty) internal {
        OracleNode storage node = nodes[nodeToSlash];
        
        // Reduce stake
        require(node.stakedAmount >= penalty, "Penalty exceeds stake");
        node.stakedAmount -= penalty;

        emit NodeSlashed(nodeToSlash, penalty);
    }

    function validateAndSlashNodes() public {
      for (uint i = 0; i < nodeAddresses.length; i++) {
          address nodeAddress = nodeAddresses[i];
          OracleNode storage node = nodes[nodeAddress];
          
          if (block.timestamp - node.lastReportedTimestamp > 1 days) {
              uint256 inactivityPenalty = node.stakedAmount / 10; // 10% penalty
              slashNode(nodeAddress, inactivityPenalty);
          } else {
            // reward node   
            ORC.mint(nodeAddress, 100 * 10 ** ORC.decimals());
          }
      }
    }
}
