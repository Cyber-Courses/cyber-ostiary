# Cyber Auth design

Cyber Auth uses the Cyber design system ("lit from within"), package `@cyber-courses/ui`
(source: Cyber-Courses/Cyber-UI). This file says how it is wired here.

## Files

- `packages/core/src/styles/globals.css` imports the package `tokens.css` and `components.css`,
  maps the remaining shadcn tokens and dresses the shadcn components through their `data-slot`
  attributes (pills, panels, glass overlays, glass inputs, mono badges and table heads). The
  component files stay as Ostiary ships them.
- `apps/auth/app/globals.css` adds the auth brand panel glow and the product tint.
- `packages/core/src/lib/brand.ts` holds the Key mark geometry, the icon and OG markup and the
  list of Cyber products.

## Identity

- Modes: Dark (default), Black and Light, via next-themes classes and `data-mode` on `<html>`.
- `<html data-product="library">`: the silver jewel is the family's neutral.
- Type: Newsreader headlines at 350 with one italic word in the jewel (`<em>` in h1 and h2),
  Geist for UI, Geist Mono for data and eyebrows (`cy-eyebrow`).
- Mark: the family Key, flat two-layer in the header, glass on the auth brand panel, glass on a
  dark tile for the favicon and app icon.
- One Preferences button (theme swatches and language) in every header.

## Product tint

A sign-in, sign-up, consent or account choice for an admin-registered client of a Cyber
product (matched by client id, or by the hosts of its registered redirect URIs) wraps the
screen in `data-auth-product`, which swaps in that product's jewel and glass mark and says
"Continue to Cyber ...". Self-registered clients never get a tint. It is visual only.

## Rules

- Tokens only in TSX: no raw palette classes, no hex outside `brand.ts`, icons and OG.
- rem everywhere; px only for hairlines.
- No em or en dashes in copy, comments or commits.
