import Web3 from 'web3';
import { AbiItem } from 'web3';

// Smart contract ABI (simplified for example)
const ShipmentContractABI: readonly AbiItem[] = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shipmentId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_origin",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_destination",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_product",
        "type": "string"
      }
    ],
    "name": "createShipment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shipmentId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_status",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      }
    ],
    "name": "updateShipmentStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shipmentId",
        "type": "string"
      }
    ],
    "name": "getShipmentDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "shipmentId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "origin",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "destination",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "product",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "status",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "currentLocation",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "internalType": "struct BlockShipContract.Shipment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address (would be provided by actual deployed contract)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x8F3E72F5A1D98b3726999EE682Bfd9365A6b8E72";

// Initialize web3
let web3Instance: Web3 | null = null;
let shipmentContract: any = null;
let selectedAccount: string | null = null;

// Connect to Web3 provider (like MetaMask)
export const connectWallet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Web3 provider detected. Please install MetaMask.');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create Web3 instance
    web3Instance = new Web3(window.ethereum);
    
    // Get connected account
    const accounts = await web3Instance.eth.getAccounts();
    selectedAccount = accounts[0];
    
    // Initialize contract
    shipmentContract = new web3Instance.eth.Contract(
      ShipmentContractABI,
      CONTRACT_ADDRESS
    );
    
    return selectedAccount;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

// Get the connected wallet address
export const getWalletAddress = async (): Promise<string> => {
  if (!web3Instance) {
    throw new Error('Web3 not initialized. Please connect your wallet first.');
  }
  
  if (selectedAccount) return selectedAccount;
  
  const accounts = await web3Instance.eth.getAccounts();
  selectedAccount = accounts[0];
  return selectedAccount;
};

// Create a new shipment on the blockchain
export const createShipment = async (
  shipmentId: string,
  origin: string,
  destination: string,
  product: string
) => {
  if (!web3Instance || !shipmentContract) {
    throw new Error('Web3 not initialized. Please connect your wallet first.');
  }
  
  try {
    return await shipmentContract.methods
      .createShipment(shipmentId, origin, destination, product)
      .send({ from: selectedAccount });
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
};

// Update shipment status on the blockchain
export const updateShipmentStatus = async (
  shipmentId: string,
  status: string,
  location: string
) => {
  if (!web3Instance || !shipmentContract) {
    throw new Error('Web3 not initialized. Please connect your wallet first.');
  }
  
  try {
    return await shipmentContract.methods
      .updateShipmentStatus(shipmentId, status, location)
      .send({ from: selectedAccount });
  } catch (error) {
    console.error('Error updating shipment status:', error);
    throw error;
  }
};

// Get shipment details from the blockchain
export const getShipmentDetails = async (shipmentId: string) => {
  if (!web3Instance || !shipmentContract) {
    throw new Error('Web3 not initialized. Please connect your wallet first.');
  }
  
  try {
    return await shipmentContract.methods
      .getShipmentDetails(shipmentId)
      .call();
  } catch (error) {
    console.error('Error getting shipment details:', error);
    throw error;
  }
};

// Check if wallet is connected
export const isWalletConnected = (): boolean => {
  return web3Instance !== null && selectedAccount !== null;
};

// Interface for Ethereum window object
declare global {
    interface Window {
        ethereum?: any;
    }
}
