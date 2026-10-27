import { ethers } from "ethers";
import defaultConfig from "../contractConfig.json";

export const CONTRACT_ADDRESS = defaultConfig.address || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const CONTRACT_ABI = defaultConfig.abi;
export const LOCAL_RPC_URL = "http://127.0.0.1:8545";
export const HARDHAT_CHAIN_ID = 31337;

/**
 * Returns a read-only provider. Prefers browser provider if available,
 * otherwise falls back to local JSON-RPC provider (127.0.0.1:8545).
 */
export async function getReadOnlyProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(LOCAL_RPC_URL);
}

/**
 * Requests wallet connection via MetaMask or active browser wallet.
 * @returns {Promise<{ signer: ethers.Signer, address: string, chainId: number }>}
 */
export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "MetaMask or an Ethereum browser wallet was not detected. Please install MetaMask, or make sure your browser extension is active."
    );
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please grant wallet access in MetaMask.");
  }

  const network = await provider.getNetwork();
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
  };
}

/**
 * Helper to prompt MetaMask to switch to the local Hardhat network (ChainId: 31337)
 */
export async function switchToLocalhostNetwork() {
  if (!window.ethereum) return;
  const hexChainId = "0x" + HARDHAT_CHAIN_ID.toString(16);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError) {
    // Error 4902: chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: "Hardhat Localhost",
            rpcUrls: [LOCAL_RPC_URL],
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

/**
 * Get an instance of the SkillChain contract with either a signer or provider
 */
export function getSkillChainContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

/**
 * Register a certificate on the blockchain
 * @param {ethers.Signer} signer
 * @param {string} certificateId
 * @param {string} certificateHash
 * @returns {Promise<{ txHash: string, blockNumber: number }>}
 */
export async function registerCertificateOnChain(signer, certificateId, certificateHash) {
  if (!signer) {
    throw new Error("Wallet not connected. Please connect your wallet to register on the blockchain.");
  }

  const contract = getSkillChainContract(signer);
  
  // Estimate gas to catch reverts early with meaningful message
  try {
    const tx = await contract.registerCertificate(certificateId, certificateHash);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: receipt.from,
    };
  } catch (error) {
    handleBlockchainError(error);
  }
}

/**
 * Verify a certificate hash against the blockchain
 * @param {string} certificateId
 * @param {string} certificateHash
 * @returns {Promise<{ isValid: boolean, isRevoked: boolean, exists: boolean, recordedHash?: string, issuer?: string }>}
 */
export async function verifyCertificateOnChain(certificateId, certificateHash) {
  const provider = await getReadOnlyProvider();
  const contract = getSkillChainContract(provider);

  try {
    const [isValid, isRevoked, exists] = await contract.verifyCertificate(
      certificateId,
      certificateHash
    );

    let recordedHash = "";
    let issuer = "";
    let issueTimestamp = 0;

    if (exists) {
      const details = await contract.getCertificate(certificateId);
      recordedHash = details.certificateHash;
      issuer = details.issuer;
      issueTimestamp = Number(details.issueTimestamp);
    }

    return {
      isValid,
      isRevoked,
      exists,
      recordedHash,
      issuer,
      issueTimestamp,
    };
  } catch (error) {
    handleBlockchainError(error);
  }
}

/**
 * Query certificate details by ID from the blockchain
 */
export async function getCertificateFromChain(certificateId) {
  const provider = await getReadOnlyProvider();
  const contract = getSkillChainContract(provider);

  try {
    const details = await contract.getCertificate(certificateId);
    return {
      certificateHash: details.certificateHash,
      issuer: details.issuer,
      issueTimestamp: Number(details.issueTimestamp),
      isRevoked: details.isRevoked,
      exists: details.exists,
    };
  } catch (error) {
    handleBlockchainError(error);
  }
}

/**
 * Revoke a certificate on the blockchain (only original issuer can revoke)
 */
export async function revokeCertificateOnChain(signer, certificateId) {
  if (!signer) {
    throw new Error("Wallet not connected. Connect the issuer's wallet to revoke.");
  }

  const contract = getSkillChainContract(signer);
  try {
    const tx = await contract.revokeCertificate(certificateId);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    handleBlockchainError(error);
  }
}

/**
 * Parse and present readable errors to the user
 */
function handleBlockchainError(error) {
  console.error("Blockchain error details:", error);

  const message = error?.reason || error?.info?.error?.message || error?.message || "";

  if (message.includes("Certificate ID already registered")) {
    throw new Error("This Certificate ID is already registered on the blockchain.");
  }
  if (message.includes("Certificate not found") || message.includes("does not exist")) {
    throw new Error("This Certificate was not found on the blockchain.");
  }
  if (message.includes("Only the original issuer can revoke")) {
    throw new Error("Unauthorized: Only the original issuer address can revoke this certificate.");
  }
  if (message.includes("Certificate is already revoked")) {
    throw new Error("This certificate has already been revoked.");
  }
  if (message.includes("user rejected action") || message.includes("User rejected")) {
    throw new Error("Transaction was rejected in your wallet.");
  }
  if (message.includes("could not detect network") || message.includes("failed to fetch")) {
    throw new Error(
      "Unable to connect to the Ethereum network. Make sure your local Hardhat node is running (npx hardhat node) or MetaMask is connected to Localhost 8545."
    );
  }

  throw new Error(message || "Blockchain transaction failed. Please check the console for details.");
}
