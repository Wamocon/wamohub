import { test, expect } from "@playwright/test";
import { adminDb, cleanupByPrefix, makePrefix } from "./helpers/db";
import { loginAs } from "./fixtures";

let prefix = "";

test.beforeEach(() => {
  prefix = makePrefix("admin");
});

test.afterEach(async () => {
  await cleanupByPrefix(prefix);
});

test("Admin invites a user and the row persists after reload", async ({ page }) => {
  const email = `${prefix}admin-user@example.com`;
  const name = `${prefix}Admin Created`;

  await loginAs(page, "Admin");

  // Navigate to admin module via hash (hashchange listener picks this up)
  await page.goto("/#admin");
  await expect(page.locator('[data-testid="admin-tab-users"]')).toBeVisible({ timeout: 10_000 });
  await page.locator('[data-testid="admin-tab-users"]').click();

  // Open invite dialog
  await page.locator('[data-testid="admin-user-new"]').click();
  await page.locator('[data-testid="admin-user-name"]').fill(name);
  await page.locator('[data-testid="admin-user-email"]').fill(email);
  await page.locator('[data-testid="admin-user-submit"]').click();

  // Row should appear after refreshData() completes.
  await expect(page.locator(`[data-testid="admin-user-row-${email}"]`)).toBeVisible({ timeout: 15_000 });

  // Reload — row is still there → persisted in Supabase, not just React state.
  await page.reload();
  await expect(page.locator(`[data-testid="admin-user-row-${email}"]`)).toBeVisible({ timeout: 15_000 });

  // Verify directly in DB to remove any UI doubt.
  const { data, error } = await adminDb
    .from("users")
    .select("id, name, email, auth_user_id, is_active")
    .eq("email", email)
    .maybeSingle();
  expect(error).toBeNull();
  expect(data?.name).toBe(name);
  expect(data?.is_active).toBe(true);
  expect(data?.auth_user_id).toBeTruthy(); // invite created an auth.users entry too
});

test("Admin can deactivate a user (soft-delete)", async ({ page }) => {
  // Create a user directly in DB to deactivate
  const email = `${prefix}deactivate@example.com`;
  const { data: created, error: insErr } = await adminDb
    .from("users")
    .insert({
      name: `${prefix}Deactivate Me`,
      email,
      level: "PRAKTIKANT",
      roles: ["Mentee"],
      cv_file_url: "",
      is_active: true,
    })
    .select("id")
    .single();
  expect(insErr).toBeNull();
  const userId = created!.id as string;

  await loginAs(page, "Admin");
  await page.goto("/#admin");
  await page.locator('[data-testid="admin-tab-users"]').click();
  await expect(page.locator(`[data-testid="admin-user-row-${email}"]`)).toBeVisible({ timeout: 10_000 });

  await page.locator(`[data-testid="admin-user-deactivate-${email}"]`).click();
  await expect(page.locator(`[data-testid="admin-user-reactivate-${email}"]`)).toBeVisible({ timeout: 10_000 });

  const { data: after } = await adminDb.from("users").select("is_active").eq("id", userId).maybeSingle();
  expect(after?.is_active).toBe(false);
});
