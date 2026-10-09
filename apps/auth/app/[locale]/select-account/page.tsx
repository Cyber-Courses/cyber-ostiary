import { Suspense } from "react";

import { AuthScreen } from "@/components/auth/auth-screen";
import { clientProduct } from "@/lib/client-product";
import { SelectAccountForm } from "@/components/auth/select-account-form";
import { authScreenApp } from "@/lib/app-context";

function SelectAccountFallback() {
  return <div className="h-64 w-full max-w-md animate-pulse rounded-xl bg-muted/60" />;
}

export default async function SelectAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const app = await authScreenApp(await searchParams);
  // An authorize request from a Cyber product tints the screen (visual only).
  const product = await clientProduct(app?.clientId ?? (await searchParams).client_id);
  return (
    <AuthScreen locale={locale} product={product} app={app} appIntent="continue">
      <Suspense fallback={<SelectAccountFallback />}>
        <SelectAccountForm />
      </Suspense>
    </AuthScreen>
  );
}
