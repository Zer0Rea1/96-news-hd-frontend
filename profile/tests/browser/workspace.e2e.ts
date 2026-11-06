import { readFileSync } from "node:fs";
import { reporterFixtures } from "../fixtures";
import { mockServices } from "./mock-services";
import { test, expect } from "@playwright/test";
test("directory, creation, editing, QR export and public privacy", async ({
  page,
}) => {
  await mockServices(page);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Reporter directory." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Card studio", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("textbox", { name: "Search reporters" }).fill("Lahore");
  await expect(
    page.getByRole("button", { name: /Ahmed Raza Senior/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Ayesha Siddiqui Special/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search" }).click();
  await page.getByRole("button", { name: "Add reporter", exact: true }).click();
  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("This field is required").first()).toBeVisible();
  await page.getByLabel("Full name", { exact: true }).fill("Fahad Iqbal");
  await page.getByLabel("Serial number", { exact: true }).fill("00042");
  await page.getByLabel("Father’s name", { exact: true }).fill("Iqbal Hussain");
  await page.getByLabel("Designated city", { exact: true }).fill("Sialkot");
  await page.getByLabel("CNIC number", { exact: true }).fill("35202-6543210-1");
  await page
    .getByLabel("Contact number", { exact: true })
    .fill("+92 300 1234567");
  await page
    .getByLabel("WhatsApp number", { exact: true })
    .fill("0300 1234567");
  await page
    .getByLabel("Address", { exact: true })
    .fill("Private street, Sialkot");
  await page
    .getByLabel("Credential status", { exact: true })
    .selectOption("active");
  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Actions for Fahad Iqbal" }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Designation", { exact: true }).fill("Bureau Chief");
  await expect(page.getByLabel("Serial number", { exact: true })).toHaveValue("00042");
  await page.getByLabel("Serial number", { exact: true }).fill("00043");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("button", { name: /Fahad Iqbal Bureau Chief/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Actions for Fahad Iqbal" }).click();
  await page
    .getByRole("region", { name: "Reporter directory" })
    .getByRole("button", { name: "Generate QR code", exact: true })
    .click();
  const url = await page.getByLabel("Permanent profile URL").inputValue();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/-qr\.png$/);
  const png = readFileSync((await download.path())!);
  expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(1024);
  await page.getByRole("button", { name: "Close QR code" }).click();
  await page.goto(url);
  await expect(
    page.getByRole("heading", { name: "Fahad Iqbal", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Officially authorized reporter")).toBeVisible();
  await expect(page.locator(".profile-details").getByText("Serial ID", { exact: true })).toBeVisible();
  await expect(page.locator(".profile-details").getByText("00043", { exact: true })).toBeVisible();
  const contact = page.getByRole("link", { name: "Add to contacts", exact: true });
  await expect(contact).toHaveAttribute("href", `/api/profiles/${url.split("/").pop()}/contact.vcf`);
  await expect(contact).not.toHaveAttribute("download");
  await expect(page.getByText("35202-6543210-1")).toHaveCount(0);
  await expect(page.getByText("Private street, Sialkot")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
    "href",
    "https://wa.me/923001234567",
  );
  await page.goto("/admin");
  await page.getByRole("textbox", { name: "Search reporters" }).fill("Fahad");
  await page.getByRole("button", { name: "Actions for Fahad Iqbal" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(
    page.getByRole("button", { name: /Fahad Iqbal Bureau Chief/ }),
  ).toHaveCount(0);
  await page.goto(url);
  await expect(
    page.getByRole("heading", { name: "Profile unavailable" }),
  ).toBeVisible();
});
test("drafts are private, revocation is visible, and mobile fits viewport", async ({
  page,
}) => {
  const services = await mockServices(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/admin");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("link", { name: "Workspace setup", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Close navigation" }).click();
  await page.goto("/admin/setup");
  await expect(
    page.getByRole("heading", { name: "Reporter directory." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/p/00000000-0000-4000-8000-000000000005");
  await expect(
    page.getByRole("heading", { name: "Profile unavailable" }),
  ).toBeVisible();
  await page.goto("/p/00000000-0000-4000-8000-000000000008");
  await expect(
    page.getByText("Revoked credential", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Call reporter" })).toHaveCount(
    0,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  services.setRows(
    reporterFixtures.map((row, index) =>
      index === 0 ? { ...row, name: "A".repeat(100) } : row,
    ),
  );
  await page.goto("/p/00000000-0000-4000-8000-000000000001");
  await expect(
    page.getByRole("heading", { name: "A".repeat(100), exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("desktop and mobile screenshots", async ({ page }) => {
  await mockServices(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Reporter directory." }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/directory-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/p/00000000-0000-4000-8000-000000000001");
  await expect(
    page.getByRole("heading", { name: "Ahmed Raza", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/profile-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("admin sign-in is required, bad credentials fail, and sign-out locks the workspace", async ({
  page,
}) => {
  await mockServices(page, false);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Enter the pressroom." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Reporter directory." }),
  ).toHaveCount(0);
  await page.getByLabel("Email address").fill("editor@96news.test");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Invalid login credentials",
  );
  await page.getByLabel("Password", { exact: true }).fill("correct-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Reporter directory." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Enter the pressroom." }),
  ).toBeVisible();
});
test("non-admin accounts cannot open the directory", async ({ page }) => {
  const services = await mockServices(page, true, "member");
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Administrator access required" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add reporter", exact: true }),
  ).toHaveCount(0);
  expect(services.adminRequests).toBe(1);
});
test("Urdu toggle only affects the public profile and preserves numeric details", async ({
  page,
}) => {
  await mockServices(page);
  await page.goto("/p/00000000-0000-4000-8000-000000000001");
  await expect(
    page.getByRole("link", { name: /Official News contact/ }),
  ).toHaveAttribute("href", "tel:+923008687435");
  await expect(
    page.getByRole("link", { name: "Staff sign in", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Switch to Urdu" }).click();
  await expect(page.locator(".public-page")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".public-page")).toHaveAttribute("lang", "ur");
  await expect(page.getByText("سیریل نمبر", { exact: true })).toBeVisible();
  await expect(page.locator(".profile-details").getByText("96-00001", { exact: true })).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("link", { name: "رابطوں میں شامل کریں", exact: true })).toHaveAttribute(
    "href", "/api/profiles/00000000-0000-4000-8000-000000000001/contact.vcf",
  );
  await expect(
    page.getByRole("link", { name: /نیوز سے تصدیق/ }),
  ).toHaveAttribute("href", "tel:+923008687435");
  await expect(page.getByText("والد کا نام", { exact: true })).toBeVisible();
  await expect(
    page.getByText("باضابطہ مجاز رپورٹر", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ahmed Raza", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".profile-details").getByText("+92 300 0000000", { exact: true }),
  ).toHaveAttribute("dir", "ltr");
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/profile-urdu-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".public-page")).toHaveAttribute("dir", "ltr");
  await expect(page.getByText("Father’s name", { exact: true })).toBeVisible();
  await page.goto("/admin");
  await expect(
    page.getByRole("button", { name: "Switch to Urdu" }),
  ).toHaveCount(0);
  await page.goto("/admin/cards");
  await expect(
    page.getByRole("heading", { name: "Reporter directory." }),
  ).toBeVisible();
});

test("three-dot menu shares the public URL and falls back to copying", async ({
  page,
}) => {
  await mockServices(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (url: string) => {
          document.documentElement.dataset.copiedUrl = url;
        },
      },
    });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: "Actions for Ahmed Raza" }).click();
  const menu = page.locator(".action-menu");
  await expect(menu.getByRole("button")).toHaveCount(5);
  for (const name of ["Edit", "Delete", "Renew credentials", "Generate QR code", "Share public URL"])
    await expect(menu.getByRole("button", { name, exact: true })).toBeVisible();
  await menu
    .getByRole("button", { name: "Share public URL", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Public profile URL copied.",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-copied-url",
    "https://profile.96newshd.com/p/00000000-0000-4000-8000-000000000001",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        document.documentElement.dataset.sharedUrl = data.url;
      },
    }),
  );
  await page.getByRole("button", { name: "Actions for Ahmed Raza" }).click();
  await page
    .getByRole("button", { name: "Share public URL", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Public profile link shared.",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-shared-url",
    "https://profile.96newshd.com/p/00000000-0000-4000-8000-000000000001",
  );
});
