# Public website: Next.js

The public app uses the Next.js App Router. News text, article metadata, topic listings, and search results render on the server using the single API at `https://api.96newshd.com`. Set `API_URL` for another backend; it is a server-only setting. The existing Vite `VITE_API_URL` is no longer used.

Run `bun run dev` from this directory. Production uses `bun run build` and `bun run start`. Vercel Root Directory is `main`, framework `nextjs`; no SPA rewrite or `dist` output setting is needed.

Every route has server-generated title, description, canonical URL, Open Graph and Twitter metadata. Articles include sanitized body HTML and NewsArticle JSON-LD, permanent Urdu slugs, and direct share links to the website. Requests using an article ID redirect permanently to its slug URL. Unknown topics/articles return 404; service errors remain errors rather than being labelled missing.

`/robots.txt` advertises `/sitemap.xml`. The sitemap fetches every published article and public tag using backend pagination. It does not include drafts, search results, paused livestream, or staff routes. Search and paused live pages are noindex. The sitemap deliberately fails if the API returns an incomplete feed or more than 50,000 URLs; split the sitemap before the site reaches that limit.

News requests use `no-store` so publishing changes appear on the next request. Existing fonts, Urdu layout, public route paths, and disabled livestream source are preserved. Pagination now uses crawlable links (`?page=2`) instead of client-only load-more state.

Tests cover sanitization, Urdu URLs, metadata/structured data escaping, API validation, crawl rules, and multi-page sitemap coverage. Browser visual verification is separate from these checks.
