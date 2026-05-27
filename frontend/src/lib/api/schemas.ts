import { z } from "zod";

/**
 * Runtime Zod schemas for the highest-value Laravel responses.
 *
 * In development we parse incoming responses with `.parse()`; a mismatch
 * throws with a precise field path — much easier to debug than an undefined
 * downstream. In production we either skip validation or use `.safeParse()`
 * and log to telemetry.
 *
 * Keep these schemas in sync with `src/lib/api/types.ts` — the TypeScript
 * type is the editor-time contract; the Zod schema is the runtime check.
 */

const userTypeSchema = z.enum(["student", "parent", "admin"]);

const studentProfileSchema = z
  .object({
    onboarding_completed_at: z.string().nullable(),
    school: z.string().nullable(),
    grade_level: z.string().nullable(),
    target_year: z.number().nullable(),
    daily_goal_minutes: z.number().nullable(),
  })
  .nullable();

const parentProfileSchema = z
  .object({
    relationship: z.string().nullable(),
    occupation: z.string().nullable(),
  })
  .nullable();

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  phone: z.string().nullable(),
  display_name: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  timezone: z.string(),
  locale: z.string(),
  user_type: userTypeSchema,
  email_verified_at: z.string().nullable(),
  phone_verified_at: z.string().nullable(),
  last_login_at: z.string().nullable(),
  student_profile: studentProfileSchema,
  parent_profile: parentProfileSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const userContextSchema = z.object({
  user_id: z.number(),
  exam_body_ids: z.array(z.number()),
  exam_subject_ids: z.array(z.number()),
  subject_ids: z.array(z.number()),
  topic_ids: z.array(z.number()),
  nearest_exam_date: z.string().nullable(),
  daily_minutes: z.number(),
  timezone: z.string(),
  locale: z.string(),
  user_type: userTypeSchema,
  permissions: z.array(z.string()),
  entitlements: z.record(z.string(), z.unknown()),
});

export const masteryBucketSchema = z.object({
  mastery_score: z.number(),
  confidence: z.number(),
  attempts_count: z.number(),
  correct_count: z.number(),
});

export const masterySummarySchema = z.object({
  by_exam: z.record(z.string(), masteryBucketSchema),
  by_subject: z.record(z.string(), masteryBucketSchema),
});

export const planSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  entitlements: z.record(z.string(), z.unknown()),
  sort_order: z.number(),
  prices: z.array(
    z.object({
      currency: z.string(),
      amount_minor: z.number(),
      interval: z.enum(["monthly", "yearly"]),
    }),
  ),
});

export const subscriptionSchema = z
  .object({
    id: z.number(),
    status: z.string(),
    started_at: z.string(),
    current_period_start: z.string(),
    current_period_end: z.string(),
    cancelled_at: z.string().nullable(),
    plan: z
      .object({
        code: z.string(),
        name: z.string(),
        entitlements: z.record(z.string(), z.unknown()),
      })
      .nullable(),
  })
  .nullable();

/**
 * Parse helper — throws in development with a clear field path, no-ops in
 * production for performance. Use in hooks that wrap critical endpoints.
 */
export function parseInDev<T>(schema: z.ZodType<T>, value: unknown): T {
  if (process.env.NODE_ENV === "development") {
    return schema.parse(value);
  }
  return value as T;
}
