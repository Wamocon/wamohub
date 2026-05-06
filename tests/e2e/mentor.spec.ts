import { test, expect, loginAs } from "./fixtures";
import { adminDb, makePrefix, cleanupByPrefix } from "./helpers/db";

test.describe("Mentor module", () => {
  let prefix: string;

  test.beforeEach(() => {
    prefix = makePrefix("mentor");
  });

  test.afterEach(async () => {
    await cleanupByPrefix(prefix);
  });

  test("Mentor can assign a goal to a mentee, and it persists", async ({ page }) => {
    await loginAs(page, "Mentor");
    await page.goto("/#mentor");

    await expect(page.locator('[data-testid="mentor-goal-title"]')).toBeVisible({ timeout: 10_000 });

    const title = `${prefix}goal`;
    await page.locator('[data-testid="mentor-goal-title"]').fill(title);
    await page.locator('[data-testid="mentor-goal-desc"]').fill(`${prefix}desc`);
    await page.locator('[data-testid="mentor-goal-submit"]').click();

    await expect(page.getByText(title, { exact: false })).toBeVisible({ timeout: 10_000 });

    const { data } = await adminDb
      .from("goals")
      .select("id, title, created_by")
      .eq("title", title)
      .maybeSingle();
    expect(data?.created_by).toBe("MENTOR");
  });
});
