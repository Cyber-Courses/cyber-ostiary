import { getTranslations } from "next-intl/server";

import { StatusScreen } from "@/components/layout/status-screen";
import { Link } from "@/i18n/navigation";
import { Button } from "@ostiary/core/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <StatusScreen
      eyebrow="404"
      title={t.rich("notFoundTitle", { em: (chunks) => <em>{chunks}</em> })}
      description={t("notFoundDescription")}
    >
      <Button asChild>
        <Link href="/login">{t("notFoundAction")}</Link>
      </Button>
    </StatusScreen>
  );
}
