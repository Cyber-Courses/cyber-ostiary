import { AuthScreen } from "@/components/auth/auth-screen";
import { clientProduct } from "@/lib/client-product";
import { captchaConfig } from "@ostiary/core/lib/captcha";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { enabledSocialProviders } from "@ostiary/core/lib/social-providers";

function LoginFallback() {
  return (
    <div className="h-80 w-full max-w-md animate-pulse rounded-xl bg-muted/60" />
  );
}

// Providers enabled from the admin console are read at request time.
export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  // An authorize request from a Cyber product tints the screen (visual only).
  const product = await clientProduct((await searchParams).client_id);

  return (
    <AuthScreen locale={locale} product={product}>
        <Suspense fallback={<LoginFallback />}>
          <LoginForm socialProviders={await enabledSocialProviders()} captcha={captchaConfig()} />
        </Suspense>
    </AuthScreen>
  );
}
