import { Link } from "react-router-dom";
import { ArrowLeft, Compass, GraduationCap, BookOpen, Sparkles, Bot, Trophy, ClipboardCheck, User } from "lucide-react";

const screens = [
  { to: "/onboarding", label: "Onboarding", icon: Compass, hint: "3-step welcome" },
  { to: "/m/app", label: "Dashboard", icon: GraduationCap, hint: "Home & progress" },
  { to: "/m/app/subjects", label: "Subjects", icon: BookOpen, hint: "All subjects" },
  { to: "/m/app/subjects/math", label: "Topic", icon: BookOpen, hint: "Topic detail" },
  { to: "/m/quiz", label: "Quiz", icon: Sparkles, hint: "Practice flow" },
  { to: "/m/app/leaderboard", label: "Compete", icon: Trophy, hint: "Ranks & badges" },
  { to: "/m/app/tutor", label: "AI Tutor", icon: Bot, hint: "prepcify AI chat" },
  { to: "/m/exam", label: "Exam Sim", icon: ClipboardCheck, hint: "Real exam mode" },
  { to: "/m/app/profile", label: "Profile", icon: User, hint: "Account" },
];

export default function MobileGallery() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="container max-w-5xl py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <span className="font-display text-base font-extrabold tracking-tight">prepcify<span className="text-accent">.</span> mobile</span>
        </div>
      </header>

      <main className="container max-w-5xl py-12">
        <p className="chip bg-secondary text-foreground"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Mobile prototype</p>
        <h1 className="mt-5 font-display text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl">
          The mobile app — every screen.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">Best on a real phone. On desktop, each screen renders inside a device frame.</p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {screens.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.to} to={s.to} className="group rounded-3xl border border-border bg-card p-5 tap hover:border-foreground transition-colors">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="mt-4 font-semibold text-[15px]">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
