import React, { useState, useEffect } from "react";
import { ListFilter, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Trash2, ExternalLink, RefreshCw, PlusCircle, Ban } from "lucide-react";
import { getStoredCertificates, updateCertificate } from "../utils/storage";
import { verifyCertificateOnChain, revokeCertificateOnChain } from "../utils/blockchain";

export default function ViewCertificates({ setActivePage, onSelectForVerification, wallet, onConnectWallet }) {
  const [certificates, setCertificates] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [statuses, setStatuses] = useState({}); // { certId: { status: 'VERIFIED' | 'INVALID' | 'REVOKED', message: '' } }
  const [filterText, setFilterText] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = () => {
    const list = getStoredCertificates();
    setCertificates(list);
  };

  const handleVerifyOne = async (cert) => {
    setVerifyingId(cert.id);
    setActionMessage(null);
    try {
      const result = await verifyCertificateOnChain(cert.id, cert.hash);
      if (result.isValid) {
        setStatuses((prev) => ({
          ...prev,
          [cert.id]: { status: "VERIFIED", text: "Verified on Blockchain" },
        }));
      } else if (result.isRevoked) {
        setStatuses((prev) => ({
          ...prev,
          [cert.id]: { status: "REVOKED", text: "Certificate Revoked" },
        }));
        updateCertificate(cert.id, { isRevoked: true });
      } else {
        setStatuses((prev) => ({
          ...prev,
          [cert.id]: { status: "INVALID", text: "Invalid / Hash Mismatch" },
        }));
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatuses((prev) => ({
        ...prev,
        [cert.id]: { status: "INVALID", text: err.message || "Failed to query blockchain" },
      }));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRevokeOne = async (cert) => {
    if (!window.confirm(`Are you sure you want to permanently revoke Certificate "${cert.id}"? This cannot be undone on the blockchain.`)) {
      return;
    }

    let signer = wallet.signer;
    if (!wallet.isConnected || !signer) {
      try {
        const connected = await onConnectWallet();
        signer = connected.signer;
      } catch (err) {
        setActionMessage({ type: "danger", text: err.message || "Please connect the issuer wallet." });
        return;
      }
    }

    try {
      setRevokingId(cert.id);
      setActionMessage(null);
      await revokeCertificateOnChain(signer, cert.id);
      
      updateCertificate(cert.id, { isRevoked: true });
      setStatuses((prev) => ({
        ...prev,
        [cert.id]: { status: "REVOKED", text: "Revoked on Blockchain" },
      }));
      loadCertificates();

      setActionMessage({
        type: "success",
        text: `Certificate ${cert.id} was successfully revoked on the smart contract.`,
      });
    } catch (err) {
      console.error("Revocation error:", err);
      setActionMessage({
        type: "danger",
        text: err.message || "Failed to revoke certificate.",
      });
    } finally {
      setRevokingId(null);
    }
  };

  const filtered = certificates.filter((c) => {
    const q = filterText.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.skillName.toLowerCase().includes(q) ||
      c.organization.toLowerCase().includes(q)
    );
  });

  return (
    <div className="view-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ListFilter size={24} color="#2563eb" />
            My Stored Certificates
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.925rem" }}>
            Credentials stored in this browser with their live verification status from the Solidity smart contract.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-primary btn-sm" onClick={() => setActivePage("add")}>
            <PlusCircle size={15} /> Add Certificate
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className={`alert alert-${actionMessage.type}`} style={{ marginBottom: "1.25rem" }}>
          {actionMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {certificates.length > 0 && (
        <div style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by student, skill, or ID..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <h3>No Certificates Found</h3>
          <p>
            You haven't issued or registered any certificates from this browser yet.
          </p>
          <button className="btn btn-primary" onClick={() => setActivePage("add")}>
            <PlusCircle size={16} /> Issue Your First Certificate
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No matching certificates</h3>
          <p>Try searching for a different keyword or student name.</p>
        </div>
      ) : (
        <div className="cert-grid">
          {filtered.map((cert) => {
            const currentStatus = statuses[cert.id];
            const isCertRevoked = cert.isRevoked || currentStatus?.status === "REVOKED";

            return (
              <div className="cert-card" key={cert.id}>
                <div>
                  <div className="cert-top">
                    <span className="cert-id-badge">{cert.id}</span>

                    {currentStatus ? (
                      <span className={`status-badge ${currentStatus.status.toLowerCase()}`}>
                        {currentStatus.status === "VERIFIED" && <CheckCircle2 size={12} />}
                        {currentStatus.status === "INVALID" && <XCircle size={12} />}
                        {currentStatus.status === "REVOKED" && <Ban size={12} />}
                        {currentStatus.status}
                      </span>
                    ) : isCertRevoked ? (
                      <span className="status-badge revoked">
                        <Ban size={12} /> REVOKED
                      </span>
                    ) : (
                      <span className="status-badge" style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1" }}>
                        REGISTERED
                      </span>
                    )}
                  </div>

                  <h3 className="cert-student">{cert.studentName}</h3>
                  <div className="cert-skill">{cert.skillName}</div>

                  <div className="cert-meta">
                    <div>
                      <strong>Issuer:</strong> {cert.organization}
                    </div>
                    <div>
                      <strong>Date:</strong> {cert.issueDate}
                    </div>
                    {cert.txHash && (
                      <div style={{ wordBreak: "break-all" }}>
                        <strong>Tx:</strong>{" "}
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#64748b" }}>
                          {cert.txHash.substring(0, 14)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="cert-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    disabled={verifyingId === cert.id}
                    onClick={() => handleVerifyOne(cert)}
                    title="Query smart contract to verify certificate hash"
                  >
                    {verifyingId === cert.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={14} color="#2563eb" />
                    )}
                    Verify Live
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (onSelectForVerification) onSelectForVerification(cert.id);
                      setActivePage("verify");
                    }}
                    title="Open in dedicated verification page"
                  >
                    <ExternalLink size={14} />
                  </button>

                  {!isCertRevoked && (
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={revokingId === cert.id}
                      onClick={() => handleRevokeOne(cert)}
                      title="Revoke certificate on blockchain (issuer only)"
                    >
                      <Ban size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
