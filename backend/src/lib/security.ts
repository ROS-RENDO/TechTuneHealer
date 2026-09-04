/**
 * Shared security helpers.
 *
 * JWT secret is loaded once at boot and fails fast if missing —
 * never fall back to a hardcoded default that would let anyone forge tokens.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET environment variable is required (min 16 chars). Set it in backend/.env before starting the server."
    );
  }
  return secret;
}
