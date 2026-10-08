import type { ReactNode } from "react";

import { Logo } from "@ostiary/core/components/brand/logo";
import { Preferences } from "@ostiary/core/components/layout/preferences";

/**
 * Full-page status shell (404, errors, loading): the family header and a centered
 * message with a mono eyebrow, a serif title and the actions.
 */
export function StatusScreen({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <header className="flex h-15 items-center justify-between gap-3 px-4 md:px-6">
        <Logo />
        <Preferences />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-24">
        <div className="w-full max-w-md min-w-0 text-center">
          <p className="cy-eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">{title}</h1>
          {description ? <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{description}</p> : null}
          {children ? <div className="mt-8 flex flex-wrap justify-center gap-2">{children}</div> : null}
        </div>
      </main>
    </div>
  );
}
