import { createHmac, timingSafeEqual } from "node:crypto";

import type { CyberProduct } from "@ostiary/core/lib/brand";

/*
 * Cyber Auth only (see FORK.md): the rules behind the one-click star page (/star) and its
 * endpoint (/api/star). Pure, no database and no network, so they can be unit tested.
 *
 * - Only repositories on an allowlist (STAR_PROJECT_REPOS) can be starred, so the endpoint
 *   cannot be pointed at an arbitrary repository.
 * - The page only sends people back to a Cyber family site, never to a URL from the request
 *   that is not on that list (no open redirect).
 * - The star request carries a token bound to the session and the repository (CSRF).
 */

/** Starred when STAR_PROJECT_REPOS is not set. */
export const DEFAULT_STAR_REPOS = "Cyber-Courses/Cyber-Library";

/** GitHub's owner and repository name rules, loosely: letters, digits, `-`, `_`, `.`. */
const REPO_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;

/**
 * The repositories that may be starred, from STAR_PROJECT_REPOS (comma or space separated
 * `owner/repo`). Malformed entries are dropped. Falls back to {@link DEFAULT_STAR_REPOS}
 * when the variable is unset or holds nothing valid.
 */
export function parseStarRepos(raw: string | undefined | null): string[] {
  const entries = (raw ?? "")
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter((entry) => REPO_PATTERN.test(entry) && !entry.endsWith(".") && !entry.includes(".."));
  const unique = entries.filter(
    (entry, i) => entries.findIndex((other) => other.toLowerCase() === entry.toLowerCase()) === i,
  );
  return unique.length ? unique : [DEFAULT_STAR_REPOS];
}

/**
 * The allowlist entry `raw` names (GitHub names are case-insensitive), or null. The entry is
 * returned as written in the allowlist, never the request's spelling.
 */
export function allowedStarRepo(raw: string | undefined | null, allowlist: readonly string[]): string | null {
  if (typeof raw !== "string") return null;
  const wanted = raw.trim().toLowerCase();
  if (!wanted || wanted.length > 140) return null;
  return allowlist.find((entry) => entry.toLowerCase() === wanted) ?? null;
}

/** A Cyber family site people can come back to. */
export type FamilySite = { host: string; name: string; product: CyberProduct | null };

/** Sites the star page may send people back to, by registrable domain. */
export const STAR_RETURN_SITES: readonly FamilySite[] = [
  { host: "cyberlibrary.com", name: "Cyber Library", product: "library" },
  { host: "cyberctf.org", name: "Cyber CTF", product: "ctf" },
  { host: "cybercourses.com", name: "Cyber Courses", product: "courses" },
  { host: "cyberbench.app", name: "Cyber Bench", product: "bench" },
  { host: "cyberexperts.io", name: "Cyber Experts", product: null },
];

/** C0 and C1 controls, DEL, the backslash and whitespace: refused anywhere in the URL. */
const UNSAFE_CHARACTERS = /[\u0000- \u007f-\u009f\\]/;

export type StarReturn = { url: string; site: FamilySite };

/**
 * Where "Back to ..." goes: `raw` when it is an https URL on a family site (the apex domain or
 * its `www.`), without credentials or an explicit port, otherwise null. Anything else, other
 * subdomains included, is refused. With `allowLocalhost` (development only), http://localhost
 * is accepted too, shown as the first family site.
 */
export function safeStarReturn(
  raw: string | undefined | null,
  { allowLocalhost = false }: { allowLocalhost?: boolean } = {},
): StarReturn | null {
  if (typeof raw !== "string" || !raw || raw.length > 2048 || UNSAFE_CHARACTERS.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.username || url.password) return null;
  if (allowLocalhost && url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    return { url: url.href, site: STAR_RETURN_SITES[0]! };
  }
  if (url.protocol !== "https:" || url.port) return null;
  const host = url.hostname.toLowerCase();
  const site = STAR_RETURN_SITES.find((s) => host === s.host || host === `www.${s.host}`);
  return site ? { url: url.href, site } : null;
}

/** Whether a linked GitHub account's granted scopes allow starring (`public_repo` or `repo`). */
export function hasStarScope(scopes: readonly string[] | string | null | undefined): boolean {
  const list = typeof scopes === "string" ? scopes.split(/[\s,]+/) : (scopes ?? []).flatMap((s) => s.split(/[\s,]+/));
  return list.some((scope) => scope === "public_repo" || scope === "repo");
}

const CSRF_PURPOSE = "cyber-auth:star:v1";

/**
 * The token the star page hands to its button and the endpoint checks: an HMAC of the
 * session and the repository, keyed with the auth secret. A page on another site cannot read
 * it, so it cannot make a signed-in browser star anything.
 */
export function starCsrfToken(secret: string, sessionId: string, repo: string): string {
  return createHmac("sha256", secret)
    .update(`${CSRF_PURPOSE}\n${sessionId}\n${repo.toLowerCase()}`)
    .digest("base64url");
}

/** Constant-time check of {@link starCsrfToken}. */
export function verifyStarCsrfToken(secret: string, sessionId: string, repo: string, token: unknown): boolean {
  if (typeof token !== "string" || token.length > 128) return false;
  const expected = Buffer.from(starCsrfToken(secret, sessionId, repo));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/**
 * Whether a POST comes from this app's own pages: the Origin header (or, without one, the
 * fetch metadata) must say same origin.
 */
export function isSameOriginRequest(headers: Headers, appOrigin: string): boolean {
  const origin = headers.get("origin");
  if (origin) return origin === appOrigin;
  return headers.get("sec-fetch-site") === "same-origin";
}
