import { expect, test as base, type Page } from "@playwright/test";

/**
 * Shared E2E helpers for RELDA.
 *
 * Login is backed by Supabase Auth. `loginAs(role)` maps the role to a demo
 * email and signs in via the email/password form on `/login`.
 *
 * Demo accounts are created by `npm run db:seed:auth` after `npm run db:reset`.
 * All demo users share the password `Demo1234!`.
 */

export type RelaLoginRole = "Admin" | "Mentor" | "Mentee";

const DEMO_EMAIL: Record<RelaLoginRole, string> = {
  Admin: "waleri.moretz@wamocon.de",
  Mentor: "daniel.moretz@wamocon.de",
  Mentee: "nurzhan.kukeyev@wamocon.de",
};

const DEMO_PASSWORD = "Demo1234!";

export async function loginAs(page: Page, role: RelaLoginRole): Promise<void> {
  // If we're mid-navigation (e.g. a logout just fired window.location.href = "/login"),
  // wait for it to settle before issuing our own goto.
  await page.waitForLoadState("domcontentloaded").catch(() => {});

  if (!page.url().endsWith("/login") && !page.url().includes("/login?")) {
    await page.goto("/login");
  }

  const email = page.locator('[data-testid="login-email"]');
  await expect(email).toBeVisible({ timeout: 15_000 });

  await email.fill(DEMO_EMAIL[role]);
  await page.locator('[data-testid="login-password"]').fill(DEMO_PASSWORD);
  await page.locator('[data-testid="login-submit"]').click();

  // Middleware redirects to "/", topbar logout becomes visible.
  await expect(page.locator('[data-testid="logout-button"]')).toBeVisible({ timeout: 15_000 });
}

export const test = base.extend({});
export { expect };
