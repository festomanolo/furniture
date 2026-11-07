import { useState, type FormEvent, type PointerEvent } from "react";
import { Link } from "react-router";
import { LayoutGroup, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { newsletterSchema } from "@samani/shared";
import { api } from "@/api/client";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";
import { errorText, useT, type TKey } from "@/lib/i18n";
import { brandImage } from "@/lib/media";
import { usePrefs } from "@/stores/prefs";
import { toast } from "@/stores/toast";
import { Logo } from "./Logo";

const FOOTER_PHOTO = "blush-chesterfield-salon";

type Col = { title: TKey; links: { to: string; label: TKey | { en: string; sw: string } }[] };
const COLUMNS: Col[] = [
  {
    title: "col_shop",
    links: [
      { to: "/explore", label: "all_categories" },
      { to: "/explore?sort=newest", label: "new_arrivals" },
      { to: "/explore?maxPrice=600000&sort=price_asc", label: "under_600k" },
      { to: "/category/sofas", label: { en: "Sofas", sw: "Sofa" } },
      { to: "/category/beds", label: { en: "Beds", sw: "Vitanda" } },
    ],
  },
  {
    title: "col_custom",
    links: [
      { to: "/custom-studio", label: "nav_studio" },
      { to: "/quotations", label: "quotations" },
      { to: "/help/custom", label: "how_custom_works" },
    ],
  },
  {
    title: "col_sell",
    links: [
      { to: "/help/selling", label: "sell_with_us" },
      { to: "/help/standards", label: "seller_standards" },
    ],
  },
  {
    title: "col_support",
    links: [
      { to: "/help/delivery", label: "help_delivery" },
      { to: "/help/returns", label: "help_returns" },
      { to: "/help/contact", label: "help_contact" },
      { to: "/help/privacy", label: "help_privacy" },
      { to: "/help/terms", label: "help_terms" },
    ],
  },
];

const lensSpring = { type: "spring", bounce: 0.2, duration: 0.45 } as const;

export function Footer() {
  const { t, locale } = useT();
  const reduce = useReducedMotion();
  const photo = brandImage(FOOTER_PHOTO);
  const [hovered, setHovered] = useState<string | null>(null);

  // Specular sheen that follows the pointer across the glass (mouse only, no re-renders).
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgb(255 255 255 / 0.32), transparent 60%)`;
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const photoStyle = { backgroundImage: `image-set(url(${photo.src}) 1x, url(${photo.src.replace("-960", "-1920")}) 2x)` };

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
