import { test, expect } from "@playwright/test";

test.describe("Admin Roster Provisioning & Sections", () => {
  test.beforeEach(async ({ page }) => {
    // Log in as Admin
    await page.goto("/login");
    await page.fill('input[placeholder="Enter your username or email"]', "admin");
    await page.fill('input[type="password"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test("admin navigates to roster upload and sees file template requirements", async ({ page }) => {
    await page.goto("/admin/roster-upload");

    await expect(page.locator("h1")).toContainText(/Roster Upload/i);
    await expect(page.locator("body")).toContainText(/LRN/i);
    await expect(page.locator("body")).toContainText(/FirstName/i);
    await expect(page.locator("body")).toContainText(/LastName/i);
    await expect(page.locator("body")).toContainText(/Section/i);
  });

  test("admin views existing class sections catalogue", async ({ page }) => {
    await page.goto("/admin/sections");

    await expect(page.locator("h1")).toContainText(/Class Sections/i);
    // Seed data should have at least Grade 10 - Rizal
    await expect(page.locator("body")).toContainText(/Rizal/i);
  });
});
