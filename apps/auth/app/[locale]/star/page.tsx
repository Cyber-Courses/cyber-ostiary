import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { AuthScreen, ProductName } from "@/components/auth/auth-screen";
import { StarFlow, type StarState } from "@/components/auth/star-flow";
import { auth } from "@/lib/auth";
import {
  githubAccessToken,
  githubLink,
  githubSignInEnabled,
  isStarred,
  repoInfo,
  starRepos,
} from "@/lib/github-star";
import { env } from "@ostiary/core/lib/env";
import { allowedStarRepo, safeStarReturn, starCsrfToken } from "@ostiary/core/lib/github-star";

/*
 * Cyber Auth only (see FORK.md). One-click star: /star?repo=owner/name&return=<family URL>.
 *
 * Signed out: sign in first. GitHub not connected (or connected without the public_repo
 * permission): connect it. Then an explicit confirmation card; the star happens only when the
 * member clicks its button (POST /api/star). Nothing is ever starred on load or on sign-in.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "star" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const allowlist = starRepos();
  const requested = first(query.repo);
  const repo = requested === undefined ? allowlist[0]! : allowedStarRepo(requested, allowlist);
  const back = safeStarReturn(first(query.return), { allowLocalhost: env.NODE_ENV !== "production" });

  // This page's own address with only the validated values, to come back to after a sign-in or GitHub.
  const selfQuery = new URLSearchParams();
  if (repo) selfQuery.set("repo", repo);
  if (back) selfQuery.set("return", back.url);
  const selfPath = `/${locale}/star?${selfQuery.toString()}`;

  const requestHeaders = await headers();
  let state: StarState;
  let csrf: string | null = null;
  let token: string | null = null;

  if (!repo) {
    state = "notAllowed";
  } else if (!(await githubSignInEnabled())) {
    state = "unavailable";
  } else {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) {
      state = "signedOut";
    } else {
      const link = await githubLink(requestHeaders);
      if (!link.linked) {
        state = "connect";
      } else if (!link.canStar) {
        state = "grant";
      } else {
        token = await githubAccessToken(requestHeaders, link.accountId);
        if (!token) {
          state = "connect";
        } else {
          state = (await isStarred(repo, token)) === true ? "already" : "confirm";
          csrf = starCsrfToken(env.BETTER_AUTH_SECRET, session.session.id, repo);
        }
      }
    }
  }

  const info = repo ? await repoInfo(repo, token ?? undefined) : null;
  const t = await getTranslations({ locale, namespace: "star" });
  const product = back?.site.product ?? null;
  const siteName = back?.site.name ?? null;

  return (
    <AuthScreen
      locale={locale}
      product={product}
      panel={{
        eyebrow: t("eyebrow"),
        title: siteName
          ? t.rich("panelTitle", {
              name: siteName,
              product: () => <ProductName name={siteName} />,
            })
          : t.rich("panelTitlePlain", { accent: (chunks) => <em>{chunks}</em> }),
        lead: t("panelLead"),
      }}
    >
      <StarFlow
        state={state}
        repo={info}
        csrf={csrf}
        selfPath={selfPath}
        back={back ? { url: back.url, name: back.site.name } : null}
        linkError={first(query.error) !== undefined}
      />
    </AuthScreen>
  );
}
