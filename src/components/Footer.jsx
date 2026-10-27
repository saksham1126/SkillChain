import React from "react";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
        <Shield size={16} color="#2563eb" />
        <span>SkillChain — Blockchain-Based Skill Passport (College Project)</span>
      </div>
      <p style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: "#94a3b8" }}>
        Built with Solidity, Hardhat, Ethers.js & React
      </p>
    </footer>
  );
}
