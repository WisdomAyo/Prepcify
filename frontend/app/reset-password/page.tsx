import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Spinner } from "@/components/ui/spinner";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Set a new password",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Set a new password."
      subtitle="Choose a strong password you don't use anywhere else."
    >
      <Suspense fallback={<Spinner className="text-accent" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
