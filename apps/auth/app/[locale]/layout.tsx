import type { Metadata, Viewport } from "next";
import { brand } from "@ostiary/core/lib/brand";

import { themeColor } from "@ostiary/core/lib/brand";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Providers } from "@/app/providers";
import { APP_TIME_ZONE } from "@ostiary/core/i18n/constants";
import { getHtmlLang, isRtlLocale } from "@ostiary/core/i18n/locale-html";
import { locales, routing, type AppLocale } from "@ostiary/core/i18n/routing";
import { getBaseURL } from "@ostiary/core/lib/url";
import { cn } from "@ostiary/core/lib/utils";

import "../globals.css";


/* The Cyber family typefaces: Newsreader headlines, Geist UI, Geist Mono data. */
const newsreader = Newsreader({
  variable: "--font-brand-heading",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-brand-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-brand-mono",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });
  const base = getBaseURL();
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${base}/${l}`]),
  ) as Record<string, string>;

  return {
    metadataBase: new URL(`${base.endsWith("/") ? base.slice(0, -1) : base}/`),
    title: {
      default: t("title"),
      template: `%s | ${brand.name}`,
    },
    description: t("description"),
    alternates: {
      languages,
    },
    applicationName: brand.name,
    openGraph: {
      type: "website",
      siteName: brand.name,
      title: brand.name,
      description: brand.tagline,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: brand.name,
      description: brand.tagline,
    },
  };
}

export const viewport: Viewport = {
  // Dark is the default mode whatever the system prefers.
  themeColor: themeColor.dark,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const appLocale = locale as AppLocale;
  const htmlLang = getHtmlLang(appLocale);
  const dir = isRtlLocale(appLocale) ? "rtl" : "ltr";

  return (
    <html
      lang={htmlLang}
      dir={dir}
      suppressHydrationWarning
      data-product="library"
      className={cn(
        "h-full",
        "antialiased",
        newsreader.variable,
        geistSans.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone={APP_TIME_ZONE}
        >
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
