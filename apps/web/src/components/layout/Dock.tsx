import { useState, type ComponentType } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Bell, Heart, Home, PenTool, Search, ShoppingBag, User, type LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT, type TKey } from "@/lib/i18n";
import { tick } from "@/lib/haptics";
import { useCartCount } from "@/stores/cart";

interface DockItem {
  key: string;
  label: TKey;
  icon: ComponentType<LucideProps>;
  to?: string;
  onSelect?: () => void;
  match?: (path: string) => boolean;
}

/** Liquid lens: slightly under-damped, it reads as a drop of glass gliding between targets. */
const lensSpring = { type: "spring", bounce: 0.22, duration: 0.5 } as const;

/**
 * Floating liquid-glass dock (bottom on mobile, top-centre on desktop).
 * The lens rests on the active route and follows the pointer on hover; the
 * item under the lens expands to show its label.
 */
export function Dock({ placement, onNotifications }: { placement: "top" | "bottom"; onNotifications?: () => void }) {
  const { t } = useT();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const count = useCartCount();
  const [hover, setHover] = useState<string | null>(null);

  const items: DockItem[] = [
    { key: "home", label: "nav_home", icon: Home, to: "/", match: (p) => p === "/" },
    { key: "search", label: "dock_search", icon: Search, to: "/explore", match: (p) => /^\/(explore|category|search|product|seller\/)/.test(p) },
    { key: "studio", label: "nav_studio", icon: PenTool, to: "/custom-studio", match: (p) => /^\/(custom-studio|quotations)/.test(p) },
    { key: "saved", label: "saved_title", icon: Heart, to: "/saved", match: (p) => p.startsWith("/saved") },
    placement === "bottom"
      ? { key: "account", label: "nav_account", icon: User, to: "/account", match: (p) => /^\/(account|orders|messages|help)/.test(p) }
      : { key: "alerts", label: "notifications", icon: Bell, onSelect: onNotifications },
  ];
  const active = items.find((i) => i.match?.(pathname))?.key ?? null;
  const lensOn = hover ?? active;
  const cartActive = /^\/(cart|checkout)/.test(pathname);

  return (
    <div className="flex items-center gap-2.5">
      <LayoutGroup id={`dock-${placement}`}>
        <motion.nav
          layout={!reduce}
          transition={lensSpring}
          aria-label={placement === "bottom" ? "Tabs" : "Primary"}
          onPointerLeave={() => setHover(null)}
          className="liquid flex h-[3.6rem] items-center gap-0.5 rounded-full p-1.5"
        >
          {items.map((item) => {
            const isActive = item.key === active;
            const expanded = item.key === lensOn;
            const Icon = item.icon;
            const content = (
              <>
                {expanded && <motion.span layoutId={`lens-${placement}`} transition={lensSpring} className="liquid-lens absolute inset-0 rounded-full" />}
                <Icon className={cn("relative size-[21px] shrink-0 transition-colors", isActive ? "text-forest" : "text-ink/75")} strokeWidth={isActive ? 2.2 : 1.8} />
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.span
                      key="label"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, width: 0, filter: "blur(4px)" }}
                      animate={reduce ? { opacity: 1 } : { opacity: 1, width: "auto", filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, width: 0, filter: "blur(4px)", transition: { duration: 0.16 } }}
                      transition={lensSpring}
                      className={cn("relative overflow-hidden text-[13.5px] font-semibold whitespace-nowrap", isActive ? "text-forest" : "text-ink")}
                    >
                      <span className="pl-1.5">{t(item.label)}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
                {!expanded && <span className="sr-only">{t(item.label)}</span>}
              </>
            );
            const cls = "relative flex h-full min-w-11 items-center justify-center rounded-full px-3 outline-offset-2 transition-transform duration-150 active:scale-[0.92]";
            const events = {
              onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setHover(item.key),
              onFocus: () => setHover(item.key),
              onBlur: () => setHover(null),
            };
            return item.to ? (
              <motion.div key={item.key} layout={!reduce} transition={lensSpring} className="h-full">
                <Link to={item.to} aria-current={isActive ? "page" : undefined} className={cls} onClick={() => tick(6)} {...events}>
                  {content}
                </Link>
              </motion.div>
            ) : (
              <motion.div key={item.key} layout={!reduce} transition={lensSpring} className="h-full">
                <button type="button" className={cls} onClick={item.onSelect} {...events}>
                  {content}
                </button>
              </motion.div>
            );
          })}
        </motion.nav>
      </LayoutGroup>

      <button
        type="button"
        onClick={() => {
          tick(6);
          nav("/cart");
        }}
        aria-label={`${t("nav_cart")}${count ? ` (${count})` : ""}`}
        aria-current={cartActive ? "page" : undefined}
        className={cn("liquid relative flex size-[3.6rem] shrink-0 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.92]", cartActive && "ring-2 ring-forest/70")}
      >
        <ShoppingBag className={cn("size-[22px]", cartActive ? "text-forest" : "text-ink/80")} strokeWidth={cartActive ? 2.2 : 1.8} />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={reduce ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.55, duration: 0.45 }}
              className="tabular absolute -top-0.5 -right-0.5 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-forest px-1.5 text-[11px] font-bold text-white ring-2 ring-white/80"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
