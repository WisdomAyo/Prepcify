import { http, HttpResponse } from "msw";

/**
 * Default MSW request handlers used by the unit test suite.
 *
 * The catch-all 404 at the end forces tests to declare any endpoint they
 * exercise — drift between the suite and reality fails loud.
 */
export const handlers = [
  // Happy-path login.
  http.post("/api/bff/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as { identifier?: string };
    if (!body.identifier) {
      return HttpResponse.json(
        {
          message: "The given data was invalid.",
          errors: { identifier: ["The identifier field is required."] },
        },
        { status: 422 },
      );
    }
    return HttpResponse.json({
      user: {
        id: 1,
        email: body.identifier,
        phone: null,
        display_name: "Test Student",
        first_name: "Test",
        last_name: "Student",
        avatar_url: null,
        timezone: "Africa/Lagos",
        locale: "en",
        user_type: "student",
        email_verified_at: null,
        phone_verified_at: null,
        last_login_at: null,
        student_profile: {
          onboarding_completed_at: null,
          school: null,
          grade_level: null,
          target_year: null,
          daily_goal_minutes: null,
        },
        parent_profile: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    });
  }),

  http.get("/api/bff/v1/auth/me", () =>
    HttpResponse.json({
      data: {
        id: 1,
        email: "test@prepcify.com",
        phone: null,
        display_name: "Test Student",
        first_name: "Test",
        last_name: "Student",
        avatar_url: null,
        timezone: "Africa/Lagos",
        locale: "en",
        user_type: "student",
        email_verified_at: null,
        phone_verified_at: null,
        last_login_at: null,
        student_profile: {
          onboarding_completed_at: "2026-01-01T00:00:00Z",
          school: null,
          grade_level: null,
          target_year: 2026,
          daily_goal_minutes: 30,
        },
        parent_profile: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    }),
  ),
];
