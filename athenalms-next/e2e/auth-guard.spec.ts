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

    await page.getByLabel(/Username or email/i).fill("wronguser");
    await page.getByLabel(/^Password$/i).fill("WrongPassword123!");
    await page.click('button[type="submit"]');

    // Expect error message to appear
    const alert = page.locator(".text-destructive");
    await expect(alert).toBeVisible();
  });

  test("admin user logs in successfully and is redirected to /admin dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/Username or email/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("admin");
    await page.click('button[type="submit"]');

    // Should navigate to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("h1")).toContainText(/Admin dashboard/i);
    await expect(page.getByText(/Needs attention/i)).toBeVisible();
  });
});
