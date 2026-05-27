"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Camera } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useOnboardingStore } from "@/stores/onboarding";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/types";
import { fadeUp, opacityFade, useMotionPreference } from "@/lib/motion";

/**
 * Step 2 of 5 — "About you".
 *
 * Persists name + phone + location to the user record so the rest of the
 * product can personalise (Pro UI greetings, leaderboard country chip,
 * timezone-aware streaks) without re-prompting. Every field bar the
 * display name is optional; the user can skip and complete later from
 * Settings.
 */

// Top countries the product cares about today. Order matters — the user's
// most likely match should be near the top of the list.
const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IE", name: "Ireland" },
  { code: "IN", name: "India" },
];

const schema = z.object({
  display_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, "Use international format, e.g. +2348012345678")
    .optional()
    .or(z.literal("")),
  country: z.string().length(2, "Pick a country").optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

export default function BasicsPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const persona = useOnboardingStore((s) => s.persona);
  const { reduced } = useMotionPreference();
  const headVariants = reduced ? opacityFade : fadeUp;

  const [form, setForm] = useState<FormState>({
    display_name: user?.display_name ?? "",
    phone: user?.phone ?? "",
    country: user?.country ?? "NG",
    state: user?.state ?? "",
    city: user?.city ?? "",
  });
  // Avatar lifecycle:
  //  - `avatarPreview` is what we render (server URL or local object-URL).
  //  - `avatarFile` is the picked File, uploaded once the user clicks Save.
  // Object URLs are revoked on unmount + when a new file is picked.
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar_url ?? null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Bounce if a persona was never picked.
  useEffect(() => {
    if (!persona) router.replace("/onboarding/persona");
  }, [persona, router]);

  // Re-seed the form once auth context hydrates the user.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      display_name: f.display_name || user.display_name || "",
      phone: f.phone || user.phone || "",
      country: f.country || user.country || "NG",
      state: f.state || user.state || "",
      city: f.city || user.city || "",
    }));
    if (!avatarPreview && user.avatar_url) setAvatarPreview(user.avatar_url);
  }, [user, avatarPreview]);

  function handleAvatarPick(file: File) {
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Image too large", {
        description: "Pick something under 1.5 MB.",
      });
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Unsupported format", {
        description: "Use a JPG, PNG, or WebP image.",
      });
      return;
    }
    // Revoke the previous object-URL (if any) before creating a new one,
    // so we don't leak.
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  // Clean up the object URL when the user navigates away.
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleContinue() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[String(i.path[0])] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = parsed.data;
      // Upload the avatar first (separate endpoint, multipart) so its URL is
      // persisted before the profile PATCH. Failing here surfaces a clear
      // error without partially saving the rest.
      if (avatarFile) {
        await meApi.uploadAvatar(avatarFile);
      }
      await meApi.updateProfile({
        display_name: payload.display_name,
        phone: payload.phone || null,
        country: payload.country || null,
        state: payload.state || null,
        city: payload.city || null,
      });
      await refresh();
      router.push("/onboarding/exam");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors());
        toast.error("Couldn't save your details", { description: err.message });
      } else {
        toast.error("Something went wrong", {
          description: "Please check your connection and try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (!persona) return null;

  return (
    <div className="space-y-12">
      <motion.header variants={headVariants} initial="hidden" animate="visible">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Step 2 of 5
        </p>
        <h1 className="mt-3 text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight">
          A little about you.
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Used for greetings, your leaderboard chip, and SMS reminders. You can
          edit any of this later from Settings.
        </p>
      </motion.header>

      <motion.div
        variants={headVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-[auto,1fr]"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <label
            htmlFor="avatar"
            className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-foreground focus-within:ring-2 focus-within:ring-ring"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-7 w-7" />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-foreground/70 py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-background opacity-0 transition-opacity group-hover:opacity-100">
              Change
            </span>
            <input
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarPick(file);
              }}
            />
          </label>
          <span className="text-[12px] text-muted-foreground">Optional · max 1.5 MB</span>
        </div>

        {/* Form */}
        <div className="grid gap-5">
          <Field label="Full name" required error={errors.display_name}>
            <Input
              autoComplete="name"
              placeholder="Adaeze Okafor"
              value={form.display_name}
              onChange={(e) => update("display_name", e.target.value)}
            />
          </Field>

          <Field
            label="Phone number"
            hint="International format only, e.g. +2348012345678"
            error={errors.phone}
          >
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="+234 801 234 5678"
              value={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Country" error={errors.country}>
              <select
                aria-label="Country"
                value={form.country ?? ""}
                onChange={(e) => update("country", e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select…</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="State / Region" error={errors.state}>
              <Input
                autoComplete="address-level1"
                placeholder="Lagos"
                value={form.state ?? ""}
                onChange={(e) => update("state", e.target.value)}
              />
            </Field>
          </div>

          <Field label="City" error={errors.city}>
            <Input
              autoComplete="address-level2"
              placeholder="Ikeja"
              value={form.city ?? ""}
              onChange={(e) => update("city", e.target.value)}
            />
          </Field>
        </div>
      </motion.div>

      <motion.div
        variants={headVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center"
      >
        <Button
          variant="ghost"
          size="lg"
          onClick={() => router.push("/onboarding/exam")}
          className="w-full sm:w-auto"
        >
          Skip for now
        </Button>
        <Button
          variant="accent"
          size="lg"
          onClick={() => void handleContinue()}
          isLoading={saving}
          loadingText="Saving…"
          rightIcon={<ArrowRight />}
          className="w-full sm:w-auto"
        >
          Save and continue
        </Button>
      </motion.div>
    </div>
  );
}
