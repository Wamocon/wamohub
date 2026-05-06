import { test, expect, loginAs } from "./fixtures";
import { adminDb, makePrefix, cleanupByPrefix } from "./helpers/db";

test.describe("Wamocon Apps CRUD", () => {
  let prefix: string;

  test.beforeEach(() => {
    prefix = makePrefix("wapp");
  });

  test.afterEach(async () => {
    await cleanupByPrefix(prefix);
  });

  test("Admin can create a Wamocon app, and it persists", async ({ page }) => {
    await loginAs(page, "Admin");
    // The Wamocon Apps tab is reachable inside Projekte module.
    await page.goto("/#projekte");
    await expect(page.locator('[data-testid="projects-new"]')).toBeVisible({ timeout: 10_000 });

    // Switch to "WAMOCON 50 Apps" tab inside Projekte.
    await page.locator('[data-testid="projects-tab-wamocon"]').click();

    await expect(page.locator('[data-testid="wamocon-app-new"]')).toBeVisible({ timeout: 10_000 });

    const name = `${prefix}app`;
    await page.locator('[data-testid="wamocon-app-new"]').click();
    await page.locator('[data-testid="wamocon-app-name"]').fill(name);
    await page.locator('[data-testid="wamocon-app-submit"]').click();

    // Verify in DB first (most reliable).
    await expect.poll(async () => {
      const { data } = await adminDb.from("wamocon_apps").select("name").eq("name", name).maybeSingle();
      return data?.name ?? null;
    }, { timeout: 10_000 }).toBe(name);

    // App should appear in any wave/unassigned section.
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });
  });
});
