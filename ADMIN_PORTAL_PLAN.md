# 96 News HD admin portal and frontend consolidation plan

## Agreed outcome

One frontend Git repository, `96-news-hd-frontend`, contains three Bun workspace applications. The existing unified backend stays in `96-news-hd-backend` on Netlify. The existing PostgreSQL database and Supabase Auth owner account stay in place.

```text
96newshd/
├── 96-news-hd-frontend/          # One Git repository
│   ├── main/                   # www.96newshd.com — public news
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vercel.json
│   ├── admin/                  # admin.96newshd.com — owner workspace
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vercel.json
│   ├── profile/                # profile.96newshd.com — public verification
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vercel.json
│   ├── config.ts               # Shared public profile-origin constant
│   ├── package.json            # workspaces: main, admin, profile
│   ├── bun.lock                # One dependency lockfile
│   └── ADMIN_PORTAL_PLAN.md
├── 96-news-hd-backend/          # api.96newshd.com — news + profiles
│   ├── src/news.ts
│   ├── src/profiles/
│   ├── db/
│   └── backups/                # Private, ignored recovery copies
└── 96newshd-app/               # Existing mobile app; outside this move
```

The standalone `96newshd-profile` checkout is the source for `profile/` and the existing management UI. Preserve it and its Git history until migration acceptance. Do not copy its `.git`, `node_modules`, build output, or credential files into the frontend repository.

There are three Vercel projects using the same Git repository with root directories `main`, `admin`, and `profile`. Keep the existing main-site and profile-site Vercel projects and domain assignments; create only the new admin project. Enable access to workspace files outside each app root where required for the shared config. Each app has its own public environment settings. Database and Cloudinary secrets remain on the backend.

## Printed-card contract

The owner confirmed that printed cards use **https://profile.96newshd.com**.

- Every existing `/p/<UUID>` path keeps its exact UUID and hostname. Reporter names and serial numbers must not replace UUIDs in URLs.
- Preserve card numbers, serial numbers including leading zeros, issue/expiry dates, status, privacy flags, photo references and history.
- Keep the existing profile Vercel project, DNS, TLS and any older profile aliases. Moving its source into a monorepo does not require replacing the project or changing its domain.
- Keep public profile and contact APIs working through compatibility rewrites. Retain `GET /api/profiles/:UUID` and `/contact.vcf` on the shared backend.
- A network failure displays temporary verification unavailability and retry. It must never label a reporter revoked or update credential status.
- No database reset, reporter re-creation, bulk reseeding, UUID regeneration, automatic expiry extension or automatic revocation is part of this move.

### Permanent URL configuration

The current profile source now has `src/config.ts` with `PROFILE_ORIGIN = "https://profile.96newshd.com"`. `profileUrl(id)` is the only profile-link builder. QR PNGs, bulk QR exports, card QR links, sharing and Open public profile use it. Admin, preview and localhost origins cannot change the destination.

During consolidation move this public constant into frontend-root `config.ts`, then import it from admin and profile. Do not restore `window.location.origin` or an optional environment fallback for printed-card URLs. Keep development API origins separately configurable; local development must still generate production profile URLs.

## Feature parity

| Area | Requirements |
| --- | --- |
| Owner access | Existing Supabase Auth account and exact backend OWNER_USER_ID; sign-in/out, expired sessions and forbidden-account states. No signup, payments or new roles. |
| Reporter directory | Existing search, city/status filters, pagination, counts and expiry reminders. |
| Reporter editing | Name, father name, designation, city, serial number, CNIC, contact, WhatsApp, address, dates, status, portrait and public-sensitive-fields control. |
| Credentials | Preserve draft/active/revoked and derived scheduled/expired behavior, existing UTC date rules, 30-day reminders and renewal validation. Renewals keep UUID, serial, card number and URL. |
| Privacy | Preserve each record's current privacy choice. Public CNIC/address remain controlled by that choice; new reporters retain the current private default. |
| QR and public preview | Existing card preview, permanent-link copying/sharing, individual 1024px QR PNG and up to 100 active reporters in a QR ZIP, with quiet margins preserved. |
| Activity and photos | Reporter activity history, existing image compression/validation, tracked replacement cleanup and owner cleanup action. Referenced portraits must remain protected from cleanup. |
| Removal | Retain the existing removal option with clear permanent-link consequences and explicit confirmation. Make revocation the clear option when withdrawing authority while retaining the record and URL. Never delete or revoke records as migration cleanup. |
| News | Create/edit drafts, publish, unpublish, preview, thumbnail upload, Urdu-capable article editor, multiple tags and immutable readable Urdu URLs. Use the API's current version for updates/deletion to prevent stale overwrites. |
| Tags | Create, rename and remove unused tags; explain the API's conflict when a tag is still in use. Stable IDs/slugs remain stable. |
| Shared UI behavior | Loading, empty, retry, field validation, forbidden access, expired session, unsaved changes and destructive confirmations. Admin controls remain English; Urdu news content supports RTL. |

Reuse the existing reporter controls and validation before redesigning their behavior. Follow the existing profile DESIGN.md: red/navy identity, Manrope, readable tables and responsive task-focused layouts. No production demo reporters or seeded news. The rich editor belongs to admin; public news bundles must remain free of editor/auth management code.

## Delivery sequence and gates

### 1. Recovery and baseline

Before structural changes, capture current source, deployment settings, domain aliases, the owner UUID, database data/ACLs and profile-link inventory. Protect backups from Git and public deploy archives. Download referenced Cloudinary image binaries to a protected backup as part of the recovery rehearsal, without replacing or deleting originals. Arrange a second protected copy outside this checkout before retirement.

