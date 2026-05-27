"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const schema = z
  .object({
    display_name: z.string().trim().min(2, "Enter your full name").max(120),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(72, "Password is too long"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

/** New-account registration form, backed by the Laravel auth API. */
export function SignUpForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    display_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
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
      await register({ ...parsed.data, user_type: "student" });
      toast.success("Account created", { description: "Let's set up your exams." });
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors());
        toast.error("Sign up failed", { description: err.message });
      } else {
        toast.error("Sign up failed", {
          description: "Please check your connection and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          or with email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.display_name} required>
          <Input
            autoComplete="name"
            placeholder="Adaeze Okafor"
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          />
        </Field>

        <Field label="Email" error={errors.email} required>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@school.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        <Field
          label="Password"
          error={errors.password}
          hint="At least 8 characters."
          required
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>

        <Field
          label="Confirm password"
          error={errors.password_confirmation}
          required
        >
          <PasswordInput
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
          loadingText="Creating account"
          rightIcon={<ArrowRight />}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
