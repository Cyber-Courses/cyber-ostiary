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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
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
