"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui/field";
import { GoogleButton } from "./google-button";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api/types";

// Laravel accepts either an email or an E.164 phone in the `identifier` field.
const schema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Enter your email or phone")
    .max(255),
  password: z.string().min(1, "Enter your password").max(72),
});

/** Email/phone + password sign-in form, backed by the Laravel auth API. */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const from = searchParams.get("from") || "/app";

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      await login(parsed.data.identifier, parsed.data.password);
      toast.success("Welcome back");
      router.push(from);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        // Laravel returns the error against `identifier` on auth failure.
        setErrors(err.fieldErrors());
        toast.error("Sign in failed", { description: err.message });
      } else {
        toast.error("Sign in failed", {
          description: "Please check your connection and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <GoogleButton />

      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          or with email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email or phone" error={errors.identifier} required>
          <Input
            type="text"
            autoComplete="username"
            placeholder="you@school.com"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </Field>

        <Field
          label="Password"
          error={errors.password}
          required
          labelAction={
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Forgot?
            </Link>
          }
        >
          <PasswordInput
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-2xl"
          isLoading={loading}
          loadingText="Signing in"
          rightIcon={<ArrowRight />}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
