import { expect, loginAs, test } from "./fixtures";

/**
 * Smoke E2E: every user role can log in and every navigable module renders
 * without runtime errors. This is intentionally tolerant — it asserts the URL
 * hash transitions and that no uncaught page errors occur. Detailed CRUD
 * flows belong in their own spec files (added in subsequent phases).
 */

const PUBLIC_MODULES: Array<{ hash: string; navName: RegExp }> = [
  { hash: "consultant", navName: /Consultant/ },
  { hash: "organisation", navName: /Organisation|Organization/ },
  { hash: "projekte", navName: /Projekte|Projects/ },
  { hash: "academy", navName: /Academy/ },
  { hash: "notizen", navName: /Notizen|Notes/ },
  { hash: "sonstiges", navName: /Sonstiges|Miscellaneous/ },
];

const ADMIN_MODULES: Array<{ hash: string; navName: RegExp }> = [
  { hash: "rbac", navName: /Benutzer & Rollen|Users & Roles/ },
  { hash: "approvals", navName: /Genehmigungen|Approvals/ },
  { hash: "admin", navName: /Admin/ },
];

test.describe("Smoke: login & module navigation", () => {
  test.beforeEach(({ page }) => {
    page.on("pageerror", (err) => {
      throw new Error(`Uncaught page error: ${err.message}`);
    });
  });

  test("Mentee can log in and visit all standard modules", async ({ page }) => {
    await loginAs(page, "Mentee");

    for (const m of PUBLIC_MODULES) {
      await page.getByRole("button", { name: m.navName }).first().click();
      await expect.poll(() => page.url(), { timeout: 5_000 }).toContain(`#${m.hash}`);
    }
  });

  test("Mentor can log in and visit mentor module", async ({ page }) => {
    await loginAs(page, "Mentor");
    await page.getByRole("button", { name: /Mentor/ }).first().click();
    await expect.poll(() => page.url(), { timeout: 5_000 }).toContain("#mentor");
  });

  test("Admin can log in and reach admin modules", async ({ page }) => {
    await loginAs(page, "Admin");

    for (const m of ADMIN_MODULES) {
      await page.getByRole("button", { name: m.navName }).first().click();
      await expect.poll(() => page.url(), { timeout: 5_000 }).toContain(`#${m.hash}`);
    }
  });

  test("Logout redirects to /login", async ({ page }) => {
    await loginAs(page, "Mentee");
    await page.locator('[data-testid="logout-button"]').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
  });
});
