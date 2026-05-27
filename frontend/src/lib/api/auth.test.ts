import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { authApi } from "./auth";
import { ApiError } from "./types";

describe("authApi.login", () => {
  it("posts `identifier` to the BFF and returns the user payload", async () => {
    let capturedBody: unknown;
    server.use(
      http.post("/api/bff/v1/auth/login", async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          user: {
            id: 42,
            email: "ada@prepcify.com",
            phone: null,
            display_name: "Ada O",
            first_name: "Ada",
            last_name: "O",
            avatar_url: null,
            timezone: "Africa/Lagos",
            locale: "en",
            user_type: "student",
            email_verified_at: null,
            phone_verified_at: null,
            last_login_at: null,
            student_profile: null,
            parent_profile: null,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        });
      }),
    );

    const session = await authApi.login({
      identifier: "ada@prepcify.com",
      password: "secret123",
    });

    expect(capturedBody).toEqual({
      identifier: "ada@prepcify.com",
      password: "secret123",
    });
    expect(session.user.id).toBe(42);
    expect(session.user.display_name).toBe("Ada O");
  });

  it("throws a typed ApiError on 422 with field errors bound", async () => {
    server.use(
      http.post("/api/bff/v1/auth/login", () =>
        HttpResponse.json(
          {
            message: "The given data was invalid.",
            errors: {
              identifier: ["The identifier field is required."],
              password: ["The password field is required."],
            },
          },
          { status: 422 },
        ),
      ),
    );

    await expect(
      authApi.login({ identifier: "", password: "" }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
    });

    try {
      await authApi.login({ identifier: "", password: "" });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const fieldErrors = (err as ApiError).fieldErrors();
      expect(fieldErrors).toEqual({
        identifier: "The identifier field is required.",
        password: "The password field is required.",
      });
    }
  });
});

describe("authApi.me", () => {
  it("unwraps the Laravel `data` envelope", async () => {
    const me = await authApi.me();
    // Default handler in src/test/msw/handlers.ts returns a fixture user.
    expect(me.id).toBe(1);
    expect(me.email).toBe("test@prepcify.com");
    expect(me.student_profile?.target_year).toBe(2026);
  });
});
