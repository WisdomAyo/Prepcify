import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Mail } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({ email: z.string().trim().email().max(255) });

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Couldn't send reset link", { description: error.message });
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout
      eyebrow="Reset password"
      title={sent ? "Check your inbox." : "Forgot your password?"}
      subtitle={
        sent
          ? `We sent a reset link to ${email}. It expires in 1 hour.`
          : "Enter your email and we'll send a secure reset link."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary">
            <Mail className="h-5 w-5 text-foreground" />
          </div>
          <div className="text-sm">
            <p className="font-semibold">Email sent</p>
            <p className="text-muted-foreground mt-1">
              Click the link in the email to set a new password. Check spam if you don't see it.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-2xl"
            />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
