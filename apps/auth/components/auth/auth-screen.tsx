import type { ReactNode } from "react";

import { Logo } from "@ostiary/core/components/brand/logo";
import { brand } from "@ostiary/core/lib/brand";
import { LocaleSwitcher } from "@ostiary/core/components/layout/locale-switcher";
import { ThemeToggle } from "@ostiary/core/components/theme-toggle";
import { getTranslations } from "next-intl/server";

/** Faint dot grid, masked to a soft glow, the Cyber family hero background, dependency-free. */
function DotField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full [mask-image:radial-gradient(520px_circle_at_30%_40%,black,transparent)]">
        <defs>
          <pattern id="auth-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className="fill-foreground/[0.14]" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-dots)" />
      </svg>
    </div>
  );
}

/**
 * The shared shell for every auth screen (login, signup, reset, consent…):
 * a brand panel on the left and the form on the right, with the theme and
 * locale controls in the form panel's top-right corner. On small screens the brand panel collapses
 * to the wordmark above the form.
 */
export async function AuthScreen({ children, locale }: { children: ReactNode; locale: string }) {
  const t = await getTranslations({ locale, namespace: "auth.screen" });
  const ecosystem = brand.ecosystem;

  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">

      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-card p-10 lg:flex xl:p-14">
        <DotField />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tighter text-balance xl:text-4xl">
            {t.rich("headline", {
              accent: (chunks) => <span className="text-serif-accent text-brass">{chunks}</span>,
            })}
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{t("subhead", { name: brand.name })}</p>
          {ecosystem.length ? (
            <ul className="mt-8 flex flex-wrap gap-2">
              {ecosystem.map((name) => (
                <li key={name} className="rounded-full border bg-background/60 px-3 py-1 text-[13px] text-muted-foreground">
                  {name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <p className="relative text-xs text-muted-foreground">{t("footer", { name: brand.name })}</p>
      </aside>

      {/* Form side */}
      <div className="relative flex items-center justify-center p-6 pt-20 md:p-10 md:pt-20">
        {/* Page header controls: part of the layout, not a floating overlay. */}
        <div className="absolute right-4 top-4 flex items-center gap-2 md:right-6 md:top-6">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
        <main className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
