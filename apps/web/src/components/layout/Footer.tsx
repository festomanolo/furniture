import { Link } from "react-router";
import { useT } from "@/lib/i18n";
import { Logo } from "./Logo";

export function Footer() {
  const { t } = useT();
  return (
    <footer className="mt-24 bg-forest-deep text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{t("tagline")}</p>
        </div>
        <div className="grid gap-2 text-sm">
          <Link className="hover:text-white" to="/explore">{t("nav_explore")}</Link>
          <Link className="hover:text-white" to="/custom-studio">{t("studio_title")}</Link>
          <Link className="hover:text-white" to="/saved">{t("saved_title")}</Link>
        </div>
        <div className="grid gap-2 text-sm">
          <Link className="hover:text-white" to="/account">{t("become_seller")}</Link>
          <Link className="hover:text-white" to="/account">{t("help")}</Link>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-white/10 px-4 py-6 pb-28 text-xs text-white/50 sm:px-6 lg:px-8 lg:pb-6">© {new Date().getFullYear()} SAMANI. Dar es Salaam, Tanzania.</div>
    </footer>
  );
}
