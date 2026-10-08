import type { ReactNode } from "react";
import { FamilyChips, GlassMark, Mark } from "@cyber-courses/ui";
import { getTranslations } from "next-intl/server";

import { GlassKey, Logo } from "@ostiary/core/components/brand/logo";
import { Preferences } from "@ostiary/core/components/layout/preferences";
import { brand, cyberProducts, type CyberProduct } from "@ostiary/core/lib/brand";

/** "Cyber Library" with its last word in the jewel italic. */
function ProductName({ name }: { name: string }) {
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
 * The shared shell for every auth screen (login, signup, reset, consent...): the Cyber
 * family front door. A lit brand panel on the left (glow field, the glass Key, a serif
 * headline and the family chips) and the form on the right under a slim header with the
 * Preferences button. On small screens the brand panel collapses to the header wordmark.
 *
 * `product` (from an admin-registered Cyber client, see lib/client-product.ts) tints the
 * screen with that product's jewel and says where the sign-in continues.
 */
export async function AuthScreen({
  children,
  locale,
  product = null,
}: {
  children: ReactNode;
  locale: string;
  product?: CyberProduct | null;
}) {
  const t = await getTranslations({ locale, namespace: "auth.screen" });
  const productName = product ? cyberProducts[product].name : null;

  return (
    <div
      data-auth-product={product ?? undefined}
      className="relative grid min-h-svh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
    >
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-surface p-10 lg:flex xl:p-14">
        <div aria-hidden className="auth-glow" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          {product ? <GlassMark product={product} size={7.5} /> : <GlassKey className="size-32" />}
          <p className="cy-eyebrow mt-10">{t("eyebrow")}</p>
          <h1 className="mt-4 text-4xl xl:text-5xl">
            {productName
              ? t.rich("continueTo", {
                  name: productName,
                  product: () => <ProductName name={productName} />,
                })
              : t.rich("headline", { accent: (chunks) => <em>{chunks}</em> })}
          </h1>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            {productName ? t("continueLead") : t("subhead", { name: brand.name })}
          </p>
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
          <div className="w-full max-w-md min-w-0">
            {product && productName ? (
              <p className="mb-5 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:hidden">
                <Mark product={product} size={1.1} aria-hidden />
                {t("continueShort", { name: productName })}
              </p>
            ) : null}
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
