const hre = require("hardhat");

async function main() {
    const Shipping = await hre.ethers.getContractFactory("ShippingNFT"); // Ensure correct contract name
    const shipping = await Shipping.deploy();

    await shipping.deployed();
    console.log(`ShippingNFT deployed to: ${shipping.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
