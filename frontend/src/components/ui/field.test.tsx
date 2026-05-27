import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./field";
import { Input } from "./input";

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field label="Email address">
        <Input />
      </Field>,
    );
    // getByLabelText only succeeds when the label/control wiring is correct.
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("marks the control invalid and links the error message", () => {
    render(
      <Field label="Email" error="Enter a valid email">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    const error = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(error).toHaveTextContent("Enter a valid email");
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
  });

  it("links the hint via aria-describedby when there is no error", () => {
    render(
      <Field label="Password" hint="At least 8 characters">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Password");
    const hint = screen.getByText("At least 8 characters");
    expect(input.getAttribute("aria-describedby")).toBe(hint.id);
  });

  it("prefers the error over the hint when both are present", () => {
    render(
      <Field label="Name" hint="Your full name" error="Required">
        <Input />
      </Field>,
    );
    expect(screen.queryByText("Your full name")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("marks the control required", () => {
    render(
      <Field label="Email" required>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText(/Email/)).toHaveAttribute(
      "aria-required",
      "true",
    );
  });
});
