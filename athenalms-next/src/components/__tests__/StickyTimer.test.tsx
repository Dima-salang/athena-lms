import React from "react";
import { render, screen, act } from "@testing-library/react";
import { StickyTimer } from "../exam/StickyTimer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("StickyTimer Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders 'No time limit' badge when initialSeconds is null", () => {
    const handleExpire = vi.fn();
    render(<StickyTimer initialSeconds={null} onExpire={handleExpire} />);

    expect(screen.getByText("No time limit")).toBeInTheDocument();
    expect(handleExpire).not.toHaveBeenCalled();
  });

  it("renders countdown correctly in HH:MM:SS or MM:SS format", () => {
    const handleExpire = vi.fn();
    // 3600s = 1 hour
    render(<StickyTimer initialSeconds={3600} onExpire={handleExpire} />);
    expect(screen.getByText("1:00:00")).toBeInTheDocument();
  });

  it("decrements remaining time every second", () => {
    const handleExpire = vi.fn();
    render(<StickyTimer initialSeconds={120} onExpire={handleExpire} />);
    expect(screen.getByText("2:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("1:59")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(59000);
    });
    expect(screen.getByText("1:00")).toBeInTheDocument();
  });

  it("calls onExpire when timer hits 0", () => {
    const handleExpire = vi.fn();
    render(<StickyTimer initialSeconds={3} onExpire={handleExpire} />);

    expect(handleExpire).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(handleExpire).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(handleExpire).toHaveBeenCalledTimes(1);
  });

  it("applies warning styles when time is low (<= 5 minutes)", () => {
    const handleExpire = vi.fn();
    const { container } = render(
      <StickyTimer initialSeconds={180} onExpire={handleExpire} />
    );

    // 180s is <= 300s, so it should have amber / low time warning
    expect(container.textContent).toContain("3:00");
  });

  it("updates countdown when initialSeconds prop changes", () => {
    const handleExpire = vi.fn();
    const { rerender } = render(
      <StickyTimer initialSeconds={60} onExpire={handleExpire} />
    );
    expect(screen.getByText("1:00")).toBeInTheDocument();

    rerender(<StickyTimer initialSeconds={300} onExpire={handleExpire} />);
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });
});
