import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generatePassword,
  validatePasswordStrength,
} from "../password";

describe("Password Utility", () => {
  it("hashes and verifies passwords correctly using bcrypt", async () => {
    const plain = "SecureP@ss123";
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith("$2")).toBe(true);

    const matches = await verifyPassword(plain, hash);
    expect(matches).toBe(true);

    const wrongMatches = await verifyPassword("WrongPassword", hash);
    expect(wrongMatches).toBe(false);
  });

  it("generates secure random passwords with mixed character types", () => {
    const password = generatePassword(14);
    expect(password).toHaveLength(14);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[a-z]/.test(password)).toBe(true);
    expect(/\d/.test(password)).toBe(true);
  });

  it("validates password strength rules accurately", () => {
    // Too short
    expect(validatePasswordStrength("Short1!").valid).toBe(false);

    // Missing uppercase
    expect(validatePasswordStrength("lowercase123!").valid).toBe(false);

    // Missing lowercase
    expect(validatePasswordStrength("UPPERCASE123!").valid).toBe(false);

    // Missing number
    expect(validatePasswordStrength("NoNumbersHere!").valid).toBe(false);

    // Strong password
    const result = validatePasswordStrength("ValidPassword123!");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
