/**
 * Product identity, in one place. Rebrand Ostiary by editing this file (and
 * `public/logo.*` via `pnpm --filter @ostiary/auth brand:assets`).
 *
 * Used where CSS variables can't reach: generated images (favicon, apple-icon,
 * Open Graph cards), emails, the web manifest and the browser `theme-color`.
 * The UI itself is themed by `styles/globals.css` on top of the Cyber design
 * system (@cyber-courses/ui tokens).
 *
 * Cyber Auth is the front door of the Cyber family: a neutral silver identity
 * with the family Key mark. When a sign-in comes from a known Cyber product,
 * the auth screens take that product's jewel (see `cyberProducts`).
 */
export const brand = {
  /** Product name: wordmark, page titles, emails, social cards. */
  name: "Cyber Auth",
  /** Headline on the sign-in screens and the social card. */
  tagline: "One account for your whole security journey.",
  /** Part of the tagline set in the accent (must appear in `tagline`); empty for none. */
  taglineAccent: "journey",
  /** One sentence under the headline. */
  description: "Sign in once to reach your labs, courses, team dashboards and library across the Cyber family.",
  /**
   * Apps that sign in through this provider, shown on the social card. Leave empty to
   * hide them. The auth screens show the design system's family chips instead.
   */
  ecosystem: ["Cyber CTF", "Cyber Courses", "Cyber Bench", "Cyber Library"] as readonly string[],
  /**
   * Cyber design system values (Dark mode, silver jewel). The UI tokens come from
   * @cyber-courses/ui; these mirror them for images and emails.
   */
  colors: {
    /** Dark ground and surfaces. */
    background: "#09090b",
    card: "#111114",
    card2: "#17171b",
    foreground: "#f4f4f6",
    muted: "#a0a0ab",
    faint: "#64646f",
    /** Silver jewel (the family's neutral). */
    jewel: "#d4d4d8",
    jewelText: "#e4e4e7",
    jewelRgb: "212, 212, 216",
    emeraldRgb: "52, 211, 153",
    amethystRgb: "167, 139, 250",
    sapphireRgb: "96, 165, 250",
    /** Light mode ground (Paper). */
    paper: "#fafaf9",
    ink: "#0c0c10",
    /* Compatibility keys used by emails and older callers. */
    bone: "#fafaf9",
    brass: "#d4d4d8",
    brassDeep: "#3f3f46",
    night: "#09090b",
    nightCard: "#111114",
    nightLine: "#26262b",
    nightText: "#a0a0ab",
    nightBody: "#f4f4f6",
    mist: "#f4f4f6",
    graphite: "#5c5c66",
    line: "#e7e7e4",
  },
} as const;

/** Browser UI color (address bar, PWA title bar) per color scheme. Dark is the default mode. */
export const themeColor = { light: brand.colors.paper, dark: brand.colors.background } as const;

/**
 * The Cyber products that sign in here. A sign-in or consent request from one of them
 * (matched by client id, or by the host of the client's registered redirect URIs) tints the
 * auth screens with the product's jewel. Only admin-registered clients qualify.
 */
export type CyberProduct = "ctf" | "courses" | "bench" | "library";

export const cyberProducts: Record<CyberProduct, { name: string; clientIds: readonly string[]; hosts: readonly string[] }> = {
  ctf: { name: "Cyber CTF", clientIds: ["cyber-ctf", "cyberctf"], hosts: ["cyberctf.org"] },
  courses: { name: "Cyber Courses", clientIds: ["cyber-courses", "cybercourses"], hosts: ["cybercourses.com"] },
  bench: { name: "Cyber Bench", clientIds: ["cyber-bench", "cyberbench"], hosts: ["cyberbench.app"] },
  library: { name: "Cyber Library", clientIds: ["cyber-library", "cyberlibrary"], hosts: ["cyberlibrary.com"] },
};

/** The product a client id or redirect host belongs to, or null. */
export function cyberProductFor(clientId: string, hosts: readonly string[] = []): CyberProduct | null {
  const entries = Object.entries(cyberProducts) as [CyberProduct, (typeof cyberProducts)[CyberProduct]][];
  const id = clientId.toLowerCase();
  for (const [product, p] of entries) if (p.clientIds.includes(id)) return product;
  for (const host of hosts) {
    const h = host.toLowerCase();
    for (const [product, p] of entries) if (p.hosts.some((d) => h === d || h.endsWith(`.${d}`))) return product;
  }
  return null;
}

