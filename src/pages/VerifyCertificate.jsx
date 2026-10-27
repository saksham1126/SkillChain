import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, CheckCircle2, XCircle, AlertTriangle, Info, Ban, Hash, Clock, User, Award, Building2, HelpCircle } from "lucide-react";
import { getCertificateById } from "../utils/storage";
import { generateCertificateHash } from "../utils/crypto";
import { verifyCertificateOnChain, getCertificateFromChain } from "../utils/blockchain";

export default function VerifyCertificate({ initialCertId = "" }) {
  const [certId, setCertId] = useState(initialCertId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Certificate details used for computing hash
  const [certDetails, setCertDetails] = useState({
    studentName: "",
    skillName: "",
    organization: "",
    issueDate: "",
  });

  const [detailsSource, setDetailsSource] = useState(null); // 'local' | 'manual' | null
  const [requiresManualDetails, setRequiresManualDetails] = useState(false);

  // Verification outcome: null | { status: 'VERIFIED' | 'INVALID' | 'REVOKED', computedHash, recordedHash, issuer, issueTimestamp }
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (initialCertId) {
      setCertId(initialCertId);
      triggerAutoVerification(initialCertId);
    }
  }, [initialCertId]);

  const triggerAutoVerification = async (idToVerify) => {
    const trimmedId = idToVerify.trim();
    if (!trimmedId) return;

    // Check localStorage
    const local = getCertificateById(trimmedId);
    if (local) {
      setCertDetails({
        studentName: local.studentName,
        skillName: local.skillName,
        organization: local.organization,
        issueDate: local.issueDate,
      });
      setDetailsSource("local");
      setRequiresManualDetails(false);
      executeVerification(trimmedId, local);
    } else {
      // Check if it exists on chain
      checkChainForId(trimmedId);
    }
  };

  const checkChainForId = async (idToVerify) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const chainData = await getCertificateFromChain(idToVerify);
      if (chainData && chainData.exists) {
        setRequiresManualDetails(true);
        setDetailsSource("manual");
        setError("");
      }
    } catch (err) {
      if (err.message.includes("not found") || err.message.includes("does not exist")) {
        setError("Certificate does not exist on the blockchain. Please verify the Certificate ID.");
      } else {
        setError(err.message || "Failed to query the blockchain.");
      }
      setRequiresManualDetails(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const cleanId = certId.trim();
    if (!cleanId) {
      setError("Please enter a Certificate ID.");
      return;
    }

    setError("");
    setResult(null);

    // 1. Check local browser storage first
    const localData = getCertificateById(cleanId);
    if (localData) {
      setCertDetails({
        studentName: localData.studentName,
        skillName: localData.skillName,
        organization: localData.organization,
        issueDate: localData.issueDate,
      });
      setDetailsSource("local");
      setRequiresManualDetails(false);
      executeVerification(cleanId, localData);
    } else {
      // Not in local storage
      // Do not treat missing browser data as proof of invalid certificate!
      setRequiresManualDetails(true);
      setDetailsSource("manual");
      setLoading(true);

      try {
        const onChain = await getCertificateFromChain(cleanId);
        if (!onChain || !onChain.exists) {
          setError("Certificate does not exist on the blockchain. Please verify the Certificate ID.");
          setRequiresManualDetails(false);
        }
      } catch (err) {
        setError("Certificate does not exist on the blockchain or could not be found.");
        setRequiresManualDetails(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!certDetails.studentName.trim() || !certDetails.skillName.trim() || !certDetails.organization.trim() || !certDetails.issueDate) {
      setError("Please provide all certificate details to perform cryptographic hash verification.");
      return;
    }
    executeVerification(certId.trim(), certDetails);
  };

  const executeVerification = async (targetId, details) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Compute SHA-256 hash of the certificate details
      const computedHash = generateCertificateHash(details);

      // 2. Query deployed smart contract
      const onChain = await verifyCertificateOnChain(targetId, computedHash);

      if (!onChain.exists) {
        setError("Certificate does not exist on the blockchain.");
        return;
      }

      if (onChain.isRevoked) {
        setResult({
          status: "REVOKED",
          computedHash,
          recordedHash: onChain.recordedHash,
          issuer: onChain.issuer,
          issueTimestamp: onChain.issueTimestamp,
          message: "This certificate was officially revoked by its issuing authority.",
        });
      } else if (onChain.isValid) {
        setResult({
          status: "VERIFIED",
          computedHash,
          recordedHash: onChain.recordedHash,
          issuer: onChain.issuer,
          issueTimestamp: onChain.issueTimestamp,
          message: "Cryptographic hash matches the immutable blockchain record. Credential is active.",
        });
      } else {
        setResult({
          status: "INVALID",
          computedHash,
          recordedHash: onChain.recordedHash,
          issuer: onChain.issuer,
          issueTimestamp: onChain.issueTimestamp,
          message: "Calculated hash does NOT match the hash recorded on the blockchain. The certificate details have been tampered with or do not match.",
        });
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setError(err.message || "Failed to verify certificate against smart contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="card form-card">
        <div className="card-header">
          <h2 className="card-title">
            <ShieldCheck size={24} color="#2563eb" />
            Verify Certificate Authenticity
          </h2>
          <p className="card-subtitle">
            Enter any Certificate ID to query the Solidity smart contract and verify its cryptographic proof on-chain.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="certId">
              Certificate ID *
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                id="certId"
                type="text"
                className="form-input"
                placeholder="e.g. SKC-2026-X7K4"
                value={certId}
                onChange={(e) => {
                  setCertId(e.target.value);
                  if (error) setError("");
                  if (result) setResult(null);
                }}
                disabled={loading}
                style={{ textTransform: "uppercase", fontFamily: "var(--font-mono)" }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !certId.trim()}
                style={{ flexShrink: 0 }}
              >
                <Search size={16} />
                Verify
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="alert alert-danger" style={{ marginTop: "1.25rem" }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {/* Explanatory note when browser data is absent */}
        {requiresManualDetails && !result && (
          <div style={{ marginTop: "1.5rem" }}>
            <div className="alert alert-info">
              <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>Notice: </strong>
                This Certificate ID exists on the blockchain ledger, but was issued from another browser or device.
                <p style={{ marginTop: "0.35rem", fontSize: "0.825rem" }}>
                  To cryptographically verify that the certificate presented by the student has not been tampered with, please enter the original certificate details below to compute and compare the SHA-256 hash.
                </p>
              </div>
            </div>

            <form onSubmit={handleManualVerify} style={{ marginTop: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Student Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Student name as printed on certificate"
                  value={certDetails.studentName}
                  onChange={(e) => setCertDetails({ ...certDetails, studentName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skill / Certificate Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Full-Stack Web Development"
                  value={certDetails.skillName}
                  onChange={(e) => setCertDetails({ ...certDetails, skillName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Organization</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dept. of Computer Science"
                  value={certDetails.organization}
                  onChange={(e) => setCertDetails({ ...certDetails, organization: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={certDetails.issueDate}
                  onChange={(e) => setCertDetails({ ...certDetails, issueDate: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
                <ShieldCheck size={18} />
                Calculate SHA-256 & Verify Against Smart Contract
              </button>
            </form>
          </div>
        )}

        {/* Verification Result Display */}
        {result && (
          <div className={`verification-result ${result.status.toLowerCase()}`}>
            <div className={`verify-badge-large ${result.status.toLowerCase()}`}>
              {result.status === "VERIFIED" && <CheckCircle2 size={24} style={{ marginRight: "0.5rem" }} />}
              {result.status === "INVALID" && <XCircle size={24} style={{ marginRight: "0.5rem" }} />}
              {result.status === "REVOKED" && <Ban size={24} style={{ marginRight: "0.5rem" }} />}
              {result.status}
            </div>

            <p style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-main)", maxWidth: "560px", margin: "0 auto" }}>
              {result.message}
            </p>

            {/* Cryptographic comparison grid */}
            <div className="result-detail-grid">
              <div className="result-row">
                <span className="result-label">Certificate ID:</span>
                <span className="result-value">{certId.toUpperCase()}</span>
              </div>

              {certDetails.studentName && (
                <div className="result-row">
                  <span className="result-label">Student Name:</span>
                  <span className="result-value" style={{ fontFamily: "inherit" }}>{certDetails.studentName}</span>
                </div>
              )}

              {certDetails.skillName && (
                <div className="result-row">
                  <span className="result-label">Certified Skill:</span>
                  <span className="result-value" style={{ fontFamily: "inherit" }}>{certDetails.skillName}</span>
                </div>
              )}

              {certDetails.organization && (
                <div className="result-row">
                  <span className="result-label">Issuing Org:</span>
                  <span className="result-value" style={{ fontFamily: "inherit" }}>{certDetails.organization}</span>
                </div>
              )}

              {result.issuer && (
                <div className="result-row">
                  <span className="result-label">Issuer Wallet:</span>
                  <span className="result-value">{result.issuer}</span>
                </div>
              )}

              {result.issueTimestamp > 0 && (
                <div className="result-row">
                  <span className="result-label">Blockchain Timestamp:</span>
                  <span className="result-value">
                    {new Date(result.issueTimestamp * 1000).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="result-row" style={{ borderTop: "1px dashed var(--border)", paddingTop: "0.5rem" }}>
                <span className="result-label">Computed Hash:</span>
                <span className="result-value" style={{ color: result.status === "VERIFIED" ? "#047857" : "#b91c1c" }}>
                  {result.computedHash}
                </span>
              </div>

              <div className="result-row">
                <span className="result-label">On-Chain Hash:</span>
                <span className="result-value">
                  {result.recordedHash || "Not Registered"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
