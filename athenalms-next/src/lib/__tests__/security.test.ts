import { describe, it, expect } from "vitest";
import {
  isValidIp,
  ipToInt,
  cidrToRange,
  isIpInCidr,
  isIpAllowed,
  extractClientIp,
  verifyExamIpLock,
} from "../security";

describe("IP Validation and Integer Conversion", () => {
  it("validates legitimate IPv4 addresses", () => {
    expect(isValidIp("192.168.1.1")).toBe(true);
    expect(isValidIp("10.0.0.1")).toBe(true);
    expect(isValidIp("127.0.0.1")).toBe(true);
    expect(isValidIp("255.255.255.255")).toBe(true);
  });

  it("rejects invalid IPv4 addresses", () => {
    expect(isValidIp("256.0.0.1")).toBe(false);
    expect(isValidIp("192.168.1")).toBe(false);
    expect(isValidIp("abc.def.ghi.jkl")).toBe(false);
    expect(isValidIp("")).toBe(false);
  });

  it("converts IP to 32-bit unsigned integer correctly", () => {
    expect(ipToInt("0.0.0.0")).toBe(0);
    expect(ipToInt("0.0.0.1")).toBe(1);
    expect(ipToInt("255.255.255.255")).toBe(4294967295);
    expect(ipToInt("127.0.0.1")).toBe(2130706433);
  });
});

describe("CIDR Range Calculation and Matching", () => {
  it("calculates range for standard /24 subnet", () => {
    const range = cidrToRange("192.168.1.0/24");
    expect(range).not.toBeNull();
    expect(range?.start).toBe(ipToInt("192.168.1.0"));
    expect(range?.end).toBe(ipToInt("192.168.1.255"));
  });

  it("calculates range for /32 single host", () => {
    const range = cidrToRange("10.0.0.5/32");
    expect(range?.start).toBe(ipToInt("10.0.0.5"));
    expect(range?.end).toBe(ipToInt("10.0.0.5"));
  });

  it("returns null for malformed CIDRs", () => {
    expect(cidrToRange("invalid-cidr")).toBeNull();
    expect(cidrToRange("192.168.1.1/35")).toBeNull();
  });

  it("identifies whether an IP is within a CIDR subnet", () => {
    expect(isIpInCidr("192.168.1.50", "192.168.1.0/24")).toBe(true);
    expect(isIpInCidr("192.168.2.1", "192.168.1.0/24")).toBe(false);
  });

  it("allows all IPs if whitelist is empty", () => {
    expect(isIpAllowed("1.2.3.4", [])).toBe(true);
  });

  it("checks multiple CIDR blocks in whitelist", () => {
    const whitelist = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"];
    expect(isIpAllowed("192.168.1.100", whitelist)).toBe(true);
    expect(isIpAllowed("10.50.1.2", whitelist)).toBe(true);
    expect(isIpAllowed("8.8.8.8", whitelist)).toBe(false);
  });
});

describe("Client IP Extraction", () => {
  it("extracts from x-forwarded-for header (first in list)", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "203.0.113.195, 70.41.3.18, 150.172.238.178");

    const ip = extractClientIp(headers);
    expect(ip).toBe("203.0.113.195");
  });

  it("extracts from x-real-ip header", () => {
    const headers = new Headers();
    headers.set("x-real-ip", "198.51.100.1");

    const ip = extractClientIp(headers);
    expect(ip).toBe("198.51.100.1");
  });

  it("returns null when no valid IP header is found", () => {
    const headers = new Headers();
    expect(extractClientIp(headers)).toBeNull();
  });
});

describe("Exam Session IP Lock", () => {
  it("allows access if exam IP lock is disabled", () => {
    const result = verifyExamIpLock("1.2.3.4", "5.6.7.8", false);
    expect(result.allowed).toBe(true);
  });

  it("allows access when current IP matches locked IP", () => {
    const result = verifyExamIpLock("192.168.1.10", "192.168.1.10", true);
    expect(result.allowed).toBe(true);
  });

  it("rejects access and flags network change when IP changes mid-exam", () => {
    const result = verifyExamIpLock("192.168.1.20", "192.168.1.10", true);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Network change detected");
  });

  it("rejects when current IP cannot be resolved", () => {
    const result = verifyExamIpLock(null, "192.168.1.10", true);
    expect(result.allowed).toBe(false);
  });
});
