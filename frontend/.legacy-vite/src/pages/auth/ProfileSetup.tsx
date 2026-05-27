import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, GraduationCap, BookOpen, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const EXAMS = [
  { id: "WAEC", desc: "West African Senior School Certificate" },
  { id: "JAMB", desc: "Joint Admissions and Matriculation Board" },
  { id: "NECO", desc: "National Examinations Council" },
  { id: "ICAN", desc: "Chartered Accountants of Nigeria" },
  { id: "Cambridge", desc: "IGCSE / International" },
  { id: "A-Levels", desc: "Cambridge / Edexcel" },
  { id: "O-Levels", desc: "Cambridge O-Level" },
  { id: "GCE", desc: "General Certificate of Education" },
];

const SUBJECTS_BY_EXAM: Record<string, string[]> = {
  WAEC: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature", "Geography", "Agric Science"],
  JAMB: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature", "Geography", "CRS"],
  NECO: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature", "Geography"],
  ICAN: ["Financial Accounting", "Audit", "Taxation", "Business Law", "Management", "Costing"],
  Cambridge: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics", "Business Studies", "Geography", "ICT"],
  "A-Levels": ["Mathematics", "Further Maths", "Physics", "Chemistry", "Biology", "Economics", "Computing"],
  "O-Levels": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Geography", "History"],
  GCE: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics", "Government"],
};

const GOALS = [15, 30, 45, 60, 90];
const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear + 1, currentYear + 2];

export default function ProfileSetup() {
  const nav = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [exam, setExam] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [year, setYear] = useState<number>(currentYear);
  const [goal, setGoal] = useState<number>(30);
  const [school, setSchool] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav("/login", { replace: true });
      return;
    }
    if (profile?.onboarded) {
      nav("/app", { replace: true });
      return;
    }
    if (profile?.full_name) setName(profile.full_name);
  }, [user, profile, loading, nav]);

  const steps = ["You", "Exam", "Subjects", "Goal"];
  const canNext = (() => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return !!exam;
    if (step === 2) return subjects.length >= 1;
    if (step === 3) return !!year && !!goal;
    return false;
  })();

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        exam_type: exam,
        subjects,
        target_year: year,
        daily_goal_minutes: goal,
        school: school.trim() || null,
        onboarded: true,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save profile", { description: error.message });
      return;
    }
    await refreshProfile();
    toast.success("You're all set", { description: "Let's start your prep." });
    nav("/app", { replace: true });
  };

  const next = () => {
    if (step < 3) setStep(step + 1);
    else finish();
  };

  const subjectOptions = exam ? SUBJECTS_BY_EXAM[exam] ?? [] : [];

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
            <GraduationCap className="h-5 w-5 text-accent" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight">
            prepcify<span className="text-accent">.</span>
          </span>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => nav("/"))}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </header>

      {/* Stepper */}
      <div className="px-6 sm:px-10">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all",
                  i <= step ? "bg-foreground" : "bg-secondary",
                )}
              />
            </div>
          ))}
        </div>
        <p className="max-w-2xl mx-auto mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Step {step + 1} of {steps.length} · {steps[step]}
        </p>
      </div>

      {/* Body */}
      <main className="flex-1 px-6 sm:px-10 py-10">
        <div className="max-w-2xl mx-auto">
          {step === 0 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[0.95]">
                  First, what should we call you?
                </h1>
                <p className="mt-3 text-muted-foreground">We'll use this on your profile and leaderboard.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adaeze Okeke"
                    className="h-14 rounded-2xl text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="school">School (optional)</Label>
                  <Input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="King's College, Lagos"
                    className="h-14 rounded-2xl text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[0.95]">
                  Which exam are you preparing for?
                </h1>
                <p className="mt-3 text-muted-foreground">Pick your main one — you can add more later.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXAMS.map((e) => {
                  const active = exam === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setExam(e.id);
                        setSubjects([]);
                      }}
                      className={cn(
                        "rounded-2xl border p-5 text-left transition-all tap",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card hover:border-foreground/30",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display text-xl font-bold">{e.id}</p>
                          <p className={cn("text-xs mt-1", active ? "text-background/70" : "text-muted-foreground")}>
                            {e.desc}
                          </p>
                        </div>
                        {active && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[0.95]">
                  Pick your subjects.
                </h1>
                <p className="mt-3 text-muted-foreground">
                  Choose at least one. We'll build a study plan around these.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {subjectOptions.map((s) => {
                  const active = subjects.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setSubjects((cur) => (active ? cur.filter((x) => x !== s) : [...cur, s]))
                      }
                      className={cn(
                        "rounded-full border px-4 py-2.5 text-sm font-semibold transition-all tap",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card hover:border-foreground/30",
                      )}
                    >
                      {active && <Check className="inline h-3.5 w-3.5 mr-1.5" />}
                      {s}
                    </button>
                  );
                })}
              </div>
              {subjects.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <BookOpen className="inline h-4 w-4 mr-1.5" />
                  {subjects.length} subject{subjects.length === 1 ? "" : "s"} selected
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[0.95]">
                  Set your pace.
                </h1>
                <p className="mt-3 text-muted-foreground">When are you sitting and how much time can you invest daily?</p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Target year
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {YEARS.map((y) => {
                    const active = year === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setYear(y)}
                        className={cn(
                          "rounded-2xl border py-4 font-display text-xl font-bold transition-all tap",
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card hover:border-foreground/30",
                        )}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Target className="h-3.5 w-3.5" /> Daily study goal
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {GOALS.map((g) => {
                    const active = goal === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGoal(g)}
                        className={cn(
                          "rounded-2xl border py-4 font-display font-bold transition-all tap",
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card hover:border-foreground/30",
                        )}
                      >
                        <span className="block text-xl">{g}</span>
                        <span className={cn("block text-[10px] mt-0.5", active ? "text-background/70" : "text-muted-foreground")}>
                          min
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 border-t border-border bg-background/85 backdrop-blur-xl px-6 sm:px-10 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || saving}
            className="rounded-2xl"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={next}
            disabled={!canNext || saving}
            className="rounded-2xl min-w-[160px]"
          >
            {saving ? "Saving…" : step === 3 ? "Finish setup" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
