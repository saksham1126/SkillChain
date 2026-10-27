import { ethers } from "ethers";

/**
 * Creates a normalized JSON string representation of certificate details
 * to guarantee identical hash calculation across different machines.
 */
export function getCanonicalCertificateString(certData) {
  const normalized = {
    studentName: (certData.studentName || "").trim().toLowerCase(),
    skillName: (certData.skillName || "").trim().toLowerCase(),
    organization: (certData.organization || "").trim().toLowerCase(),
    issueDate: (certData.issueDate || "").trim(),
  };
  return JSON.stringify(normalized);
}

/**
 * Computes the SHA-256 hash of certificate data using Ethers.js
 * @param {Object} certData - { studentName, skillName, organization, issueDate }
 * @returns {string} Hexadecimal SHA-256 hash string (0x...)
 */
export function generateCertificateHash(certData) {
  const payload = getCanonicalCertificateString(certData);
  const bytes = ethers.toUtf8Bytes(payload);
  return ethers.sha256(bytes);
}

/**
 * Generates a unique, human-readable certificate ID
 * Example format: SKC-2026-X7K4
 */
export function generateCertificateId() {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SKC-${year}-${randomPart}`;
}
