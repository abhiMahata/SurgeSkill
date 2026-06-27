/**
 * Password utilities for the localStorage dev-mode fallback only.
 * In production (Firebase mode) passwords are NEVER handled client-side —
 * Firebase Auth manages them securely server-side.
 */

/**
 * Hash a password using SHA-256 via the Web Crypto API.
 * Returns a lowercase hex string (64 characters).
 */
export async function hashPassword(password: string): Promise<string> {
  const data       = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify a plaintext password against a stored value.
 * Handles both SHA-256 hashes (new accounts) and legacy plain-text
 * (migration path — will not be produced by new registrations).
 */
export async function verifyPassword(input: string, stored: string): Promise<boolean> {
  // SHA-256 hex is always exactly 64 lowercase hex characters.
  if (/^[a-f0-9]{64}$/.test(stored)) {
    const hashed = await hashPassword(input);
    return hashed === stored;
  }
  // Legacy plain-text fallback (dev accounts created before this change)
  return input === stored;
}
