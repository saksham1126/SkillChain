// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillChain — Blockchain-Based Skill Passport
 * @dev A beginner-friendly smart contract for issuing, verifying, and revoking skills certificates.
 */
contract SkillChain {
    // Structure holding certificate details on-chain
    struct Certificate {
        string certificateId;      // Unique certificate identifier
        string certificateHash;    // SHA-256 hash of certificate payload
        address issuer;            // Address of the issuer/organization
        uint256 issueTimestamp;    // Timestamp when registered on-chain
        bool isRevoked;            // True if revoked by the issuer
        bool exists;               // True if registered
    }

    // Mapping from unique certificate ID to Certificate
    mapping(string => Certificate) private certificates;

    // Events emitted during lifecycle
    event CertificateRegistered(
        string indexed certificateId,
        string certificateHash,
        address indexed issuer,
        uint256 timestamp
    );

    event CertificateRevoked(
        string indexed certificateId,
        address indexed issuer,
        uint256 timestamp
    );

    /**
     * @notice Register a new certificate with unique ID and data hash
     * @param _certificateId Unique alphanumeric ID
     * @param _certificateHash SHA-256 hash string of student/skill data
     */
    function registerCertificate(
        string memory _certificateId,
        string memory _certificateHash
    ) external {
        require(bytes(_certificateId).length > 0, "Certificate ID cannot be empty");
        require(bytes(_certificateHash).length > 0, "Certificate hash cannot be empty");
        require(!certificates[_certificateId].exists, "Certificate ID already registered");

        certificates[_certificateId] = Certificate({
            certificateId: _certificateId,
            certificateHash: _certificateHash,
            issuer: msg.sender,
            issueTimestamp: block.timestamp,
            isRevoked: false,
            exists: true
        });

        emit CertificateRegistered(_certificateId, _certificateHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify a certificate hash against the recorded blockchain hash
     * @param _certificateId Certificate ID to verify
     * @param _certificateHash Computed SHA-256 hash of original certificate details
     * @return isValid True if certificate exists, is not revoked, and hash matches
     * @return isRevoked True if certificate exists but has been revoked
     * @return exists True if certificate exists on-chain
     */
    function verifyCertificate(
        string memory _certificateId,
        string memory _certificateHash
    ) external view returns (bool isValid, bool isRevoked, bool exists) {
        Certificate memory cert = certificates[_certificateId];
        if (!cert.exists) {
            return (false, false, false);
        }
        if (cert.isRevoked) {
            return (false, true, true);
        }

        bool hashMatches = keccak256(bytes(cert.certificateHash)) == keccak256(bytes(_certificateHash));
        return (hashMatches, false, true);
    }

    /**
     * @notice Retrieve stored certificate details
     * @param _certificateId Unique ID of certificate
     */
    function getCertificate(string memory _certificateId)
        external
        view
        returns (
            string memory certificateHash,
            address issuer,
            uint256 issueTimestamp,
            bool isRevoked,
            bool exists
        )
    {
        Certificate memory cert = certificates[_certificateId];
        require(cert.exists, "Certificate not found");
        return (
            cert.certificateHash,
            cert.issuer,
            cert.issueTimestamp,
            cert.isRevoked,
            cert.exists
        );
    }

    /**
     * @notice Revoke an issued certificate. Only the original issuer can revoke it.
     * @param _certificateId Unique ID to revoke
     */
    function revokeCertificate(string memory _certificateId) external {
        Certificate storage cert = certificates[_certificateId];
        require(cert.exists, "Certificate not found");
        require(cert.issuer == msg.sender, "Only the original issuer can revoke this certificate");
        require(!cert.isRevoked, "Certificate is already revoked");

        cert.isRevoked = true;
        emit CertificateRevoked(_certificateId, msg.sender, block.timestamp);
    }

    /**
     * @notice Check whether a certificate exists and is currently active
     * @param _certificateId Unique ID of certificate
     */
    function isCertificateActive(string memory _certificateId) external view returns (bool) {
        Certificate memory cert = certificates[_certificateId];
        return cert.exists && !cert.isRevoked;
    }
}
