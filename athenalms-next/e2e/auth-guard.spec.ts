import { test, expect } from "@playwright/test";

test.describe("Authentication & RBAC Route Guard", () => {
  test("unauthenticated user is redirected to /login when visiting protected routes", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/teacher");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/student");
    await expect(page).toHaveURL(/\/login/);
  });

  test("displays error message on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[placeholder="Enter your username or email"]', "wronguser");
    await page.fill('input[type="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    // Expect error message to appear
    const alert = page.locator(".text-destructive");
    await expect(alert).toBeVisible();
  });

  test("admin user logs in successfully and is redirected to /admin dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[placeholder="Enter your username or email"]', "admin");
    await page.fill('input[type="password"]', "admin");
    await page.click('button[type="submit"]');

    // Should navigate to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("h1")).toContainText(/Admin/i);
  });
});
