import { brand } from "@ostiary/core/lib/brand";
import { env } from "@ostiary/core/lib/env";
import { getBaseURL } from "@ostiary/core/lib/url";

/**
 * The one look for every email: a centred card in the app's
 * monochrome style, a single call-to-action button, the link spelled out for
 * clients that block buttons, and a plain-text twin.
 *
 * Email clients ignore most CSS, so the HTML is table-based with inline styles.
 * A small <style> block adds dark mode where supported (Apple Mail, Outlook
 * apps); everywhere else the light version shows.
 */

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export interface EmailContent {
  /** Inbox preview line (hidden in the body). */
  preheader: string;
  heading: string;
  /** Paragraphs, plain text (escaped here). */
  body: string[];
  /** The call to action. Every email has either a button or a code. */
  button?: { label: string; url: string };
  /** A one-time code shown large instead of a button (sign-in codes). */
  code?: string;
  /** BCP-47 language of the text (default `en`); Arabic is laid out right to left. */
  lang?: string;
  /** Small print under the button, e.g. expiry. */
  note?: string;
  /** Last line: why you got this / what to do if it wasn't you. */
  footnote: string;
}

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const SITE_URL = (env.AUTH_APP_URL ?? getBaseURL()).replace(/\/$/, "");
const SITE_HOST = new URL(SITE_URL).host.replace(/^www\./, "");
const LOGO_URL = `${SITE_URL}/logo.png`;

/**
 * The brand mark: the Key logo, served by the auth app (`public/logo.png`, generated from
 * `lib/brand.ts`). Clients that block images show the alt text instead.
 */
const MARK = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
  <td width="28" height="28" valign="middle" style="width:28px;height:28px;"><img src="${LOGO_URL}" width="28" height="28" alt="${escapeHtml(brand.name)}" style="display:block;width:28px;height:28px;border:0;border-radius:7px;"></td>
  <td style="padding:0 10px;font:600 15px/28px ${FONT};letter-spacing:-0.2px;" class="fg">${escapeHtml(brand.name)}</td>
</tr></table>`;

export function renderEmail(c: EmailContent): { html: string; text: string } {
  const lang = c.lang ?? "en";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const url = c.button ? escapeHtml(c.button.url) : "";
  const paragraphs = c.body
    .map((p) => `<p class="muted" style="margin:0 0 16px;font:400 15px/24px ${FONT};color:#4d4d4d;">${escapeHtml(p)}</p>`)
    .join("");

  const html = `<!doctype html>
<html lang="${escapeHtml(lang)}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(c.heading)}</title>
<style>
  @media (prefers-color-scheme: dark) {
    .bg { background:#000000 !important; }
    .card { background:#0a0a0a !important; border-color:#262626 !important; }
    .fg { color:#ededed !important; }
    .muted { color:#a1a1a1 !important; }
    .faint { color:#737373 !important; }
    .rule { border-color:#262626 !important; }
    .btn { background:#ededed !important; }
    .btn a { color:#0a0a0a !important; }
    .mark { background:#ededed !important; color:#0a0a0a !important; }
    .link { color:#ededed !important; }
    .code { background:#000000 !important; }
  }
  @media (max-width: 600px) { .pad { padding:28px 22px !important; } }
</style>
</head>
<body class="bg" style="margin:0;padding:0;background:#fafafa;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(c.preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:#fafafa;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
      <tr><td style="padding:0 4px 20px;">${MARK}</td></tr>
      <tr><td class="card pad" style="background:#ffffff;border:1px solid #ebebeb;border-radius:12px;padding:36px 32px;">
        <h1 class="fg" style="margin:0 0 16px;font:600 22px/30px ${FONT};letter-spacing:-0.4px;color:#0a0a0a;">${escapeHtml(c.heading)}</h1>
        ${paragraphs}
        ${c.code ? `<p class="code rule fg" dir="ltr" style="margin:24px 0 8px;padding:16px 0 16px 10px;border:1px solid #ebebeb;border-radius:8px;background:#fafafa;text-align:center;font:600 32px/40px ${MONO};letter-spacing:10px;color:#0a0a0a;">${escapeHtml(c.code)}</p>` : ""}
        ${c.button ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
          <tr><td class="btn" align="center" style="border-radius:8px;background:#0a0a0a;">
            <a href="${url}" target="_blank" style="display:inline-block;padding:12px 22px;font:500 15px/20px ${FONT};color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(c.button.label)}</a>
          </td></tr>
        </table>` : ""}
        ${c.note ? `<p class="faint" style="margin:12px 0 0;font:400 13px/20px ${FONT};color:#8f8f8f;">${escapeHtml(c.note)}</p>` : ""}
        ${c.button ? `<hr class="rule" style="margin:28px 0 20px;border:0;border-top:1px solid #ebebeb;">
        <p class="faint" style="margin:0 0 6px;font:400 12px/18px ${FONT};color:#8f8f8f;">Button not working? Paste this link into your browser:</p>
        <p style="margin:0;font:400 12px/18px ${MONO};word-break:break-all;"><a class="link" href="${url}" target="_blank" style="color:#0a0a0a;">${url}</a></p>` : ""}
      </td></tr>
      <tr><td style="padding:20px 4px 0;">
        <p class="faint" style="margin:0 0 6px;font:400 12px/18px ${FONT};color:#8f8f8f;">${escapeHtml(c.footnote)}</p>
        <p class="faint" style="margin:0;font:400 12px/18px ${FONT};color:#8f8f8f;">${escapeHtml(brand.name)} · <a class="faint" href="${SITE_URL}" style="color:#8f8f8f;">${escapeHtml(SITE_HOST)}</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    c.heading,
    "",
    ...c.body.flatMap((p) => [p, ""]),
    ...(c.code ? [c.code] : []),
    ...(c.button ? [`${c.button.label}: ${c.button.url}`] : []),
    ...(c.note ? ["", c.note] : []),
    "",
    "",
    c.footnote,
    `${brand.name} · ${SITE_URL}`,
  ].join("\n");

  return { html, text };
}
