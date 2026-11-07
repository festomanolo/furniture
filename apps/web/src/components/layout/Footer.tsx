import { useLayoutEffect, useRef, useState, type FormEvent, type PointerEvent, type RefObject } from "react";
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

  const footerRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const align = useCoverAlign(footerRef, markRef, photo.src, 0.5, 0.62);

  const photoStyle = { backgroundImage: `image-set(url(${photo.src}) 1x, url(${photo.src.replace("-960", "-1920")}) 2x)` };

  return (
    <footer ref={footerRef} className="relative isolate mt-24 overflow-hidden [container-type:inline-size] [--fpb:calc(env(safe-area-inset-bottom)+6.75rem)] lg:[--fpb:3rem]">
      {/* The room behind the glass */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-cover bg-[center_62%]" style={photoStyle} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(245_245_240)_0%,rgb(245_245_240/0)_14%,transparent_70%,rgb(16_45_32/0.25))]" />

      <div className="relative mx-auto max-w-7xl px-3 pt-20 pb-[var(--fpb)] sm:px-6 lg:px-8 lg:pt-28">
        <div onPointerMove={onMove} onPointerLeave={() => (mx.set(-400), my.set(-400))} className="liquid-panel overflow-hidden rounded-[2.25rem] p-5 pb-5 sm:p-8 lg:p-10 lg:pb-5">
          <motion.div aria-hidden style={{ background: sheen }} className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]" />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] lg:gap-12">
            <Newsletter />

            <LayoutGroup id="footer-links">
              <nav
                aria-label="Footer"
                onPointerLeave={() => setHovered(null)}
                className="grid grid-cols-2 gap-x-4 gap-y-7 rounded-[1.6rem] border border-white/45 bg-white/22 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] sm:grid-cols-4 sm:p-6"
              >
                {COLUMNS.map((col) => (
                  <div key={col.title}>
                    <h3 className="mb-2.5 px-2.5 text-[12px] font-semibold tracking-[0.02em] text-ink/55">{t(col.title)}</h3>
                    <ul className="grid gap-0.5">
                      {col.links.map((l) => {
                        const id = `${col.title}:${l.to}`;
                        const label = typeof l.label === "string" ? t(l.label) : l.label[locale];
                        return (
                          <li key={id}>
                            <Link
                              to={l.to}
                              onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(id)}
                              onFocus={() => setHovered(id)}
                              onBlur={() => setHovered(null)}
                              className="relative inline-flex min-h-9 items-center rounded-full px-2.5 text-[14px] text-ink/85 transition-colors hover:text-ink"
                            >
                              {hovered === id && <motion.span layoutId="footer-lens" transition={lensSpring} className="liquid-lens absolute inset-0 -z-0 rounded-full" />}
                              <span className="relative">{label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </LayoutGroup>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[13px] text-ink/70">
              © {new Date().getFullYear()} SAMANI. {t("footer_made")}.
            </p>
            <div className="flex items-center gap-2">
              {env.supportWhatsapp && (
                <a
                  href={`https://wa.me/${env.supportWhatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="liquid flex size-11 items-center justify-center rounded-full text-forest"
                >
                  <MessageCircle className="size-[18px]" />
                </a>
              )}
              <LanguagePill />
            </div>
          </div>

          {/* Reserves the space the see-through wordmark occupies inside the panel. */}
          <div aria-hidden className="h-[calc(min(21cqw,17.5rem)*0.74)]" />
        </div>
      </div>

      {/*
        See-through wordmark: the same photo, unblurred and pixel-aligned with the room
        behind, clipped to the letters. Reads as clear glass cut into the frosted panel.
        The layer only spans the wordmark strip (large clip-text layers fail on Android WebView),
        so its background is aligned to the footer photo by useCoverAlign.
      */}
      <div ref={markRef} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[var(--fpb)] flex justify-center pb-[1.15rem] select-none">
        <span
          className="block bg-no-repeat text-[min(21cqw,17.5rem)] leading-[0.74] font-semibold tracking-[-0.055em] text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.55)]"
          style={{ backgroundImage: `url(${photo.src.replace("-960", "-1920")})`, backgroundSize: align.size, backgroundPosition: align.pos, WebkitBackgroundClip: "text", backgroundClip: "text" }}
        >
          SAMANI
        </span>
      </div>
      {/* Specular sheen on the letters, a separate layer so the photo stays crisp. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[var(--fpb)] flex justify-center pb-[1.15rem] select-none">
        <span className="bg-[linear-gradient(180deg,rgb(255_255_255/0.5),rgb(255_255_255/0)_38%,rgb(255_255_255/0)_70%,rgb(255_255_255/0.22))] bg-clip-text text-[min(21cqw,17.5rem)] leading-[0.74] font-semibold tracking-[-0.055em] text-transparent [-webkit-background-clip:text] [filter:drop-shadow(0_18px_28px_rgb(16_45_32/0.28))]">
          SAMANI
        </span>
      </div>
    </footer>
  );
}

function Newsletter() {
  const { t, locale } = useT();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(errorText(locale, parsed.error.issues[0]?.message));
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      const r = await api.subscribeNewsletter(parsed.data.email, locale);
      toast(r.alreadySubscribed ? t("already_subscribed") : t("subscribed"), "success");
      setEmail("");
    } catch {
      toast(t("error_title"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Logo />
      <h2 className="mt-5 max-w-[17ch] text-[26px] leading-[1.12] font-semibold tracking-[-0.035em] text-balance text-ink sm:text-[32px]">{t("newsletter_title")}</h2>
      <form onSubmit={submit} noValidate className="mt-6 max-w-md">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("email")}
        </label>
        <div
          className={cn(
            "flex h-14 items-center rounded-full border bg-forest-deep/80 p-1.5 pl-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_10px_30px_-12px_rgb(16_45_32/0.6)] backdrop-blur-md transition-[border-color] focus-within:border-gold",
            error ? "border-red-300" : "border-white/15",
          )}
        >
          <input
            id="newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email_placeholder")}
            aria-invalid={!!error}
            aria-describedby={error ? "newsletter-err" : "newsletter-note"}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/55"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-ivory px-4 text-[14px] font-semibold text-forest-deep transition-transform active:scale-[0.96] disabled:opacity-70"
          >
            {busy ? <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden /> : null}
            {t("subscribe")}
            {!busy && <ArrowRight className="size-4" />}
          </button>
        </div>
        {error ? (
          <p id="newsletter-err" className="mt-2 pl-5 text-[13px] font-medium text-danger">
            {error}
          </p>
        ) : (
          <p id="newsletter-note" className="mt-2 pl-5 text-[13px] text-ink/65">
            {t("newsletter_note")}
          </p>
        )}
      </form>
    </div>
  );
}

function LanguagePill() {
  const { t, locale } = useT();
  const setLocale = usePrefs((s) => s.setLocale);
  return (
    <div role="radiogroup" aria-label={t("language")} className="liquid flex h-11 items-center gap-0.5 rounded-full p-1">
      {(["sw", "en"] as const).map((l) => (
        <button key={l} role="radio" aria-checked={locale === l} onClick={() => setLocale(l)} className="relative h-9 rounded-full px-3.5 text-[13px] font-semibold">
          {locale === l && <motion.span layoutId="lang-lens" transition={lensSpring} className="absolute inset-0 rounded-full bg-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]" />}
          <span className={cn("relative", locale === l ? "text-white" : "text-ink/70")}>{l === "sw" ? "Kiswahili" : "English"}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Computes background-size/position so an element's background lines up exactly with a
 * `background-size: cover` photo on an ancestor (posX/posY = the ancestor's background-position).
 */
function useCoverAlign(outer: RefObject<HTMLElement | null>, inner: RefObject<HTMLElement | null>, src: string, posX: number, posY: number) {
  const [align, setAlign] = useState({ size: "cover", pos: "center" });
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current?.firstElementChild as HTMLElement | null;
    if (!o || !i) return;
    let natural: { w: number; h: number } | null = null;
    const compute = () => {
      if (!natural) return;
