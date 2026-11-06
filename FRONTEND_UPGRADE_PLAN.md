# 96 News HD: main website upgrade plan

Implementation update: the public homepage, category, article, search, navigation and footer have now been rebuilt. The official slogan is “ہر خبر باوثوق” and appears in the brand lockup and page titles. The website is now public-only: staff routes, authentication, the reporter portal and editor have been removed from the active source and their packages removed from the manifest. Their source is preserved in `legacy/reporter-portal/` for the future admin application. Livestream is disabled with its original component preserved, and old admin URLs now show the redesigned not-found page. The project now uses Bun exclusively and its frontend packages have been upgraded to current releases. See README.md for the current implementation, tests and remaining limitations; the original audit and phased plan below are retained as historical context.

Scope: the existing `96-news-hd-frontend` website. Backend consolidation, building the new admin application, and changes to the mobile/profile applications are separate projects.

Original planning decisions (the implementation update above reflects later scope changes):

- Keep the website Urdu-first, RTL, and recognizably 96 News HD, using its existing red identity.
- The public website belongs at `www.96newshd.com`; shared business APIs eventually belong at `api.96newshd.com`.
- Move publishing/membership workflows to the future admin application eventually; preserve the current reporter portal until that replacement works.
- Remove the current website's admin routes now, as explicitly requested. Do not introduce links to an admin application that does not exist yet.
- Use `admin.96newshd.com` as the planned admin hostname, interpreting the later `admin.86newshd.com` spelling as a typo. Verify the hostname before DNS or deployment work.

## 1. Current assessment

Overall: **5/10 for production readiness**. This is a useful working foundation, with recognizable React components, routes, a reusable Axios client, loading skeletons, a reusable HLS player, and an Urdu/RTL interface. Its weakest parts are state correctness, delivery performance, and handling failures consistently. A separate frontend repository is a valid architecture; it is not itself a mistake.

Audit baseline, before the admin-route removal:

- `npm run build`: passed using the installed dependencies.
- `npm run lint`: failed with 16 errors and 5 warnings; no existing test script or test suite was found in this frontend.
- Production output: one 1,317.63 kB minified JavaScript chunk (402.66 kB gzip), a 68.42 kB CSS file, and a 10,784.98 kB Urdu TTF font. These are build sizes, not measured page-load timings.
- Both npm and Bun lockfiles exist. Choose one package manager and one authoritative lockfile during cleanup.
- No browser, live API, real-device, or deployment validation was performed for this planning audit.

| Priority | Finding and evidence | Planned correction |
| --- | --- | --- |
| P0 | `AuthProvider` suppresses all children while `/api/auth/check-cookie` runs, and wraps the public website. | Scope auth/profile providers to reporter routes; public pages render without a session request. |
| P0 | `ProtectedRoute` reads `profile.paid` before checking whether `profile` exists. | Handle unauthenticated, loading, missing-profile, and failed-profile cases before payment fields. |
| P0 | `NewsSection` truncates raw HTML and inserts it into a paragraph; `PostPage` inserts article HTML without frontend sanitization. The inspected post-writing controller does not sanitize it either. | Render excerpts as plain text; sanitize full article HTML with a maintained sanitizer and a documented allowlist. This is an injection risk identified in code, not a verified production exploit. |
| P1 | `NewsPages.handleLoadMore` updates state then fetches using the previous `page`, repeating offsets; responses can also arrive after category navigation. | Pass the intended offset explicitly, commit it after success, cancel obsolete requests, and preserve existing results on errors. |
| P1 | Category filtering happens after global pagination. The local API returns 10 posts by default and a global count, so category lists/home sections can appear empty even when older matching stories exist. | Correct frontend pagination and exhaustion accounting now; record category-filtered pagination as a future API dependency. |
| P1 | Home/category/live requests generally only log errors; search conflates typing/no results and has no visible failure state. | Distinguish initial, loading, success, empty, and error states; add retry where useful. Use Axios `params` for encoded search input and keep submitted search in the URL. |
| P1 | All pages, editor code, and player dependencies are imported eagerly. | Lazy-load reporter routes and heavy player/editor code; verify output chunks and the requests made on public pages. |
| P1 | The 10.8 MB Urdu font has no `font-display`; CSS applies transitions to every element and globally overrides Tailwind text utilities. | Verify font licensing/coverage, use WOFF2 and `font-display: swap`, and replace global styling side effects with explicit tokens/styles. |
| P1 | Main HTML says `lang="en"`; there is no per-article metadata in the website shell and unknown paths redirect home. | Correct Urdu language/direction; implement page metadata, a useful 404, and a deliberate rendering/status-code plan. |
| P2 | Auth exists in Context and an effectively inactive Redux slice; signup still reads that slice. | Migrate the signup caller to the real auth context, then remove Redux if the caller audit confirms no remaining use. |
| P2 | Card/skeleton markup, category names, and request behavior are repeated; template CSS/assets remain. | Reuse small shared components and category data, then remove verified dead files/imports. |
| P2 | Mobile menu lacks complete keyboard/focus behavior; focus styling and meaningful image text are inconsistent. | Add focus management, Escape dismissal, focus restoration, named controls, active navigation, and meaningful alternatives. |

