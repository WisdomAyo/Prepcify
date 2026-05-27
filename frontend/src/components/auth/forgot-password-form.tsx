"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { ArrowRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

/** Requests a password-reset link from the Laravel auth API. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await authApi.forgotPassword(parsed.data.email);
      setSent(true);
    } catch (err) {
      // Do not leak whether an email exists — show the success state anyway,
      // unless it is a hard validation error.
      if (err instanceof ApiError && err.status === 422) {
        setError(err.fieldErrors().email ?? err.message);
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-secondary/40 p-6 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
          <MailCheck className="h-6 w-6" />
        </div>
        <p className="font-display text-lg font-bold">Check your inbox</p>
        <p className="mt-1 text-sm text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a
          link to reset your password.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Email" error={error} required>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@school.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="w-full rounded-2xl"
        isLoading={loading}
        loadingText="Sending link"
        rightIcon={<ArrowRight />}
      >
        {loading ? "Sending link…" : "Send reset link"}
      </Button>
    </form>
  );
}
