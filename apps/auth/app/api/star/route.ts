import { NextResponse } from "next/server";

import { recordAudit } from "@ostiary/core/lib/audit";
import { clientIp } from "@ostiary/core/lib/auth-events";
import { env } from "@ostiary/core/lib/env";
import { allowedStarRepo, isSameOriginRequest, verifyStarCsrfToken } from "@ostiary/core/lib/github-star";
import { auth } from "@/lib/auth";
import {
  githubAccessToken,
  githubLink,
  githubSignInEnabled,
  starRepo,
  starRepos,
  takeStarRateLimit,
} from "@/lib/github-star";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Cyber Auth only (see FORK.md). Stars an allowlisted repository for the signed-in member with
 * their linked GitHub account. Only the confirmation button of /star calls it, after an
 * explicit click: never on sign-in, never in the background.
 *
 * Checks, in order: same origin, session, allowlisted repository, CSRF token (bound to the
 * session and the repository), rate limit, linked GitHub account. The GitHub token never
 * appears in a response or a log line.
 */

function json(body: Record<string, unknown>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function appOrigin(request: Request): string {
  const configured = env.AUTH_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  try {
    if (configured) return new URL(configured).origin;
  } catch {
    // Fall through to the request's own origin.
  }
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request.headers, appOrigin(request))) {
    return json({ error: "forbidden" }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "unsupported_media_type" }, 415);
  }
  if (!(await githubSignInEnabled())) {
    return json({ error: "unavailable" }, 503);
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return json({ error: "unauthenticated" }, 401);

  let body: { repo?: unknown; csrf?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const repo = allowedStarRepo(typeof body.repo === "string" ? body.repo : null, starRepos());
  if (!repo) return json({ error: "repo_not_allowed" }, 400);
  if (!verifyStarCsrfToken(env.BETTER_AUTH_SECRET, session.session.id, repo, body.csrf)) {
    return json({ error: "forbidden" }, 403);
  }

  const limit = await takeStarRateLimit(session.user.id);
  if (!limit.allowed) {
    return json({ error: "rate_limited", retryAfter: limit.retryAfter }, 429, { "Retry-After": String(limit.retryAfter) });
  }

  const link = await githubLink(request.headers);
  const token = link.linked ? await githubAccessToken(request.headers, link.accountId) : null;
  if (!token) return json({ error: "github_not_linked" }, 409);

  const outcome = await starRepo(repo, token);
  // Who starred what and how it went. Never the token.
  console.info(`[star] user=${session.user.id} repo=${repo} outcome=${outcome}`);
  if (outcome === "starred" || outcome === "already") {
    await recordAudit({
      actor: { id: session.user.id, email: session.user.email },
      action: "github.star",
      target: { type: "github_repo", id: repo, label: repo },
      metadata: { outcome },
      ipAddress: clientIp(request.headers),
    });
    return json({ status: outcome, repo });
  }
  if (outcome === "needs_permission") return json({ error: "needs_permission" }, 403);
  return json({ error: "github_error" }, 502);
}
