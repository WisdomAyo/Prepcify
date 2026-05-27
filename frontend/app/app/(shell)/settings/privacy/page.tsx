import { PageHeader } from "@/components/shells/page-header";
import { Download, Trash2 } from "lucide-react";

export default function SettingsPrivacyPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        crumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Privacy" },
        ]}
        eyebrow="Settings"
        title="Privacy & data"
      />

      <div className="space-y-6 rounded-3xl border border-border bg-card p-6">
        <div>
          <p className="font-semibold">Profile visibility</p>
          <p className="text-xs text-muted-foreground">
            Who can see your stats on the leaderboard.
          </p>
          <div className="mt-3 flex gap-2">
            {["Public", "Friends", "Private"].map((o, i) => (
              <button
                key={o}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                  i === 0
                    ? "bg-foreground text-background"
                    : "bg-secondary"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="font-semibold">Data export</p>
          <p className="text-xs text-muted-foreground">
            Download a copy of your study history, scores, and profile.
          </p>
          <button className="mt-3 flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold">
            <Download className="h-3.5 w-3.5" /> Request export
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-semibold text-destructive">Delete account</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This is permanent. All your scores, badges, and study history will be
          erased.
        </p>
        <button className="mt-3 flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground">
          <Trash2 className="h-3.5 w-3.5" /> Delete my account
        </button>
      </div>
    </div>
  );
}
