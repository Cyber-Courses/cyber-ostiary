import { AuthScreen } from "@/components/auth/auth-screen";
import { clientProduct } from "@/lib/client-product";
import { captchaConfig } from "@ostiary/core/lib/captcha";
import { SignupForm } from "@/components/auth/signup-form";
import { enabledSocialProviders } from "@ostiary/core/lib/social-providers";

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
        <SignupForm socialProviders={await enabledSocialProviders()} captcha={captchaConfig()} />
    </AuthScreen>
  );
}
