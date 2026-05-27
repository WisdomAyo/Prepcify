"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shells/page-header";
import { useAuth } from "@/contexts/auth-context";

const sections = [
  { href: "/app/settings/account", icon: User, title: "Account", desc: "Edit profile, change password, exam targets" },
  { href: "/app/settings/notifications", icon: Bell, title: "Notifications", desc: "Email, push, study reminders" },
  { href: "/app/settings/privacy", icon: Shield, title: "Privacy", desc: "Profile visibility, data export" },
  { href: "/app/settings/subscription", icon: CreditCard, title: "Subscription", desc: "Plan, billing, payment method" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleSignOut() {
    await logout();
    toast.success("Signed out");
    router.replace("/");
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Settings"
        title="Account & preferences"
        description="Tune prepcify to fit how you learn."
      />
      <div className="space-y-3">
        {sections.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-destructive transition-colors hover:bg-destructive/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
            <LogOut className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">Log out</p>
            <p className="text-xs">Sign out of this device.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
