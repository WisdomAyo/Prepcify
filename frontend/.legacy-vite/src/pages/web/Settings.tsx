import { Link } from "react-router-dom";
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

const sections = [
  { to: "/app/settings/account", icon: User, title: "Account", desc: "Edit profile, change password, exam targets" },
  { to: "/app/settings/notifications", icon: Bell, title: "Notifications", desc: "Email, push, study reminders" },
  { to: "/app/settings/privacy", icon: Shield, title: "Privacy", desc: "Profile visibility, data export" },
  { to: "/app/settings/subscription", icon: CreditCard, title: "Subscription", desc: "Plan, billing, payment method" },
];

export default function Settings() {
  const { signOut } = useAuth();
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Settings" title="Account & preferences" description="Tune prepcify to fit how you learn." />
      <div className="space-y-3">
        {sections.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:bg-secondary/30 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
        <button onClick={signOut} className="w-full flex items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-destructive hover:bg-destructive/10 transition-colors">
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