/**
 * The family Key mark, filled, on a 32-unit grid: a ring (bow) and a shaft with two teeth.
 * Nonzero winding keeps the ring's hole open where the shaft joins it.
 */
export const keyMark = {
  /** Tight frame around the key. */
  viewBox: "4.6 7.2 22.4 18",
  path: "M6.125 16a5.375 5.375 0 1 1 10.75 0a5.375 5.375 0 1 1-10.75 0Z M8.375 16a3.125 3.125 0 1 0 6.25 0a3.125 3.125 0 1 0-6.25 0Z M16.5 14.9H25.5V20.4H22.8V17.1H20.6V19.6H18.4V17.1H16.5Z",
  /** Offset of the deep base layer under the top layer (two-layer flat mark). */
  baseOffset: 1.6,
} as const;

/** Kept for callers of the previous mark API (32-unit tile). */
export const logoMark = {
  viewBox: "0 0 32 32",
  radius: 8,
  path: keyMark.path,
} as const;

/** Glass Key colors: lit silver top layer, deep graphite base, soft silver glow. */
const GLASS_KEY = { a: ["#ffffff", "#d4d4d8", "#8c8c96"], b: ["#71717a", "#18181b"], glow: "#a1a1aa" } as const;

/**
 * The Key as a lit glass object (gradient top layer with a white edge over a deep base), as
 * SVG markup for a 32-unit grid. `uid` keeps gradient ids unique in one document.
 */
function glassKeyLayers(uid: string, { glow = true }: { glow?: boolean } = {}) {
  const g = GLASS_KEY;
  const k = keyMark;
  return `<defs><linearGradient id="${uid}a" x1="0" y1="10" x2="0" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${g.a[0]}"/><stop offset=".55" stop-color="${g.a[1]}"/><stop offset="1" stop-color="${g.a[2]}"/></linearGradient><linearGradient id="${uid}b" x1="0" y1="11" x2="0" y2="23" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${g.b[0]}"/><stop offset="1" stop-color="${g.b[1]}"/></linearGradient><linearGradient id="${uid}e" x1="0" y1="10" x2="0" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".5" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>${glow ? `<filter id="${uid}f" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.6"/></filter>` : ""}</defs>${glow ? `<path d="${k.path}" fill="${g.glow}" opacity=".45" filter="url(#${uid}f)" transform="translate(0 2.2)"/>` : ""}<path d="${k.path}" fill="url(#${uid}b)" transform="translate(0 ${k.baseOffset})"/><path d="${k.path}" fill="url(#${uid}a)" opacity=".96"/><path d="${k.path}" fill="none" stroke="url(#${uid}e)" stroke-width=".28"/>`;
}

/**
 * App icon: the glass Key on a dark tile with a silver-tinted gradient and a 1px white/12%
 * edge, as standalone SVG markup (favicon, apple-icon, `public/logo.*`, emails).
 */
export function logoMarkSvg({
  size = 32,
  radius = logoMark.radius,
}: {
  /** Kept for compatibility; the tile is always the dark family tile. */
  background?: string;
  /** Kept for compatibility. */
  foreground?: string;
  size?: number;
  /** Corner radius on the 32-unit grid; 0 for platforms that mask icons (iOS). */
  radius?: number;
} = {}) {
  const r = radius;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#26262c"/><stop offset="1" stop-color="#0b0b0d"/></linearGradient><radialGradient id="l" cx="16" cy="13" r="15" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d4d4d8" stop-opacity=".22"/><stop offset="1" stop-color="#d4d4d8" stop-opacity="0"/></radialGradient></defs><rect width="32" height="32" rx="${r}" fill="url(#t)"/><rect width="32" height="32" rx="${r}" fill="url(#l)"/><rect x=".5" y=".5" width="31" height="31" rx="${Math.max(r - 0.5, 0)}" fill="none" stroke="#fff" stroke-opacity=".12"/><g transform="translate(16 15.2) scale(.92) translate(-15.8 -16)">${glassKeyLayers("k")}</g></svg>`;
}

/** The glass Key alone (no tile), sized for OG cards and hero use. */
export function glassKeySvg(size = 360, uid = "gk") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="3.8 4.6 24 24">${glassKeyLayers(uid)}</svg>`;
}
