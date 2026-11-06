import { test, expect } from "@playwright/test";
import { mockServices } from "./mock-services";
import { reporterFixtures } from "../fixtures";

test("reporter cards use personal details, serial IDs and a unique profile QR", async ({ page }) => {
  const services = await mockServices(page);
  const first = reporterFixtures[0]!;
  services.setRows([{ ...first, photo_url: "https://res.cloudinary.com/news/image/upload/portrait.webp" }, ...reporterFixtures.slice(1)]);
  await page.route("https://res.cloudinary.com/**", route => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="#78939a"/><circle cx="200" cy="180" r="80" fill="#dfb89c"/><path d="M40 500V420a160 160 0 0 1 320 0v80" fill="#23334c"/></svg>',
  }));
  await page.goto(`/p/${first.id}`);
  const card = page.getByRole("region", { name: "Reporter card", exact: true });
  await expect(card.getByRole("group", { name: "Card front", exact: true })).toBeVisible();
  await expect(card.getByRole("group", { name: "Card back", exact: true })).toBeVisible();
  await expect(card.locator(".press-card-name")).toHaveText(first.name);
  await expect(card.locator(".press-card-serial")).toHaveText("96-00001");
  await expect(page.locator(".photo-number")).toHaveText(`Serial ID / ${first.serial_number}`);
  await expect(page.locator(".photo-number")).not.toContainText(String(first.card_number));
  await expect(card.locator(".press-card-cnic")).toHaveText("Private");
  await expect(card.locator(".press-card-address")).toHaveText("Private");
  await expect(card.locator(".press-card-phone")).toHaveText(first.contact);
  expect(await card.locator(".press-card-authority").evaluate(el => Number(getComputedStyle(el).zIndex))).toBeGreaterThan(
    await card.locator(".press-card-portrait").evaluate(el => Number(getComputedStyle(el).zIndex)),
  );
  await card.locator(".press-card-front").screenshot({ path: "test-results/card-stamp-over-photo.png" });
  await expect(card.locator(".press-card-qr")).toHaveAttribute("href", `https://profile.96newshd.com/p/${first.id}`);
  const firstQr = await card.locator(".press-card-qr svg").innerHTML();
  const second = reporterFixtures[1]!;
  services.setRows([{ ...second, serial_number: "00099", show_sensitive: true }]);
  await page.goto(`/p/${second.id}`);
  await expect(card.locator(".press-card-name")).toHaveText(second.name);
  await expect(card.locator(".press-card-serial")).toHaveText("00099");
  await expect(card.locator(".press-card-cnic")).toHaveText(second.cnic);
  await expect(card.locator(".press-card-address")).toHaveText(second.address);
  await expect(card.locator(".press-card-qr")).toHaveAttribute("href", `https://profile.96newshd.com/p/${second.id}`);
  expect(await card.locator(".press-card-qr svg").innerHTML()).not.toBe(firstQr);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/reporter-card-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Switch to Urdu" }).click();
  await expect(page.getByRole("region", { name: "رپورٹر کا کارڈ", exact: true })).toBeVisible();
});

test("inactive cards have a clear warning and blank serials never use the press ID", async ({ page }) => {
  await mockServices(page);
  const revoked = reporterFixtures[7]!;
  await page.goto(`/p/${revoked.id}`);
  await expect(page.locator(".press-card-serial")).toHaveText("—");
  await expect(page.locator(".photo-number")).toHaveText("Serial ID / —");
  await expect(page.locator(".press-card-state")).toHaveCount(2);
  await expect(page.locator(".press-card-state").first()).toHaveText("Revoked");
});
