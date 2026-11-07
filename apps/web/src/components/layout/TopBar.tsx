import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Bell, ChevronDown, MapPin, User } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";
import { usePrefs } from "@/stores/prefs";
import { Dock } from "./Dock";
import { LocationSheet } from "./LocationSheet";
import { Logo } from "./Logo";
import { NotificationsSheet } from "./NotificationsSheet";

export function TopBar() {
  const { t } = useT();
  const { pathname } = useLocation();
  const district = usePrefs((s) => s.district);
  const [locOpen, setLocOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const accountActive = /^\/(account|orders|messages|help)/.test(pathname);

  return (
    <>
      <header className="pt-safe pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 pt-2.5 sm:px-6 lg:px-8 lg:pt-4">
          {/* Brand + delivery location */}
          <div className="liquid pointer-events-auto flex h-14 min-w-0 items-center gap-1 rounded-full pr-1.5 pl-4 max-lg:flex-1 lg:h-[3.6rem]">
            <Link to="/" aria-label="SAMANI" className="shrink-0 rounded-full">
              <Logo />
            </Link>
            <button onClick={() => setLocOpen(true)} className="ml-1 flex h-10 min-w-0 items-center gap-1.5 rounded-full px-2.5 text-left text-sm hover:bg-white/40">
              <MapPin className="size-4 shrink-0 text-forest" />
              <span className="min-w-0 truncate">
                <span className="hidden text-muted sm:inline">{t("deliver_to")} </span>
                <span className="font-medium">{district}</span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted" />
            </button>
            <IconButton label={t("notifications")} className="ml-auto hover:bg-white/40 lg:hidden" onClick={() => setNotiOpen(true)}>
              <Bell className="size-5" />
            </IconButton>
          </div>

          {/* Desktop: dock in the centre of the bar */}
          <div className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <Dock placement="top" onNotifications={() => setNotiOpen(true)} />
          </div>

          <Link
            to="/account"
            aria-label={t("nav_account")}
            aria-current={accountActive ? "page" : undefined}
            className={cn("liquid pointer-events-auto ml-auto hidden size-[3.6rem] items-center justify-center rounded-full lg:flex", accountActive && "ring-2 ring-forest/70")}
          >
            <User className={cn("size-[21px]", accountActive ? "text-forest" : "text-ink/80")} />
          </Link>
        </div>
      </header>
      <LocationSheet open={locOpen} onClose={() => setLocOpen(false)} />
      <NotificationsSheet open={notiOpen} onClose={() => setNotiOpen(false)} />
    </>
  );
}