Important correction: sharing `https://api.96newshd.com/post/:id` is intentional in this codebase. The backend has an HTML social-preview endpoint that redirects readers to `https://96newshd.com/news/:id`. Preserve it until the website can provide equivalent previews; changing the copied URL alone could regress sharing.

## 2. Repository and application boundaries

Use the existing frontend Git repository as the repository for the main website. Keep its history. It contains the website source, assets, build/deployment configuration, checks, and documentation. No monorepo framework or shared package is needed for this work.

| Application | Hostname | Responsibility |
| --- | --- | --- |
| Website, this project | `www.96newshd.com` | News browsing, article reading, categories, search, live TV, policy pages. Reporter routes remain temporarily. |
| Shared API, future backend work | `api.96newshd.com` | Business logic, data access, authentication/authorization, publishing and membership APIs. |
| Admin, future separate application | `admin.96newshd.com` | Staff administration and eventually reporter workflows, with role-based access. |
| Profile application, separate project | `profile.96newshd.com` | Its existing profile-related experience; future changes connect through the shared API. |

Each client can consume one backend without sharing a repository or a login implementation. Replacing the API domain is not backend consolidation: contracts, authorization and client compatibility still need a later migration plan.

For this phase, retain React 19, Vite, React Router, Tailwind 4, Axios and HLS.js. Do not combine the redesign with a TypeScript conversion or a framework migration. Review rendering requirements early so SEO work does not get left to the end.

## 3. Implementation order and completion checks

### Step 0: remove the existing admin entry points

Implemented in this turn:

- Remove the `/admin/*`, `/admin/users`, and `/admin/paymentverify` route registrations and their page imports from `App.jsx`.
- Remove the Users/Payment Verify sidebar links and their now-unused icons from `PortalLayout.jsx`.
- Remove the unused `CheckAdmin` export after checking all its callers.
- Retain the two unimported admin page source files for the later admin-app migration. They are excluded from the website entry graph.
- Keep existing catch-all behavior: old admin URLs resolve to the home redirect. Do not redirect to an unbuilt external application.

Completion: production build succeeds; no remaining admin route registrations, internal admin navigation links, or `CheckAdmin` references. This changes website access only; it does not disable admin backend endpoints. It also means website payment verification/user management are unavailable until the replacement admin app is built.

Post-change verification: production build passed (1,301.68 kB JavaScript, 400.31 kB gzip); reference search found no remaining admin route/navigation/guard references outside the retained page files. Lint still fails with 15 existing errors and 5 warnings; this small removal introduced no new reported lint findings. Browser behavior was not exercised.

### Step 1: repair behavior before redesigning

Touch: `App.jsx`, auth/profile contexts, `ProtectedRoute.jsx`, `NewsPages.jsx`, `Home.jsx`, `SearchPage.jsx`, `PostPage.jsx`, `NewsSection.jsx`, and the shared API module. Check signup and all reporter callers before removing auth state.

