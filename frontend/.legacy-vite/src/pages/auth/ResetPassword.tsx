import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({ password: z.string().min(8).max(72) });

export default function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery hash; once session is set, we're good.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password });
    if (!parsed.success) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error("Couldn't update password", { description: error.message });
      return;
    }
    toast.success("Password updated");
    nav("/app", { replace: true });
  };

  return (
    <AuthLayout
      eyebrow="New password"
      title="Set a new password."
      subtitle="Make it strong — at least 8 characters."
      footer={
        <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl pr-12"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={loading || !ready}>
          {loading ? "Updating…" : ready ? "Update password" : "Verifying link…"} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}
