import type { Page } from "@playwright/test";
import { reporterFixtures } from "../fixtures";
import { publicReporter, renewalSchema, type Reporter } from "../../src/domain";
export interface MockActivity {
  id: string;
  created_at: string;
  actor_id: string;
  actor_email: string;
  reporter_id: string;
  reporter_name: string;
  serial_number: string;
  action: "created" | "updated" | "revoked" | "renewed" | "deleted";
  changed_fields: string[];
}
export async function mockServices(
  page: Page,
  authenticated = true,
  role = "admin",
) {
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    aud: "authenticated",
    role: "authenticated",
    email: "editor@96news.test",
    app_metadata: { role },
    user_metadata: {},
    created_at: "2026-01-01T00:00:00Z",
  };
  const expires_at = Math.floor(Date.now() / 1000) + 3600;
  const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify({ sub: user.id, exp: expires_at, aud: "authenticated" })).toString("base64url")}.test-signature`;
  const session = {
    access_token: token,
    refresh_token: "test-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at,
    user,
  };
  let rows: Reporter[] = structuredClone(reporterFixtures);
  let activities: MockActivity[] = [];
  let activityError: string | null = null;
  function recordActivity(action: MockActivity["action"], reporter: Reporter, fields: string[]) {
    activities.unshift({ id: crypto.randomUUID(), created_at: new Date().toISOString(), actor_id: user.id, actor_email: user.email, reporter_id: reporter.id, reporter_name: reporter.name, serial_number: reporter.serial_number || "", action, changed_fields: fields });
  }
  let adminRequests = 0;
  if (authenticated)
    await page.addInitScript(
      (value) =>
        localStorage.setItem(
          "sb-pressroom-test-auth-token",
          JSON.stringify(value),
        ),
      session,
    );
  await page.route(
    "https://pressroom-test.supabase.co/auth/v1/**",
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/token")) {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: body.password === "correct-password" ? 200 : 400,
          json:
            body.password === "correct-password"
              ? session
              : {
                  error: "invalid_grant",
                  error_description: "Invalid login credentials",
                  msg: "Invalid login credentials",
                },
        });
      } else if (path.endsWith("/logout")) await route.fulfill({ status: 204 });
      else await route.fulfill({ json: { user } });
    },
  );
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/admin/")) {
      adminRequests++;
      if (
        request.headers().authorization !== `Bearer ${token}` ||
        role !== "admin"
      ) {
        await route.fulfill({
          status: 403,
          json: { error: "Administrator access is required." },
        });
        return;
      }
      if (path === "/api/admin/session") {
        await route.fulfill({ json: { owner: true, user: { id: user.id } } });
        return;
      }
      if (path === "/api/admin/activity") {
        if (activityError) await route.fulfill({ status: 500, json: { error: activityError } });
        else {
          const page = Number(new URL(request.url()).searchParams.get("page") || "1");
          await route.fulfill({ json: { activities: activities.slice((page - 1) * 50, page * 50), total: activities.length } });
        }
        return;
      }
      const id = path.split("/")[4];
      const previous = rows.find((r) => r.id === id);
      if (path.endsWith("/renew")) {
        const parsed = renewalSchema.safeParse(request.postDataJSON());
        if (!previous) await route.fulfill({ status: 404, json: { error: "Reporter not found." } });
        else if (!parsed.success) await route.fulfill({ status: 400, json: { error: "Check the renewal dates." } });
        else if (previous.status !== "active" || parsed.data.expiry_date <= previous.expiry_date || parsed.data.expiry_date < new Date().toISOString().slice(0, 10)) await route.fulfill({ status: 409, json: { error: "This credential cannot be renewed with these dates." } });
        else {
          const renewed = { ...previous, ...parsed.data, updated_at: new Date().toISOString() };
          rows = rows.map(row => row.id === id ? renewed : row);
          recordActivity("renewed", renewed, ["issue_date", "expiry_date"]);
          await route.fulfill({ json: renewed });
        }
      } else if (request.method() === "GET")
        await route.fulfill({ json: { reporters: rows, total: rows.length } });
      else if (request.method() === "DELETE") {
        if (previous) recordActivity("deleted", previous, []);
        rows = rows.filter((r) => r.id !== id);
        await route.fulfill({ status: 204 });
      } else {
        const input = request.postDataJSON();
        const row = {
          ...input,
          id: previous?.id || crypto.randomUUID(),
          card_number: previous?.card_number || 1009,
          created_at: previous?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        rows = previous
          ? rows.map((r) => (r.id === id ? row : r))
          : [row, ...rows];
        recordActivity(!previous ? "created" : previous.status !== "revoked" && row.status === "revoked" ? "revoked" : "updated", row, Object.keys(input).filter(key => !previous || JSON.stringify(previous[key as keyof Reporter]) !== JSON.stringify(input[key])));
        await route.fulfill({ status: previous ? 200 : 201, json: row });
      }
    } else if (path.startsWith("/api/profiles/")) {
      const row = rows.find(
        (r) => r.id === path.split("/")[3] && r.status !== "draft",
      );
      await route.fulfill({
        status: row ? 200 : 404,
        json: row ? publicReporter(row) : { error: "Profile not found." },
      });
    } else await route.fulfill({ status: 404, json: { error: "Not found." } });
  });
  return {
    get adminRequests() {
      return adminRequests;
    },
    setRows(value: Reporter[]) {
      rows = value;
    },
    setActivities(value: MockActivity[]) { activities = value; },
    setActivityError(value: string | null) { activityError = value; },
  };
}
