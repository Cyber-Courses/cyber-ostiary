import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { brand, glassKeySvg, logoMarkSvg } from "@ostiary/core/lib/brand";

/**
 * Open Graph / Twitter card for Cyber Auth, in the Cyber design system layout shared by the
 * family sites: #09090b with the glow field on the right and a faint masked grid; the brand
 * row top-left; the serif title on the left (one italic word in the jewel); mono meta on the
 * bottom row; the glass Key on the right.
 *
 * Satori can't use next/font, so it reads the `.woff` files in `assets/fonts` (the app runs
 * from apps/auth, so they resolve from there).
 */
export const ogSize = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
const fontsPromise = Promise.all([
  font("Newsreader-Regular.woff"),
  font("Newsreader-Italic.woff"),
  font("Geist-Regular.woff"),
  font("Geist-SemiBold.woff"),
  font("GeistMono-Regular.woff"),
]);

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

function titleWords(title: string, accent: string) {
  const em = accent.toLowerCase();
  return title
    .trim()
    .split(/\s+/)
    .map((text) => ({ text, em: Boolean(em) && text.toLowerCase().replace(/[.,!?]$/, "") === em }));
}

export async function renderOgImage({ title, description, host }: { title: string; description: string; host: string }) {
  const [serif, serifItalic, sans, sansSemibold, mono] = await fontsPromise;
  const c = brand.colors;
  const words = titleWords(title, brand.taglineAccent);
  const size = title.length > 60 ? 64 : 74;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: c.background,
          color: c.foreground,
          fontFamily: "Geist",
        }}
      >
        {/* Glow field on the right: the silver jewel with the family lights. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ogSize.width,
            height: ogSize.height,
            display: "flex",
            backgroundImage: `radial-gradient(circle at 80% 44%, rgba(${c.jewelRgb}, 0.32) 0%, rgba(${c.jewelRgb}, 0.08) 26%, transparent 46%), radial-gradient(circle at 66% 86%, rgba(${c.emeraldRgb}, 0.16) 0%, transparent 28%), radial-gradient(circle at 96% 10%, rgba(${c.sapphireRgb}, 0.22) 0%, transparent 30%), radial-gradient(circle at 98% 80%, rgba(${c.amethystRgb}, 0.18) 0%, transparent 28%)`,
          }}
        />
        {/* Faint grid, masked around the mark. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ogSize.width,
            height: ogSize.height,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at 80% 45%, black 0%, transparent 45%)",
          }}
        />
        {/* Glass Key. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri(glassKeySvg(380))} width={380} height={380} alt="" style={{ position: "absolute", right: 70, top: 120 }} />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "72px 78px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUri(logoMarkSvg({ size: 46 }))} width={46} height={46} alt="" />
            {brand.name}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: "62%" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                fontFamily: "Newsreader",
                fontSize: size,
                lineHeight: 1.02,
                letterSpacing: -size * 0.035,
              }}
            >
              {words.map((w, i) => (
                <span key={i} style={{ marginRight: size * 0.24, fontStyle: w.em ? "italic" : "normal", color: w.em ? c.jewelText : c.foreground }}>
                  {w.text}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 26, lineHeight: 1.4, color: c.muted }}>{description}</div>
          </div>

          <div style={{ display: "flex", gap: 14, fontFamily: "Geist Mono", fontSize: 22, color: c.muted }}>
            {[host, ...brand.ecosystem].map((m, i) => (
              <span key={m} style={{ display: "flex", gap: 14 }}>
                {i > 0 && <span style={{ color: c.faint }}>·</span>}
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Newsreader", data: serif, weight: 400, style: "normal" },
        { name: "Newsreader", data: serifItalic, weight: 400, style: "italic" },
        { name: "Geist", data: sans, weight: 400, style: "normal" },
        { name: "Geist", data: sansSemibold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
