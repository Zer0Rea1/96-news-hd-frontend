# 96 News HD frontends

One Bun workspace, three separately deployed apps, one API at https://api.96newshd.com.

| App | Directory | Production domain |
| --- | --- | --- |
| News website | `main/` | www.96newshd.com |
| Private reporter admin | `admin/` | admin.96newshd.com |
| Public reporter verification | `profile/` | profile.96newshd.com |

Run `bun install`, then `bun run dev`, `bun run dev:admin`, or `bun run dev:profile`.
Run `bun run test` and `bun run build` before deployment.

Vercel projects use the matching app directory as Root Directory, with files outside that directory included. Each app has its own vercel.json. Keep the single root bun.lock.

Admin requires the two public Supabase values from admin/.env.example. The existing owner signs in with the same account; the API verifies the owner on every private request. No service key, database credentials, signup, or payment code belongs in these apps.

Printed-card URLs always use PROFILE_ORIGIN in config.ts. Existing UUIDs and data remain unchanged. The old profile checkout and live deployment remain available until the new public profile cutover is verified. News editing is the next admin phase; this release carries the existing reporter management features.

See ADMIN_PORTAL_PLAN.md for the rollout and retirement gates. Livestream source remains in main but is disabled.
