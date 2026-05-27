/**
 * Full-screen flow layout — quizzes, mock exams, live battles, checkout
 * results. Deliberately renders no navigation chrome so the learner stays
 * focused. Auth is still enforced by the parent `/app` layout.
 */
export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-background">{children}</div>;
}
