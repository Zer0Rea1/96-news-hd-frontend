import { readFileSync } from "node:fs";
import { unzipSync } from "fflate";
import { test, expect } from "@playwright/test";
import { reporterFixtures } from "../fixtures";
import { mockServices, type MockActivity } from "./mock-services";

function dateAfter(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

test("expiring credentials can be renewed without changing their Serial ID or public URL", async ({ page }) => {
  const services = await mockServices(page);
  const reporter = { ...reporterFixtures[0]!, issue_date: dateAfter(-30), expiry_date: dateAfter(7) };
  services.setRows([
    reporter,
    { ...reporterFixtures[1]!, issue_date: dateAfter(-30), expiry_date: dateAfter(90) },
    { ...reporterFixtures[2]!, issue_date: dateAfter(-30), expiry_date: dateAfter(7), status: "revoked" },
  ]);
  await page.goto("/admin");
  await expect(page.getByRole("complementary", { name: "Expiry reminders" })).toContainText("1 credential expires within 30 days");
  await page.getByRole("button", { name: "Review expiring credentials" }).click();
  await expect(page.getByRole("button", { name: /Ahmed Raza Senior/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Ayesha Siddiqui Special/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Hassan Ali Bureau/ })).toHaveCount(0);
  await page.getByRole("button", { name: `Actions for ${reporter.name}` }).click();
  await page.getByRole("button", { name: "Renew credentials", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Renew credentials" });
  await expect(dialog).toContainText("Their Serial ID, profile link and QR code stay the same.");
  await dialog.getByLabel("New expiry date").fill(reporter.expiry_date);
  await dialog.getByRole("button", { name: "Confirm renewal" }).click();
  await expect(dialog.getByRole("alert")).toContainText("after the current expiry");
  const expiry = dateAfter(400);
  await dialog.getByLabel("New expiry date").fill(expiry);
  const renewalRequest = page.waitForRequest(request => request.method() === "POST" && request.url().endsWith(`/api/admin/reporters/${reporter.id}/renew`));
  await dialog.getByRole("button", { name: "Confirm renewal" }).click();
  expect((await renewalRequest).postDataJSON()).toEqual({ issue_date: dateAfter(0), expiry_date: expiry });
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Credential renewed");
  await page.goto(`/p/${reporter.id}`);
  await expect(page.locator(".profile-details").getByText(reporter.serial_number!, { exact: true })).toBeVisible();
  await expect(page.locator(".press-card-serial")).toHaveText(reporter.serial_number!);
  await expect(page.locator(".press-card-qr")).toHaveAttribute("href", `https://profile.96newshd.com/p/${reporter.id}`);
  await page.goto("/admin");
  await page.getByRole("link", { name: "Activity log", exact: true }).click();
  const activity = page.getByRole("region", { name: "Admin activity log" });
  await expect(activity).toContainText("Renewed");
  await expect(activity).toContainText(reporter.name);
  await expect(activity).toContainText("editor@96news.test");
  await expect(activity).toContainText("issue date, expiry date");
  await expect(activity).not.toContainText(reporter.cnic);
  await expect(activity).not.toContainText(reporter.address);
});

test("activity history supports empty states, pagination and retry after a server error", async ({ page }) => {
  const services = await mockServices(page);
  await page.goto("/admin/activity");
  await expect(page.getByRole("heading", { name: "No activity yet" })).toBeVisible();
  const activities: MockActivity[] = Array.from({ length: 51 }, (_, index) => ({
    id: crypto.randomUUID(), created_at: new Date().toISOString(), actor_id: "11111111-1111-4111-8111-111111111111", actor_email: "editor@96news.test", reporter_id: reporterFixtures[0]!.id, reporter_name: `Audit reporter ${index + 1}`, serial_number: String(index + 1).padStart(5, "0"), action: "updated", changed_fields: ["city"],
  }));
  services.setActivities(activities);
  await page.getByRole("button", { name: "Refresh activity" }).click();
  const activity = page.getByRole("region", { name: "Admin activity log" });
  await expect(activity.getByRole("row")).toHaveCount(51);
  await expect(activity.getByText("Audit reporter 1", { exact: true })).toBeVisible();
  await expect(activity.getByText("Audit reporter 51", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Next activity page" }).click();
  await expect(activity.getByRole("row")).toHaveCount(2);
  await expect(activity.getByText("Audit reporter 51", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Previous activity page" }).click();
  await expect(activity.getByRole("row")).toHaveCount(51);
  services.setActivityError("Activity service temporarily unavailable.");
  await page.getByRole("button", { name: "Refresh activity" }).click();
  await expect(activity.getByRole("alert")).toHaveText("Activity service temporarily unavailable.");
  services.setActivityError(null);
  await activity.getByRole("button", { name: "Try again" }).click();
  await expect(activity.getByRole("row")).toHaveCount(51);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("bulk QR export contains separate high-resolution PNGs for selected active reporters", async ({ page }) => {
  const services = await mockServices(page);
  const first = { ...reporterFixtures[0]!, issue_date: dateAfter(-30), expiry_date: dateAfter(90) };
  const second = { ...reporterFixtures[1]!, issue_date: dateAfter(-30), expiry_date: dateAfter(90) };
  services.setRows([
    first, second,
    { ...reporterFixtures[2]!, expiry_date: dateAfter(-1) },
    { ...reporterFixtures[3]!, status: "draft" },
    { ...reporterFixtures[4]!, status: "revoked" },
  ]);
  await page.goto("/admin");
  await page.getByRole("button", { name: "Bulk QR download", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Bulk QR download" });
  await expect(dialog.getByRole("checkbox")).toHaveCount(2);
  await expect(dialog.getByRole("checkbox", { name: `Select ${first.name}` })).toBeChecked();
  await dialog.getByRole("button", { name: "Clear selection" }).click();
  await expect(dialog.getByRole("button", { name: "Download QR ZIP" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Select up to 100" }).click();
  const downloadReady = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download QR ZIP" }).click();
  const download = await downloadReady;
  expect(download.suggestedFilename()).toMatch(/^96news-qr-codes-\d{4}-\d{2}-\d{2}\.zip$/);
  const files = unzipSync(readFileSync((await download.path())!));
  const names = [first, second].map(reporter => `96news-${reporter.card_number}-qr.png`);
  expect(Object.keys(files).sort()).toEqual(names.sort());
  for (const name of names) {
    const png = Buffer.from(files[name]!);
    expect(png.toString("hex", 0, 8)).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(1024);
    expect(png.readUInt32BE(20)).toBe(1024);
  }
  expect(Buffer.from(files[names[0]!]!).equals(Buffer.from(files[names[1]!]!))).toBe(false);
});
