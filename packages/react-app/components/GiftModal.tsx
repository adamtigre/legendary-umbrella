// This component is used to add a product to the marketplace and show the user's cUSD balance

// Importing the dependencies
import { useState } from "react";
// import ethers to convert the product price to wei
import { BigNumber } from "ethers";
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to write a product to the marketplace contract
import { useContractSend } from "@/hooks/contract/useContractWrite";
// Import useContractApprove to approve gift transactions
import { useContractApprove } from "@/hooks/contract/useApprove";
import { useConnectModal } from "@rainbow-me/rainbowkit";

// Define the AddProductModal component
const GiftModal = ({id, price, bigPrice, setLoading, setError}:any) => {
  // The visible state is used to toggle the visibility of the modal
  const [visible, setVisible] = useState(false);
  // Address of product receiver
  const [receiver, setReceiver] = useState<string>("0x0000000000000000000000000000000000000000");
  // Quantity of product to send
  const [quantity, setQuantity] = useState<number>(1)
   // Get the user's address and balance
   const { address } = useAccount();
    // The following states are used to debounce the input fields
    const [debouncedReceiver] = useDebounce(receiver, 500);
    const [debouncedQuantity] = useDebounce(quantity, 500);
    // Use useContractApprove to approve product to be gifted
    const { writeAsync: approve } = useContractApprove(
        String(BigNumber.from(String(bigPrice)).mul(quantity))
      );
      // Use useContractSend to gift the product
    const {writeAsync: executeTransfer} = useContractSend("executeTransfer", [
        debouncedReceiver, 
        id,
        debouncedQuantity
    ]);

    // Use the useConnectModal hook to trigger the wallet connect modal
  const { openConnectModal } = useConnectModal();

  // Define the handleGift function which handles the gifting interaction with the smart contract
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
    // Once the transaction is mined, transfer the product via our marketplace contract executeTransfer function
    const res = await executeTransfer();
    // Wait for the transaction to be mined
    await res.wait();
  };

  // Define the gift function that is called when the user clicks the gift button
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