At planning time there are 8 reporters. A fresh public-schema custom-format dump and a private manifest of all existing UUID URLs/credential fields have been saved under `../96-news-hd-backend/backups/`. Both the committed profile source and its working tree, including uncommitted admin changes, have recovery archives there. Secrets are excluded from source archives and must remain separately secured.

The new dump is readable by pg_restore; this does **not** yet prove full recovery. Restore it into a disposable database and compare reporter checksums, IDs, serial/card numbers, date/status/privacy fields, activity and photo registry before retiring any old service. These public-schema backups do not replace Supabase Auth or Cloudinary backups; keep those existing services and the owner account intact.

**Gate:** successful restore rehearsal, usable source/deployment rollback, private asset backup, current URL inventory. Counts must reflect the latest database at cutover rather than assuming it will always contain eight reporters.

### 2. Establish the frontend workspace

Checkpoint the current uncommitted main website as well as the profile source. Move the public news app into `main/` and copy the public profile app into `profile/`, retaining existing assets and relative paths. Create `admin/` with React, TypeScript and Vite. Use one root Bun workspace/lockfile, with editor dependencies limited to admin. Keep the old profile admin available in its existing deployment during this phase.

Add the shared fixed profile-origin config. Give the public news and profile Vercel projects the new root directories in a coordinated release, preserving their domain assignments. Stage and compare each public app before assigning production traffic. The legacy staff archive stays inactive under main and outside the public build.

**Gate:** all app builds and relevant regression tests pass, public page/API behavior is unchanged, and existing profile paths resolve correctly.

### 3. Bring existing reporter management into admin

Port reporter management first, with the feature-parity checklist above. Authenticate against the existing Supabase project and verify owner access through `/api/admin/session`; the shared API remains authoritative. Keep production access read-only until the owner switches management tools. Exercise create/edit/renew/revoke/delete/image/QR flows only against isolated fixtures or a disposable database.

Use the existing `/api/admin/reporters`, renewal, activity and photo endpoints. No profile-table rebuild or account migration is needed. Tests must cover changes to names, leading-zero serials and renewal dates without changing the permanent URL.

**Gate:** all existing options work in the new portal and wrong/expired/anonymous sessions cannot manage records.

### 4. Add news management

Add news list, editor, draft/publish workflow, thumbnails, labels and preview using the already deployed news API. Show the generated URL as read-only after creation, and preserve it on title changes. Handle stale-write and in-use-tag conflicts explicitly. Keep reporter and news uploads in their separate existing folders.

**Gate:** isolated end-to-end news workflows pass; public articles, tag feeds and Urdu content render correctly without exposing admin functions.

### 5. Switch profile management and public API routing

Take a new backup immediately before cutover. Briefly stop edits in the old admin while taking the final baseline; public verification stays available. Verify the new admin against current data, then make it the sole management UI.

Deploy `profile/` as a public-only app using the existing profile Vercel project. Remove admin/login imports and the wildcard redirect to admin. Old `/admin` bookmarks may temporarily redirect to `https://admin.96newshd.com`; existing `/p/:UUID` paths must continue to render the same public profiles. Preserve public API/contact compatibility rewrites to api.96newshd.com.

Read-check every inventoried UUID through the public site and API. Published profiles must retain the same identity and privacy behavior; draft profiles must remain private. Expired/revoked behavior stays consistent. Scan at least one actual printed card on a phone and confirm it opens the same reporter without login. Confirm portrait, English/Urdu view, contact actions and QR destination.

**Gate:** all recorded links, checksums and visibility rules pass, and the physical printed-card check succeeds.

### 6. Retire only the obsolete profile backend

Remove the standalone profile server/function deployment and obsolete server dependencies after the previous gates pass. Confirm there is exactly one active reporter-photo cleanup scheduler before retiring the older one. Preserve the shared database, Supabase Auth account, Cloudinary assets, profile frontend/domain, and shared backend `src/profiles` routes, validation and RPCs.

Archive the old profile repository/checkout and retain recovery copies until the agreed retention period. Do not delete the Vercel profile project: it owns the printed-card domain/aliases. A source or service cleanup must contain no reporter DELETEs, table drops or storage-folder deletion.

**Gate:** public profile verification and all new admin options still pass with the obsolete backend absent.

## Rollback

Keep the previous main/profile deployment IDs, private source copies and API-compatible old admin until cutover checks pass. On a frontend or routing failure, restore the prior deployment/settings while retaining the database and all subsequent legitimate edits. Do not automatically restore an old full database over live data. If actual data recovery is needed, identify affected records and recover them from the verified backup with matching original UUIDs.

## Acceptance checklist

- [ ] Three apps build from one frontend repository with Bun.
- [ ] Printed profile hostname and every inventoried UUID path remain unchanged.
- [ ] Every existing reporter-management option is available in admin.
- [ ] Only the existing owner can manage reporters/news.
- [ ] Portraits, privacy, status/date behavior, serial/card numbers and history are preserved.
- [ ] QR/sharing links always use profile.96newshd.com, regardless of the current app hostname.
- [ ] Database/source/asset recovery and deployment rollback have been rehearsed.
- [ ] A real printed card opens the expected profile on a phone.
- [ ] Profile is public-only; its obsolete backend is removed only after all earlier checks pass.

This document is a plan. The admin app and workspace move are not implemented yet. The permanent profile URL config is implemented and tested locally; no profile/admin removal or production profile cutover has been performed during planning.


## Implementation status

The three-app Bun workspace and separate reporter admin are implemented. Profile source is public-only; its production cutover, physical card checks, restore rehearsal, and old backend retirement remain pending. The original profile checkout and deployment are retained. News admin is a later phase.
