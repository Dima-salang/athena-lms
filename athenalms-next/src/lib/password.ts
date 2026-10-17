/**
 * Password Utility Library
 *
 * Provides secure password generation and hashing using bcrypt.
 * Designed to be injectable — bcrypt calls can be mocked in tests.
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hash a plain-text password using bcrypt. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Verify a plain-text password against a bcrypt hash. */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Generate a secure random password.
 * Default length: 12 characters, alphanumeric.
 * Used when creating initial student accounts from roster upload.
 */
export function generatePassword(length = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
  let password = "";
  // Ensure at least one of each required character class
  password += charset[Math.floor(Math.random() * 26)]; // lowercase
  password += charset[26 + Math.floor(Math.random() * 26)]; // uppercase
  password += charset[52 + Math.floor(Math.random() * 10)]; // digit
  password += charset[62 + Math.floor(Math.random() * 4)]; // special

  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle to avoid predictable pattern at start
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/** Validate that a password meets minimum security requirements. */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePasswordStrength(
  password: string
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Must be at least 8 characters long.");
  if (!/[A-Z]/.test(password)) errors.push("Must contain at least one uppercase letter.");
  if (!/[a-z]/.test(password)) errors.push("Must contain at least one lowercase letter.");
  if (!/\d/.test(password)) errors.push("Must contain at least one digit.");

  return { valid: errors.length === 0, errors };
}
