import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { Spinner } from "@/components/ui/spinner";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to prepcify — your streaks, XP and mock exams, exactly how you left them.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      step="01 / 01"
      title="Pick up where you left off."
      subtitle="Streaks, XP, mock exams — exactly how you left them."
      footer={
        <>
          New to prepcify?{" "}
          <Link
            href="/signup"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </>
      }
    >
      {/* useSearchParams() must sit inside a Suspense boundary. */}
      <AuthSessionProvider>
        <Suspense fallback={<Spinner className="text-accent" />}>
          <LoginForm />
        </Suspense>
      </AuthSessionProvider>
    </AuthLayout>
  );
}
