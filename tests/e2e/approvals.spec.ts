import { test, expect } from "@playwright/test";
import { adminDb, cleanupByPrefix, makePrefix } from "./helpers/db";
import { loginAs } from "./fixtures";

let prefix = "";

test.beforeEach(() => {
  prefix = makePrefix("approvals");
});

test.afterEach(async () => {
  await cleanupByPrefix(prefix);
});

/**
 * End-to-end approval flow:
 *  1. Mentee logs in and submits a timesheet (via consultant module's TimesheetEntry).
 *  2. Admin logs in, opens approvals, approves it.
 *  3. DB row reflects status = 'APPROVED' AND reviewed_by = admin user id.
 */
test("Mentee submits timesheet, Admin approves, status persists", async ({ page }) => {
  const description = `${prefix}timesheet-flow`;

  // ---- Mentee submits ----
  await loginAs(page, "Mentee");
  await page.goto("/#consultant");
  // Wait for the project select to be populated (mentee must already be on a project via seed).
  const projectSelect = page.locator('[data-testid="timesheet-project"]');
  await expect(projectSelect).toBeVisible({ timeout: 10_000 });
  await expect.poll(() => projectSelect.locator("option").count(), { timeout: 10_000 }).toBeGreaterThan(1);

  // Choose first real project (skip placeholder).
  const optValue = await projectSelect.locator("option").nth(1).getAttribute("value");
  if (!optValue) test.skip(true, "Mentee has no projects assigned in seed → cannot test flow");
  await projectSelect.selectOption(optValue!);
  await page.locator('[data-testid="timesheet-hours"]').fill("3");
  await page.locator('[data-testid="timesheet-description"]').fill(description);
  await page.locator('[data-testid="timesheet-submit"]').click();

  // Confirm row exists in DB
  await expect.poll(async () => {
    const { data } = await adminDb.from("timesheets").select("id, status").eq("description", description).maybeSingle();
    return data?.status ?? null;
  }, { timeout: 10_000 }).toBe("SUBMITTED");

  // ---- Admin approves ----
  await page.locator('[data-testid="logout-button"]').click();
  await page.waitForURL(/\/login/, { timeout: 10_000 });
  await loginAs(page, "Admin");
  await page.goto("/#approvals");
  await page.locator('[data-testid="approvals-tab-timesheet"]').click();

  const { data: row } = await adminDb.from("timesheets").select("id").eq("description", description).maybeSingle();
  expect(row?.id).toBeTruthy();
  const id = row!.id as string;

  const approveBtn = page.locator(`[data-testid="approvals-timesheet-approve-${id}"]`);
  await expect(approveBtn).toBeVisible({ timeout: 10_000 });
  await approveBtn.click();

  // Confirm DB now shows APPROVED with reviewed_by set
  await expect.poll(async () => {
    const { data } = await adminDb
      .from("timesheets")
      .select("status, reviewed_by")
      .eq("description", description)
      .maybeSingle();
    return data;
  }, { timeout: 10_000 }).toMatchObject({ status: "APPROVED" });

  const { data: final } = await adminDb
    .from("timesheets")
    .select("reviewed_by")
    .eq("description", description)
    .maybeSingle();
  expect(final?.reviewed_by).toBeTruthy();
});
