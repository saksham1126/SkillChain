const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SkillChain Smart Contract", function () {
  let skillChain;
  let owner;
  let student;
  let otherAccount;

  // Sample test certificate details
  const certId = "SKILL-2026-CS101";
  const certHash = "a3f5b786d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f0";
  const wrongHash = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

  beforeEach(async function () {
    [owner, student, otherAccount] = await ethers.getSigners();
    const SkillChainFactory = await ethers.getContractFactory("SkillChain");
    skillChain = await SkillChainFactory.deploy();
    await skillChain.waitForDeployment();
  });

  describe("Certificate Registration", function () {
    it("should register a certificate successfully", async function () {
      const tx = await skillChain.registerCertificate(certId, certHash);
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      const cert = await skillChain.getCertificate(certId);
      expect(cert.certificateHash).to.equal(certHash);
      expect(cert.issuer).to.equal(owner.address);
      expect(cert.isRevoked).to.equal(false);
      expect(cert.exists).to.equal(true);

      const isActive = await skillChain.isCertificateActive(certId);
      expect(isActive).to.equal(true);
    });

    it("should reject duplicate certificate IDs", async function () {
      await skillChain.registerCertificate(certId, certHash);

      let reverted = false;
      try {
        await skillChain.registerCertificate(certId, certHash);
      } catch (err) {
        reverted = true;
        expect(err.message).to.include("Certificate ID already registered");
      }
      expect(reverted, "Transaction should have reverted on duplicate ID").to.be.true;
    });

    it("should reject registration with empty ID or hash", async function () {
      let emptyIdReverted = false;
      try {
        await skillChain.registerCertificate("", certHash);
      } catch (err) {
        emptyIdReverted = true;
        expect(err.message).to.include("Certificate ID cannot be empty");
      }
      expect(emptyIdReverted, "Transaction should have reverted on empty ID").to.be.true;

      let emptyHashReverted = false;
      try {
        await skillChain.registerCertificate("ID-EMPTY-HASH", "");
      } catch (err) {
        emptyHashReverted = true;
        expect(err.message).to.include("Certificate hash cannot be empty");
      }
      expect(emptyHashReverted, "Transaction should have reverted on empty hash").to.be.true;
    });
  });

  describe("Certificate Verification", function () {
    beforeEach(async function () {
      await skillChain.registerCertificate(certId, certHash);
    });

    it("should verify a correct hash", async function () {
      const [isValid, isRevoked, exists] = await skillChain.verifyCertificate(certId, certHash);
      expect(isValid).to.equal(true);
      expect(isRevoked).to.equal(false);
      expect(exists).to.equal(true);
    });

    it("should reject an incorrect hash", async function () {
      const [isValid, isRevoked, exists] = await skillChain.verifyCertificate(certId, wrongHash);
      expect(isValid).to.equal(false);
      expect(isRevoked).to.equal(false);
      expect(exists).to.equal(true);
    });

    it("should reject verification for non-existent certificate", async function () {
      const [isValid, isRevoked, exists] = await skillChain.verifyCertificate("NON-EXISTENT", certHash);
      expect(isValid).to.equal(false);
      expect(isRevoked).to.equal(false);
      expect(exists).to.equal(false);
    });
  });

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      await skillChain.registerCertificate(certId, certHash);
    });

    it("should allow the original issuer to revoke their certificate", async function () {
      const tx = await skillChain.revokeCertificate(certId);
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      const cert = await skillChain.getCertificate(certId);
      expect(cert.isRevoked).to.equal(true);

      const isActive = await skillChain.isCertificateActive(certId);
      expect(isActive).to.equal(false);
    });

    it("should reject revocation attempts by non-issuers", async function () {
      let reverted = false;
      try {
        await skillChain.connect(otherAccount).revokeCertificate(certId);
      } catch (err) {
        reverted = true;
        expect(err.message).to.include("Only the original issuer can revoke this certificate");
      }
      expect(reverted, "Transaction should have reverted when non-issuer tries to revoke").to.be.true;
    });

    it("should reject verification of a revoked certificate", async function () {
      await skillChain.revokeCertificate(certId);

      const [isValid, isRevoked, exists] = await skillChain.verifyCertificate(certId, certHash);
      expect(isValid).to.equal(false);
      expect(isRevoked).to.equal(true);
      expect(exists).to.equal(true);
    });

    it("should reject revoking an already revoked certificate", async function () {
      await skillChain.revokeCertificate(certId);

      let reverted = false;
      try {
        await skillChain.revokeCertificate(certId);
      } catch (err) {
        reverted = true;
        expect(err.message).to.include("Certificate is already revoked");
      }
      expect(reverted, "Transaction should have reverted when revoking an already revoked certificate").to.be.true;
    });
  });
});
