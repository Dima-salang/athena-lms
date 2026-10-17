import { test, expect } from "@playwright/test";

test.describe("Student Authentication & Exam Portal", () => {
  test("student with mustChangePassword=true is redirected to /change-password on first login", async ({ page }) => {
    await page.goto("/login");

    // Login with seeded initial credentials
    await page.fill('input[placeholder="Enter your username or email"]', "student.001");
    await page.fill('input[type="password"]', "100000000001");
    await page.click('button[type="submit"]');

    // Should redirect to /change-password
    await expect(page).toHaveURL(/\/change-password/);
    await expect(page.locator("h1")).toContainText(/Change Password/i);

    // Complete password change
    await page.fill('input[id="currentPassword"], input[name="currentPassword"], input[placeholder*="current" i]', "100000000001");
    await page.fill('input[id="newPassword"], input[name="newPassword"], input[placeholder*="new password" i]', "Student@NewPass123");
    await page.fill('input[id="confirmPassword"], input[name="confirmPassword"], input[placeholder*="confirm" i]', "Student@NewPass123");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // After password change, redirects to /student dashboard
    await expect(page).toHaveURL(/\/student/);
    await expect(page.locator("body")).toContainText(/Welcome back/i);
    await expect(page.locator("body")).toContainText(/100000000001/i);
  });

  test("student dashboard renders Available, Upcoming, and Completed test tabs", async ({ page }) => {
    // If student.001 already changed password or using changed password
    await page.goto("/login");
    await page.fill('input[placeholder="Enter your username or email"]', "student.001");
    await page.fill('input[type="password"]', "Student@NewPass123");
    await page.click('button[type="submit"]');

    if (page.url().includes("/login")) {
      // Fallback if not yet changed
      await page.fill('input[placeholder="Enter your username or email"]', "student.001");
      await page.fill('input[type="password"]', "100000000001");
      await page.click('button[type="submit"]');
    }

    if (page.url().includes("/change-password")) {
      await page.fill('input[placeholder*="current" i]', "100000000001");
      await page.fill('input[placeholder*="new password" i]', "Student@NewPass123");
      await page.fill('input[placeholder*="confirm" i]', "Student@NewPass123");
      await page.click('button[type="submit"]');
    }

    await expect(page).toHaveURL(/\/student/);
    await expect(page.locator('button[role="tab"]:has-text("Available")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Upcoming")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Completed")')).toBeVisible();
  });
});
