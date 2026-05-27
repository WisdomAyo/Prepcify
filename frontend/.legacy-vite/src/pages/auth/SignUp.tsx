import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleButton } from "@/components/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const STRENGTH = [
  { label: "Too short", color: "bg-destructive" },
  { label: "Weak", color: "bg-destructive" },
  { label: "Okay", color: "bg-accent" },
  { label: "Good", color: "bg-accent" },
  { label: "Strong", color: "bg-success" },
];

export default function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);

  const score = useMemo(() => passwordScore(form.password), [form.password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const redirectUrl = `${window.location.origin}/app`;
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: redirectUrl, data: { full_name: parsed.data.fullName } },
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        toast.error("Account exists", { description: "Try signing in instead." });
      } else {
        toast.error("Couldn't create account", { description: error.message });
      }
      return;
    }
    toast.success("Welcome to prepcify", { description: "Let's set up your study plan." });
    nav("/onboarding", { replace: true });
  };

  return (
    <AuthLayout
      eyebrow="Create account"
      step="01 / 02"
      title="Start your prep journey."
      subtitle="Free forever. Built for WAEC, JAMB, NECO, Cambridge, ICAN and more."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton label="Sign up with Google" />

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">or with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <FieldShell
            label="Full name"
            htmlFor="fullName"
            icon={<User className="h-4 w-4" />}
            error={errors.fullName}
            focused={focused === "fullName"}
            filled={!!form.fullName}
          >
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Adaeze Okeke"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              onFocus={() => setFocused("fullName")}
              onBlur={() => setFocused(null)}
              className="h-12 rounded-2xl border-0 bg-transparent pl-11 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </FieldShell>

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
          >
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

          {/* password strength meter */}
          {form.password && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-300",
                      i < score ? STRENGTH[score].color : "bg-border"
                    )}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                Strength: <span className="text-foreground font-semibold">{STRENGTH[score].label}</span>
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-2xl h-12 text-sm font-bold relative overflow-hidden group"
            disabled={loading}
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? "Creating your account…" : "Create account"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="absolute inset-0 -translate-x-full bg-accent transition-transform duration-500 group-hover:translate-x-0" />
          </Button>

          <p className="text-[11px] text-muted-foreground text-center pt-1">
            By continuing, you agree to our{" "}
            <a className="underline underline-offset-2 hover:text-foreground" href="#">Terms</a> and{" "}
            <a className="underline underline-offset-2 hover:text-foreground" href="#">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}

function FieldShell({
  label, htmlFor, icon, error, focused, filled, children,
}: {
  label: string; htmlFor: string; icon: React.ReactNode; error?: string;
  focused?: boolean; filled?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className={cn("text-xs font-semibold transition-colors", focused && "text-foreground")}>{label}</Label>
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
