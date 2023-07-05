// This component is used to add a product to the marketplace and show the user's cUSD balance

// Importing the dependencies
import { useEffect, useCallback, useState } from "react";
// import ethers to convert the product price to wei
import { ethers } from "ethers";
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to write a product to the marketplace contract
import { useContractCall } from "@/hooks/contract/useContractRead";
// Import the erc20 contract abi to get the cUSD balance
import erc20Instance from "../abi/erc20.json";
import { useContractSend } from "@/hooks/contract/useContractWrite";

interface Transaction {
    from: string;
    to: string;
    productIndex: number;
    quantity: number;
    timestamp: number;
  }

// Define the AddProductModal component
const TransferTransactions = () => {
    // Get the user's address and balance
   const { address, isConnected } = useAccount();
  // The visible state is used to toggle the visibility of the modal
  const [visible, setVisible] = useState(false);
    //
    const [transactions, setTransactions] = useState<Transaction[] | null>()
    const { data: rawTxns }: any = useContractCall("readTransferTransactions", [], true, address);

  // Define the JSX that will be rendered
  return (
    <div className={"flex flex-row w-full justify-between"}>
      <div>
        {/* Add Product Button that opens the modal */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="mb-4 inline-block ml-4 px-6 py-2.5 bg-black text-white font-medium text-md leading-tight rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        >
            Transfers - {transactions?.length}
        </button>

        {/* Modal */}
        {isvisible && (
          <div
            className="fixed z-40 overflow-y-auto top-0 w-full left-0"
            id="modal"
          >
            {/* Form with input fields for the product, that triggers the addProduct function on submit */}
            <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                    <div className="absolute inset-0 bg-gray-900 opacity-75" />
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                    &#8203;
                </span>
                <div
                    className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-headline"
                >
                       <div className="p-4 flex flex-col items-center">
                        <p className="text-2xl underline">List of transfers ever occured in your account in this marketplace</p>
                        <div className="flex flex-col m-4 gap-3">
                            {transactions?.map(txn => (
                                <>
                                    {txn.from == address && (
                                        <>
                                            <div className="border border-yellow-300 rounded-lg w-full h-[90px] px-4 py-2">You gifted{" "}
                                            <span className="underline italic font-mono text-sm text-green-600">{txn.quantity}</span>{" "}items to{" "}
                                            <span className="italic underline font-mono text-sm text-gray-400">{txn.to}</span>{" "}on{" "}
                                            <span className="underline italic font-mono text-sm text-blue-400">{new Date(Number(txn.timestamp)*1000).toUTCString()}</span>
                                            </div>
                                            <div className="inline-block h-[25px] ml-5 w-0.5 self-stretch bg-gray-300 opacity-100"></div>
                                        </>  
                                    )}
                                    {txn.to == address && (
                                        <>
                                            <div className="border border-yellow-300 rounded-lg w-full h-[90px] px-4 py-2">
                                            <span className="italic underline font-mono text-sm text-gray-400">{txn.from}</span> gifted you {" "}
                                            <span className="underline italic font-mono text-sm text-green-600">{txn.quantity}</span>{" "}items on{" "}
                                            <span className="underline italic font-mono text-sm text-blue-400">{new Date(Number(txn.timestamp)*1000).toUTCString()}</span>
                                            </div>
                                            <div className="inline-block h-[25px] ml-5 w-0.5 self-stretch bg-gray-300 opacity-100"></div>
                                        </>
                                    )}
                                </>
                                
                            ))}
                        </div>
                    </div>
                    {/* Button to close the modal */}
                    <div className="bg-gray-200 px-4 py-3 text-right">
                        <button
                            type="button"
                            className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                            onClick={() => setVisible(false)}
                        >
                            <i className="fas fa-times">Close</i> 
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferTransactions;
