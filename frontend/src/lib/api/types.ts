/**
 * Shared API types — mirror the Laravel `App\Http\Resources` shapes exactly.
 * Field names and casing match what the backend returns; do not reshape on
 * the client unless there is a strong reason.
 */

export type UserType = "student" | "parent" | "admin";

/** Lightweight nested profile blocks returned alongside the user. */
export interface StudentProfile {
  /** ISO timestamp; null until the student finishes onboarding. */
  onboarding_completed_at: string | null;
  school: string | null;
  grade_level: string | null;
  target_year: number | null;
  daily_goal_minutes: number | null;
}

export interface ParentProfile {
  relationship: string | null;
  occupation: string | null;
}

/** GET /api/v1/auth/me, /register, /login. Mirrors `UserResource`. */
export interface ApiUser {
  id: number;
  email: string;
  phone: string | null;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  /** ISO 3166-1 alpha-2 (e.g. "NG", "US"). Optional. */
  country: string | null;
  state: string | null;
  city: string | null;
  user_type: UserType;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  last_login_at: string | null;
  student_profile: StudentProfile | null;
  parent_profile: ParentProfile | null;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/v1/me/context. Mirrors `UserContextResource` → `UserContext`
 * ValueObject. Drives entitlement-gated UI and routing decisions.
 */
export interface UserContext {
  user_id: number;
  exam_body_ids: number[];
  exam_subject_ids: number[];
  subject_ids: number[];
  topic_ids: number[];
  nearest_exam_date: string | null;
  daily_minutes: number;
  timezone: string;
  locale: string;
  user_type: UserType;
  permissions: string[];
  entitlements: Record<string, unknown>;
}

/**
 * Auth response from `POST /auth/login` and `POST /auth/register`.
 * The Sanctum token is set as an HttpOnly cookie by the BFF Route Handler;
 * the client only ever sees the user payload.
 */
export interface AuthSession {
  user: ApiUser;
}

/** Standard Laravel error envelope. */
export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}

/** Thrown by `apiFetch` for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.errors = body.errors;
  }

  /** Flatten Laravel validation errors to `{ field: firstMessage }` for forms. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, messages] of Object.entries(this.errors ?? {})) {
      if (messages?.[0]) out[key] = messages[0];
    }
    return out;
  }
}

/** Convenience derived flag — true once the student has completed onboarding. */
export function isOnboarded(user: ApiUser | null | undefined): boolean {
  if (!user) return false;
  if (user.user_type !== "student") return true; // non-students never see onboarding
  return Boolean(user.student_profile?.onboarding_completed_at);
}
