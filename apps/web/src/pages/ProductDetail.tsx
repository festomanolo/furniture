import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Camera, ChevronLeft, Clock, Hammer, MapPin, MessageCircle, Ruler, Share2, ShieldCheck, ShoppingBag, Truck, X, ZoomIn } from "lucide-react";
import type { DeliveryOption, Product } from "@samani/shared";
import { api } from "@/api/client";
import { ApiError } from "@/api/types";
import { useProduct, useProducts, useReviews, useSeller } from "@/api/hooks";
import { Section } from "@/components/layout/Section";
import { DiscountPill, Price } from "@/components/product/Price";
import { ProductRail } from "@/components/product/Rail";
import { SaveButton } from "@/components/product/SaveButton";
import { AvailabilityText, FulfilmentTag, Rating, VerifiedMark } from "@/components/ui/Badges";
import { Button, IconButton } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { formatDate, range, tzs } from "@/lib/format";
import { tick } from "@/lib/haptics";
import { useT, type TKey } from "@/lib/i18n";
import { imageSet } from "@/lib/media";
import { useCart } from "@/stores/cart";
import { useRecent } from "@/stores/recent";
import { toast } from "@/stores/toast";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { data: p, isLoading, isError, error, refetch } = useProduct(slug);
  const push = useRecent((s) => s.push);
  useEffect(() => {
    if (p) {
      push(p.slug);
      document.title = `${p.name} | SAMANI`;
    }
    return () => {
      document.title = "SAMANI - Furniture, Made Accessible.";
    };
  }, [p, push]);

  if (isLoading) return <DetailSkeleton />;
  if (isError) {
    if (error instanceof ApiError && error.status === 404) return <EmptyState icon={<Search404 />} title="404" body="This piece is no longer listed." action={<Link to="/explore" className="text-forest underline">Explore</Link>} />;
    return <ErrorState onRetry={() => refetch()} />;
  }
  if (!p) return null;
  return <Detail key={p.id} p={p} />;
}

function Search404() {
  return <X className="size-7" />;
}

