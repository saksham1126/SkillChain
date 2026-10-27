import React, { useState } from "react";
import { PlusCircle, CheckCircle2, AlertCircle, Copy, Check, ArrowRight, Loader2 } from "lucide-react";
import { generateCertificateHash, generateCertificateId } from "../utils/crypto";
import { registerCertificateOnChain } from "../utils/blockchain";
import { saveCertificate } from "../utils/storage";

export default function AddCertificate({ wallet, onConnectWallet, setActivePage }) {
  const [formData, setFormData] = useState({
    studentName: "",
    skillName: "",
    organization: "",
    issueDate: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessResult(null);

    // 1. Validate inputs
    if (!formData.studentName.trim()) {
      setError("Please enter the student's full name.");
      return;
    }
    if (!formData.skillName.trim()) {
      setError("Please enter the skill or certificate title.");
      return;
    }
    if (!formData.organization.trim()) {
      setError("Please enter the issuing organization name.");
      return;
    }
    if (!formData.issueDate) {
      setError("Please select a valid issue date.");
      return;
    }

    // 2. Check wallet connection
    let signer = wallet.signer;
    if (!wallet.isConnected || !signer) {
      try {
        const connected = await onConnectWallet();
        signer = connected.signer;
      } catch (walletErr) {
        setError(walletErr.message || "Please connect your wallet before submitting.");
        return;
      }
    }

    try {
      setLoading(true);

      // 3. Generate unique Certificate ID & SHA-256 Hash
      const certId = generateCertificateId();
      const certHash = generateCertificateHash(formData);

      // 4. Send Certificate ID and hash to the Solidity smart contract
      // IMPORTANT: Transaction must succeed first before declaring success
      const txResult = await registerCertificateOnChain(signer, certId, certHash);

      // 5. Store certificate information in browser localStorage
      const certRecord = {
        id: certId,
        studentName: formData.studentName.trim(),
        skillName: formData.skillName.trim(),
        organization: formData.organization.trim(),
        issueDate: formData.issueDate,
        hash: certHash,
        txHash: txResult.txHash,
        issuerAddress: wallet.address,
        createdAt: new Date().toISOString(),
        isRevoked: false,
      };
      saveCertificate(certRecord);

      // 6. Show success message with transaction details
      setSuccessResult({
        certId,
        certHash,
        txHash: txResult.txHash,
        blockNumber: txResult.blockNumber,
      });

      // Reset form
      setFormData({
        studentName: "",
        skillName: "",
        organization: "",
        issueDate: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      // Never show success if transaction fails
      console.error("Submission failed:", err);
      setError(err.message || "Failed to register certificate on the blockchain.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  return (
    <div className="add-page">
      <div className="card form-card">
        <div className="card-header">
          <h2 className="card-title">
            <PlusCircle size={22} color="#2563eb" />
            Issue & Register Certificate
          </h2>
          <p className="card-subtitle">
            Create a verifiable skill credential anchored permanently to the Ethereum blockchain.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Registration Failed: </strong>
              {error}
            </div>
          </div>
        )}

        {successResult && (
          <div className="alert alert-success" style={{ flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700 }}>
              <CheckCircle2 size={20} color="#059669" />
              <span>Certificate Successfully Registered on Blockchain!</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#065f46" }}>
              The certificate ID and cryptographic SHA-256 hash are now immutably stored in the SkillChain smart contract.
            </p>

            <div className="tx-success-box" style={{ width: "100%", marginTop: "0.5rem" }}>
              <div className="tx-field">
                <span className="tx-field-label">Generated Certificate ID</span>
                <div className="tx-field-value">
                  <span>{successResult.certId}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(successResult.certId, "id")}
                    type="button"
                    title="Copy Certificate ID"
                  >
                    {copiedId ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="tx-field" style={{ marginTop: "0.75rem" }}>
                <span className="tx-field-label">Ethereum Transaction Hash</span>
                <div className="tx-field-value">
                  <span>{successResult.txHash}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(successResult.txHash, "tx")}
                    type="button"
                    title="Copy Transaction Hash"
                  >
                    {copiedTx ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  className="btn btn-primary btn-sm"
                  type="button"
                  onClick={() => setActivePage("view")}
                >
                  View My Certificates <ArrowRight size={14} />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={() => setActivePage("verify")}
                >
                  Test Verification
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="studentName">
              Student Full Name *
            </label>
            <input
              id="studentName"
              name="studentName"
              type="text"
              className="form-input"
              placeholder="e.g. Alex Morgan"
              value={formData.studentName}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <p className="form-help">The official recipient of the certificate.</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="skillName">
              Skill or Certificate Title *
            </label>
            <input
              id="skillName"
              name="skillName"
              type="text"
              className="form-input"
              placeholder="e.g. Full-Stack Web Development, Solidity & Smart Contracts"
              value={formData.skillName}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <p className="form-help">The verified skill, course, or achievement being certified.</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="organization">
              Issuing Organization *
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              className="form-input"
              placeholder="e.g. Dept. of Computer Science & Engineering"
              value={formData.organization}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <p className="form-help">University, institute, or certifying body.</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="issueDate">
              Issue Date *
            </label>
            <input
              id="issueDate"
              name="issueDate"
              type="date"
              className="form-input"
              value={formData.issueDate}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {!wallet.isConnected && (
            <div className="alert alert-warning" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
              <AlertCircle size={16} />
              <div>
                Wallet is currently disconnected. Clicking register will prompt you to connect your MetaMask or development account.
              </div>
            </div>
          )}

          <div style={{ marginTop: "1.75rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Broadcasting to Blockchain...
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  Register Certificate on Blockchain
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
