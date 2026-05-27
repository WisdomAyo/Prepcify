import { describe, it, expect } from "vitest";
import { ApiError } from "./types";

describe("ApiError", () => {
  it("uses the backend message", () => {
    const err = new ApiError(422, { message: "Validation failed" });
    expect(err.message).toBe("Validation failed");
    expect(err.status).toBe(422);
  });

  it("falls back to a generic message when none is given", () => {
    const err = new ApiError(500, { message: "" });
    expect(err.message).toContain("500");
  });

  it("flattens Laravel field errors to first-message-per-field", () => {
    const err = new ApiError(422, {
      message: "Validation failed",
      errors: {
        email: ["The email is invalid.", "The email is taken."],
        password: ["The password is too short."],
      },
    });
    expect(err.fieldErrors()).toEqual({
      email: "The email is invalid.",
      password: "The password is too short.",
    });
  });

  it("returns an empty object when there are no field errors", () => {
    const err = new ApiError(401, { message: "Unauthenticated" });
    expect(err.fieldErrors()).toEqual({});
  });
});
