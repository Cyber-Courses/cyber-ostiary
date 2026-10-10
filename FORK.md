# Cyber Auth fork of Ostiary

This repository is Cyber Auth: [Ostiary](https://github.com/florianamette/ostiary) with the
Cyber brand. Fixes and features go to Ostiary first, then come here with a merge:

```bash
git remote add upstream git@github.com:florianamette/ostiary.git   # once
git fetch upstream
git merge upstream/main
```

The repository is public. Secrets live in the Vercel environment variables, never in the code.

## Files that differ from Ostiary

Keep this list short: anything that is not branding belongs upstream.

| File | Why |
| --- | --- |
| `packages/core/src/lib/brand.ts` | Name, copy, the family Key mark (flat and glass), the Cyber products for the client tint |
| `packages/core/src/components/brand/logo.tsx` | Two-layer Key mark, glass Key, wordmark |
| `packages/core/src/styles/globals.css` | Cyber design system (@cyber-courses/ui tokens) and the shadcn components dressed through `data-slot` |
| `packages/core/src/components/layout/preferences.tsx`, `preferences-menu-items.tsx` | One Preferences button; Dark, Black and Light themes |
| `packages/core/src/lib/email/layout.ts` | Email colors and system font |
| `packages/core/messages/*.json` | `auth.screen` copy, preferences, 404 strings |
| `packages/core/src/components/layout/locale-layout.tsx`, `packages/core/src/components/providers.tsx` | Newsreader, Geist and Geist Mono; `data-product="library"` (silver); next-themes Dark, Black, Light. The apps' `[locale]/layout.tsx` stay Ostiary's thin wrappers, except the auth one's dark `themeColor` |
| `apps/auth/components/auth/auth-screen.tsx`, `apps/auth/app/globals.css` | The lit family front door and the per-product tint |
| `apps/auth/lib/client-product.ts` + login, signup, consent and select-account pages | Tint for admin-registered Cyber clients (visual only); a Cyber product's screen keeps the family look, so Ostiary's per-app branding (`app`) applies to every other app |
| `apps/auth/components/layout/status-screen.tsx`, `app/[locale]/not-found.tsx`, `[...rest]`, `error.tsx`, `loading.tsx` | Status pages (the auth app keeps its own `error.tsx` and `loading.tsx`; the admin console uses `packages/core/src/components/layout/locale-error.tsx`, with a Newsreader heading) |
| `apps/auth/components/dashboard/dashboard-shell.tsx`, `apps/admin/components/admin/admin-header.tsx` | Glass headers with the Preferences button |
| `apps/auth/lib/og.tsx`, `apps/auth/assets/fonts/` | Social card in the Cyber style, Newsreader and Geist `.woff` |
| `apps/auth/public/logo.*` | Generated from `brand.ts` with `pnpm --filter @ostiary/auth brand:assets` |
| `.npmrc`, `apps/*/vercel.json` | `@cyber-courses/ui` from GitHub Packages (`NPM_TOKEN`); webhook retries every 5 minutes (Pro plan) |
| `packages/core/src/lib/security/sso-domain.ts` | SSO domain verification prefix `cyber-auth` (`SSO_DOMAIN_TOKEN_PREFIX`), so existing DNS records stay valid |
| `apps/auth/app/[locale]/star/`, `apps/auth/app/api/star/`, `apps/auth/components/auth/star-flow.tsx`, `apps/auth/lib/github-star.ts`, `packages/core/src/lib/github-star.ts` (+ test), the `star` messages | One-click star of a Cyber repository, see below. `auth-screen.tsx` takes a `panel` for it |

The design rules live in `DESIGN.md`.

## Configuration (Vercel)

Besides Ostiary's variables, Cyber Auth sets:

- `OAUTH_API_SCOPES=labs:publish,leads:write` (CyberBackend scopes). APIs and their scopes can
  now be managed in the admin console (APIs). Once these scopes are declared on their API
  there, this variable can be removed.

## One-click star

Readers of a Cyber site can star a Cyber repository on GitHub through Cyber Auth:

```
https://www.cyberauth.co/<locale>/star?repo=Cyber-Courses/Cyber-Library&return=<page on a Cyber site>
```

1. Signed out: "Sign in to continue" (back to this page afterwards), or the plain GitHub link.
2. GitHub not connected, or connected without `public_repo`: "Connect GitHub" links the account
   with that extra scope only (`linkSocial`, needs a sign-in from the last 10 minutes like every
   connection). The card says why the scope is needed. Sign-in with GitHub keeps the default
   scopes (`read:user`, `user:email`).
3. A confirmation card with the repository's name, description and stars, and a
   "Star Cyber-Courses/Cyber-Library" button. Nothing is starred before that click: not on load,
   not on sign-in, not on the way back from GitHub.
4. The click posts to `/api/star`, which checks the origin, the session, the repository against
   the allowlist, a CSRF token bound to the session and the repository, and a rate limit (5 per
   member per 10 minutes, in the `rate_limit` table). It asks GitHub whether the repository is
   already starred (`GET /user/starred/{owner}/{repo}`), stars it otherwise (`PUT`), and logs
   `[star] user=... repo=... outcome=...` plus an audit entry `github.star`. The token is never
   logged or returned.
5. "Thank you" (or "already starred") and "Back to Cyber Library".

Starring is optional and unlocks nothing (GitHub Acceptable Use Policies). `return` is followed
only to `https://` on cyberlibrary.com, cyberctf.org, cybercourses.com, cyberbench.app or
cyberexperts.io (apex or `www.`); otherwise the page shows no back button. Without GitHub sign-in
configured, the page shows the plain "Open on GitHub" link instead.

### Setup (once)

1. GitHub, Cyber-Courses organization, Settings, Developer settings, OAuth Apps, New OAuth App
   (or reuse the one behind "Continue with GitHub"):
   - Homepage URL: `https://www.cyberauth.co`
   - Authorization callback URL: `https://www.cyberauth.co/api/auth/callback/github`
2. Vercel, project `cyber-auth`, Settings, Environment Variables (Production and Preview):
   - `GITHUB_CLIENT_ID` = the OAuth App's client ID
   - `GITHUB_CLIENT_SECRET` = a client secret generated on that page
   - `STAR_PROJECT_REPOS` = `Cyber-Courses/Cyber-Library` (comma-separated `owner/repo`; that is
     also the default)
   Set the two GitHub variables on the admin project too, so the console shows the provider.
   GitHub can also be configured in the admin console (Sign-in providers) instead of the two
   variables; the star page works with either.
3. Redeploy `cyber-auth`.

Local tests: with `E2E_TEST_MODE=true` and a loopback `AUTH_APP_URL`, `E2E_GITHUB_API_URL`
points the GitHub API calls at a mock.
