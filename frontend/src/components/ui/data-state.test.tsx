import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataState } from "./data-state";

describe("DataState", () => {
  it("renders children on the success path", () => {
    render(
      <DataState>
        <p>Loaded content</p>
      </DataState>,
    );
    expect(screen.getByText("Loaded content")).toBeInTheDocument();
  });

  it("shows an accessible loading region while loading", () => {
    render(
      <DataState isLoading>
        <p>Loaded content</p>
      </DataState>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Loaded content")).not.toBeInTheDocument();
  });

  it("shows the error message and a retry button", async () => {
    const onRetry = vi.fn();
    render(
      <DataState
        isError
        error={new Error("Network unreachable")}
        onRetry={onRetry}
      >
        <p>Loaded content</p>
      </DataState>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Network unreachable");
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("prioritises loading over error and empty", () => {
    render(
      <DataState isLoading isError isEmpty>
        <p>Loaded content</p>
      </DataState>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the empty state when there is no data", () => {
    render(
      <DataState isEmpty>
        <p>Loaded content</p>
      </DataState>,
    );
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.queryByText("Loaded content")).not.toBeInTheDocument();
  });
});
