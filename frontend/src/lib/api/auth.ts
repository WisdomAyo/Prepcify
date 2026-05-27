import { api } from "./client";
import type { ApiUser, AuthSession, UserContext } from "./types";

/**
 * Auth API — wraps the Laravel `/api/v1/auth/*` endpoints.
 *
 * All calls go through the BFF (`/api/bff/v1/auth/*`); the session token is
 * stored in an HttpOnly cookie set by the Route Handler. The browser never
 * touches the token — `login`/`register` just return the user payload, and
 * `logout` simply triggers the cookie-clearing endpoint.
 */
export const authApi = {
  /**
   * `identifier` accepts either an email or an E.164 phone number — Laravel's
   * `LoginRequest` normalises both into the same field.
   */
  login(input: { identifier: string; password: string }): Promise<AuthSession> {
    return api.post<AuthSession>("/auth/login", input);
  },

  register(input: {
    email: string;
    password: string;
    password_confirmation: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    user_type?: "student" | "parent";
  }): Promise<AuthSession> {
    return api.post<AuthSession>("/auth/register", input);
  },

  logout(): Promise<{ message: string }> {
    return api.post<{ message: string }>("/auth/logout");
  },

  me(): Promise<ApiUser> {
    return api.get<ApiUser>("/auth/me");
  },

  context(): Promise<UserContext> {
    return api.get<UserContext>("/me/context");
  },

  forgotPassword(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>("/auth/password/forgot", { email });
  },

  resetPassword(input: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    return api.post<{ message: string }>("/auth/password/reset", input);
  },
};
