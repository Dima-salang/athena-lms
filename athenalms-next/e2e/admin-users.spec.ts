import { test, expect, type Page } from "@playwright/test";

/**
 * Admin user management, end to end.
 *
 * Everything happens on a throwaway account created by the test itself, so a
 * run never disturbs the seeded students and teachers that other specs use.
 */

const SECTION_NAME = "Grade 10 - Aristotle";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/Username or email/i).fill("admin");
  await page.getByLabel(/^Password$/i).fill("admin");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin/);
}

/** Choose an option from a Radix select, which is not a native <select>. */
async function pickOption(page: Page, triggerId: string, optionText: string | RegExp) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole("option", { name: optionText }).click();
}

test.describe("Admin user accounts", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("creates an account, resets its password, deactivates it, moves it out of a section, then deletes it", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const stamp = Date.now();
    const username = `e2e.student.${stamp}`;
    const lrn = String(stamp).slice(1); // 12 digits
    const fullName = "E2E Bulk";

    // ── create ───────────────────────────────────────────────────────────────
    await page.goto("/admin/users");
    await page.getByRole("button", { name: /Add account/i }).click();
    await page.fill("#user-first-name", "E2E");
    await page.fill("#user-last-name", "Bulk");
    await page.fill("#user-username", username);
    await page.fill("#user-lrn", lrn);
    await pickOption(page, "user-section", SECTION_NAME);
    await page.getByRole("button", { name: /^Create account$/i }).click();

    await expect(page.getByText(/Account created/i)).toBeVisible();
    await expect(page.locator("#user-username")).toHaveCount(0);

    // ── search finds it ──────────────────────────────────────────────────────
    await page.getByLabel(/Search user accounts/i).fill(username);
    const row = page.locator("tr", { hasText: username });
    await expect(row).toBeVisible();
    await expect(row).toContainText(lrn);
    await expect(row).toContainText(SECTION_NAME);
    await expect(row).toContainText(/Must change password/i);

    // ── reset password: students go back to their LRN ────────────────────────
    await row.getByRole("button", { name: `Actions for ${fullName}` }).click();
    await page.getByRole("menuitem", { name: /Reset password/i }).click();
    await page.getByRole("button", { name: /^Reset password$/i }).click();

    await expect(page.getByText(/Password reset for/i)).toBeVisible();
    await expect(page.getByRole("dialog").locator("code")).toHaveText(lrn);
    await page.getByRole("button", { name: /^Done$/i }).click();

    // ── bulk deactivate ──────────────────────────────────────────────────────
    await page.getByLabel(`Select ${fullName}`).check();
    await expect(page.getByText(/1 selected/i)).toBeVisible();
    await page.getByRole("button", { name: /^Deactivate$/i }).click();
    await page.getByRole("button", { name: /^Confirm$/i }).click();

    await expect(page.getByText(/1 account deactivated/i)).toBeVisible();
    await expect(page.locator("tr", { hasText: username })).toContainText(/Inactive/i);

    // ── move out of the section from the section page ────────────────────────
    await page.goto("/admin/sections");
    await page.getByRole("link", { name: SECTION_NAME }).click();
    const studentRow = page.locator("tr", { hasText: fullName });
    await expect(studentRow).toBeVisible();

    await studentRow.getByLabel(`Move or remove ${fullName}`).click();
    await page.getByRole("option", { name: /Remove from section/i }).click();
    await page.getByRole("button", { name: /^Remove$/i }).click();

    await expect(page.getByText(new RegExp(`^${fullName} removed$`))).toBeVisible();
    await expect(page.locator("tr", { hasText: fullName })).toHaveCount(0);

    // ── bulk delete ──────────────────────────────────────────────────────────
    await page.goto("/admin/users");
    await page.getByLabel(/Search user accounts/i).fill(username);
    await expect(page.locator("tr", { hasText: username })).toBeVisible();

    await page.getByLabel(`Select ${fullName}`).check();
    await page.getByRole("button", { name: /^Delete$/i }).click();
    await page.getByRole("button", { name: /Delete accounts/i }).click();

    await expect(page.getByText(/1 account deleted/i)).toBeVisible();
    await expect(page.locator("tr", { hasText: username })).toHaveCount(0);
  });

  test("searches, filters and pages through the user list", async ({ page }) => {
    await page.goto("/admin/users");

    // Seeded students only.
    await page.getByLabel(/Search user accounts/i).fill("student.00");
    await expect(page.getByText(/Showing 3 of 3 accounts/i)).toBeVisible();

    // Password-status filter narrows it further (student.001 already chose one).
    await pickOption(page, "status-filter", /Must change password/i);
    await expect(page.getByText(/Showing 2 of 2 accounts/i)).toBeVisible();

    await page.getByRole("button", { name: /Reset filters/i }).click();
    await expect(page.getByLabel(/Search user accounts/i)).toHaveValue("");
  });

  test("dashboard drill-down opens the user list pre-filtered", async ({ page }) => {
    await page.goto("/admin");

    await page.getByRole("link", { name: /Review accounts/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/users\?/);
    await expect(page.getByText(/Must change password|No accounts match/i).first()).toBeVisible();
  });
});
