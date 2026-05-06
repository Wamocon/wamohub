import { test, expect } from "@playwright/test";
import { adminDb, cleanupByPrefix, makePrefix } from "./helpers/db";
import { loginAs } from "./fixtures";

let prefix = "";

test.beforeEach(() => {
  prefix = makePrefix("notes");
});

test.afterEach(async () => {
  await cleanupByPrefix(prefix);
});

test("Mentee can create a personal note that persists", async ({ page }) => {
  const body = `${prefix}note body — this should persist after reload`;

  await loginAs(page, "Mentee");
  await page.goto("/#notizen");

  // Open create modal, fill body, submit
  await page.locator('[data-testid="notes-new"]').click();
  const textarea = page.locator('[data-testid="notes-body"]');
  await expect(textarea).toBeVisible({ timeout: 10_000 });
  await textarea.fill(body);
  await page.locator('[data-testid="notes-submit"]').click();

  // Verify DB row directly to keep this test independent of UI quirks.
  await expect.poll(async () => {
    const { data } = await adminDb.from("notes").select("id, body").like("body", `${prefix}%`).limit(1).maybeSingle();
    return data?.body ?? null;
  }, { timeout: 10_000 }).toContain(prefix);
});
