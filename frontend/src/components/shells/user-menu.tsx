"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Account dropdown shown in the app + admin top bars. */
export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleSignOut() {
    await logout();
    toast.success("Signed out");
    router.replace("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-display text-sm font-bold tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {getInitials(user?.display_name, user?.email)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold">
            {user?.display_name || "Student"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/app/profile")}>
          <UserIcon /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/app/settings")}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
