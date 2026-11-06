import { createClient } from "@supabase/supabase-js";
import type { Reporter } from "./domain";
export const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
export const supabase = configured
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
    )
  : null;
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { data } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const headers = new Headers(options.headers);
  if (data.session)
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(`/api${path}`, { ...options, headers });
  if (response.status === 401 && supabase)
    await supabase.auth.signOut({ scope: "local" });
  if (response.status === 204) return undefined as T;
  const body = await response
    .json()
    .catch(() => ({ error: "The server could not be reached." }));
  if (!response.ok)
    throw new Error(body.error || "Something went wrong. Please try again.");
  return body;
}
// shortcut: filtering is local; query filters and counts in Postgres for thousands of reporters.
export async function loadReporters() {
  const rows: Reporter[] = [];
  let page = 1;
  while (true) {
    const data = await request<{ reporters: Reporter[]; total: number }>(
      `/admin/reporters?page=${page}`,
    );
    rows.push(...data.reporters);
    if (rows.length >= data.total || !data.reporters.length) return rows;
    page++;
  }
}
