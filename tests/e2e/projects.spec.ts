import { test, expect, loginAs } from "./fixtures";
import { adminDb, makePrefix, cleanupByPrefix } from "./helpers/db";

test.describe("Projects CRUD", () => {
  let prefix: string;

  test.beforeEach(() => {
    prefix = makePrefix("proj");
  });

  test.afterEach(async () => {
    await cleanupByPrefix(prefix);
  });

  test("Admin can create, edit and delete a project", async ({ page }) => {
    await loginAs(page, "Admin");

    // Navigate to Projects via hash.
    await page.goto("/#projekte");
    await expect(page.locator('[data-testid="projects-new"]')).toBeVisible({ timeout: 10_000 });

    // ---- Create ----
    const name = `${prefix}name`;
    await page.locator('[data-testid="projects-new"]').click();
    await page.locator('[data-testid="project-name"]').fill(name);
    await page.locator('[data-testid="project-description"]').fill(`${prefix}desc`);
    await page.locator('[data-testid="project-submit"]').click();

    // Wait for refresh and card to appear.
    await expect(page.getByText(name, { exact: false })).toBeVisible({ timeout: 10_000 });

    // Assert in DB.
    const { data: created, error: e1 } = await adminDb
      .from("projects")
      .select("id, name, description")
      .eq("name", name)
      .maybeSingle();
    expect(e1).toBeNull();
    expect(created).not.toBeNull();
    const projectId = created!.id as string;

    // ---- Edit ----
    const newName = `${prefix}renamed`;
    await page.locator(`[data-testid="project-edit-${projectId}"]`).click();
    const nameInput = page.locator('[data-testid="project-name"]');
    await nameInput.fill(newName);
    await page.locator('[data-testid="project-submit"]').click();
    await expect(page.getByText(newName, { exact: false })).toBeVisible({ timeout: 10_000 });

    const { data: edited } = await adminDb
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .maybeSingle();
    expect(edited?.name).toBe(newName);

    // ---- Delete ----
    page.on("dialog", (d) => d.accept());
    await page.locator(`[data-testid="project-delete-${projectId}"]`).click();
    await expect(page.locator(`[data-testid="project-card-${projectId}"]`)).toHaveCount(0, { timeout: 10_000 });

    const { data: gone } = await adminDb
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .maybeSingle();
    expect(gone).toBeNull();
  });
});
