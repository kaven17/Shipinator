require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: '.env.local' });

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Validate environment variables
if (!ALCHEMY_API_KEY || !PRIVATE_KEY) {
  console.error("Please set your ALCHEMY_API_KEY and PRIVATE_KEY in a .env file");
  process.exit(1);
}

// Remove '0x' prefix if present in private key
const formattedPrivateKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY.slice(2) : PRIVATE_KEY;

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [formattedPrivateKey],
    },
  },
};
