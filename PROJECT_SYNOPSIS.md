# PROJECT SYNOPSIS

## Project Title
**SkillChain — Blockchain-Based Skill Passport**

---

## 1. Introduction & Background
In the contemporary academic and professional landscape, verifiable credentials (degrees, certificates, skill badges, and diplomas) are critical for recruitment, admissions, and career mobility. However, paper certificates and traditional digital PDFs are susceptible to forgery, unauthorized alterations, and duplication. Centralized verification systems often suffer from single points of failure, administrative delays, high verification costs, and vulnerability to database tampering.

**SkillChain** addresses this problem by leveraging Ethereum smart contract technology and cryptographic SHA-256 hashing to create an immutable, decentralized skill passport. It enables academic institutes and certifying bodies to anchor proof of issued certificates onto the blockchain, allowing anyone (recruiters, institutions, employers) to verify credential authenticity in seconds without intermediaries.

---

## 2. Problem Statement
- **Credential Fraud & Tampering**: Digital certificates (e.g., standard PDFs or image files) can be easily edited using image editing software, leading to fake resumes and invalid academic claims.
- **Centralized Vulnerabilities**: Traditional verification relies on centralized university databases that can be hacked, compromised, or taken offline.
- **Verification Latency & Overhead**: Background verification checks often require manual outreach to institutions, taking days or weeks.
- **Revocation Challenges**: In cases of misconduct or erroneous issuance, centralized records can be updated, but third-party verifiers holding previous physical copies have no way of knowing if a credential was revoked.

---

## 3. Objectives of the Project
1. Develop an Ethereum-compatible Solidity smart contract to store certificate fingerprints (hashes) immutably on-chain.
2. Implement cryptographic SHA-256 hashing to guarantee that any minor alteration in certificate metadata immediately invalidates verification.
3. Eliminate duplicate certificate registrations on the blockchain ledger.
4. Establish decentralized access control such that only the original issuing organization can revoke an issued credential.
5. Provide a responsive, beginner-friendly React.js frontend interface for issuing, viewing, and verifying certificates in real time.
6. Provide an automated testing suite validating all operational requirements and edge cases.

---

## 4. System Architecture & Workflow

### Architectural Overview
```
+-------------------------------------------------------------------------+
|                              USER BROWSER                               |
|                                                                         |
|   +-------------------+    +-------------------+    +---------------+   |
|   |   Add Certificate |    |  My Certificates  |    |  Verification |   |
|   |       Form        |    |      Dashboard    |    |     Portal    |   |
|   +---------+---------+    +---------+---------+    +-------+-------+   |
|             |                        |                      |           |
|             v                        v                      v           |
|      [Local Storage]         [Local Storage]         [SHA-256 Calc]     |
|   (Browser Persistence)                                     |           |
+-------------+-----------------------------------------------+-----------+
              |                                               |
              |                     Ethers.js                 |
              +-------------------------+---------------------+
                                        |
                                        v
                       +----------------------------------+
                       |    ETHEREUM LOCAL BLOCKCHAIN     |
                       |         (Hardhat Node)           |
                       |                                  |
                       |   +--------------------------+   |
                       |   |      SkillChain.sol      |   |
                       |   |                          |   |
                       |   | - registerCertificate()  |   |
                       |   | - verifyCertificate()    |   |
                       |   | - revokeCertificate()    |   |
                       |   | - getCertificate()       |   |
                       |   +--------------------------+   |
                       +----------------------------------+
```

### Operational Workflow:
1. **Issuance (Add Certificate)**:
   - Issuer fills out: Student Name, Skill/Course Title, Issuing Organization, Issue Date.
   - Frontend validates fields and generates a unique ID (`SKC-YYYY-XXXX`).
   - A canonical SHA-256 hash is computed from the normalized payload.
   - The Certificate ID and cryptographic hash are broadcasted via Ethers.js to `SkillChain.sol`.
   - The transaction is mined, recording the issuer's wallet address, timestamp, and hash permanently on-chain.
   - Details are preserved in browser `localStorage`.

