import { test, expect } from "@playwright/test";
import { mockServices } from "./mock-services";

test("admin can clean up abandoned photos and retry failures", async ({ page }) => {
  await mockServices(page);
  let fail = true;
  await page.route("**/api/admin/photos/cleanup", route => route.fulfill(fail
    ? { status: 500, json: { error: "Photos could not be cleaned up. Try again." } }
    : { json: { deleted: 2, failed: 0 } }));
  await page.goto("/admin/activity");
  const cleanup = page.getByRole("region", { name: "Photo cleanup", exact: true });
  await cleanup.getByRole("button", { name: "Clean up unused photos", exact: true }).click();
  await expect(cleanup.getByRole("alert")).toHaveText("Photos could not be cleaned up. Try again.");
  fail = false;
  await cleanup.getByRole("button", { name: "Clean up unused photos", exact: true }).click();
  await expect(cleanup.getByRole("status")).toHaveText("2 unused photos removed.");
  await expect(cleanup.getByRole("alert")).toHaveCount(0);
});
