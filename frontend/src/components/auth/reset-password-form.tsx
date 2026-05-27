"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(72),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

/**
 * Completes a password reset. The `token` and `email` are read from the
 * query string of the link delivered by `ForgotPasswordForm`.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const linkInvalid = !token || !email;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as string] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword({ token, email, ...parsed.data });
      toast.success("Password updated", { description: "You can now sign in." });
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors());
        toast.error("Reset failed", { description: err.message });
      } else {
        toast.error("Reset failed", {
          description: "Please request a fresh reset link and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  if (linkInvalid) {
    return (
      <div
        role="alert"
        className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-muted-foreground"
      >
        This reset link is missing required information. Please request a new
        one from the{" "}
        <a href="/forgot-password" className="font-semibold text-foreground underline">
          forgot password
        </a>{" "}
        page.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="New password" error={errors.password} hint="At least 8 characters." required>
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </Field>
      <Field label="Confirm new password" error={errors.password_confirmation} required>
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password_confirmation}
          onChange={(e) =>
            setForm({ ...form, password_confirmation: e.target.value })
          }
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="w-full rounded-2xl"
        isLoading={loading}
        loadingText="Updating password"
        rightIcon={<ArrowRight />}
      >
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
