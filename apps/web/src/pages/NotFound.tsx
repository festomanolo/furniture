import { Link } from "react-router";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/States";
import { useT } from "@/lib/i18n";

export default function NotFound() {
  const { t, locale } = useT();
  return (
    <EmptyState
      icon={<Compass className="size-7" />}
      title={locale === "sw" ? "Ukurasa haupo" : "Page not found"}
      body={locale === "sw" ? "Huenda kiungo kimebadilika." : "The link may have changed."}
      action={<Link to="/" className="inline-flex h-11 items-center rounded-full bg-forest px-6 font-medium text-white">{t("nav_home")}</Link>}
    />
  );
}
