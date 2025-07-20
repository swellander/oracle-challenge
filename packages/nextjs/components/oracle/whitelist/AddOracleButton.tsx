import { useState } from "react";
import { Address as AddressType, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { PlusIcon } from "@heroicons/react/24/outline";
import { AddressInput, IntegerInput } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

// SimpleOracle bytecode from compiled artifact
const SIMPLE_ORACLE_BYTECODE =
  "0x60a060405234801561001057600080fd5b5060405161020838038061020883398101604081905261002f91610040565b6001600160a01b0316608052610070565b60006020828403121561005257600080fd5b81516001600160a01b038116811461006957600080fd5b9392505050565b60805161017e61008a60003960006061015261017e6000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80638da5cb5b1461005c57806391b7f5ed146100a057806398d5fdca146100b5578063a035b1fe146100d0578063b80777ea146100e7575b600080fd5b6100837f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b6100b36100ae36600461012f565b6100f0565b005b60005460015460408051928352602083019190915201610097565b6100d960005481565b604051908152602001610097565b6100d960015481565b6000819055426001556040518181527f66cbca4f3c64fecf1dcb9ce094abcf7f68c3450a1d4e3a8e917dd621edb4ebe09060200160405180910390a150565b60006020828403121561014157600080fd5b503591905056fea26469706673582212209fd125d081658cebd290a96a912d32827a9dea9c1dbb9f2c5f9598dffd5fbbca64736f6c63430008140033" as const;

export const AddOracleButton = () => {
  const [newOracleOwner, setNewOracleOwner] = useState<AddressType>();
  const [initialPrice, setInitialPrice] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { writeContractAsync: writeWhitelistOracle } = useScaffoldWriteContract({ contractName: "WhitelistOracle" });

  const handleGenerateRandomAddress = () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    setNewOracleOwner(account.address as AddressType);
  };

  const handleAddOracle = async () => {
    if (!newOracleOwner || !walletClient || !connectedAddress || !publicClient || !initialPrice) {
      notification.error("Please connect wallet and enter both oracle owner address and initial price");
      return;
    }
    if (Number.isNaN(Number(initialPrice)) || Number(initialPrice) <= 0) {
      notification.error("Please enter a valid initial price");
      return;
    }

    try {
      setIsDeploying(true);

      // Step 1: Deploy new SimpleOracle instance

      // Get SimpleOracle ABI from deployed contracts
      const simpleOracleAbi = deployedContracts[31337].SimpleOracle_1.abi; // TODO: fix this. Maybe put it in a separate file as a constant.

      const deployTxHash = await walletClient.deployContract({
        abi: simpleOracleAbi,
        bytecode: SIMPLE_ORACLE_BYTECODE,
        args: [newOracleOwner],
      });

      // Wait for deployment transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: deployTxHash,
      });

      const oracleAddress = receipt.contractAddress;

      if (!oracleAddress) {
        throw new Error("Failed to get deployed contract address");
      }

      notification.success(`SimpleOracle deployed at: ${oracleAddress}`);

      // Step 2: Add oracle to whitelist
      await writeWhitelistOracle({
        functionName: "addOracle",
        args: [oracleAddress],
      });

      notification.success("Oracle successfully added to whitelist!");

      // Step 3: Set initial price on the newly deployed oracle
      const priceInWei = parseEther(initialPrice);

      const setPriceTxHash = await walletClient.writeContract({
        address: oracleAddress,
        abi: simpleOracleAbi,
        functionName: "setPrice",
        args: [priceInWei],
      });

      await publicClient.waitForTransactionReceipt({
        hash: setPriceTxHash,
      });

      // Reset form and close modal
      setNewOracleOwner(undefined);
      setInitialPrice("");
    } catch (error: any) {
      console.log("Error adding oracle:", error);
      notification.error(`Failed to add oracle: ${getParsedError(error)}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const resetAndCloseModal = () => {
    setNewOracleOwner(undefined);
    setInitialPrice("");
  };

  return (
    <>
      {/* Add Oracle Button */}
      <div>
        <label htmlFor="add-oracle-modal" className="btn btn-primary btn-sm font-normal gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>Add Oracle Node</span>
        </label>
      </div>

      <input type="checkbox" id="add-oracle-modal" className="modal-toggle" />

      {/* Modal Dialog */}
      <label htmlFor="add-oracle-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="font-bold text-lg mb-4">Add New Oracle</h3>
          <label htmlFor="add-oracle-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="flex flex-col gap-4">
            <div>
              <p className="block text-sm font-medium mb-2">Oracle Owner Address</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <AddressInput
                    placeholder="Enter oracle owner address"
                    value={newOracleOwner ?? ""}
                    onChange={setNewOracleOwner}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGenerateRandomAddress}
                  disabled={isDeploying}
                >
                  🎲 Random
                </button>
              </div>
            </div>

            <div>
              <p className="block text-sm font-medium mb-2">Initial Price (USD)</p>
              <IntegerInput
                placeholder="Enter initial price"
                value={initialPrice}
                onChange={setInitialPrice}
                disableMultiplyBy1e18={true}
              />
            </div>
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost" onClick={resetAndCloseModal} disabled={isDeploying}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddOracle}
              disabled={!newOracleOwner || !initialPrice || isDeploying}
            >
              {isDeploying ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Deploying...
                </>
              ) : (
                "Deploy"
              )}
            </button>
          </div>
        </label>
      </label>
    </>
  );
};
