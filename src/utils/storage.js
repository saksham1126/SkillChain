const STORAGE_KEY = "skillchain_local_certificates";

/**
 * Retrieve all certificates stored in this browser's localStorage
 * @returns {Array} List of certificate objects
 */
export function getStoredCertificates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read from localStorage:", err);
    return [];
  }
}

/**
 * Save a new certificate record to localStorage
 * @param {Object} cert - Certificate object
 */
export function saveCertificate(cert) {
  const certs = getStoredCertificates();
  // Check if exists
  const existsIndex = certs.findIndex((c) => c.id === cert.id);
  if (existsIndex >= 0) {
    certs[existsIndex] = { ...certs[existsIndex], ...cert };
  } else {
    certs.unshift(cert);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
  return certs;
}

/**
 * Find a certificate by its unique ID in localStorage
 * @param {string} certId
 * @returns {Object|null}
 */
export function getCertificateById(certId) {
  if (!certId) return null;
  const certs = getStoredCertificates();
  return certs.find((c) => c.id.trim().toUpperCase() === certId.trim().toUpperCase()) || null;
}

/**
 * Update certificate status (e.g. revoked) in localStorage
 * @param {string} certId
 * @param {Object} updates
 */
export function updateCertificate(certId, updates) {
  const certs = getStoredCertificates();
  const updated = certs.map((c) => {
    if (c.id === certId) {
      return { ...c, ...updates };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