- Decouple public rendering from auth; retain protection for existing reporter routes.
- Fix missing-profile handling and the `/portal` index destination after login.
- Fix pagination offsets, retry behavior, stale responses and stable article keys.
- Make excerpts plain text and define sanitized article rendering. A maintained sanitizer is justified here; do not invent a regex-based HTML sanitizer.
- Guard required response fields at the API boundary and report malformed responses without crashing the whole route.
- Add useful route-level failure handling and visible loading/empty/error states.
- Encode search parameters and distinguish the submitted query from the current input.

Completion: regression checks cover offset sequence 0/10/20 without duplicates, category switches during requests, API errors and retry, null profiles, malicious article attributes/URLs, and queries containing `&`/Urdu text. Public pages must not request auth/profile endpoints.

### Step 2: simplify code and delivery

Touch: public pages/components, route imports, `src/api`, Redux callers, styles, assets, package scripts/lockfiles, and the README.

- Keep one Axios transport; centralize list/detail/search functions and error behavior using the existing API directory.
- Use local state and scoped auth/profile context; remove Redux only after updating its remaining caller.
- Share one category definition and a small set of news card, image, skeleton and status components. Avoid a generic component framework.
- Lazy-load reporter routes and the editor. Load HLS only when a live player is activated.
- Prefer click-to-play on the homepage to avoid fetching the stream on every visit; preserve live TV on its dedicated route.
- Convert the Urdu font after checking license and complete Urdu glyph coverage. Size images appropriately, reserve their aspect ratios, and lazy-load only below-the-fold images.
- Remove template CSS/assets, unused request helpers and placeholders after searching references.
- Document setup and public environment values in `.env.example`; fail clearly when the required API URL is absent. Client environment values must never contain secrets.
- Select the package manager based on the actual deployment setup; make clean install, lint and build checks reproducible in CI.

Completion: zero lint errors, hook warnings addressed, reproducible build, no editor/admin modules on the public entry path, and a build report comparing font/JS sizes against the recorded baseline. Set performance budgets from mobile measurements rather than promising an unmeasured score.

### Step 3: redesign around Urdu news reading

Create desktop/mobile references for the homepage and article page first; then implement the same system across category, search, live and 404 pages.

- Identity: keep the current brand/logo and red accent, with white/off-white reading surfaces, charcoal text, thin dividers and restrained shadows. Use editorial hierarchy rather than making every story a large rounded card.
- Typography: test the existing Nastaliq font for Urdu headlines/body at actual mobile sizes, with enough line-height for glyphs; use a clean sans-serif for English controls and timestamps. Verify mixed-direction dates, numbers and names.
- Homepage: masthead and clear category navigation; one lead story with supporting headlines; compact latest-news list; category sections and an accessible live-TV entry. Do not label a story as breaking unless the API supplies that information.
- Article: headline, category, verified author/date fields, uncropped lead image where practical, readable article width, share action, and latest news. Do not claim related stories unless the data actually supports that relationship.
- Category/search: consistent cards, useful query/category headings, visible result/loading states, and reliable load-more behavior. Do not show category totals derived from the global count.
- Live: responsive player, explicit play/mute controls, stream status, failure/retry UI, and keyboard controls. Handle blocked autoplay and native Safari HLS.
- Shared shell: active navigation, a keyboard-accessible mobile menu, skip link, semantic main/article/aside landmarks, and a footer exposing existing policy/contact destinations.
- Motion: short transitions on interactive elements only; respect reduced-motion settings. No animation dependency or decorative scrolling effects needed.

Completion: all public templates reviewed at 360, 768 and 1440 px with real-length Urdu headlines; no clipping or horizontal overflow; keyboard navigation and menu focus work; content remains usable when images/API/stream fail.

### Step 4: SEO, compatibility and frontend release

Touch: `index.html`, article metadata/rendering, router/404 handling, `vercel.json`, public robots/sitemap assets or generation, and deployment documentation.