2. **Verification (Public Portal)**:
   - Verifier enters the Certificate ID.
   - The system retrieves the canonical certificate data and recomputes the SHA-256 hash.
   - The smart contract is queried with `verifyCertificate(id, computedHash)`.
   - The contract performs an on-chain comparison (`keccak256(storedHash) == keccak256(computedHash)`).
   - If match & not revoked $\rightarrow$ **VERIFIED** (Active credential).
   - If data was modified $\rightarrow$ **INVALID** (Hash mismatch).
   - If issuer revoked $\rightarrow$ **REVOKED** (Revoked by issuing authority).

---

## 5. Key Modules & Features

| Module | Description |
| :--- | :--- |
| **Landing Page** | Clean dashboard introducing SkillChain, value proposition (*"Your Skills. Your Proof."*), and quick navigation. |
| **Add Certificate** | Input validation, unique ID generation, SHA-256 hashing, MetaMask/Signer integration, and real transaction feedback. |
| **View Certificates** | Listing of all credentials issued from the browser, live on-chain status checks, and issuer-only revocation. |
| **Verification Portal** | Instant public verification comparing computed hash against on-chain records, with support for verifying external credentials. |
| **Solidity Smart Contract** | Minimal, secure smart contract managing registration, verification, active checks, and revocation access control. |

---

## 6. Technology Stack

- **Client Tier**: React 18, Vite 5, Lucide React (Icons), Custom CSS3 (Navy/Indigo theme).
- **Blockchain Tier**: Solidity `0.8.20`, Hardhat Local Network (Chain ID: `31337`).
- **Integration Layer**: Ethers.js (v6) for Web3 provider/signer management and JSON-RPC calls.
- **Client Storage**: Browser `localStorage` for offline caching of issued credentials.
- **Testing & Tooling**: Chai assertion library, Mocha, Hardhat Runner.

---

## 7. Security & Cryptographic Mechanisms

1. **SHA-256 Cryptographic Fingerprint**:
   Certificate details are hashed using SHA-256 before anchoring. Because SHA-256 is collision-resistant and irreversible, sensitive private student details do not need to be stored directly on-chain, preserving data privacy while maintaining verifiable integrity.
2. **Blockchain Immutability**:
   Once registered, the certificate hash and issuance timestamp cannot be modified by any third party or network node.
3. **Issuer Access Control**:
   The smart contract strictly enforces `require(cert.issuer == msg.sender)` on revocation requests, preventing unauthorized parties from tampering with valid certificates.
4. **Collision & Duplicate Prevention**:
   The smart contract checks `require(!certificates[_certificateId].exists)` to eliminate duplicate certificate ID conflicts.

---

## 8. Test Suite & Validation Results

The project includes an automated test suite (`blockchain/test/SkillChain.test.js`) executed with Hardhat and Chai:
- **Test 1**: Successful certificate registration and state verification (`exists = true`, `isRevoked = false`).
- **Test 2**: Rejection of duplicate certificate IDs.
- **Test 3**: Rejection of empty certificate ID or empty hash payloads.
- **Test 4**: Successful verification of matching SHA-256 hashes (`isValid = true`).
- **Test 5**: Rejection of altered/mismatched hashes (`isValid = false`).
- **Test 6**: Proper handling of non-existent certificate IDs.
- **Test 7**: Successful credential revocation by the legitimate issuer.
- **Test 8**: Rejection of revocation attempts by unauthorized wallets.
- **Test 9**: Verification rejection for revoked certificates (`isRevoked = true`).
- **Test 10**: Prevention of redundant revocation on already revoked credentials.
*Result: 10/10 automated tests passing.*

---

## 9. Conclusion & Future Scope

### Conclusion
**SkillChain** successfully demonstrates a practical, lightweight, and cost-effective implementation of blockchain technology for educational and professional credentialing. By combining client-side cryptographic hashing with Ethereum smart contract enforcement, the platform provides zero-trust verification that eliminates certificate fraud.

### Future Scope
- **IPFS Integration**: Decentralized storage of certificate PDF documents and badges via InterPlanetary File System (IPFS).
- **Soulbound Tokens (SBT / ERC-5192)**: Minting non-transferable NFTs directly to student wallet addresses.
- **Multi-Signature Issuing**: Requiring multi-signature approval (e.g., Dean + Registrar) before anchoring credentials.
- **Layer 2 Deployment**: Deploying to low-cost networks such as Polygon, Arbitrum, or Base for near-zero gas fee transactions.
