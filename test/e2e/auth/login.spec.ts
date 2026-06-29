import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows login page with Google sign-in", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Sign in with Google")).toBeVisible();
  });
});
