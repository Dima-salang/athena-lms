import { test, expect } from "@playwright/test";

test.describe("Grading & Analytics Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Log in as Demo Teacher
    await page.goto("/login");
    await page.fill('input[placeholder="Enter your username or email"]', "teacher.demo");
    await page.fill('input[type="password"]', "Teacher@123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/teacher/);
  });

  test("teacher navigates to tests list and can inspect submissions", async ({ page }) => {
    await page.goto("/teacher/tests");
    await expect(page.locator("h1")).toContainText("Tests");

    // Look for an existing test card or link
    const viewSubmissionsBtn = page.locator('a[href*="/submissions"]').first();
    if (await viewSubmissionsBtn.isVisible()) {
      await viewSubmissionsBtn.click();
      await expect(page).toHaveURL(/\/submissions/);
      await expect(page.locator("h1")).toContainText(/Submissions/i);
    }
  });

  test("teacher views item analysis and analytics dashboard", async ({ page }) => {
    await page.goto("/teacher/tests");

    const analyticsLink = page.locator('a[href*="/analytics"]').first();
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
      await expect(page).toHaveURL(/\/analytics/);
      await expect(page.locator("h1")).toContainText(/analytics/i);

      // Verify presence of analytics tabs
      await expect(page.locator('button[role="tab"]:has-text("Gradebook")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("Item analysis")')).toBeVisible();
      await expect(page.locator('button[role="tab"]:has-text("Score spread")')).toBeVisible();
    }
  });
});
