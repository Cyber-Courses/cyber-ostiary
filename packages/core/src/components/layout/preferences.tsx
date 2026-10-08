"use client";

import { PreferencesMenu, type Mode } from "@cyber-courses/ui";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { usePathname, useRouter } from "@ostiary/core/i18n/navigation";
import { locales, type AppLocale } from "@ostiary/core/i18n/routing";

/**
 * The one Preferences button of the Cyber design system (@cyber-courses/ui PreferencesMenu):
 * theme swatches (Dark, Black, Light) wired to next-themes, and the language, which keeps
 * the current path and query.
 */
export function Preferences({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const tCommon = useTranslations("common");
  const tLocaleNames = useTranslations("common.localeNames");
  const tTheme = useTranslations("admin.themeToggle");
  // The panel only renders once opened (client side), so the stored theme is known by then.
  const mode: Mode = theme === "black" || theme === "light" ? theme : "dark";

  return (
    <PreferencesMenu
      className={className}
      mode={mode}
      onModeChange={setTheme}
      modeLabels={{ dark: tTheme("dark"), black: tTheme("black"), light: tTheme("light") }}
      locale={locale}
      locales={locales.map((l) => ({ value: l, label: tLocaleNames(l) }))}
      onLocaleChange={(next) => {
        if (next === locale) return;
        const query = typeof window === "undefined" ? "" : window.location.search;
        router.replace(`${pathname}${query}`, { locale: next as AppLocale });
      }}
      labels={{ button: tCommon("preferences"), theme: tCommon("theme"), language: tCommon("language") }}
    />
  );
}
