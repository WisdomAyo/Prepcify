import { api } from "./client";
import type { ApiUser } from "./types";

/**
 * "Me" API — endpoints scoped to the authenticated user.
 *
 * `updateProfile` powers the onboarding "About you" step AND later
 * profile-settings edits. Every field is optional; the backend's
 * `UpdateProfileRequest` only validates what's present.
 */
export interface ProfilePatch {
  display_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  timezone?: string;
  locale?: string;
}

export const meApi = {
  updateProfile(input: ProfilePatch): Promise<ApiUser> {
    return api.patch<ApiUser>("/me/profile", input);
  },

  /**
   * Upload an avatar via multipart/form-data. Returns the updated user with
   * the `avatar_url` pointing at the public disk URL. Goes through the BFF
   * catch-all which preserves the multipart boundary on the way to Laravel.
   */
  async uploadAvatar(file: File): Promise<ApiUser> {
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch("/api/bff/v1/me/avatar", {
      method: "POST",
      credentials: "same-origin",
      // No Content-Type header — let the browser set the multipart
      // boundary. Setting it manually would break the boundary parameter.
      headers: { Accept: "application/json" },
      body: form,
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const { ApiError } = await import("./types");
      throw new ApiError(res.status, payload);
    }
    return (payload?.data ?? payload) as ApiUser;
  },
};
