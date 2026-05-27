import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Reset your password",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to set a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
