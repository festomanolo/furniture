import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Bell, ChevronDown, Heart, MapPin, Search, ShoppingBag, User } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";
import { useCartCount } from "@/stores/cart";
import { usePrefs } from "@/stores/prefs";
import { LocationSheet } from "./LocationSheet";
import { Logo } from "./Logo";
import { NotificationsSheet } from "./NotificationsSheet";

export function TopBar() {
  const { t } = useT();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const district = usePrefs((s) => s.district);
  const count = useCartCount();
  const overHero = pathname === "/";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 24);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  // Scroll restoration can land mid-page without a change event; sync once after navigation.
  useEffect(() => {
    const id = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  const [locOpen, setLocOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [q, setQ] = useState("");
  const onHero = overHero && !scrolled;

  return (
    <>
      <header className="pt-safe fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-3 pt-2 sm:px-6 lg:px-8">
          <motion.div
            animate={{ y: 0 }}
            className={cn(
              "flex h-14 items-center gap-2 rounded-full pr-1.5 pl-4 transition-[background,box-shadow,border-color,color] duration-300 lg:h-16 lg:pl-5",
              onHero ? "glass-dark" : "glass glass-sheen",
            )}
          >
            <Link to="/" aria-label="SAMANI" className="shrink-0">
              <Logo inverted={onHero} />
            </Link>

            <button
              onClick={() => setLocOpen(true)}
              className={cn(
                "ml-1 hidden h-10 min-w-0 items-center gap-1.5 rounded-full px-3 text-left text-sm sm:flex",
                onHero ? "hover:bg-white/10" : "hover:bg-sage/60",
              )}
            >
              <MapPin className="size-4 shrink-0 opacity-80" />
              <span className="min-w-0 truncate">
                <span className="opacity-70">{t("deliver_to")} </span>
                <span className="font-medium">{district}</span>
              </span>
              <ChevronDown className="size-3.5 opacity-70" />
            </button>

            <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Primary">
              {[
                ["/explore", t("nav_explore")],
                ["/custom-studio", t("nav_studio")],
              ].map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to!}
                  className={({ isActive }) =>
                    cn("h-10 rounded-full px-4 text-sm leading-10 font-medium", isActive ? (onHero ? "bg-white/15" : "bg-forest text-white") : onHero ? "hover:bg-white/10" : "hover:bg-sage/60")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <form
              role="search"
              className="ml-auto hidden max-w-xs flex-1 md:block"
              onSubmit={(e) => {
                e.preventDefault();
                nav(`/search?q=${encodeURIComponent(q.trim())}`);
              }}
            >
              <label className={cn("flex h-10 items-center gap-2 rounded-full px-3.5", onHero ? "bg-white/12 placeholder:text-white/70" : "bg-paper/70 ring-1 ring-line")}>
                <Search className="size-4 shrink-0 opacity-70" />
                <span className="sr-only">Search</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className={cn("w-full bg-transparent text-sm outline-none", onHero ? "placeholder:text-white/70" : "placeholder:text-muted")}
                />
              </label>
            </form>

            <div className={cn("ml-auto flex items-center md:ml-1", onHero && "[&_button]:text-white [&_a]:text-white")}>
              <IconButton label="Search" className="md:hidden" onClick={() => nav("/search")}>
                <Search className="size-5" />
              </IconButton>
              <IconButton label={t("deliver_to")} className="sm:hidden" onClick={() => setLocOpen(true)}>
                <MapPin className="size-5" />
              </IconButton>
              <IconButton label={t("notifications")} onClick={() => setNotiOpen(true)}>
                <Bell className="size-5" />
              </IconButton>
              <Link to="/saved" aria-label={t("saved_title")} className="hidden size-11 items-center justify-center rounded-full hover:bg-sage/60 lg:inline-flex">
                <Heart className="size-5" />
              </Link>
              <Link to="/cart" aria-label={t("nav_cart")} className="relative hidden size-11 items-center justify-center rounded-full hover:bg-sage/60 lg:inline-flex">
                <ShoppingBag className="size-5" />
                {count > 0 && <span className="tabular absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-forest-deep">{count}</span>}
              </Link>
              <Link to="/account" aria-label={t("nav_account")} className="hidden size-11 items-center justify-center rounded-full hover:bg-sage/60 lg:inline-flex">
                <User className="size-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </header>
      <LocationSheet open={locOpen} onClose={() => setLocOpen(false)} />
      <NotificationsSheet open={notiOpen} onClose={() => setNotiOpen(false)} />
    </>
  );
}
