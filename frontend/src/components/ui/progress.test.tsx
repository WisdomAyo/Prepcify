import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BarProgress, RingProgress } from "./progress";

describe("Progress", () => {
  it("exposes BarProgress as an accessible progressbar", () => {
    render(<BarProgress value={40} label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps out-of-range values (edge cases)", () => {
    const { rerender } = render(<BarProgress value={250} label="P" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    rerender(<BarProgress value={-10} label="P" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("exposes RingProgress as an accessible progressbar", () => {
    render(
      <RingProgress value={68} label="Readiness">
        <span>68%</span>
      </RingProgress>,
    );
    expect(
      screen.getByRole("progressbar", { name: "Readiness" }),
    ).toHaveAttribute("aria-valuenow", "68");
  });
});
