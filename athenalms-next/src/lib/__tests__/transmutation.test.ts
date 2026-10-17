import { describe, it, expect } from "vitest";
import {
  depedStandardTransmutation,
  linear50BaseTransmutation,
  customTransmutation,
  transmute,
} from "../transmutation";

describe("DepEd Standard Transmutation Table", () => {
  it("maps 100% to 100", () => {
    expect(depedStandardTransmutation(100)).toBe(100);
  });

  it("maps passing benchmark 60% raw to 75 transmuted", () => {
    expect(depedStandardTransmutation(60.0)).toBe(75);
    expect(depedStandardTransmutation(61.59)).toBe(75);
  });

  it("maps 59.99% raw to 74 (just below passing)", () => {
    expect(depedStandardTransmutation(59.99)).toBe(74);
    expect(depedStandardTransmutation(56.0)).toBe(74);
  });

  it("maps lowest boundary: 0% to 60 (minimum grade)", () => {
    expect(depedStandardTransmutation(0)).toBe(60);
    expect(depedStandardTransmutation(3.99)).toBe(60);
  });

  it("maps intermediate brackets accurately", () => {
    expect(depedStandardTransmutation(90.4)).toBe(94);
    expect(depedStandardTransmutation(80.0)).toBe(87);
    expect(depedStandardTransmutation(70.0)).toBe(81);
  });
});

describe("Linear 50-Base Transmutation", () => {
  it("calculates 0% -> 50", () => {
    expect(linear50BaseTransmutation(0)).toBe(50);
  });

  it("calculates 50% -> 75 (passing threshold)", () => {
    expect(linear50BaseTransmutation(50)).toBe(75);
  });

  it("calculates 100% -> 100", () => {
    expect(linear50BaseTransmutation(100)).toBe(100);
  });

  it("clamps below 50 and above 100", () => {
    expect(linear50BaseTransmutation(-10)).toBe(50);
    expect(linear50BaseTransmutation(110)).toBe(100);
  });
});

describe("Custom Transmutation", () => {
  it("interpolates below passing grade smoothly", () => {
    // 0% -> 60, 60% -> 75. At 30% (halfway): 60 + 0.5 * 15 = 67.5
    const grade = customTransmutation(30, 60, 60, 75);
    expect(grade).toBe(67.5);
  });

  it("interpolates above passing grade smoothly", () => {
    // 60% -> 75, 100% -> 100. At 80% (halfway): 75 + 0.5 * 25 = 87.5
    const grade = customTransmutation(80, 60, 60, 75);
    expect(grade).toBe(87.5);
  });

  it("returns baseScore for 0% and 100 for 100%", () => {
    expect(customTransmutation(0, 65, 50, 75)).toBe(65);
    expect(customTransmutation(100, 65, 50, 75)).toBe(100);
  });
});

describe("Full transmute() API", () => {
  it("handles zero total points defensively", () => {
    const result = transmute(10, 0);
    expect(result.transmutedGrade).toBe(60);
    expect(result.isPassing).toBe(false);
  });

  it("computes passing DepEd standard grade correctly", () => {
    const result = transmute(30, 40); // 75%
    expect(result.rawPercent).toBe(75);
    expect(result.transmutedGrade).toBe(84);
    expect(result.isPassing).toBe(true);
  });

  it("computes failing DepEd standard grade correctly", () => {
    const result = transmute(15, 30); // 50%
    expect(result.rawPercent).toBe(50);
    expect(result.transmutedGrade).toBe(72);
    expect(result.isPassing).toBe(false);
  });

  it("supports LINEAR_50_BASE formula", () => {
    const result = transmute(25, 50, { formula: "LINEAR_50_BASE" }); // 50%
    expect(result.rawPercent).toBe(50);
    expect(result.transmutedGrade).toBe(75);
    expect(result.isPassing).toBe(true);
  });

  it("supports CUSTOM formula", () => {
    const result = transmute(25, 50, {
      formula: "CUSTOM",
      baseScore: 50,
      passingRawPercent: 50,
      passingGrade: 75,
    });
    expect(result.transmutedGrade).toBe(75);
    expect(result.isPassing).toBe(true);
  });
});
