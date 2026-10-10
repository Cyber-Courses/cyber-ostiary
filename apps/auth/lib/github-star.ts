import { randomUUID } from "node:crypto";

import { sql } from "drizzle-orm";

import { db } from "@ostiary/core/db/index";
import { rateLimit } from "@ostiary/core/db/schema";
import { e2eTestMode } from "@ostiary/core/lib/e2e-test-mode";
import { hasStarScope, parseStarRepos } from "@ostiary/core/lib/github-star";
import { enabledSocialProviders } from "@ostiary/core/lib/social-providers";
import { auth } from "@/lib/auth";

/*
 * Cyber Auth only (see FORK.md): server side of the one-click star (/star and /api/star).
 * The rules themselves (allowlists, CSRF token) are in packages/core/src/lib/github-star.ts.
 *
 * The member's GitHub token never leaves the server: it is read from their linked account,
 * sent to api.github.com only, and never logged or returned.
 */

/** The repositories that may be starred (STAR_PROJECT_REPOS, default Cyber-Courses/Cyber-Library). */
export function starRepos(): string[] {
  return parseStarRepos(process.env.STAR_PROJECT_REPOS);
}

/**
 * GitHub's REST API. The end-to-end suite (and local screenshots) may point it at a mock with
 * E2E_GITHUB_API_URL, honoured in test mode only (a loopback auth URL, see e2e-test-mode.ts).
 */
function githubApi(path: string): string {
  const mock = e2eTestMode() ? process.env.E2E_GITHUB_API_URL : undefined;
  return `${(mock || "https://api.github.com").replace(/\/$/, "")}${path}`;
}

function repoPath(repo: string): string {
  const [owner, name] = repo.split("/");
  return `${encodeURIComponent(owner!)}/${encodeURIComponent(name!)}`;
}

function githubHeaders(token?: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "cyber-auth-star",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Whether "Continue with GitHub" is configured (environment or admin console). */
export async function githubSignInEnabled(): Promise<boolean> {
  try {
    return (await enabledSocialProviders()).some((provider) => provider.id === "github");
  } catch {
    return false;
  }
}

export type RepoInfo = { fullName: string; description: string | null; stars: number | null; url: string };

/** Public details of the repository, for the confirmation card. Falls back to its name alone. */
export async function repoInfo(repo: string, token?: string): Promise<RepoInfo> {
  const fallback: RepoInfo = { fullName: repo, description: null, stars: null, url: `https://github.com/${repo}` };
  try {
    const res = await fetch(githubApi(`/repos/${repoPath(repo)}`), {
      headers: githubHeaders(token),
      signal: AbortSignal.timeout(5000),
      // With the member's token the answer is theirs: never cached. Without, an hour is plenty.
      ...(token ? { cache: "no-store" as const } : { next: { revalidate: 3600 } }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as {
      full_name?: unknown;
      description?: unknown;
      stargazers_count?: unknown;
      html_url?: unknown;
    };
    const url = typeof data.html_url === "string" && data.html_url.startsWith("https://github.com/") ? data.html_url : fallback.url;
    return {
      fullName: typeof data.full_name === "string" ? data.full_name : repo,
      description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : null,
      stars: typeof data.stargazers_count === "number" ? data.stargazers_count : null,
      url,
    };
  } catch {
    return fallback;
  }
}

export type GithubLink =
  | { linked: false }
  | { linked: true; accountId: string; canStar: boolean; scopeKnown: boolean };

/** The signed-in member's GitHub account (its local row id), and whether its token may star. */
export async function githubLink(headers: Headers): Promise<GithubLink> {
  try {
    const accounts = (await auth.api.listUserAccounts({ headers })) as {
      id: string;
      providerId: string;
      scopes?: string[];
    }[];
    const github = accounts.find((account) => account.providerId === "github");
    if (!github) return { linked: false };
    const scopes = github.scopes ?? [];
    // An account linked before scopes were stored has none recorded: try, and ask again on refusal.
    return {
      linked: true,
      accountId: github.id,
      canStar: scopes.length === 0 || hasStarScope(scopes),
      scopeKnown: scopes.length > 0,
    };
  } catch {
    return { linked: false };
  }
}

/** The member's GitHub access token (account selected by its local row id), or null. Never log it. */
export async function githubAccessToken(headers: Headers, accountId: string): Promise<string | null> {
  try {
    const res = (await auth.api.getAccessToken({ body: { accountId }, headers })) as {
      accessToken?: string;
    } | null;
    return res?.accessToken || null;
  } catch {
    return null;
  }
}

/** Whether the member already starred the repository: true, false, or null when GitHub did not say. */
export async function isStarred(repo: string, token: string): Promise<boolean | null> {
  try {
    const res = await fetch(githubApi(`/user/starred/${repoPath(repo)}`), {
      headers: githubHeaders(token),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 204) return true;
    if (res.status === 404) return false;
    return null;
  } catch {
    return null;
  }
}

export type StarOutcome = "starred" | "already" | "needs_permission" | "github_error";

/**
 * Stars the repository for the member: checks first (an existing star is reported as such),
 * then PUT /user/starred/{owner}/{repo}. Called only from POST /api/star, after the member
 * clicked the confirmation button.
 */
export async function starRepo(repo: string, token: string): Promise<StarOutcome> {
  if ((await isStarred(repo, token)) === true) return "already";
  try {
    const res = await fetch(githubApi(`/user/starred/${repoPath(repo)}`), {
      method: "PUT",
      headers: { ...githubHeaders(token), "Content-Length": "0" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 204 || res.status === 304) return "starred";
    // 401: token revoked; 403/404: no public_repo scope (GitHub answers 404 for that too).
    if (res.status === 401 || res.status === 403 || res.status === 404) return "needs_permission";
    return "github_error";
  } catch {
    return "github_error";
  }
}

/** At most this many star requests per member in {@link STAR_RATE_WINDOW_SECONDS}. */
export const STAR_RATE_MAX = 5;
export const STAR_RATE_WINDOW_SECONDS = 600;

/**
 * Counts a star request for the member in the shared `rate_limit` table (one counter for every
 * instance, like Better Auth's own limits) and says whether it is allowed. A fixed window: the
 * count restarts once the window since its first request has passed. Fails open when the
 * database is unreachable (the star itself needs GitHub and a session anyway).
 */
export async function takeStarRateLimit(userId: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const now = Date.now();
  const windowMs = STAR_RATE_WINDOW_SECONDS * 1000;
  const cutoff = now - windowMs;
  try {
    const [row] = await db
      .insert(rateLimit)
      .values({ id: randomUUID(), key: `star|user:${userId}`, count: 1, lastRequest: now })
      .onConflictDoUpdate({
        target: rateLimit.key,
        set: {
          count: sql`CASE WHEN ${rateLimit.lastRequest} < ${cutoff} THEN 1 ELSE ${rateLimit.count} + 1 END`,
          lastRequest: sql`CASE WHEN ${rateLimit.lastRequest} < ${cutoff} THEN ${now} ELSE ${rateLimit.lastRequest} END`,
        },
      })
      .returning({ count: rateLimit.count, lastRequest: rateLimit.lastRequest });
    if (!row || row.count <= STAR_RATE_MAX) return { allowed: true, retryAfter: 0 };
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((row.lastRequest + windowMs - now) / 1000)) };
  } catch (error) {
    console.error("[star] rate limit unavailable:", error instanceof Error ? error.message : "unknown error");
    return { allowed: true, retryAfter: 0 };
  }
}
