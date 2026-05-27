import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/signup-form";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Create your account",
  description: "Join 42,000+ students preparing for WAEC, JAMB, NECO and more with prepcify. Free forever to start.",
  path: "/signup",
});

export default function SignUpPage() {
  return (
    <AuthLayout
      eyebrow="Get started"
      step="01 / 02"
      title="Your best result starts here."
      subtitle="Create a free account — set up your exams in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <AuthSessionProvider>
        <SignUpForm />
      </AuthSessionProvider>
    </AuthLayout>
  );
}
