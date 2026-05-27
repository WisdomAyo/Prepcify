import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({
  children,
  requireOnboarded = true,
}: {
  children: React.ReactNode;
  requireOnboarded?: boolean;
}) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOnboarded && profile && !profile.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
