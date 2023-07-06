// This component is used to add a product to the marketplace and show the user's cUSD balance

// Importing the dependencies
import { useEffect, useCallback, useState } from "react";
// import ethers to convert the product price to wei
import { BigNumber, ethers } from "ethers";
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to write a product to the marketplace contract
import { useContractSend } from "@/hooks/contract/useContractWrite";
// 
import { useContractCall } from "@/hooks/contract/useContractRead";
// Import the erc20 contract abi to get the cUSD balance
import erc20Instance from "../abi/erc20.json";
import { useContractApprove } from "@/hooks/contract/useApprove";
import { useConnectModal } from "@rainbow-me/rainbowkit";

// Define the interface for the product, an interface is a type that describes the properties of an object

// Define the AddProductModal component
const GiftModal = ({id, price, bigPrice, setLoading, setError}:any) => {
  // The visible state is used to toggle the visibility of the modal
  const [visible, setVisible] = useState(false);
  //
  const [receiver, setReceiver] = useState<string>("0x0000000000000000000000000000000000000000");
  //
  const [quantity, setQuantity] = useState<number>(1)
   // Get the user's address and balance
   const { address, isConnected } = useAccount();
   const { data: cusdBalance } = useBalance({
     address,
     token: erc20Instance.address as `0x${string}`,
   });

    // The following states are used to debounce the input fields
    const [debouncedReceiver] = useDebounce(receiver, 500);
    const [debouncedQuantity] = useDebounce(quantity, 500);

    const { writeAsync: approve } = useContractApprove(
        String(BigNumber.from(String(bigPrice)).mul(quantity))
      );

    const {writeAsync: executeTransfer} = useContractSend("executeTransfer", [
        debouncedReceiver, 
        id,
        debouncedQuantity
    ]);

         // Use the useConnectModal hook to trigger the wallet connect modal
  const { openConnectModal } = useConnectModal();

      // Define the handlePurchase function which handles the purchase interaction with the smart contract
  const handleGift = async () => {
    if (!approve) {
      throw "Failed to approve product";
    } 

    if (!executeTransfer) {
      throw "Error occured while gifting product"
    }
    // Approve the spending of the product's price, for the ERC20 cUSD contract
    const approveTx = await approve();
    // Wait for the transaction to be mined, (1) is the number of confirmations we want to wait for
    await approveTx.wait(1);
    setLoading("Transferring product in process...");
    // Once the transaction is mined, purchase the product via our marketplace contract buyProduct function
    const res = await executeTransfer();
    // Wait for the transaction to be mined
    await res.wait();
  };

  // Define the purchaseProduct function that is called when the user clicks the purchase button
  const gift = async (e: any) => {
    e.preventDefault();
    setLoading("Approving ...");
    try {
      // If the user is not connected, trigger the wallet connect modal
      if (!address && openConnectModal) {
        openConnectModal();
        return;
      }
      // If the user is connected, call the handlePurchase function and display a notification
      await toast.promise(handleGift(), {
        pending: "Gifting product ...",
        error: "Failed to gift product",
        success: "You have successfully gifted a product",
      });
      // If there is an error, display the error message
    } catch (e: any) {
      console.log({ e });
      setError(e?.reason || e?.message || "Something went wrong. Try again.");
      // Once the purchase is complete, clear the loading state
    } finally {
      setLoading(null);
    }
  };

  // Define the JSX that will be rendered
  return (
    <div className={"flex flex-row w-full justify-between"}>
      <div>
        {/* Add Product Button that opens the modal */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="mt-4 h-14 w-full border-[1px] border-gray-500 text-black p-2 rounded-lg hover:bg-black hover:text-white"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        >
            Gift
        </button>

        {/* Modal */}
        {visible && (
          <div
            className="fixed z-40 overflow-y-auto top-0 w-full h-full left-0"
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
                    <form onSubmit={gift} className="flex flex-col px-5 py-3">
                        <label>Receiver address</label>
                        <input onChange={e => setReceiver(e.target.value)} className="w-full bg-gray-100 p-2 mt-2 mb-3" type="text"/>
                        <label>Quantity</label>
                        <input onChange={e => setQuantity(Number(e.target.value))} className="w-full bg-gray-100 p-2 mt-2 mb-3" type="number"/>
                        <button type="submit" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2">
                            Gift = {quantity? quantity * Number(price) : 0} cUSD
                        </button>
                    </form>
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

export default GiftModal;
