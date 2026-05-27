import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleButton } from "@/components/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter your password").max(72),
});

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/app";

  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
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
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error("Sign in failed", { description: error.message });
      return;
    }
    toast.success("Welcome back");
    nav(from, { replace: true });
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      step="01 / 01"
      title="Pick up where you left off."
      subtitle="Streaks, XP, mock exams — exactly how you left them."
      footer={
        <>
          New to prepcify?{" "}
          <Link to="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Create account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton />

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">or with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <FieldShell
            label="Email"
            htmlFor="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email}
            focused={focused === "email"}
            filled={!!form.email}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@school.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              className="h-12 rounded-2xl border-0 bg-transparent pl-11 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </FieldShell>

          <FieldShell
            label="Password"
            htmlFor="password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password}
            focused={focused === "password"}
            filled={!!form.password}
            trailing={
              <Link to="/forgot-password" className="text-xs font-semibold text-muted-foreground hover:text-foreground tap">
                Forgot?
              </Link>
            }
          >
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              className="h-12 rounded-2xl border-0 bg-transparent pl-11 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground tap"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </FieldShell>

          <Button
            type="submit"
            size="lg"
            className={cn(
              "w-full rounded-2xl h-12 text-sm font-bold relative overflow-hidden group",
              loading && "opacity-90"
            )}
            disabled={loading}
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? "Signing in…" : "Sign in"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="absolute inset-0 -translate-x-full bg-accent transition-transform duration-500 group-hover:translate-x-0" />
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

/* Reusable field shell with floating-icon, focus ring, and error state. */
function FieldShell({
  label,
  htmlFor,
  icon,
  error,
  focused,
  filled,
  trailing,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: React.ReactNode;
  error?: string;
  focused?: boolean;
  filled?: boolean;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className={cn("text-xs font-semibold transition-colors", focused && "text-foreground")}>{label}</Label>
        {trailing}
      </div>
      <div
        className={cn(
          "relative rounded-2xl bg-secondary/60 border transition-all duration-200",
          focused ? "border-foreground ring-4 ring-foreground/5 bg-card" : "border-transparent",
          error && "border-destructive ring-4 ring-destructive/10",
          filled && !focused && !error && "bg-card border-border"
        )}
      >
        <span className={cn("absolute left-4 top-4 text-muted-foreground transition-colors", focused && "text-foreground", error && "text-destructive")}>
          {icon}
        </span>
        {children}
      </div>
      {error && <p className="text-xs font-medium text-destructive animate-fade-in">{error}</p>}
    </div>
  );
}
