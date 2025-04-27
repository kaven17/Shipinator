const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contract with the account:", deployer.address);

  const ShippingNFT = await ethers.getContractFactory("ShippingNFT");
  const contract = await ShippingNFT.deploy();

  console.log("✅ Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
