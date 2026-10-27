import React from "react";
import { Award, PlusCircle, ShieldCheck, ListFilter, Wallet } from "lucide-react";

export default function Navbar({ activePage, setActivePage, wallet, onConnectWallet }) {
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand" onClick={() => setActivePage("home")}>
          <div className="brand-icon">
            <Award size={20} />
          </div>
          <div>
            Skill<span className="accent">Chain</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link ${activePage === "home" ? "active" : ""}`}
            onClick={() => setActivePage("home")}
          >
            Home
          </button>
          <button
            className={`nav-link ${activePage === "add" ? "active" : ""}`}
            onClick={() => setActivePage("add")}
          >
            <PlusCircle size={16} />
            Add Certificate
          </button>
          <button
            className={`nav-link ${activePage === "view" ? "active" : ""}`}
            onClick={() => setActivePage("view")}
          >
            <ListFilter size={16} />
            My Certificates
          </button>
          <button
            className={`nav-link ${activePage === "verify" ? "active" : ""}`}
            onClick={() => setActivePage("verify")}
          >
            <ShieldCheck size={16} />
            Verify
          </button>
        </nav>

        <div>
          {wallet.isConnected ? (
            <button
              className="wallet-badge-btn connected"
              title={`Connected: ${wallet.address}`}
              onClick={onConnectWallet}
            >
              <span className="wallet-dot"></span>
              <span>{formatAddress(wallet.address)}</span>
            </button>
          ) : (
            <button className="wallet-badge-btn disconnected" onClick={onConnectWallet}>
              <Wallet size={14} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
