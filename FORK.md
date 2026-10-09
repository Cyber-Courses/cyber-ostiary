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
| `apps/*/app/[locale]/layout.tsx`, `apps/*/app/providers.tsx` | Newsreader, Geist and Geist Mono; `data-product="library"` (silver); next-themes Dark, Black, Light |
| `apps/auth/components/auth/auth-screen.tsx`, `apps/auth/app/globals.css` | The lit family front door and the per-product tint |
| `apps/auth/lib/client-product.ts` + login, signup, consent and select-account pages | Tint for admin-registered Cyber clients (visual only) |
| `apps/auth/components/layout/status-screen.tsx`, `app/[locale]/not-found.tsx`, `[...rest]`, `error.tsx`, `loading.tsx` | Status pages |
| `apps/auth/components/dashboard/dashboard-shell.tsx`, `apps/admin/components/admin/admin-header.tsx` | Glass headers with the Preferences button |
| `apps/auth/lib/og.tsx`, `apps/auth/assets/fonts/` | Social card in the Cyber style, Newsreader and Geist `.woff` |
| `apps/auth/public/logo.*` | Generated from `brand.ts` with `pnpm --filter @ostiary/auth brand:assets` |
| `.npmrc`, `apps/*/vercel.json` | `@cyber-courses/ui` from GitHub Packages (`NPM_TOKEN`); webhook retries every 5 minutes (Pro plan) |
| `packages/core/src/lib/auth-factory.ts`, `apps/admin/app/[locale]/(console)/sso/actions.ts` | SSO domain verification prefix `cyber-auth`, so existing DNS records stay valid |

The design rules live in `DESIGN.md`.

## Configuration (Vercel)

Besides Ostiary's variables, Cyber Auth sets:

- `OAUTH_API_SCOPES=labs:publish,leads:write` (CyberBackend scopes). APIs and their scopes can
  now be managed in the admin console (APIs). Once these scopes are declared on their API
  there, this variable can be removed.
