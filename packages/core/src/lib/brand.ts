/**
 * Product identity, in one place. Rebrand Ostiary by editing this file (and
 * `public/logo.*` via `pnpm --filter @ostiary/auth brand:assets`).
 *
 * Used where CSS variables can't reach: generated images (favicon, apple-icon,
 * Open Graph cards), emails, the web manifest and the browser `theme-color`.
 * The UI itself is themed by `styles/globals.css`.
 *
 * Cyber Auth: neutral black and white, no accent hue. The mark follows the Cyber
 * family grammar (see Cyber CTF / Cyber Bench): a 32-unit tile with an 8-unit
 * radius, one filled shape and one 2.25 stroke with round ends, ink on paper.
 */
export const brand = {
  /** Product name: wordmark, page titles, emails, social cards. */
  name: "Cyber Auth",
  /** Headline on the sign-in screens and the social card. */
  tagline: "One account for your whole security journey.",
  /** Part of the tagline set in the accent (must appear in `tagline`); empty for none. */
  taglineAccent: "",
  /** One sentence under the headline. */
  description: "Sign in once to reach your labs, courses and team dashboards across the Cyber ecosystem.",
  /**
   * Apps that sign in through this provider, shown as chips on the sign-in
   * screen and the social card. Leave empty to hide them.
   */
  ecosystem: ["Cyber CTF", "Cyber Courses", "Cyber Bench"] as readonly string[],
  /**
   * Neutral scale, no accent hue. The UI tokens in styles/globals.css use the same
   * values. `brass` is kept as a key for compatibility but is a neutral here.
   */
  colors: {
    /** Primary dark: text, the logo tile. */
    ink: "#171717",
    /** Light-mode ground. */
    bone: "#ffffff",
    paper: "#ffffff",
    /** Accent key (compat): ink, not gold. */
    brass: "#171717",
    /** Neutral for text and links on light grounds. */
    brassDeep: "#171717",
    /** Dark-mode surfaces and text. */
    night: "#000000",
    nightCard: "#0a0a0a",
    nightLine: "#262626",
    nightText: "#a1a1a1",
    nightBody: "#ededed",
    mist: "#ededed",
    graphite: "#666666",
    line: "#ebebeb",
  },
} as const;

/** Browser UI color (address bar, PWA title bar) per color scheme. */
export const themeColor = { light: brand.colors.paper, dark: brand.colors.night } as const;

/** The Key mark on a 32×32 grid: one key for every Cyber app (and a nod to passkeys). */
export const logoMark = {
  viewBox: "0 0 32 32",
  radius: 8,
  /** Filled shape: the shaft and two teeth. */
  path: "M15.75 14.9H25V20.2H22.4V17.1H20.2V19.4H18.2V17.1H15.75Z",
  /** Stroked shape: the key's ring (bow). */
  stroke: "M15.75 16a4.25 4.25 0 1 1-8.5 0 4.25 4.25 0 0 1 8.5 0Z",
  strokeWidth: 2.25,
} as const;

/** Standalone SVG markup of the mark, for image routes and exported files. */
export function logoMarkSvg({
  background = brand.colors.ink,
  foreground = brand.colors.paper,
  size = 32,
  radius = logoMark.radius,
}: {
  background?: string;
  foreground?: string;
  size?: number;
  /** Corner radius on the 32-unit grid; 0 for platforms that mask icons (iOS). */
  radius?: number;
} = {}) {
  const m = logoMark;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${m.viewBox}"><rect width="32" height="32" rx="${radius}" fill="${background}"/><path d="${m.path}" fill="${foreground}"/><path d="${m.stroke}" fill="none" stroke="${foreground}" stroke-width="${m.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
