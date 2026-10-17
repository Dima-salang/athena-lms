import { test, expect } from "@playwright/test";

test.describe("Admin roster import & sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/Username or email/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test("admin sees the expected columns and can download a template", async ({ page }) => {
    await page.goto("/admin/roster-upload");

    await expect(page.locator("h1")).toContainText(/Import students/i);
    const body = page.locator("body");
    await expect(body).toContainText(/LRN/i);
    await expect(body).toContainText(/FirstName/i);
    await expect(body).toContainText(/LastName/i);
    await expect(body).toContainText(/Section/i);

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download template/i }).click();
    expect((await download).suggestedFilename()).toBe("class-list-template.xlsx");
  });

  test("admin browses sections and opens one", async ({ page }) => {
    await page.goto("/admin/sections");

    await expect(page.locator("h1")).toContainText(/Sections/i);
    // Seeded data.
    await expect(page.locator("body")).toContainText(/Grade 10 - Aristotle/i);

    await page.getByRole("link", { name: "Grade 10 - Aristotle" }).click();

    await expect(page).toHaveURL(/\/admin\/sections\/[^/]+$/);
    await expect(page.locator("h1")).toContainText(/Grade 10 - Aristotle/i);
    await expect(page.getByRole("tab", { name: /Students/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Teacher assignments/i })).toBeVisible();
    // The tab counts the students the section actually holds.
    await expect(page.getByRole("tab", { name: /Students/i })).toContainText(/[1-9]/);
  });

  test("admin filters the sections list", async ({ page }) => {
    await page.goto("/admin/sections");

    await page.getByLabel(/Search by section name/i).fill("Plato");
    await expect(page.getByRole("link", { name: "Grade 10 - Plato" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Grade 10 - Aristotle" })).toHaveCount(0);

    await page.getByRole("button", { name: /Reset filters/i }).click();
    await expect(page.getByRole("link", { name: "Grade 10 - Aristotle" })).toBeVisible();
  });
});
