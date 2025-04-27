import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { Contract } from 'web3-eth-contract';

// ✅ Updated Smart Contract ABI for user-defined shipment ID
const ShippingNFTABI: AbiItem[] = [
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "desc", type: "string" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "string", name: "cid", type: "string" },
    ],
    name: "createShipment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "cid", type: "string" },
    ],
    name: "uploadDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getShipmentDetails",
    outputs: [
      { internalType: "string", name: "desc", type: "string" },
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "string", name: "cid", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ✅ Load Contract Address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
if (!CONTRACT_ADDRESS) {
  throw new Error("🚨 NEXT_PUBLIC_CONTRACT_ADDRESS is missing in .env.local");
}

// Web3 + State
let web3Instance: Web3 | null = null;
let shippingContract: any = null;
let selectedAccount: string | null = null;

// Gas config
const DEFAULT_MAX_PRIORITY_FEE = "2.5"; // Gwei
const DEFAULT_MAX_FEE = "2.515"; // Gwei
const MIN_GAS_LIMIT = 250000;

// Define the contract type with the correct ABI type
type ShippingContract = Contract<{
  readonly name: string;
  readonly type: string;
  readonly stateMutability: string;
  readonly inputs: readonly { readonly internalType: string; readonly name: string; readonly type: string }[];
  readonly outputs?: readonly { readonly internalType: string; readonly name: string; readonly type: string }[];
}[]> & {
  methods: {
    createShipment: (id: number, desc: string, receiver: string, cid: string) => any;
    uploadDocument: (id: number, cid: string) => any;
    getShipmentDetails: (id: number) => any;
  };
};

// ✅ Initialize Web3
export const initializeWeb3 = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("⚠️ No Web3 provider detected. Install MetaMask.");
  }

  try {
    if (!web3Instance) {
      web3Instance = new Web3(window.ethereum);
    }

    if (!shippingContract) {
      shippingContract = new web3Instance.eth.Contract(
        ShippingNFTABI as unknown as {
          readonly name: string;
          readonly type: string;
          readonly stateMutability: string;
          readonly inputs: readonly { readonly internalType: string; readonly name: string; readonly type: string }[];
          readonly outputs?: readonly { readonly internalType: string; readonly name: string; readonly type: string }[];
        }[],
        CONTRACT_ADDRESS
      ) as unknown as ShippingContract;
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    selectedAccount = accounts?.[0] || null;
  } catch (error) {
    console.error("❌ Web3 Initialization Error:", error);
    throw error;
  }
};

// ✅ Connect Wallet
export const connectWallet = async (): Promise<string | null> => {
  try {
    await initializeWeb3();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("⚠️ No accounts found. Unlock MetaMask.");
    }

    selectedAccount = accounts[0];
    console.log("✅ Wallet Connected:", selectedAccount);
    return selectedAccount;
  } catch (error: any) {
    console.error("❌ Wallet Connection Error:", error.message);
    throw error;
  }
};

// ✅ Get Wallet Address
export const getWalletAddress = async (): Promise<string | null> => {
  if (!selectedAccount) {
    await connectWallet();
  }
  return selectedAccount;
};

// ✅ Get Shipment Details
export const getShipmentDetails = async (
  shipmentId: string | number
) => {
  await initializeWeb3();
  try {
    const id = typeof shipmentId === "string" ? parseInt(shipmentId, 10) : shipmentId;
    const details = await shippingContract.methods.getShipmentDetails(id).call();
    console.log("📦 Shipment Details:", details);
    return details;
  } catch (error) {
    console.error("❌ Error fetching shipment details:", error);
    throw error;
  }
};

// ✅ Create Shipment (takes user-defined ID)
export const createShipment = async (
  shipmentId: number,
  description: string,
  receiver: string,
  documentCID: string = ""
) => {
  await initializeWeb3();

  if (!selectedAccount) throw new Error("⚠️ Wallet not connected.");

  // Prepare the method call, matching your solidity signature:
  const method = shippingContract.methods.createShipment(
    shipmentId,
    description,
    Web3.utils.toChecksumAddress(receiver),
    documentCID
  );

  // Estimate gas (might come back as a BigInt)
  const gasEstimate = await method.estimateGas({ from: selectedAccount });

  // Normalize: pick the larger of estimate vs MIN_GAS_LIMIT
  const minGasBI = BigInt(MIN_GAS_LIMIT);
  const estimateBI = BigInt(gasEstimate);
  const chosenBI = estimateBI > minGasBI ? estimateBI : minGasBI;
  const gasLimit = chosenBI.toString(); // string is accepted by web3

  // Send tx
  const tx = await method.send({
    from: selectedAccount,
    gas: gasLimit,
    maxPriorityFeePerGas: web3Instance!.utils.toWei(
      DEFAULT_MAX_PRIORITY_FEE,
      "gwei",
    ),
    maxFeePerGas: web3Instance!.utils.toWei(
      DEFAULT_MAX_FEE,
      "gwei",
    ),
  });

  return tx;
};


// ✅ Upload New Document
export const uploadDocument = async (shipmentId: number, cid: string) => {
  await initializeWeb3();

  if (!selectedAccount) {
    throw new Error("⚠️ Wallet not connected.");
  }

  try {
    const method = shippingContract.methods.uploadDocument(shipmentId, cid);
    const gasEstimate = await method.estimateGas({ from: selectedAccount });

    const tx = await method.send({
      from: selectedAccount,
      gas: Math.max(gasEstimate, MIN_GAS_LIMIT),
      maxPriorityFeePerGas: web3Instance!.utils.toWei(DEFAULT_MAX_PRIORITY_FEE, "gwei"),
      maxFeePerGas: web3Instance!.utils.toWei(DEFAULT_MAX_FEE, "gwei"),
    });

    console.log("✅ Document Uploaded:", tx);
    return tx;
  } catch (error) {
    console.error("❌ Document Upload Error:", error);
    throw error;
  }
};

// ✅ Listen to wallet changes
if (typeof window !== "undefined" && window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts: string[]) => {
    selectedAccount = accounts.length > 0 ? accounts[0] : null;
    console.log("🔄 Wallet Changed:", selectedAccount);
  });
}

// ✅ Declare Ethereum type for TS
declare global {
  interface Window {
    ethereum?: any;
  }
}
