import { Link } from "react-router-dom";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BarProgress } from "@/components/Progress";
import { Search, Calculator, FlaskConical, Globe2, BookText, Atom, Languages, Landmark, Microscope, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const subjects = [
  { id: "math", name: "Mathematics", topics: 24, progress: 68, icon: Calculator, color: "bg-accent/15 text-accent" },
  { id: "phy", name: "Physics", topics: 18, progress: 42, icon: FlaskConical, color: "bg-sky/20 text-sky" },
  { id: "eng", name: "English Language", topics: 22, progress: 81, icon: BookText, color: "bg-foreground/10 text-foreground" },
  { id: "geo", name: "Geography", topics: 16, progress: 24, icon: Globe2, color: "bg-success/15 text-success" },
  { id: "chem", name: "Chemistry", topics: 20, progress: 51, icon: Atom, color: "bg-accent/15 text-accent" },
  { id: "bio", name: "Biology", topics: 19, progress: 12, icon: Microscope, color: "bg-success/15 text-success" },
  { id: "lit", name: "Literature", topics: 14, progress: 0, icon: Languages, color: "bg-sky/20 text-sky" },
  { id: "gov", name: "Government", topics: 15, progress: 0, icon: Landmark, color: "bg-foreground/10 text-foreground" },
];

const exams = ["All", "WAEC", "JAMB", "NECO", "Cambridge", "ICAN"];

export default function Subjects() {
  return (
    <div className="pb-6">
      <ScreenHeader title="Subjects" subtitle="Pick where to continue" />

      <div className="px-5">
        <label className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search topics, papers, years…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 scroll-hide">
        {exams.map((e, i) => (
          <button
            key={e}
            className={cn(
              "tap whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              i === 0 ? "bg-foreground text-background border-foreground" : "bg-card text-foreground border-border"
            )}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="mt-5 px-5 space-y-2.5">
        {subjects.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.id}
              to={`/app/subjects/${s.id}`}
              style={{ animationDelay: `${i * 30}ms` }}
              className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 tap animate-fade-in hover:shadow-soft transition-shadow"
            >
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", s.color)}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.topics} topics · {s.progress}% complete</p>
                <BarProgress value={s.progress} className="mt-2" height={4} />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
