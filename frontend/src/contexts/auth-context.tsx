"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api/auth";
import { isOnboarded, type ApiUser, type UserContext } from "@/lib/api/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface RegisterInput {
  email: string;
  password: string;
  password_confirmation: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  user_type?: "student" | "parent";
}

interface AuthContextValue {
  user: ApiUser | null;
  /** Permission + entitlement context for the active user. Null pre-load. */
  context: UserContext | null;
  status: AuthStatus;
  isLoading: boolean;
  /** True once the active student has completed onboarding (or isn't a student). */
  isOnboarded: boolean;
  login: (identifier: string, password: string) => Promise<ApiUser>;
  register: (input: RegisterInput) => Promise<ApiUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * App-wide auth provider, backed by the Laravel Sanctum API via the BFF.
 *
 * On mount it asks `/auth/me` — if the HttpOnly session cookie is valid, the
 * browser is signed in. Otherwise we land in `unauthenticated` quietly (no
 * thrown errors surface, since "no session" is a normal first-visit state).
 */
export function AuthProvider({
  children,
  initialContext = null,
  initialUser = null,
}: {
  children: ReactNode;
  initialContext?: UserContext | null;
  initialUser?: ApiUser | null;
}) {
  const [user, setUser] = useState<ApiUser | null>(initialUser);
  const [context, setContext] = useState<UserContext | null>(initialContext);
  const [status, setStatus] = useState<AuthStatus>(
    initialUser ? "authenticated" : "loading",
  );

  const loadSession = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      try {
        setContext(await authApi.context());
      } catch {
        setContext(null);
      }
      setStatus("authenticated");
    } catch {
      setUser(null);
      setContext(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    if (status !== "loading") return;
    void loadSession();
  }, [loadSession, status]);

  const login = useCallback(async (identifier: string, password: string) => {
    const { user: me } = await authApi.login({ identifier, password });
    setUser(me);
    setStatus("authenticated");
    try {
      setContext(await authApi.context());
    } catch {
      setContext(null);
    }
    return me;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user: me } = await authApi.register(input);
    setUser(me);
    setStatus("authenticated");
    try {
      setContext(await authApi.context());
    } catch {
      setContext(null);
    }
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setContext(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      context,
      status,
      isLoading: status === "loading",
      isOnboarded: isOnboarded(user),
      login,
      register,
      logout,
      refresh: loadSession,
    }),
    [user, context, status, login, register, logout, loadSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth session. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}
