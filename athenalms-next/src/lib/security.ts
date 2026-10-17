/**
 * Security Engine
 *
 * Handles:
 *  - Client IP address resolution from Next.js request headers
 *  - CIDR subnet whitelist checking (campus IP enforcement)
 *  - Exam session IP lock validation (prevent network switching mid-exam)
 *
 * Zero external dependencies for core logic — fully unit-testable.
 * ip-cidr package used only for CIDR parsing (injectable for tests).
 */

// ─────────────────────────────────────────────────────────────────────────────
// IP Address Extraction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract the real client IP from a Next.js request.
 * Checks standard proxy headers in priority order.
 */
export function extractClientIp(headers: Headers): string | null {
  const candidates = [
    "x-real-ip",
    "x-forwarded-for",
    "cf-connecting-ip", // Cloudflare
    "true-client-ip",   // Akamai
    "x-client-ip",
  ];

  for (const header of candidates) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can be a comma-separated list; take the first
      const ip = value.split(",")[0].trim();
      if (isValidIp(ip)) return ip;
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// IP Validation
// ─────────────────────────────────────────────────────────────────────────────

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/;

/** Basic IPv4 address validation. */
export function isValidIp(ip: string): boolean {
  return IPV4_REGEX.test(ip.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// CIDR Subnet Checking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a CIDR block to its start and end IP range as 32-bit integers.
 * Supports /0 through /32.
 */
export function cidrToRange(cidr: string): { start: number; end: number } | null {
  const parts = cidr.trim().split("/");
  if (parts.length !== 2) return null;

  const ipPart = parts[0];
  const prefixLen = parseInt(parts[1], 10);

  if (!isValidIp(ipPart) || isNaN(prefixLen) || prefixLen < 0 || prefixLen > 32) {
    return null;
  }

  const ipInt = ipToInt(ipPart);
  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
  const start = (ipInt & mask) >>> 0;
  const end = (start | (~mask >>> 0)) >>> 0;

  return { start, end };
}

/** Convert dotted IPv4 to unsigned 32-bit integer. */
export function ipToInt(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

/**
 * Check if an IP address falls within a CIDR block.
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  if (!isValidIp(ip)) return false;

  const range = cidrToRange(cidr);
  if (!range) return false;

  const ipInt = ipToInt(ip);
  return ipInt >= range.start && ipInt <= range.end;
}

/**
 * Check if an IP address is permitted by any CIDR block in the whitelist.
 *
 * @param ip         Client IP address string.
 * @param cidrBlocks Array of CIDR blocks (e.g. ["192.168.1.0/24"]).
 * @returns true if the IP matches any block, or if the whitelist is empty.
 */
export function isIpAllowed(ip: string, cidrBlocks: string[]): boolean {
  // Empty whitelist = allow all (network lock disabled)
  if (!cidrBlocks || cidrBlocks.length === 0) return true;

  return cidrBlocks.some((cidr) => isIpInCidr(ip, cidr));
}

// ─────────────────────────────────────────────────────────────────────────────
// Exam Session IP Lock
// ─────────────────────────────────────────────────────────────────────────────

export interface IpLockVerificationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Verify that the current request IP matches the IP locked to an exam session.
 *
 * @param currentIp    IP from the current API request.
 * @param lockedIp     IP recorded when the exam session was started.
 * @param lockEnabled  Whether the IP lock feature is active.
 */
export function verifyExamIpLock(
  currentIp: string | null,
  lockedIp: string | null,
  lockEnabled: boolean
): IpLockVerificationResult {
  if (!lockEnabled) return { allowed: true };

  if (!currentIp) {
    return { allowed: false, reason: "Client IP could not be determined." };
  }

  if (!lockedIp) {
    // No IP was recorded at session start — allow and log
    return { allowed: true };
  }

  if (currentIp !== lockedIp) {
    return {
      allowed: false,
      reason: `Network change detected. Exam started from ${lockedIp}, current IP is ${currentIp}.`,
    };
  }

  return { allowed: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Allowed CIDRs from environment config
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse the ALLOWED_CIDR_BLOCKS environment variable into an array.
 * Returns an empty array (allow-all) if the variable is empty or unset.
 */
export function getAllowedCidrs(): string[] {
  const raw = process.env.ALLOWED_CIDR_BLOCKS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Whether the exam session IP lock feature is globally enabled. */
export function isExamIpLockEnabled(): boolean {
  return process.env.EXAM_IP_LOCK_ENABLED === "true";
}
