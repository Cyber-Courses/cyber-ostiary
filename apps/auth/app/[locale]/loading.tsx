import { getLocale, getTranslations } from "next-intl/server";

import { Skeleton } from "@ostiary/core/components/ui/skeleton";

export default async function LocaleLoading() {
  await getLocale();
  const t = await getTranslations("common");

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background p-8">
      <p className="cy-eyebrow">{t("loading")}</p>
      <Skeleton className="h-64 w-full max-w-md rounded-[1.25rem]" />
    </div>
  );
}
