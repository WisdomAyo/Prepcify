import { Link } from "react-router-dom";
import { Calculator, LineChart, Atom, FlaskConical, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const tools = [
  { to: "/app/playground/math-solver", icon: Calculator, name: "Math Solver", desc: "Step-by-step equation solving from algebra to calculus.", color: "bg-foreground text-background" },
  { to: "/app/playground/graphing", icon: LineChart, name: "Graphing Tool", desc: "Plot functions and visualise transformations.", color: "bg-accent text-accent-foreground" },
  { to: "/app/playground/physics", icon: Atom, name: "Physics Simulator", desc: "Drop balls, swing pendulums, observe motion.", color: "bg-sky text-sky-foreground" },
  { to: "/app/playground/chemistry", icon: FlaskConical, name: "Chemistry Visualizer", desc: "Build molecules and watch reactions.", color: "bg-success/15 text-success border border-success/30" },
];

export default function Playground() {
  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Playground"
        title="Hands-on STEM tools"
        description="Stop memorising — play with concepts until they click."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Pro feature
          </span>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        {tools.map(({ to, icon: Icon, name, desc, color }) => (
          <Link key={to} to={to} className="group rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-card">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-extrabold">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-accent">
              Open tool <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
