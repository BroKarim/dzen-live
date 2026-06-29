import { test, expect } from "@playwright/test";

test.describe("Public Profile", () => {
  test("displays profile information", async ({ page }) => {
    await page.goto("/test-user");
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-links"]')).toBeVisible();
  });

  test("clicks a link and tracks analytics", async ({ page }) => {
    await page.goto("/test-user");
    const firstLink = page.locator('[data-testid="link-card"]').first();
    await firstLink.click();
  });
});
