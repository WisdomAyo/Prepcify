import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { AuthSessionProvider, UiProviders } from "@/components/providers";
import { AdminShell } from "@/components/shells/admin-shell";
import { serverFetch } from "@/lib/api/server";
import type { ApiUser, UserContext } from "@/lib/api/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function getInitialAdminSession() {
  let initialUser: ApiUser;

  try {
    initialUser = await serverFetch<ApiUser>("/auth/me");
  } catch {
    redirect("/login");
  }

  if (initialUser.user_type !== "admin") redirect("/app");

  const initialContext = await serverFetch<UserContext>("/me/context").catch(
    () => null,
  );

  return { initialUser, initialContext };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialUser, initialContext } = await getInitialAdminSession();

  return (
    <UiProviders>
      <AuthSessionProvider
        initialContext={initialContext}
        initialUser={initialUser}
      >
        <RouteGuard requireUserType="admin" requireOnboarded={false}>
          <AdminShell>{children}</AdminShell>
        </RouteGuard>
      </AuthSessionProvider>
    </UiProviders>
  );
}
