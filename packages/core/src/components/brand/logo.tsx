import { useId } from "react";

import { brand, keyMark } from "@ostiary/core/lib/brand";
import { cn } from "@ostiary/core/lib/utils";

/**
 * The family Key mark, flat and two-layer like the Cyber product marks: a light top layer
 * over a deep base. Geometry lives in `lib/brand.ts` (shared with the favicon and social
 * images); colors follow the `--key-top` / `--key-base` tokens, so it reads in every mode.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox={keyMark.viewBox} aria-hidden className={cn("h-6 w-7 shrink-0", className)}>
      <path d={keyMark.path} transform={`translate(0 ${keyMark.baseOffset})`} className="fill-[var(--key-base)]" />
      <path d={keyMark.path} className="fill-[var(--key-top)]" />
    </svg>
  );
}

/**
 * The Key as a lit glass object: the family's hero mark on the auth screens. One per view.
 * Gently floats (off under reduced motion).
 */
export function GlassKey({ className, float = true }: { className?: string; float?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      viewBox="3.8 4.6 24 24"
      aria-hidden
      className={cn("size-36 shrink-0 drop-shadow-[0_1.5rem_2.5rem_rgb(161_161_170/0.4)]", float && "cy-float-anim", className)}
    >
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="10" x2="0" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#d4d4d8" />
          <stop offset="1" stopColor="#8c8c96" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="11" x2="0" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#71717a" />
          <stop offset="1" stopColor="#18181b" />
        </linearGradient>
        <linearGradient id={`${id}e`} x1="0" y1="10" x2="0" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={keyMark.path} fill={`url(#${id}b)`} transform={`translate(0 ${keyMark.baseOffset})`} />
      <path d={keyMark.path} fill={`url(#${id}a)`} opacity={0.96} />
      <path d={keyMark.path} fill="none" stroke={`url(#${id}e)`} strokeWidth={0.18} />
    </svg>
  );
}

/** Mark + wordmark. The wordmark is the name set in Geist, like the other Cyber lockups. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <LogoMark />
      <span className="truncate font-sans text-base font-semibold tracking-[-0.02em]">{brand.name}</span>
    </span>
  );
}
