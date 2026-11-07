import { NavLink, useLocation } from "react-router";
import { motion } from "motion/react";
import { Compass, Home, PenTool, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";
import { spring } from "@/lib/motion";
import { useCartCount } from "@/stores/cart";

/** Floating liquid-glass tab bar (mobile). Max 5 destinations. */
export function TabBar() {
  const { t } = useT();
  const count = useCartCount();
  const { pathname } = useLocation();
  const tabs = [
    { to: "/", label: t("nav_home"), icon: Home, match: (p: string) => p === "/" },
    { to: "/explore", label: t("nav_explore"), icon: Compass, match: (p: string) => /^\/(explore|category|search|product|seller\/)/.test(p) },
    { to: "/custom-studio", label: t("nav_studio"), icon: PenTool, match: (p: string) => p.startsWith("/custom-studio") || p.startsWith("/quotations") },
    { to: "/cart", label: t("nav_cart"), icon: ShoppingBag, match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout") },
    { to: "/account", label: t("nav_account"), icon: User, match: (p: string) => /^\/(account|orders|saved|messages)/.test(p) },
  ];
  return (
    <nav aria-label="Tabs" className="pb-safe fixed inset-x-0 bottom-0 z-50 px-3 lg:hidden">
      <div className="glass glass-sheen mx-auto mb-2 flex h-16 max-w-md items-center justify-between rounded-full px-1.5">
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <NavLink key={to} to={to} aria-current={active ? "page" : undefined} className="relative flex h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-full">
              {active && <motion.span layoutId="tab-pill" transition={spring} className="absolute inset-0 rounded-full bg-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]" />}
              <span className="relative">
                <Icon className={cn("size-[21px] transition-colors", active ? "text-white" : "text-ink/75")} strokeWidth={active ? 2.1 : 1.8} />
                {to === "/cart" && count > 0 && (
                  <span className="tabular absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-forest-deep">{count}</span>
                )}
              </span>
              <span className={cn("relative text-[10.5px] font-medium tracking-[0.01em]", active ? "text-white" : "text-ink/70")}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
