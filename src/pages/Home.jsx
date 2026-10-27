import React from "react";
import { PlusCircle, ShieldCheck, ListFilter, CheckCircle, Cpu, Lock, FileText } from "lucide-react";

export default function Home({ setActivePage }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-pill">
          <Cpu size={14} />
          <span>Ethereum Smart Contract Powered</span>
        </div>

        <h1 className="hero-title">
          Your Skills. <span className="highlight">Your Proof.</span>
        </h1>

        <p className="hero-desc">
          SkillChain is a decentralized academic and skill credential verification platform.
          Issue tamper-proof certificates registered on an immutable Ethereum blockchain using
          cryptographic SHA-256 hashes, preventing credential fraud once and for all.
        </p>

        <div className="hero-actions">
          <button
            className="btn btn-primary"
            onClick={() => setActivePage("add")}
          >
            <PlusCircle size={18} />
            Add Certificate
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setActivePage("verify")}
          >
            <ShieldCheck size={18} />
            Verify Certificate
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setActivePage("view")}
          >
            <ListFilter size={18} />
            View My Certificates
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon-box">
            <Lock size={22} />
          </div>
          <h3>Cryptographic Integrity</h3>
          <p>
            Certificate details are hashed using SHA-256 before registration. Even a single character
            change completely alters the hash, exposing any falsified certificate instantly.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <CheckCircle size={22} />
          </div>
          <h3>Immutable Blockchain Ledger</h3>
          <p>
            Records are permanently anchored in our Solidity smart contract. No central administrator
            or database intruder can secretly manipulate or delete issued credentials.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <FileText size={22} />
          </div>
          <h3>Instant Public Verification</h3>
          <p>
            Employers, universities, and recruiters can verify any credential in seconds by providing
            the certificate ID and details without requiring privileged portal logins.
          </p>
        </div>
      </section>
    </div>
  );
}
