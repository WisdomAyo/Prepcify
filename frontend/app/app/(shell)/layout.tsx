import { WebShell } from "@/components/shells/web-shell";

/** Wraps every standard `/app/*` page in the WebShell navigation chrome. */
export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WebShell>{children}</WebShell>;
}
