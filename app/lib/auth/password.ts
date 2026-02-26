/**
 * Re-export PBKDF2 password utilities from root lib for alias compatibility.
 * The tsconfig @/lib/* alias resolves to app/lib/* in Turbopack dev mode.
 * This shim ensures the same API is available regardless of the resolver used.
 */
export { hashPassword, verifyPassword } from '../../../lib/auth/password';

