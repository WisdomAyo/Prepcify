"use client";

import { PageHeader } from "@/components/shells/page-header";
import { useAuth } from "@/contexts/auth-context";

function TextField({
  label,
  type = "text",
  defaultValue = "",
  disabled = false,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground disabled:opacity-60"
      />
    </div>
  );
}

export default function SettingsAccountPage() {
  const { user } = useAuth();
  const sp = user?.student_profile;

  return (
    <div className="max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Settings", href: "/app/settings" }, { label: "Account" }]}
        eyebrow="Settings"
        title="Account"
      />

      <form
        className="space-y-6 rounded-3xl border border-border bg-card p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <TextField label="Full name" defaultValue={user?.display_name ?? ""} />
        <TextField label="Email" defaultValue={user?.email ?? ""} disabled />
        <TextField label="School" defaultValue={sp?.school ?? ""} />
        <TextField
          label="Target exam year"
          defaultValue={sp?.target_year ? String(sp.target_year) : ""}
          type="number"
        />
        <TextField
          label="Daily goal (minutes)"
          defaultValue={String(sp?.daily_goal_minutes ?? 30)}
          type="number"
        />
        <button className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground">
          Save changes
        </button>
      </form>

      <form
        className="mt-6 space-y-6 rounded-3xl border border-border bg-card p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="font-display text-lg font-bold">Change password</h2>
        <TextField label="Current password" type="password" />
        <TextField label="New password" type="password" />
        <TextField label="Confirm new password" type="password" />
        <button className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background">
          Update password
        </button>
      </form>
    </div>
  );
}
