# SkillChain — Blockchain-Based Skill Passport

SkillChain is a beginner-friendly, decentralized academic and skill credential verification project built for college and learning demonstrations. It leverages the Ethereum blockchain to store tamper-proof cryptographic proofs (SHA-256 hashes) of issued certificates, completely eliminating fraudulent or modified credentials.

---

## 🚀 Key Features

1. **Home Landing Page**
   - Clean, modern dashboard highlighting the core mission: *"Your Skills. Your Proof."*
   - Direct access to issue certificates, verify credentials, and view stored passports.

2. **Add & Register Certificate**
   - Form capturing: Student Name, Skill/Certificate Title, Issuing Organization, and Issue Date.
   - Generates a unique Certificate ID (e.g., `SKC-2026-X7K4`).
   - Generates a cryptographic **SHA-256 hash** of the certificate details.
   - Broadcasts the Certificate ID and hash to the Solidity smart contract via Ethers.js.
   - Stores certificate details in browser `localStorage`.
   - Displays real Ethereum transaction hash and confirmation upon success.

3. **View My Certificates**
   - Displays all credentials added by the browser user.
   - Shows: Certificate ID, Student Name, Skill Name, Issuing Organization, Issue Date, and Verification Status.
   - "Verify Live" button queries the blockchain smart contract in real time.
   - Revoke option allows the original issuing authority to revoke credentials on-chain.

4. **Verify Certificate Authenticity**
   - Public verification page accessible by employers, recruiters, or universities.
   - Queries the deployed smart contract by Certificate ID.
   - Computes the SHA-256 hash and compares it directly with the hash stored on the blockchain ledger:
     - **VERIFIED**: Cryptographic hash matches and certificate is active.
     - **INVALID**: Details were altered or do not match the on-chain hash.
     - **REVOKED**: Certificate was officially cancelled by its issuing authority.
     - **ERROR**: Certificate ID does not exist on the blockchain.
   - Explains when original certificate details are required if verifying from an external device.

---

## 🛠️ Technology Stack

- **Frontend**: React.js with Vite
- **Styling**: Modern, responsive vanilla CSS (white/light theme, navy headings, blue/indigo accents)
- **Icons**: Lucide React
- **Smart Contract**: Solidity (`^0.8.20`)
- **Local Blockchain**: Hardhat (`31337`)
- **Web3 Library**: Ethers.js (v6)
- **Local Persistence**: Browser `localStorage`

---

## 📂 Project Structure

```text
SkillChain/
├── blockchain/
│   ├── contracts/
│   │   └── SkillChain.sol       # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js            # Hardhat deployment script (exports config to src)
│   └── test/
│       └── SkillChain.test.js   # Automated test suite (10 unit tests)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Top navigation bar & wallet status
│   │   └── Footer.jsx           # Clean footer
│   ├── pages/
│   │   ├── Home.jsx             # Landing page
│   │   ├── AddCertificate.jsx   # Certificate issuance form & blockchain submission
│   │   ├── ViewCertificates.jsx # Stored certificates list with live verification
│   │   └── VerifyCertificate.jsx# Cryptographic verification against smart contract
│   ├── utils/
│   │   ├── blockchain.js        # Ethers.js provider, signer, & contract calls
│   │   ├── crypto.js            # Deterministic SHA-256 calculation & ID generation
│   │   └── storage.js           # Browser localStorage manager
│   ├── App.jsx                  # Main application state & routing
│   ├── contractConfig.json      # Deployed address and contract ABI
│   ├── main.jsx                 # React root mount
│   └── styles.css               # Clean styling
├── hardhat.config.js            # Hardhat network & compiler configuration
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite bundler configuration
└── README.md                    # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18, v20, or v22 recommended)
- [MetaMask](https://metamask.io/) browser extension (optional, but recommended for full Web3 wallet experience)

### Step 1: Install Dependencies
Open a terminal in the project directory and run:
```bash
npm install
```

---

## ⛓️ Running the Local Blockchain & Deploying Contract

### Step 2: Start the Local Hardhat Blockchain
Open a dedicated terminal window and run:
```bash
npx hardhat node
```
This launches a local Ethereum node at `http://127.0.0.1:8545` and creates 20 pre-funded test accounts with 10,000 fake ETH each. **Keep this terminal window open.**

