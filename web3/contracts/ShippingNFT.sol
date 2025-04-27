// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";

contract ShippingNFT is ERC721Base {
    struct Shipment {
        string description;
        address sender;
        address receiver;
        string documentCID; // IPFS hash for the customs document
    }

    // Mapping from user-provided shipment ID to Shipment record
    mapping(uint256 => Shipment) public shipments;
    // Track the highest shipment ID for informational purposes
    uint256 public shipmentCount;

    event ShipmentCreated(
        uint256 indexed id,
        address indexed sender,
        address indexed receiver,
        string description,
        string documentCID
    );
    event DocumentUploaded(uint256 indexed id, string cid);
    event ShipmentTransferred(uint256 indexed id, address indexed from, address indexed to);

    constructor() ERC721Base(msg.sender, "BlockShipNFT", "BSHIP", msg.sender, 0) {}

    /**
     * @notice Creates a shipment NFT using a user-supplied shipment ID.
     * @param id The shipment ID you want to use (no restrictions are enforced).
     * @param desc The description of the shipment.
     * @param receiver The receiver’s Ethereum address.
     * @param cid The IPFS CID for the customs document.
     *
     * Note: This function does not enforce uniqueness or additional validations.
     */
    function createShipment(
        uint256 id,
        string memory desc,
        address receiver,
        string memory cid
    ) external {
        // Update shipmentCount for informational purposes only.
        if (id > shipmentCount) {
            shipmentCount = id;
        }
        // Mint an NFT with the provided shipment ID as the token ID.
        _safeMint(msg.sender, id);

        // Store shipment data without extra validation.
        shipments[id] = Shipment({
            description: desc,
            sender: msg.sender,
            receiver: receiver,
            documentCID: cid
        });

        emit ShipmentCreated(id, msg.sender, receiver, desc, cid);
    }

    /**
     * @notice Transfers the shipment NFT to the stored receiver.
     * @param id The shipment ID to transfer.
     */
    function transferShipment(uint256 id) external {
        // Use safeTransferFrom to move the NFT.
        safeTransferFrom(msg.sender, shipments[id].receiver, id);
        emit ShipmentTransferred(id, msg.sender, shipments[id].receiver);
    }

    /**
     * @notice Updates the document for a given shipment.
     * @param id The shipment ID.
     * @param cid The new IPFS CID for the document.
     */
    function uploadDocument(uint256 id, string memory cid) external {
        shipments[id].documentCID = cid;
        emit DocumentUploaded(id, cid);
    }

    /**
     * @notice Retrieves the details of a shipment.
     * @param id The shipment ID.
     * @return desc The shipment description.
     * @return sender The sender's address.
     * @return receiver The receiver's address.
     * @return cid The customs document IPFS CID.
     */
    function getShipmentDetails(uint256 id) external view returns (
        string memory desc,
        address sender,
        address receiver,
        string memory cid
    ) {
        Shipment memory s = shipments[id];
        return (s.description, s.sender, s.receiver, s.documentCID);
    }
}
