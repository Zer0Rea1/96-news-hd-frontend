import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { PROFILE_ORIGIN } from "../config";
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
test("public profiles have no admin route or auth client", () => {
  expect(read("profile/src/App.tsx")).not.toContain("/admin");
  expect(read("profile/src/api.ts")).not.toContain("supabase");
});
test("admin uses the shared API and permanent card origin", () => {
  expect(PROFILE_ORIGIN).toBe("https://profile.96newshd.com");
  expect(read("admin/src/config.ts")).toContain('../../config');
  const config = JSON.parse(read("admin/vercel.json"));
  expect(config.rewrites[0].destination).toBe("https://api.96newshd.com/api/:path*");
  expect(read("admin/src/App.tsx")).toContain('/admin/*');
  expect(read("admin/src/Admin.tsx")).toContain('/admin/session');
});
