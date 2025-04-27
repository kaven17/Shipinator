require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

if (
  !ALCHEMY_API_KEY ||
  !PRIVATE_KEY ||
  !ETHERSCAN_API_KEY
) {
  console.error(
    "Please set your ALCHEMY_API_KEY, PRIVATE_KEY, and ETHERSCAN_API_KEY in .env.local",
  );
  process.exit(1);
}

// Remove any leading '0x' if present
const formattedPrivateKey = PRIVATE_KEY.startsWith("0x")
  ? PRIVATE_KEY.slice(2)
  : PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimize for deployment efficiency
      },
      viaIR: true, // Additional optimization technique
      metadata: {
        bytecodeHash: "ipfs", // Helps with reproducible builds
      },
    },
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [formattedPrivateKey],
      chainId: 11155111,
      gas: 5000000, // Increase to 5M
      gasPrice: 2500000000, // Adjust based on network conditions (2.5 Gwei)
    },
    
    // Optional: Add local hardhat network for testing
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  // Optional: Add paths configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
