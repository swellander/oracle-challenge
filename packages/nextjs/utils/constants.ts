export const INITIAL_ETH_PRICE = 4000;
// SimpleOracle bytecode from compiled artifact (Update abi and bytecode if you change the contract)
export const SIMPLE_ORACLE_BYTECODE =
  "0x608060405234801561001057600080fd5b50610126806100206000396000f3fe6080604052348015600f57600080fd5b506004361060465760003560e01c806391b7f5ed14604b57806398d5fdca14605c578063a035b1fe14607c578063b80777ea146091575b600080fd5b605a605636600460d8565b6099565b005b600054600154604080519283526020830191909152015b60405180910390f35b608460005481565b6040519081526020016073565b608460015481565b6000819055426001556040518181527f66cbca4f3c64fecf1dcb9ce094abcf7f68c3450a1d4e3a8e917dd621edb4ebe09060200160405180910390a150565b60006020828403121560e957600080fd5b503591905056fea2646970667358221220e7066415d88de574c1c15fd3cdf3d8abc42f8d22a95560aa0d2d03572fd07c3964736f6c63430008140033" as const;

export const SIMPLE_ORACLE_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newPrice",
        type: "uint256",
      },
    ],
    name: "PriceUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newPrice",
        type: "uint256",
      },
    ],
    name: "setPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "timestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
