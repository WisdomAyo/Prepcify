import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { ExamHeroSection } from "@/components/marketing/exams/exam-hero-section";
import { LazyExamMarquee } from "@/components/marketing/lazy-landing-sections";

export default function ExamsPage() {
  return (
    <MarketingPageShell className="bg-emerald-950">
      <ExamHeroSection />
      <LazyExamMarquee />
    </MarketingPageShell>
  );
}
