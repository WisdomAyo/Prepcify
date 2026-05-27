import { test, expect } from "@playwright/test";

/**
 * Smoke tests for the public surface and edge routing.
 *
 * Run against the production build (see `playwright.config.ts`), so these
 * also catch SSR / metadata / middleware regressions. None of them require a
 * running Laravel — they exercise the Next.js layer only.
 */

test("home page renders hero copy and is crawlable", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /pass your exams/i }),
  ).toBeVisible();

  await expect(page).toHaveTitle(/prepcify/i);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /study app/i,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(
    page.locator('script[type="application/ld+json"]'),
  ).not.toHaveCount(0);
});

test("primary CTA navigates to signup", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /get started/i }).first().click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(
    page.getByRole("heading", { name: /your best result starts here/i }),
  ).toBeVisible();
});

test("middleware redirects unauthenticated /app traffic to /login", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
});

test("login form is accessible (uses identifier, not bare email)", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email or phone/i)).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("session token cookie is HttpOnly (BFF security)", async ({ page, context }) => {
  await page.goto("/");
  const cookies = await context.cookies();
  const token = cookies.find((c) => c.name === "prepcify_token");
  if (token) {
    // If a session is present, it must be HttpOnly. The browser must not be
    // able to expose it to JavaScript.
    expect(token.httpOnly).toBe(true);
  }
  // Either way: document.cookie must never include the token name.
  const visible = await page.evaluate(() => document.cookie);
  expect(visible).not.toContain("prepcify_token");
});

test("/pricing renders the SSR ServerPlans heading", async ({ page }) => {
  await page.goto("/pricing");
  // Either the live API rendered plans, OR the fallback heading is shown —
  // both are valid SSR output.
  const live = page.getByRole("heading", { name: /pick the plan that fits/i });
  const fallback = page.getByRole("heading", { name: /live plans are loading/i });
  await expect(live.or(fallback)).toBeVisible();
});
