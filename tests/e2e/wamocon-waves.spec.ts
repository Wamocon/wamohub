import { test, expect } from "@playwright/test";
import { adminDb } from "./helpers/db";
import { loginAs } from "./fixtures";

/**
 * Verifies the 8 waves seeded by migration 20260430120000_eight_waves_and_placeholder_apps.sql
 * are present in the DB and that the wamocon-apps module renders apps assigned to Wave 1.
 *
 * This spec does not create or delete data — it only asserts on what the migration installs.
 */
test("8 waves exist in DB and Wave 1 contains placeholder apps", async () => {
  const { data: waves, error } = await adminDb
    .from("wamocon_waves")
    .select("id, name, sort_order")
    .order("sort_order");
  expect(error).toBeNull();
  expect(waves?.length ?? 0).toBeGreaterThanOrEqual(8);

  const wave1 = waves!.find((w) => w.sort_order === 1);
  expect(wave1).toBeDefined();

  const { data: assignments } = await adminDb
    .from("wamocon_app_waves")
    .select("app_id")
    .eq("wave_id", wave1!.id);
  expect(assignments?.length ?? 0).toBeGreaterThanOrEqual(12); // 12 placeholder apps from migration
});

test("Wamocon Apps detail page is reachable via opaque public_id", async ({ page }) => {
  // Look up the public_id of the first placeholder app (UUIDs are no longer
  // exposed in URLs).
  const { data: app } = await adminDb
    .from("wamocon_apps")
    .select("public_id, name")
    .eq("id", "fa100000-0000-0000-0000-000000000001")
    .maybeSingle();
  expect(app?.public_id).toMatch(/^[A-Za-z0-9_-]{12}$/);

  await loginAs(page, "Admin");
  await page.goto(`/wamocon-app/${app!.public_id}`);
  await expect(page.getByRole("heading", { name: new RegExp(app!.name as string, "i") })).toBeVisible({ timeout: 10_000 });
});
