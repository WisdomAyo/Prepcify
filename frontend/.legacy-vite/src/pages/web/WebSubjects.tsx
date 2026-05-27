import { Link } from "react-router-dom";
import { BarProgress } from "@/components/Progress";
import { Calculator, FlaskConical, Globe2, BookText, Atom, Languages, Landmark, Microscope, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const subjects = [
  { id: "math", name: "Mathematics", topics: 24, progress: 68, icon: Calculator, color: "bg-accent/15 text-accent", desc: "Algebra, geometry, calculus & statistics" },
  { id: "phy", name: "Physics", topics: 18, progress: 42, icon: FlaskConical, color: "bg-sky/20 text-sky", desc: "Mechanics, waves, electricity, modern physics" },
  { id: "eng", name: "English Language", topics: 22, progress: 81, icon: BookText, color: "bg-foreground/10 text-foreground", desc: "Comprehension, summary, lexis & structure" },
  { id: "geo", name: "Geography", topics: 16, progress: 24, icon: Globe2, color: "bg-success/15 text-success", desc: "Physical, human and regional geography" },
  { id: "chem", name: "Chemistry", topics: 20, progress: 51, icon: Atom, color: "bg-accent/15 text-accent", desc: "Atoms, reactions, organic and inorganic" },
  { id: "bio", name: "Biology", topics: 19, progress: 12, icon: Microscope, color: "bg-success/15 text-success", desc: "Cells, ecology, genetics, the human body" },
  { id: "lit", name: "Literature", topics: 14, progress: 0, icon: Languages, color: "bg-sky/20 text-sky", desc: "Prose, poetry, drama and African literature" },
  { id: "gov", name: "Government", topics: 15, progress: 0, icon: Landmark, color: "bg-foreground/10 text-foreground", desc: "Political theory, Nigerian government, ECOWAS" },
];

const exams = ["All", "WAEC", "JAMB", "NECO", "Cambridge", "A-Levels", "O-Levels", "ICAN"];

export default function WebSubjects() {
  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Subjects</h1>
        <p className="mt-1 text-muted-foreground">Pick where to continue. Your progress syncs across every device.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-1 min-w-[260px] max-w-md items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search topics, past papers, years…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        <div className="flex flex-wrap gap-2">
          {exams.map((e, i) => (
            <button
              key={e}
              className={cn(
                "tap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                i === 0 ? "bg-foreground text-background border-foreground" : "bg-card text-foreground border-border hover:border-foreground/40"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {subjects.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.id}
              to={`/app/subjects/${s.id}`}
              style={{ animationDelay: `${i * 30}ms` }}
              className="group rounded-3xl border border-border bg-card p-5 tap animate-fade-in hover:shadow-card transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", s.color)}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="mt-4 font-semibold text-[15px]">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-[2.25rem]">{s.desc}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{s.topics} topics</span>
                <span className="font-semibold text-foreground">{s.progress}%</span>
              </div>
              <BarProgress value={s.progress} className="mt-2" height={4} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