function Detail({ p }: { p: Product }) {
  const { t, locale } = useT();
  const nav = useNavigate();
  const add = useCart((s) => s.add);
  const { data: seller } = useSeller(p.sellerId);
  const { data: reviews } = useReviews(p.id);
  const { data: related, isLoading: relLoading } = useProducts({ sort: "recommended", pageSize: 60 });
  const [variantId, setVariantId] = useState<string | null>(p.variants[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState<number | null>(null);
  const [requesting, setRequesting] = useState(false);
  const variant = p.variants.find((v) => v.id === variantId);
  const unit = p.price + (variant?.priceDelta ?? 0);
  const outOfStock = p.availability === "out_of_stock" || variant?.stock === 0;

  const addToCart = (go?: boolean) => {
    add(p.id, variantId, qty);
    tick(12);
    if (go) nav("/cart");
    else toast(t("added_to_cart"), "success", { label: t("nav_cart"), onClick: () => nav("/cart") });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.name, text: `${p.name} - ${tzs(unit, locale)}`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast(t("link_copied"), "success");
      }
    } catch {
      /* user cancelled share */
    }
  };

  const requestPhotos = async () => {
    setRequesting(true);
    try {
      await api.requestPhotos(p.id);
      toast(t("photos_requested"), "success");
    } catch {
      toast(t("error_title"), "error");
    } finally {
      setRequesting(false);
    }
  };

  const relatedItems = related?.items.filter((r) => r.id !== p.id && (r.categoryId === p.categoryId || r.sellerId === p.sellerId)).slice(0, 8);

  return (
    <article className="pb-28 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:px-8">
        <div className="relative lg:sticky lg:top-28 lg:self-start">
          <Gallery p={p} onZoom={setZoom} />
          <div className="absolute top-3 left-3 flex gap-2 lg:hidden">
            <IconButton label={t("back")} tone="glass" onClick={() => (history.length > 1 ? nav(-1) : nav("/explore"))}>
              <ChevronLeft className="size-5" />
            </IconButton>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <IconButton label={t("share")} tone="glass" onClick={share}>
              <Share2 className="size-[18px]" />
            </IconButton>
            <SaveButton productId={p.id} className="size-11" />
          </div>
        </div>

        <div className="pt-5 lg:pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <FulfilmentTag type={p.fulfilment} />
            <DiscountPill price={unit} compareAt={p.compareAtPrice ? p.compareAtPrice + (variant?.priceDelta ?? 0) : null} />
            <Rating value={p.rating} count={p.reviewCount} className="ml-auto" />
          </div>
          <h1 className="mt-3 text-[26px] leading-[1.12] font-semibold tracking-[-0.035em] text-balance sm:text-[32px]">{p.name}</h1>
          <Price price={unit} compareAt={p.compareAtPrice ? p.compareAtPrice + (variant?.priceDelta ?? 0) : null} size="lg" className="mt-3" />
          <div className="mt-2 flex items-center gap-3">
            <AvailabilityText value={variant?.stock === 0 ? "out_of_stock" : variant?.stock && variant.stock <= 5 ? "low_stock" : p.availability} />
            <span className="tabular text-sm text-muted">
              {p.soldCount} {t("sold")}
            </span>
          </div>

          {p.variants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="mb-3 text-sm font-semibold">
                {t("colour")}: <span className="font-normal text-muted">{variant?.label}</span>
              </legend>
              <div className="flex flex-wrap gap-2.5" role="radiogroup">
                {p.variants.map((v) => (
                  <button
                    key={v.id}
                    role="radio"
                    aria-checked={v.id === variantId}
                    aria-label={v.label}
                    onClick={() => setVariantId(v.id)}
                    className={cn("flex h-11 items-center gap-2 rounded-full border bg-paper pr-4 pl-1.5 text-sm transition-colors", v.id === variantId ? "border-forest ring-1 ring-forest" : "border-line")}
                  >
                    <span className="size-8 rounded-full ring-1 ring-black/10" style={{ background: v.colourHex }} />
                    {v.label}
                    {v.priceDelta > 0 && <span className="tabular text-xs text-muted">+{tzs(v.priceDelta, locale)}</span>}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-6 hidden items-center gap-3 lg:flex">
            <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, n))} label={t("qty")} />
            <Button size="lg" variant="secondary" className="flex-1" disabled={outOfStock} onClick={() => addToCart()}>
              {t("add_to_cart")}
            </Button>
            <Button size="lg" className="flex-1" disabled={outOfStock} onClick={() => addToCart(true)}>
              {t("buy_now")}
            </Button>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-3">
            <Spec icon={Ruler} label={t("dimensions")} value={`${p.dimensions.widthCm} × ${p.dimensions.depthCm} × ${p.dimensions.heightCm} cm`} />
            <Spec icon={Hammer} label={t("materials")} value={p.materials.join(", ")} />
            <Spec icon={Clock} label={t("production_time")} value={p.productionDays ? `${range(p.productionDays)} ${t("days")}` : t("ready_made")} />
            <Spec icon={ShieldCheck} label={t("warranty")} value={`${p.warrantyMonths} ${t("months")}`} />
          </dl>

          <section className="mt-8">
            <h2 className="text-base font-semibold">{t("description")}</h2>
            <p className="mt-2 max-w-[65ch] text-[15px] leading-relaxed text-ink/80">{p.description}</p>
            {p.dimensions.weightKg && (
              <p className="mt-2 text-sm text-muted">
                ≈ {p.dimensions.weightKg} kg
              </p>
            )}
          </section>

          <section className="mt-8 rounded-[1.5rem] bg-paper p-5 ring-1 ring-line">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Truck className="size-[18px] text-forest" /> {t("delivery")}
            </h2>
            <ul className="mt-3 divide-y divide-line">
              {p.delivery.map((d) => (
                <DeliveryRow key={d.method} d={d} />
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
              {t("installation")}: {p.installation.available ? (p.installation.fee === null ? t("quote_required") : p.installation.fee === 0 ? t("free") : tzs(p.installation.fee, locale)) : "-"}
            </p>
          </section>

          {seller && (
            <section className="mt-6 rounded-[1.5rem] bg-paper p-5 ring-1 ring-line">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[17px] font-semibold">
                    <span className="truncate">{seller.name}</span>
                    <VerifiedMark status={seller.verification} withLabel />
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                    <MapPin className="size-3.5" /> {t("seller_workshop")}: {seller.district}, {seller.region}
                  </p>
                </div>
                <Rating value={seller.rating} count={seller.reviewCount} />
              </div>
              <p className="mt-3 text-sm text-muted">
                {seller.yearsActive} {t("years_active")} · {t("replies_in")} {seller.responseHours}
                {t("hours")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/seller/${seller.slug}`} className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium hover:border-sage-deep">
                  {t("visit_store")}
                </Link>
                {seller.whatsapp ? (
                  <a
                    href={`https://wa.me/${seller.whatsapp}?text=${encodeURIComponent(`Habari, naulizia kuhusu ${p.name} (SAMANI): ${window.location.href}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-medium text-white"
                  >
                    <MessageCircle className="size-4" /> {t("contact_seller")}
                  </a>
                ) : (
                  <Link to="/messages" className="inline-flex h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-medium text-white">
                    <MessageCircle className="size-4" /> {t("contact_seller")}
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="h-10" loading={requesting} onClick={requestPhotos}>
                  <Camera className="size-4" /> {t("request_photos")}
                </Button>
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="flex items-baseline gap-2 text-base font-semibold">
              {t("reviews")} <span className="tabular text-sm font-normal text-muted">({p.reviewCount})</span>
            </h2>
            {reviews?.length ? (
              <ul className="mt-3 grid gap-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-paper p-4 ring-1 ring-line">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {r.author} <span className="font-normal text-muted">· {r.region}</span>
                      </span>
                      <Rating value={r.rating} />
                    </div>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink/80">{r.body}</p>
                    <p className="mt-2 text-xs text-muted">{formatDate(r.createdAt, locale)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">{reviews ? t("no_reviews") : ""}</p>
            )}
          </section>
        </div>
      </div>

      <Section title={t("related")} className="mt-16">
        <ProductRail products={relatedItems} loading={relLoading} />
      </Section>

      {/* Sticky purchase bar (mobile): sits above the tab bar. */}
      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-40 px-3 lg:hidden">
        <div className="glass glass-sheen mx-auto flex max-w-md items-center gap-2 rounded-full p-1.5 pl-5">
          <div className="min-w-0 flex-1">
            <p className="tabular truncate text-[15px] font-semibold">{tzs(unit * qty, locale)}</p>
            <p className="truncate text-[11px] text-muted">{p.fulfilment === "made_to_order" ? t("made_to_order") : t((p.availability === "low_stock" ? "low_stock" : "in_stock") as TKey)}</p>
          </div>
          <IconButton label={t("add_to_cart")} className="border border-line bg-paper disabled:opacity-50" disabled={outOfStock} onClick={() => addToCart()}>
            <ShoppingBag className="size-5" />
          </IconButton>
          <Button size="md" className="px-5" disabled={outOfStock} onClick={() => addToCart(true)}>
            {t("buy_now")}
          </Button>
        </div>
      </div>

      <ZoomViewer p={p} index={zoom} onClose={() => setZoom(null)} />
    </article>
  );
}

function Spec({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-sage/55 p-3.5">
      <dt className="flex items-center gap-1.5 text-xs text-muted">
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className="tabular mt-1 text-[14px] leading-snug font-medium">{value}</dd>
    </div>
  );
}

function DeliveryRow({ d }: { d: DeliveryOption }) {
  const { t, locale } = useT();
  const label = t(d.method as TKey);
  const fee = d.method === "customer_collection" ? t("free") : d.fee === null ? t("quote_required") : d.fee === 0 ? t("free") : tzs(d.fee, locale);
  return (
    <li className="flex items-start justify-between gap-4 py-3 text-sm">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-0.5 text-muted">
          {d.regions.length ? `${d.regions.slice(0, 3).join(", ")}${d.regions.length > 3 ? ` +${d.regions.length - 3}` : ""} · ` : ""}
          {range(d.etaDays)} {t("days")}
          {d.freeAbove ? ` · ${t("free")} > ${tzs(d.freeAbove, locale)}` : ""}
        </p>
      </div>
      <span className="tabular shrink-0 font-medium">{fee}</span>
    </li>
  );
}

function Gallery({ p, onZoom }: { p: Product; onZoom: (i: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("[data-i]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  const go = (i: number) => track.current?.children[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });

  return (
    <div>
      <div ref={track} className="scrollbar-none -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0 sm:rounded-[1.75rem]">
        {p.images.map((im, i) => (
          <button key={im.id} data-i={i} onClick={() => onZoom(i)} className="relative w-full shrink-0 snap-center cursor-zoom-in" aria-label={`${im.alt}. Zoom`}>
            <Img base={im.src} alt={im.alt} priority={i === 0} sizes="(min-width:1024px) 55vw, 100vw" wrapperClassName="aspect-square sm:aspect-[4/3.4] lg:aspect-square" />
            <span className="glass absolute right-3 bottom-3 hidden size-10 items-center justify-center rounded-full sm:flex">
              <ZoomIn className="size-4" />
            </span>
          </button>
        ))}
      </div>
      {p.images.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          {p.images.map((im, i) => (
            <button key={im.id} onClick={() => go(i)} aria-label={`Image ${i + 1}`} aria-current={i === active} className={cn("overflow-hidden rounded-xl ring-2 transition", i === active ? "ring-forest" : "ring-transparent opacity-70")}>
              <Img base={im.src} alt="" sizes="64px" wrapperClassName="size-14" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Full-screen viewer. Native pinch-zoom on touch; click-to-zoom at the pointer on desktop. */
function ZoomViewer({ p, index, onClose }: { p: Product; index: number | null; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");
  useEffect(() => {
    if (index === null) return;
    setScale(1);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, onClose]);
  const im = index !== null ? p.images[index] : undefined;
  const set = im ? imageSet(im.src) : null;
  return (
    <AnimatePresence>
      {im && set && (
        <motion.div
          role="dialog"
          aria-modal
          aria-label={im.alt}
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-auto bg-forest-deep/95"
          style={{ touchAction: "pinch-zoom" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <img
            src={set.src}
            srcSet={set.srcSet}
            sizes="100vw"
            alt={im.alt}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
              setScale((s) => (s > 1 ? 1 : 2.2));
            }}
            className={cn("max-h-full max-w-full object-contain transition-transform duration-300 ease-out", scale > 1 ? "cursor-zoom-out" : "cursor-zoom-in")}
            style={{ transform: `scale(${scale})`, transformOrigin: origin }}
          />
          <IconButton label="Close" tone="dark" className="pt-safe fixed top-4 right-4" onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:px-8" aria-busy>
      <Skeleton className="aspect-square w-full rounded-[1.75rem]" />
      <div className="pt-6">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-4 h-9 w-4/5" />
        <Skeleton className="mt-3 h-8 w-40" />
        <div className="mt-8 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="mt-8 h-28 w-full" />
      </div>
    </div>
  );
}
