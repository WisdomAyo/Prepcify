import { Link } from "react-router-dom";
import { UploadCloud, FileSpreadsheet, ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function AdminQuestionsUpload() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Questions", to: "/admin/questions" }, { label: "Bulk upload" }]}
        eyebrow="Admin"
        title="Bulk upload questions"
        description="Drop a CSV with up to 5,000 questions. We'll validate before publishing."
        actions={
          <Link to="/admin/questions" className="rounded-full bg-secondary px-5 py-2 text-sm font-semibold flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      <div className="rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <UploadCloud className="h-8 w-8 text-accent" />
        </div>
        <p className="mt-4 font-display text-lg font-bold">Drop CSV here or click to browse</p>
        <p className="mt-1 text-sm text-muted-foreground">Max 5,000 rows · 20 MB</p>
        <button className="mt-5 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground">Choose file</button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <p className="font-semibold text-sm">CSV template</p>
            <p className="text-xs text-muted-foreground">Required columns: exam, year, subject, topic, difficulty, stem, opt_a, opt_b, opt_c, opt_d, correct, explanation</p>
          </div>
          <button className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold">Download</button>
        </div>
      </div>
    </div>
  );
}
