"use client";

import * as React from "react";
import { ArrowLeft, Check, ExternalLink, Info, Loader2, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@ostiary/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ostiary/core/components/ui/card";
import { SocialProviderIcon } from "@ostiary/core/components/brand/social-provider-icon";
import { addAccountHref } from "@ostiary/core/lib/device-accounts";
import { authClient } from "@/lib/auth-client";
import { needsRecentSignIn } from "@/lib/sign-in-again";

/*
 * Cyber Auth only (see FORK.md). The one-click star card (/star). Every star is an explicit
 * click on the confirmation button: this component never stars on mount, on sign-in or on
 * return from GitHub.
 */

export type StarState =
  | "notAllowed"
  | "unavailable"
  | "signedOut"
  | "connect"
  | "grant"
  | "confirm"
  | "already";

type Repo = { fullName: string; description: string | null; stars: number | null; url: string };

/** The permission starring needs, asked for when GitHub is connected from this page only. */
const STAR_SCOPES = ["public_repo"];

function RepoCard({ repo }: { repo: Repo }) {
  const t = useTranslations("star");
  return (
    <div className="flex items-start gap-3 rounded-xl bg-glass px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--border)]">
      <SocialProviderIcon provider="github" name="GitHub" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate font-mono text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          {repo.fullName}
        </a>
        {repo.description ? (
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{repo.description}</p>
        ) : null}
        {repo.stars !== null ? (
          <p className="flex items-center gap-1.5 text-xs text-faint">
            <Star className="size-3.5" aria-hidden />
            {t("repoStars", { count: repo.stars })}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** `text` with `repo` kept on one line (repository names break badly at their hyphens). */
function WithRepo({ text, repo }: { text: string; repo: string }) {
  if (!repo || !text.includes(repo)) return <>{text}</>;
  const [before, ...rest] = text.split(repo);
  return (
    <>
      {before}
      <span className="whitespace-nowrap">{repo}</span>
      {rest.join(repo)}
    </>
  );
}

function Notice({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "error" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "note"}
      className={
        tone === "error"
          ? "flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-foreground"
          : "flex gap-3 rounded-xl bg-muted/50 px-3 py-3 text-sm text-muted-foreground"
      }
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">{children}</div>
    </div>
  );
}

export function StarFlow({
  state: initialState,
  repo: initialRepo,
  csrf,
  selfPath,
  back,
  linkError,
}: {
  state: StarState;
  repo: Repo | null;
  csrf: string | null;
  /** This page with its validated query, to come back to after signing in or connecting GitHub. */
  selfPath: string;
  /** The validated family page to go back to. */
  back: { url: string; name: string } | null;
  /** GitHub sent the member back with an error (connection refused or cancelled). */
  linkError: boolean;
}) {
  const t = useTranslations("star");
  const locale = useLocale();
  const [state, setState] = React.useState<StarState | "success">(initialState);
  const [repo, setRepo] = React.useState<Repo | null>(initialRepo);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(linkError ? t("errors.linkFailed") : null);
  const [needsSignIn, setNeedsSignIn] = React.useState(false);

  const signInHref = `/${locale}/login?${new URLSearchParams({ callbackURL: selfPath }).toString()}`;
  const signInAgainHref = addAccountHref(locale, new URLSearchParams({ callbackURL: selfPath }));

  async function connectGithub() {
    setBusy(true);
    setError(null);
    setNeedsSignIn(false);
    const { error: linkFailure } = await authClient.linkSocial({
      provider: "github",
      scopes: STAR_SCOPES,
      callbackURL: selfPath,
      errorCallbackURL: selfPath,
    });
    if (linkFailure) {
      setBusy(false);
      if (needsRecentSignIn(linkFailure)) {
        setNeedsSignIn(true);
        setError(t("errors.signInAgain"));
      } else {
        setError(t("errors.linkFailed"));
      }
    }
    // On success the browser goes to GitHub and comes back to this page, which asks again.
  }

  async function star() {
    if (!repo || !csrf) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ repo: repo.fullName, csrf }),
      });
      const data = (await res.json().catch(() => ({}))) as { status?: string; error?: string };
      if (res.ok && data.status === "starred") {
        setState("success");
        setRepo((current) => (current && current.stars !== null ? { ...current, stars: current.stars + 1 } : current));
      }
      else if (res.ok && data.status === "already") setState("already");
      else if (data.error === "needs_permission") {
        setState("grant");
        setError(t("errors.needsPermission"));
      } else if (data.error === "github_not_linked") {
        setState("connect");
        setError(t("errors.notLinked"));
      } else if (res.status === 429) setError(t("errors.rateLimited"));
      else if (res.status === 401) setState("signedOut");
      else setError(t("errors.generic"));
    } catch {
      setError(t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  const name = repo?.fullName ?? "";
  const backButton = back ? (
    <Button variant={state === "success" || state === "already" ? "default" : "ghost"} asChild>
      <a href={back.url}>
        <ArrowLeft className="size-4" aria-hidden />
        {t("back", { name: back.name })}
      </a>
    </Button>
  ) : null;
  const plainLink = repo ? (
    <Button variant="outline" asChild>
      <a href={repo.url} target="_blank" rel="noopener noreferrer">
        <SocialProviderIcon provider="github" name="GitHub" className="size-4" />
        {t("openOnGitHub")}
        <ExternalLink className="size-3.5 opacity-60" aria-hidden />
      </a>
    </Button>
  ) : null;

  const copy: Record<StarState | "success", { title: string; description: string }> = {
    notAllowed: { title: t("notAllowed.title"), description: t("notAllowed.description") },
    unavailable: { title: t("unavailable.title", { repo: name }), description: t("unavailable.description") },
    signedOut: { title: t("signedOut.title", { repo: name }), description: t("signedOut.description") },
    connect: { title: t("connect.title"), description: t("connect.description") },
    grant: { title: t("grant.title"), description: t("grant.description") },
    confirm: { title: t("confirm.title"), description: t("confirm.description") },
    already: { title: t("already.title", { repo: name }), description: t("already.description") },
    success: { title: t("success.title"), description: t("success.description", { repo: name }) },
  };

  return (
    <Card data-star-state={state}>
      <CardHeader className="space-y-1">
        {state === "success" || state === "already" ? (
          <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="size-5" aria-hidden />
          </span>
        ) : null}
        <CardTitle className="text-xl leading-snug text-pretty">
          <WithRepo text={copy[state].title} repo={name} />
        </CardTitle>
        <CardDescription className="text-pretty">
          <WithRepo text={copy[state].description} repo={name} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {repo ? <RepoCard repo={repo} /> : null}

        {state === "connect" || state === "grant" ? (
          <Notice>
            <p className="font-medium text-foreground">{t("scope.title")}</p>
            <p className="text-pretty">{t("scope.body")}</p>
          </Notice>
        ) : null}

        {error ? (
          <Notice tone="error">
            <p>{error}</p>
            {needsSignIn ? (
              <Button className="mt-2" size="sm" variant="secondary" asChild>
                <a href={signInAgainHref}>{t("errors.signInAgainButton")}</a>
              </Button>
            ) : null}
          </Notice>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {state === "signedOut" ? (
            <>
              <Button asChild>
                <a href={signInHref}>{t("signedOut.signIn")}</a>
              </Button>
              {plainLink}
            </>
          ) : null}

          {state === "connect" || state === "grant" ? (
            <>
              <Button type="button" disabled={busy} onClick={() => void connectGithub()}>
                {busy ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <SocialProviderIcon provider="github" name="GitHub" className="size-4" />
                )}
                {state === "connect" ? t("connect.button") : t("grant.button")}
              </Button>
              {plainLink}
            </>
          ) : null}

          {state === "confirm" ? (
            <Button type="button" disabled={busy || !csrf} onClick={() => void star()}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Star className="size-4" aria-hidden />}
              <span className="truncate">{t("confirm.button", { repo: name })}</span>
            </Button>
          ) : null}

          {state === "unavailable" ? plainLink : null}

          {backButton}
        </div>

        {state === "confirm" ? <p className="text-xs leading-relaxed text-faint">{t("confirm.note")}</p> : null}
      </CardContent>
    </Card>
  );
}
