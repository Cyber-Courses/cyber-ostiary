# SEO — cyberauth.co

Tier: auto · Next review: 2026-12-18 · Data: seo-ops/data/2026-11-18/sites.json

Repo: [Cyber-Courses/cyber-ostiary](https://github.com/Cyber-Courses/cyber-ostiary), app in `apps/auth`, Vercel project `cyber-auth`. Cyber Auth is the sign-in service (Ostiary, Better Auth) for the portfolio's apps. `https://www.cyberauth.co/` redirects to `/en` and then to `/en/login`.

## Baseline

| Date | Google clicks 28d | Google clicks 90d | Google impr 90d | Google pos 90d | Bing clicks 30d | Bing clicks 90d | Bing pages in index | Vercel visitors 30d | Search visitors 30d | Direct share | Events 30d (total) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-18 | 1 | 3 | 56 | 13.9 | 1 | 1 | 37 | 0 | 0 | – | 0 |

Vercel shows 0 visitors because Web Analytics is opt-in in this app (#28) and does not report for this project; 0 does not mean no users.

## Where traffic comes from

- **Brand navigation only.** Google: `cyberauth` 22 impressions, 1 click, pos 6.2; all 3 clicks in 90 days land on `/`. Other impressions are people looking for other products' logins (`cyberhoot login`, `cyberhealth login`, `cyberimpact login`), at positions 7–60. Bing: `cyberauth` 29 impressions, 1 click, pos 3.8; pages `/` and `/en/signup`.
- **Users arrive from the apps that use it,** not from search. That traffic isn't visible here.

## Diagnosis

- **This is a login service, not a content site.** Its only search job is to come up first for `cyberauth` so people can find the sign-in page. It does: pos 3.8 on Bing, 6.2 on Google, with a tiny volume.
- **The audit flags ("no canonical on home", "sitemap missing") don't matter here.** The home is a redirect chain to `/en/login`, which has a title ("Sign in") and a description. A sitemap of login, signup and locale variants would only invite crawlers to index more form pages.
- **Locale variants of the login page leak into the index** (`/pl`, `/hi`, `/fi`, `/cn`, `/es` got single impressions). Harmless at this volume.
- **No SEO work is worth doing this month.** Nothing shipped.

## Plan (next 30 days)

No site changes.

1. **Keep the brand query on top.** Metric: position for `cyberauth` (Google 6.2, Bing 3.8). Judge on 2026-12-18: Google at 6 or better, Bing at 4 or better. If Google slips past 10, give `/en/login` a title that names the product ("Sign in to Cyber Auth") in the next cycle.
2. **Turn analytics on if the owner wants usage numbers.** Metric: Vercel visitors (0). Judge on 2026-12-18: nonzero only if the opt-in env var was set; otherwise drop this column for this site.

## Waiting on the owner

- Decide whether Vercel Web Analytics should be enabled for `cyber-auth` (#28 made it opt-in by env var). It only matters for usage reporting, not SEO.

## Changelog

- 2026-11-02 — Next.js 16.4.3 security upgrade (no SEO change) — https://github.com/Cyber-Courses/cyber-ostiary/commit/db49402
- 2026-10-10 — One-click GitHub star through Cyber Auth (feature, no SEO change) — https://github.com/Cyber-Courses/cyber-ostiary/pull/4
- 2026-10-09 — Opt-in Vercel Web Analytics (analytics) — https://github.com/Cyber-Courses/cyber-ostiary/commit/12fff93
- 2026-10-09 — Translations finished for all locales, including admin strings (locale pages) — https://github.com/Cyber-Courses/cyber-ostiary/commit/f6b3067
- 2026-10-08 — Cyber Auth redesign in the Cyber design system (branding of the sign-in pages) — https://github.com/Cyber-Courses/cyber-ostiary/pull/3
- 2026-10-08 — Cyber Auth theme on top of Ostiary (launch of cyberauth.co) — https://github.com/Cyber-Courses/cyber-ostiary/pull/1

## Review log

- 2026-11-18 — baseline written
