"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { ThemeProvider } from "@ostiary/core/components/theme-provider";
import { Toaster } from "@ostiary/core/components/ui/sonner";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      theme={resolvedTheme === "light" ? "light" : "dark"}
    />
  );
}

/** `nonce`: the page's CSP nonce, for the theme script next-themes renders inline. */
export function Providers({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <ThemeProvider
      nonce={nonce}
      attribute={["class", "data-mode"]}
      themes={["dark", "black", "light"]}
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <ThemedToaster />
    </ThemeProvider>
  );
}
