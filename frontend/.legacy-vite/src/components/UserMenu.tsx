import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function initials(name?: string | null, email?: string | null) {
  const src = name?.trim() || email?.split("@")[0] || "U";
  return src
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu() {
  const nav = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    nav("/", { replace: true });
  };

  const label = initials(profile?.full_name, user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-display text-sm font-bold tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-2xl">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold truncate">{profile?.full_name || "Student"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => nav("/app/profile")} className="rounded-xl">
          <UserIcon className="h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => nav("/app/profile")} className="rounded-xl">
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
