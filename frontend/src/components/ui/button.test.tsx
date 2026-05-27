import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("fires onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled and announces busy while loading", () => {
    render(<Button isLoading>Submit</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    // The accessible loading label is exposed via the spinner.
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not fire onClick while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Submit
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects the disabled prop", () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders as a link when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/app">Open app</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Open app" });
    expect(link).toHaveAttribute("href", "/app");
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-destructive");
    expect(btn.className).toContain("h-14");
  });
});
