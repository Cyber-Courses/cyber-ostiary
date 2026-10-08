import { Suspense } from "react";

import { AuthScreen } from "@/components/auth/auth-screen";
import { clientProduct } from "@/lib/client-product";
import { SelectAccountForm } from "@/components/auth/select-account-form";

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
  const product = await clientProduct((await searchParams).client_id);
  return (
    <AuthScreen locale={locale} product={product}>
      <Suspense fallback={<SelectAccountFallback />}>
        <SelectAccountForm />
      </Suspense>
    </AuthScreen>
  );
}
