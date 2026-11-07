import { Link } from "react-router";
import { Bell, ChevronRight, FileText, Heart, LifeBuoy, MapPin, MessagesSquare, Package, Store } from "lucide-react";
import { PageHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { env, isDemoMode } from "@/lib/env";
import { useT } from "@/lib/i18n";
import { usePrefs } from "@/stores/prefs";
import { toast } from "@/stores/toast";

export default function Account() {
  const { t, locale } = useT();
  const setLocale = usePrefs((s) => s.setLocale);
  const { region, district } = usePrefs();
  const soon = () => toast(locale === "sw" ? "Inahitaji kuingia. Inakuja na API." : "Requires sign-in. Arrives with the API.");
  const rows = [
    { to: "/orders", icon: Package, label: t("orders") },
    { to: "/quotations", icon: FileText, label: t("quotations") },
    { to: "/saved", icon: Heart, label: t("saved_title") },
    { to: "/messages", icon: MessagesSquare, label: t("messages") },
  ];
  return (
    <div>
      <PageHeader title={t("account")} />
      <div className="mx-auto grid max-w-2xl gap-5 px-4 sm:px-6">
        <section className="rounded-[1.5rem] bg-forest p-5 text-white">
          <p className="text-[15px] leading-relaxed text-white/85">{t("sign_in_note")}</p>
          <Button variant="gold" className="mt-4" onClick={soon}>
            {t("sign_in")}
          </Button>
        </section>

        <section className="rounded-[1.5rem] bg-paper p-5 ring-1 ring-line">
          <h2 className="text-sm font-semibold">{t("language")}</h2>
          <div className="mt-3 inline-flex rounded-full bg-sage p-1" role="radiogroup" aria-label={t("language")}>
            {(["sw", "en"] as const).map((l) => (
              <button
                key={l}
                role="radio"
                aria-checked={locale === l}
                onClick={() => setLocale(l)}
                className={cn("h-10 rounded-full px-5 text-sm font-medium transition-colors", locale === l ? "bg-paper shadow-soft" : "text-ink/70")}
              >
                {l === "sw" ? "Kiswahili" : "English"}
              </button>
            ))}
          </div>
        </section>

        <ul className="divide-y divide-line overflow-hidden rounded-[1.5rem] bg-paper ring-1 ring-line">
          {rows.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link to={to} className="flex h-15 items-center gap-3.5 px-5 hover:bg-sage/40">
                <Icon className="size-5 text-forest" /> <span className="flex-1">{label}</span> <ChevronRight className="size-4 text-muted" />
              </Link>
            </li>
          ))}
          <li className="flex h-15 items-center gap-3.5 px-5 text-muted">
            <MapPin className="size-5 text-forest" />
            <span className="flex-1 text-ink">{t("addresses")}</span>
            <span className="text-sm">
              {district}, {region}
            </span>
          </li>
          <li>
            <button onClick={soon} className="flex h-15 w-full items-center gap-3.5 px-5 text-left hover:bg-sage/40">
              <Bell className="size-5 text-forest" /> <span className="flex-1">{t("notifications")}</span> <ChevronRight className="size-4 text-muted" />
            </button>
          </li>
          <li>
            {env.supportWhatsapp ? (
              <a href={`https://wa.me/${env.supportWhatsapp}`} target="_blank" rel="noreferrer" className="flex h-15 items-center gap-3.5 px-5 hover:bg-sage/40">
                <LifeBuoy className="size-5 text-forest" /> <span className="flex-1">{t("help")}</span> <ChevronRight className="size-4 text-muted" />
              </a>
            ) : (
              <button onClick={soon} className="flex h-15 w-full items-center gap-3.5 px-5 text-left hover:bg-sage/40">
                <LifeBuoy className="size-5 text-forest" /> <span className="flex-1">{t("help")}</span> <ChevronRight className="size-4 text-muted" />
              </button>
            )}
          </li>
        </ul>

        <button onClick={soon} className="flex items-center gap-4 rounded-[1.5rem] bg-sage p-5 text-left">
          <span className="flex size-12 items-center justify-center rounded-full bg-forest text-gold">
            <Store className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{t("become_seller")}</span>
            <span className="block text-sm text-muted">{t("become_seller_sub")}</span>
          </span>
          <ChevronRight className="size-5 text-muted" />
        </button>

        {isDemoMode && <p className="text-center text-xs text-muted">{t("demo_banner")}</p>}
      </div>
    </div>
  );
}
