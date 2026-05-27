import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const exams = [
  { id: "waec", name: "WAEC", full: "West African Examinations Council", years: "2008–2024", papers: 3240, color: "bg-foreground text-background" },
  { id: "jamb", name: "JAMB", full: "Joint Admissions and Matriculation Board", years: "2010–2024", papers: 2180, color: "bg-accent text-accent-foreground" },
  { id: "neco", name: "NECO", full: "National Examinations Council", years: "2012–2024", papers: 1640, color: "bg-sky text-sky-foreground" },
  { id: "ican", name: "ICAN", full: "Institute of Chartered Accountants", years: "2015–2024", papers: 720, color: "bg-secondary text-foreground" },
  { id: "cambridge", name: "Cambridge", full: "IGCSE & A-Level", years: "2014–2024", papers: 1980, color: "bg-success/15 text-success border border-success/30" },
  { id: "olevel", name: "GCE O-Level", full: "General Certificate", years: "2010–2023", papers: 1120, color: "bg-foreground/10 text-foreground" },
];

export default function PastQuestionsExams() {
  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Past Questions Engine"
        title="Pick an exam body"
        description="Browse 11,000+ past questions across major Nigerian and international exams. Filter by year, subject, and topic."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((e) => (
          <Link
            key={e.id}
            to={`/app/past-questions/${e.id}`}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-extrabold ${e.color}`}>
              {e.name.slice(0, 2)}
            </div>
            <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight">{e.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{e.full}</p>
            <div className="mt-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                {e.papers.toLocaleString()} papers · {e.years}
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
