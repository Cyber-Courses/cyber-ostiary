"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { StatusScreen } from "@/components/layout/status-screen";
import { Button } from "@ostiary/core/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      eyebrow={t("boundaryEyebrow")}
      title={t("boundaryTitle")}
      description={t("boundaryDescription")}
    >
      <Button type="button" onClick={() => reset()}>
        {t("retry")}
      </Button>
    </StatusScreen>
  );
}
