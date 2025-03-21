// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";

contract ShippingNFT is ERC721Base {
    struct Shipment {
        uint256 id;
        string description;
        address sender;
        address receiver;
        string status;
        uint256 expiryDate;
        int256 recordedTemperature;
        string customClearanceCID; // Stores the document's IPFS hash
    }

    mapping(uint256 => Shipment) public shipments;
    uint256 public shipmentCount;

    event ShipmentCreated(uint256 shipmentId, address sender, address receiver, uint256 expiryDate);
    event TemperatureUpdated(uint256 shipmentId, int256 temperature, uint256 newExpiryDate);
    event DocumentUploaded(uint256 shipmentId, string cid);

    constructor() ERC721Base(msg.sender, "MedicineNFT", "MED", msg.sender, 0) {}

    function createShipment(
        string memory _description,
        address _receiver,
        uint256 _expiryDate
    ) public {
        shipmentCount++;
        shipments[shipmentCount] = Shipment(
            shipmentCount,
            _description,
            msg.sender,
            _receiver,
            "Pending",
            _expiryDate,
            0,
            "" // No document uploaded initially
        );
        _mint(msg.sender, shipmentCount);
        emit ShipmentCreated(shipmentCount, msg.sender, _receiver, _expiryDate);
    }

    function uploadCustomClearance(uint256 _shipmentId, string memory _cid) public {
        require(ownerOf(_shipmentId) == msg.sender, "Only owner can upload documents");
        shipments[_shipmentId].customClearanceCID = _cid;
        emit DocumentUploaded(_shipmentId, _cid);
    }

    function getCustomClearance(uint256 _shipmentId) public view returns (string memory) {
        return shipments[_shipmentId].customClearanceCID;
    }
}
