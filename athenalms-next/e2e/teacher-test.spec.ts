import { test, expect } from "@playwright/test";

test.describe("Teacher Test Authoring Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Log in as Demo Teacher
    await page.goto("/login");
    await page.fill('input[placeholder="Enter your username or email"]', "teacher.demo");
    await page.fill('input[type="password"]', "Teacher@123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/teacher/);
  });

  test("teacher views test catalogue and initiates test creation", async ({ page }) => {
    await page.goto("/teacher/tests");
    await expect(page.locator("h1")).toContainText("Tests");

    // Click Create test
    await page.click('a:has-text("Create test")');
    await expect(page).toHaveURL(/\/teacher\/tests\/create/);

    // Fill basic details
    await page.fill('input[placeholder*="Quarter 1 Summative"]', "E2E Biology Quiz");
    await page.fill('textarea[placeholder*="instructions"]', "Answer all questions honestly.");

    // Select first section button if available
    const sectionBtn = page.locator('button:has-text("Grade 10 - Rizal")').first();
    if (await sectionBtn.isVisible()) {
      await sectionBtn.click();
    }

    // Submit test creation
    await page.click('button:has-text("add questions")');

    // Should redirect to edit page
    await expect(page).toHaveURL(/\/teacher\/tests\/.*\/edit/);
    await expect(page.locator("h1")).toContainText("E2E Biology Quiz");
  });
});
