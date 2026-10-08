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
| `packages/core/src/lib/brand.ts` | Name, copy, ecosystem chips, colors, the Key mark |
| `packages/core/src/components/brand/logo.tsx` | The Key mark has a stroked ring as well as a filled shape |
| `packages/core/src/styles/globals.css` | Neutral black and white tokens |
| `packages/core/src/lib/email/layout.ts` | Email colors and system font |
| `packages/core/messages/*.json` | `auth.screen` headline, subhead, footer and ecosystem copy |
| `apps/auth/app/[locale]/layout.tsx`, `apps/admin/app/[locale]/layout.tsx` | Geist instead of Instrument Sans and Serif |
| `apps/auth/components/auth/auth-screen.tsx` | The dot-grid brand panel instead of the doorway |
| `apps/auth/lib/og.tsx`, `apps/auth/assets/fonts/` | Social card in the Cyber style, Geist fonts |
| `apps/auth/public/logo.*` | Generated from `brand.ts` with `pnpm --filter @ostiary/auth brand:assets` |
| `packages/core/src/lib/auth-factory.ts`, `apps/admin/app/[locale]/(console)/sso/actions.ts` | SSO domain verification prefix `cyber-auth`, so existing DNS records stay valid |

## Configuration (Vercel)

Besides Ostiary's variables, Cyber Auth sets:

- `OAUTH_API_SCOPES=labs:publish,leads:write` (CyberBackend scopes)
