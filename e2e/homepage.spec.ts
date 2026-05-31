import { test, expect } from "@playwright/test";

test.describe("Damusia Landing Page E2E Tests", () => {
  test("should load the homepage and check main content", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Verify main title is visible and contains expected text
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Validate Your Startup Idea");

    // Verify the social proof text is present
    await expect(page.locator("text=people already interested")).toBeVisible();
  });

  test("should open the waitlist modal when clicking CTA button", async ({
    page,
  }) => {
    await page.goto("/");

    // Locate the 'Get Early Access' CTA button and click it
    // WaitlistModal should show up
    const ctaButton = page
      .locator('button:has-text("Get Early Access")')
      .first();
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();

    // Verify modal overlay heading is visible
    const modalHeading = page.locator('h3:has-text("Get Early Access")');
    await expect(modalHeading).toBeVisible();

    // Verify form fields are visible inside the modal
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="phone"]')).toBeVisible();
    await expect(page.locator('label[for="dob"]')).toBeVisible();
  });
});
