# Shipinator

**Decentralized Cargo & Medicine Shelf-Life Tracking**

Shipinator is a full-stack, blockchain-powered cargo tracking system that ensures transparency, security, and end-to-end visibility across the shipping lifecycle. It combines:

- **Immutable on-chain tracking** via NFT-based shipments (ERC-721)
- **AI-driven medicine shelf-life validation** against mock (and future API) data
- **Temperature and transit time checks** using Node.js off-chain logic
- **Secure document storage** on IPFS via Pinata
- **Role-based UI** (admins vs. viewers) with Firebase auth + Google login

---

## 🚀 Project Structure

```
shipinator/
├── client/                   # Next.js frontend
│   ├── pages/                # Routes & pages
│   ├── components/           # Reusable UI components
│   ├── utils/                # Helpers (IPFS upload, time calc, etc.)
│   ├── styles/               # Tailwind / global styles
│   ├── public/               # Static assets
│   └── package.json
│
├── web3/                     # Smart contracts & blockchain scripts
│   ├── contracts/            # Solidity ERC-721 contract (ShippingNFT)
│   ├── scripts/              # Deploy & helper scripts (Hardhat)
│   ├── deployments/          # Network addresses & ABI
│   └── package.json
│
├── backend/                  # Node.js / Express + Firebase backend
│   ├── models/               # Data schemas (if any)
│   ├── routes/               # REST endpoints (shelf-life, temp check)
│   ├── controllers/          # Business logic
│   └── server.js             # Express app, Firebase init
│
├── data/                     # Mock data & scripts
│   ├── medicines.json        # Sample shelf-life lookup
│   └── fetch_shelf_life.py   # Python script (optional)
└── README.md                 # ← You are here!
```

---

## 📄 Pages & Flow

1. **Shipment Details**  
   - Form to enter `shipmentId`, `source`, `destination`, `contents`, `receiver`  
   - File upload → Pinata → returns IPFS CID & URL  
   - On submit → mints an ERC-721 “shipment” NFT (metadata stored on IPFS)  
   - Saves form + transaction hash to Firebase  

2. **Medicine Shelf-Life Tracker**  
   - User selects shipped medicine  
   - Lookup shelf-life from `data/medicines.json` (or future API like OpenFDA/DrugBank)  
   - Calculate transit duration (source → destination) + current temperature via backend  
   - Compare transit days vs. shelf-life → show **“Can Ship”** or **“Expired”**  

3. **Shipments Dashboard (Admin only)**  
   - Table of all shipments (from Firebase) with columns:  
     `ID | Contents | TX Hash | Status | Temperature | Shelf-Life Result`  
   - Admins (Google-auth + wallet) can **update status** (In Transit, Delivered, etc.)  
   - Viewers see read-only  

4. **Receiver View**  
   - Given a shipment NFT, receiver can fetch IPFS CID from on-chain metadata  
   - Display uploaded documents (PDFs, images) via IPFS gateway  
   - Show final status & details  

---

## ⚙️ Installation & Setup

1. **Clone & install all modules**  
   ```bash
   git clone https://github.com/your-org/shipinator.git
   cd shipinator
   # Client
   cd client && npm install
   # Web3
   cd ../web3 && npm install
   # Backend
   cd ../backend && npm install
   ```

2. **Environment variables**  
   Create `.env` files in each folder with:

   **client/.env.local**  
   ```
   NEXT_PUBLIC_PINATA_JWT=<your-pinata-jwt>
   NEXT_PUBLIC_FIREBASE_API_KEY=…
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=…
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
   NEXT_PUBLIC_FIREBASE_APP_ID=…
   ```

   **web3/.env**  
   ```
   PRIVATE_KEY=<deployer-wallet-key>
   RPC_URL=<sepolia-or-polygon-rpc-url>
   ```

   **backend/.env**  
   ```
   FIREBASE_SERVICE_ACCOUNT=<path-to-service-account-json>
   PORT=4000
   ```

3. **Deploy Smart Contract**  
   ```bash
   cd web3
   npx hardhat run scripts/deploy.js --network sepolia
   # Note the deployed contract address → update client/utils/constants.ts
   ```

4. **Run Backend**  
   ```bash
   cd backend
   node server.js
   ```

5. **Run Frontend**  
   ```bash
   cd client
   npm run dev
   ```

---

## 📚 Technologies Used

```
Solidity, Hardhat, Thirdweb, Chainlink, Pinata, IPFS, React.js, Next.js, Tailwind CSS, Ethers.js, Node.js, Express, Firebase Authentication & Realtime Database, Python
```

---

## 🔮 Future Work

- Swap mock shelf-life data for real APIs (OpenFDA, DrugBank)  
- On-chain verifiable proofs for temperature & expiry (e.g., zk-SNARKs)  
- Multi-chain support (Polygon, BNB) & gas optimizations  
- Role-based dashboards with richer analytics  

---

## 🤝 Contributing

Feel free to open issues or PRs! For major changes, please fork the repo and submit a PR.

---

## 📝 License

MIT © [Your Name / Organization]