- Preserve `/news/:id`, `/page/:slug`, `/live`, `/search`, `/privacy-policy`, and existing reporter URLs. No article-slug migration in this phase.
- Choose one canonical public host and document redirects between apex and `www`; keep existing shared links valid.
- Add per-page titles/descriptions, canonical URLs and article social metadata; add NewsArticle structured data from real fields only.
- Decide how fresh article HTML/metadata reaches crawlers. Start by proving the existing preview bridge still works, then scope frontend server rendering or regularly refreshed prerendering if needed. This presentation layer still consumes the same business API; it does not become a second business backend.
- Do not treat client-side title changes as proof that social previews work. Inspect fetched HTML and test previews with a real published article.
- Add robots/sitemap handling only with a reliable source of published URLs; do not publish a sitemap containing only the latest ten articles.
- Show an actual not-found page for unknown routes and distinguish API failure from missing articles. True HTTP 404s require hosting/rendering support; the current universal SPA rewrite returns the shell.
- Test on a preview deployment against the current API before switching the production frontend. Verify API CORS for the deployment origin; record backend configuration needs without editing them in this phase.

Completion: lint/build/regression checks pass; direct article navigation and reload work; preview metadata is present in fetched HTML or the retained bridge; old shares still resolve; mobile and live-TV checks pass; rollback can restore the previous frontend deployment. Do not switch DNS or the API base URL as part of the refactor by assumption.

## 4. Current API compatibility and later backend dependencies

Reuse existing endpoints initially:

| Website operation | Current endpoint/response |
| --- | --- |
| Latest feed | `GET /api/getpost?skip=0&limit=10` → `{ posts, totalCount }` |
| Article | `GET /api/getpostbyid/:id` → `{ post, authorname }` |
| Search | `GET /api/search?query=...` → `{ success, results }` |
| Social preview | `GET /post/:id` → metadata HTML and reader redirect |

The inspected backend does not implement category filtering on the feed. During a frontend-only phase, advance through bounded global pages and track exhaustion using raw feed records, not matching category records. If a batch has no category matches but the feed continues, offer an explicit way to continue rather than declaring the category empty. Do not silently download the entire archive or fabricate a category total. Homepage category sections can only represent the fetched recent feed until the API supports better queries.

Record, but do not implement here: category-filtered pagination/counts, independent homepage category feeds, reliable article 404s, published-URL discovery for a complete sitemap, and cross-application authentication/CORS rules. These are release dependencies for a complete archive/SEO experience; a visual redesign cannot fix them by itself.

## 5. Minimal regression coverage

Add a small test setup when implementing the behavior fixes, not a broad testing-platform migration. Cover the state transitions that currently break:

1. Anonymous homepage renders even if auth is slow/unavailable; reporter routes remain protected.
2. Load more advances once; retry does not skip records; obsolete responses cannot overwrite a different category/article.
3. An empty category batch does not falsely signal archive exhaustion; no fake category total appears.
4. Article HTML cannot introduce executable handlers or unsafe links; excerpts render as text.
5. Search supports Urdu/special characters, loading, no matches, and API errors.
6. Old admin paths no longer expose admin screens; reporter publishing/profile/membership routes remain reachable.

Use browser/manual checks for mobile layout, menu focus, clipboard rejection, direct-route reloads, blocked autoplay, player teardown, unavailable streams and social previews. Keep fixtures small: representative list/detail/search responses, missing fields, hostile HTML and empty/error responses.

## 6. Reference constraints

- [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): discoverable links, page metadata, rendering and status-code handling need deliberate treatment.
- [Vite environment guidance](https://vite.dev/guide/env-and-mode): `VITE_*` values are bundled into the client; public API URLs are appropriate, credentials are not.
- [Browser autoplay guidance](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay): audible autoplay may be blocked; the player must remain usable with explicit user activation.

Deferred: shared-backend implementation, new admin/profile/mobile work, repository consolidation, new product features, TypeScript/framework migration, and production/DNS changes. Primary risks are breaking existing reporter/payment workflows, rendering untrusted article HTML, losing share previews, and promising complete category archives before the API supports them.