### Step 3: Deploy the Smart Contract
Open a **second** terminal window and run:
```bash
npm run deploy:local
```
*(or `npx hardhat run blockchain/scripts/deploy.js --network localhost`)*

This compiles `SkillChain.sol`, deploys it to your local node, and automatically writes the contract address and ABI into `src/contractConfig.json`.

---

## 💻 Starting the React Frontend

### Step 4: Launch Vite Dev Server
In your terminal, start the development server:
```bash
npm run dev
```

Open your browser and navigate to the printed URL (typically `http://localhost:5173`).

---

## 🦊 Connecting MetaMask (Development Wallet)

1. Open your MetaMask extension.
2. Click the Network dropdown (top-left) and select **Add network** -> **Add a network manually**:
   - **Network Name**: `Hardhat Localhost`
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Click **Save**.
4. Import a Hardhat test account into MetaMask:
   - In MetaMask, click your account profile icon -> **Add account or hardware wallet** -> **Import account**.
   - Paste Account #0's private key from the `npx hardhat node` terminal output:
     ```
     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
     ```
   - You now have 10,000 local test ETH for free instant transactions!
5. On the SkillChain web page, click **Connect Wallet** in the top navigation bar.

*Note: Never use real cryptocurrency or real mainnet wallets for testing.*

---

## 🧪 Running Automated Smart Contract Tests

To run the complete automated test suite verifying contract integrity:
```bash
npm run test:contract
```
*(or `npx hardhat test`)*

### Tested Scenarios:
- ✅ Registering a certificate on-chain with unique ID and SHA-256 hash.
- ✅ Rejecting duplicate certificate IDs.
- ✅ Rejecting empty certificate IDs or hashes.
- ✅ Verifying a correct hash returns `isValid = true`.
- ✅ Rejecting an incorrect or altered hash (`isValid = false`).
- ✅ Rejecting verification for non-existent certificate IDs.
- ✅ Allowing only the original issuer to revoke their certificate.
- ✅ Rejecting unauthorized revocation attempts by other accounts.
- ✅ Rejecting verification of revoked certificates (`isRevoked = true`).
- ✅ Rejecting double-revocation of already revoked certificates.

---

## 🔍 How to Test Registration and Verification (Walkthrough)

1. **Issue a Certificate**:
   - Navigate to **Add Certificate**.
   - Enter Student Name: `Jane Doe`
   - Enter Skill: `Full-Stack Web Development & Blockchain`
   - Enter Issuing Organization: `National Engineering Institute`
   - Select today's date.
   - Click **Register Certificate on Blockchain**. Confirm the transaction in MetaMask.
   - A green success box displays your generated **Certificate ID** and **Ethereum Transaction Hash**.

2. **View Certificate**:
   - Go to **My Certificates**.
   - Your newly issued credential appears in a card.
   - Click **Verify Live** to query the smart contract and see the verified badge.

3. **Verify Certificate (Verification Page)**:
   - Navigate to **Verify**.
   - Enter your Certificate ID and click **Verify**.
   - The system retrieves the data, recalculates the SHA-256 hash, and compares it to the blockchain hash.
   - You will see a large **VERIFIED** badge, timestamp, issuer address, and matching hash details.

4. **Test Tamper Detection (Negative Test)**:
   - In the verification page, if you alter even one letter in the student name or skill and click verify, the computed SHA-256 hash changes completely.
   - The contract detects the mismatch and flags the certificate as **INVALID**.

5. **Test Revocation**:
   - In **My Certificates**, click the red Revoke button on a certificate.
   - Confirm in MetaMask. The certificate status updates to **REVOKED**.
   - Verifying the certificate now displays **REVOKED**, proving that canceled credentials cannot be passed off as valid.

---

## 📜 License
This project is open-source and intended for academic, college, and learning purposes.
