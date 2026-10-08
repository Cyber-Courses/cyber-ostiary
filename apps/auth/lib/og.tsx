import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { brand } from "@ostiary/core/lib/brand";
import { logoMarkDataUri } from "@ostiary/core/lib/brand-image";

/**
 * Open Graph / Twitter card for Cyber Auth, in the identity's style: Night
 * ground, Mist mark, Geist type (vendored in `assets/fonts`: Satori can't use
 * next/font). The app runs from apps/auth, so fonts resolve from there.
 */
export const ogSize = { width: 1200, height: 630 };

const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-SemiBold.ttf")),
]);

export async function renderOgImage({ title, description, host }: { title: string; description: string; host: string }) {
  const [regular, semibold] = await fontsPromise;
  const c = brand.colors;
  const grid = "rgba(255,255,255,0.05)";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: c.night,
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: "56px 56px, 56px 56px",
          color: c.mist,
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoMarkDataUri({ size: 60, background: c.mist, foreground: "#0a0a0a" })} width={60} height={60} alt="" />
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.8 }}>{brand.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 980 }}>
          <div style={{ display: "block", fontSize: 72, fontWeight: 600, lineHeight: 1.06, letterSpacing: -2.4 }}>{title}</div>
          <div style={{ display: "block", fontSize: 28, lineHeight: 1.4, color: c.nightText }}>{description}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {brand.ecosystem.map((name) => (
              <span
                key={name}
                style={{ display: "flex", fontSize: 22, color: c.nightText, border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, padding: "8px 20px" }}
              >
                {name}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 24, color: c.nightText }}>{host}</span>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
