import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AddCertificate from "./pages/AddCertificate";
import ViewCertificates from "./pages/ViewCertificates";
import VerifyCertificate from "./pages/VerifyCertificate";
import { connectWallet, switchToLocalhostNetwork, LOCAL_RPC_URL } from "./utils/blockchain";
import { ethers } from "ethers";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [verifyTargetId, setVerifyTargetId] = useState("");
  const [wallet, setWallet] = useState({
    isConnected: false,
    address: "",
    signer: null,
    chainId: null,
  });
  const [walletError, setWalletError] = useState("");

  // Check if wallet is already connected or connect to MetaMask / Local Node
  useEffect(() => {
    checkExistingConnection();

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setWallet({ isConnected: false, address: "", signer: null, chainId: null });
        } else {
          checkExistingConnection();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const checkExistingConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          setWallet({
            isConnected: true,
            address,
            signer,
            chainId: Number(network.chainId),
          });
        }
      } catch (err) {
        console.warn("Could not check existing wallet connection:", err);
      }
    }
  };

  const handleConnectWallet = async () => {
    setWalletError("");
    try {
      // If MetaMask is installed
      if (typeof window !== "undefined" && window.ethereum) {
        const res = await connectWallet();
        // Check if on Hardhat network
        if (res.chainId !== 31337 && res.chainId !== 1337) {
          try {
            await switchToLocalhostNetwork();
          } catch (switchErr) {
            console.warn("Network switch warning:", switchErr);
          }
        }
        setWallet({
          isConnected: true,
          address: res.address,
          signer: res.signer,
          chainId: res.chainId,
        });
        return res;
      } else {
        // Fallback for local development if browser wallet extension is not installed:
        // Connect directly to local Hardhat node signer (account #0)
        const localProvider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
        const localSigner = await localProvider.getSigner(0);
        const localAddress = await localSigner.getAddress();
        const network = await localProvider.getNetwork();
        const res = {
          isConnected: true,
          address: localAddress,
          signer: localSigner,
          chainId: Number(network.chainId),
        };
        setWallet(res);
        return res;
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setWalletError(err.message || "Failed to connect wallet.");
      throw err;
    }
  };

  const handleSelectForVerification = (certId) => {
    setVerifyTargetId(certId);
    setActivePage("verify");
  };

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={(page) => {
          if (page !== "verify") setVerifyTargetId("");
          setActivePage(page);
        }}
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
      />

      <main className="main-content">
        {walletError && (
          <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
            <span>{walletError}</span>
          </div>
        )}

        {activePage === "home" && <Home setActivePage={setActivePage} />}

        {activePage === "add" && (
          <AddCertificate
            wallet={wallet}
            onConnectWallet={handleConnectWallet}
            setActivePage={setActivePage}
          />
        )}

        {activePage === "view" && (
          <ViewCertificates
            setActivePage={setActivePage}
            onSelectForVerification={handleSelectForVerification}
            wallet={wallet}
            onConnectWallet={handleConnectWallet}
          />
        )}

        {activePage === "verify" && (
          <VerifyCertificate initialCertId={verifyTargetId} />
        )}
      </main>

      <Footer />
    </div>
  );
}
