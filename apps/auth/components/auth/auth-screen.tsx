import type { CSSProperties, ReactNode } from "react";
import { FamilyChips, GlassMark, Mark } from "@cyber-courses/ui";
import { getTranslations } from "next-intl/server";

import { GlassKey, Logo } from "@ostiary/core/components/brand/logo";
import { Preferences } from "@ostiary/core/components/layout/preferences";
import { brand, cyberProducts, type CyberProduct } from "@ostiary/core/lib/brand";
import type { AuthScreenApp } from "@ostiary/core/lib/app-branding/store";
import { AppBrandHeader, type AppBrandIntent } from "@/components/auth/app-brand-header";

/** "Cyber Library" with its last word in the jewel italic. */
export function ProductName({ name }: { name: string }) {
  const i = name.lastIndexOf(" ");
  if (i < 0) return <em>{name}</em>;
  return (
    <>
      {name.slice(0, i + 1)}
      <em>{name.slice(i + 1)}</em>
    </>
  );
}

/**
 * The side panel's backdrop for an app with its own image: the image, darkened toward the
 * bottom so the headline and the identity provider's mark stay legible over it.
 */
function PanelImage({ src }: { src: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Same-origin route (see /api/app-branding); never the app's own server. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 size-full object-cover" decoding="async" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--background)_55%,transparent),color-mix(in_oklab,var(--background)_35%,transparent)_40%,var(--background)_95%)]" />
    </div>
  );
}

/**
 * The shared shell for every auth screen (login, signup, reset, consent...): the Cyber
 * family front door. A lit brand panel on the left (glow field, the glass Key, a serif
 * headline and the family chips) and the form on the right under a slim header with the
 * Preferences button. On small screens the brand panel collapses to the header wordmark.
 *
 * `product` (from an admin-registered Cyber client, see lib/client-product.ts) tints the
 * screen with that product's jewel and says where the sign-in continues.
 *
 * Any other app with branding (`app`, a verified app context, see lib/app-context.ts) gets
 * Ostiary's per-app treatment instead: the app header above the form, its accent through
 * `[data-app-brand]`, and its headline and image in the side panel. The Cyber Key, wordmark
 * and footer always stay, so people can tell where they are typing their password.
 *
 * `panel` replaces the side panel's eyebrow, headline and lead (the star page, which is not a
 * sign-in). The product tint and mark stay.
 */
export async function AuthScreen({
  children,
  locale,
  product = null,
  app: appContext = null,
  appIntent = "continue",
  panel = null,
}: {
  children: ReactNode;
  locale: string;
  product?: CyberProduct | null;
  app?: AuthScreenApp | null;
  /** Wording of the app header; "none" applies the colors only (the consent card names the app). */
  appIntent?: AppBrandIntent | "none";
  /** Side panel copy for a screen that is not a sign-in. */
  panel?: { eyebrow: ReactNode; title: ReactNode; lead: ReactNode } | null;
}) {
  const t = await getTranslations({ locale, namespace: "auth.screen" });
  const productName = product ? cyberProducts[product].name : null;
  // A Cyber product keeps the family look; per-app branding is for every other app.
  const app = product ? null : appContext;
  const panelText = app?.verified ? app.panelText : null;
  const panelImage = app?.verified ? app.panelImageUrl : null;
  const accent = app?.verified ? app.accent : null;

  return (
    <div
      data-auth-product={product ?? undefined}
      className="relative grid min-h-svh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
    >
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-surface p-10 lg:flex xl:p-14">
        {panelImage ? <PanelImage src={panelImage} /> : <div aria-hidden className="auth-glow" />}
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          {product ? <GlassMark product={product} size={7.5} /> : <GlassKey className="size-32" />}
          <p className="cy-eyebrow mt-10">{panel ? panel.eyebrow : t("eyebrow")}</p>
          <h1 data-testid={panelText ? "app-panel-text" : undefined} className="mt-4 text-4xl text-pretty xl:text-5xl">
            {panel ? (
              panel.title
            ) : panelText ? (
              <bdi>{panelText}</bdi>
            ) : productName
              ? t.rich("continueTo", {
                  name: productName,
                  product: () => <ProductName name={productName} />,
                })
              : t.rich("headline", { accent: (chunks) => <em>{chunks}</em> })}
          </h1>
          {panelText ? null : (
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
              {panel ? panel.lead : productName ? t("continueLead") : t("subhead", { name: brand.name })}
            </p>
          )}
          <FamilyChips className="mt-8" />
        </div>
        <p className="relative font-mono text-xs text-faint">{t("footer", { name: brand.name })}</p>
      </aside>

      {/* Form side */}
      <div className="relative flex min-w-0 flex-col">
        <header className="flex h-15 items-center justify-between gap-3 px-4 md:px-6">
          <span className="min-w-0 lg:invisible">
            <Logo />
          </span>
          <Preferences />
        </header>
        <main className="auth-main flex flex-1 justify-center px-4 pt-4 pb-10 sm:items-center md:px-10">
          <div
            className="w-full max-w-md min-w-0"
            data-app-brand={accent ? "accent" : app ? "plain" : undefined}
            style={accent ? (accent as CSSProperties) : undefined}
          >
            {product && productName && !panel ? (
              <p className="mb-5 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:hidden">
                <Mark product={product} size={1.1} aria-hidden />
                {t("continueShort", { name: productName })}
              </p>
            ) : null}
            {app && appIntent !== "none" ? <AppBrandHeader app={app} intent={appIntent} locale={locale} /> : null}
            {children}
          </div>
        </main>
        <footer className="flex justify-center px-4 pb-8 lg:hidden">
          <FamilyChips className="justify-center" />
        </footer>
      </div>
    </div>
  );
}
