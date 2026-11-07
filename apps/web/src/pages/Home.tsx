import { useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, Camera, MessagesSquare, Ruler, Search, Star } from "lucide-react";
import type { Product, SellerSummary } from "@samani/shared";
import { useCategories, useProducts, useSellers } from "@/api/hooks";
import { Img } from "@/components/ui/Img";
import { Button } from "@/components/ui/Button";
import { Rating, VerifiedMark } from "@/components/ui/Badges";
import { Skeleton } from "@/components/ui/Skeleton";
import { Section } from "@/components/layout/Section";
import { ProductRail } from "@/components/product/Rail";
import { ProductCard } from "@/components/product/ProductCard";
import { Price } from "@/components/product/Price";
import { inspiration } from "@/data/seed";
import { brandImage } from "@/lib/media";
import { easeOutExpo, reveal, stagger } from "@/lib/motion";
import { useT } from "@/lib/i18n";
import { usePrefs } from "@/stores/prefs";

export default function Home() {
  return (
    <div className="pb-4">
      <Hero />
      <div className="space-y-16 pt-8 sm:space-y-20">
        <Categories />
        <PopularNearYou />
        <CustomStudioFeature />
        <Affordable />
        <Trending />
        <Carpenters />
        <VerifiedShops />
        <BestSellers />
        <RecentlyAdded />
        <Inspiration />
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useT();
  const nav = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Slow push-in as the page scrolls away: adds depth, communicates "leaving the hero".
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
  const img = brandImage("hero-forest-lounge");

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <motion.div style={{ scale, y }} className="absolute inset-0 -z-10 origin-bottom">
        <img src={img.src} srcSet={img.srcSet} sizes="100vw" alt="" fetchPriority="high" className="size-full object-cover object-[38%_50%]" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(16_45_32/0.38)_0%,rgb(16_45_32/0.06)_32%,rgb(16_45_32/0.2)_58%,rgb(16_45_32/0.86)_100%)]" />

      <motion.div
        variants={stagger(0.09)}
        initial={reduce ? "show" : "hidden"}
        animate="show"
        className="mx-auto flex min-h-[86dvh] max-w-7xl flex-col justify-end px-5 pt-32 pb-24 sm:px-6 md:min-h-[78dvh] lg:min-h-[86dvh] lg:px-8 lg:pb-28"
      >
        <motion.h1
          variants={reveal}
          className="max-w-[14ch] text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-white sm:text-6xl lg:max-w-[16ch] lg:text-7xl"
        >
          {t("hero_title")}
        </motion.h1>
        <motion.p variants={reveal} className="mt-4 max-w-[38ch] text-[16px] leading-relaxed text-white/85 sm:text-lg">
          {t("hero_sub")}
        </motion.p>
        <motion.div variants={reveal} className="mt-7 flex flex-wrap gap-3">
          <Button size="lg" className="bg-ivory text-forest shadow-lift hover:bg-white" onClick={() => nav("/explore")}>
            {t("hero_cta")} <ArrowRight className="size-[18px]" />
          </Button>
          <Button size="lg" variant="ghost" className="glass-dark text-white hover:bg-white/10" onClick={() => nav("/custom-studio")}>
            {t("hero_cta_custom")}
          </Button>
        </motion.div>
      </motion.div>

      {/* Search pill straddles the hero edge: the most-used action is one tap away. */}
      <div className="absolute inset-x-0 bottom-0 translate-y-1/2 px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.45, duration: 0.7, ease: easeOutExpo }}
          onClick={() => nav("/search")}
          className="glass glass-sheen mx-auto flex h-14 w-full max-w-2xl items-center gap-3 rounded-full px-5 text-left text-muted active:scale-[0.99]"
        >
          <Search className="size-5 text-forest" />
          <span className="truncate text-[15px]">{t("search_placeholder")}</span>
        </motion.button>
      </div>
    </section>
  );
}

function Categories() {
  const { t, locale } = useT();
  const { data, isLoading } = useCategories();
  return (
    <Section title={t("shop_by_category")} href="/explore" className="pt-6">
      <div className="scrollbar-none -mx-4 grid snap-x auto-cols-[5.5rem] grid-flow-col grid-rows-2 gap-x-3 gap-y-5 scroll-row scroll-px-4 px-4 sm:-mx-6 sm:auto-cols-[6.5rem] sm:px-6 lg:mx-0 lg:grid-flow-row lg:grid-cols-9 lg:grid-rows-none lg:overflow-visible lg:[contain:none] lg:px-0">
        {isLoading
          ? Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="aspect-square w-full rounded-[1.4rem]" />)
          : data?.map((c) => (
              <Link key={c.id} to={`/category/${c.slug}`} className="group snap-start text-center">
                <Img base={c.image} alt="" sizes="110px" wrapperClassName="aspect-square rounded-[1.4rem] shadow-soft" className="group-hover:scale-105" />
                <span className="mt-2 line-clamp-2 block text-[12.5px] leading-tight font-medium">{c.name[locale]}</span>
              </Link>
            ))}
      </div>
    </Section>
  );
}

function PopularNearYou() {
  const { t } = useT();
  const region = usePrefs((s) => s.region);
  const { data, isLoading } = useProducts({ region, sort: "recommended", pageSize: 8, inStockOnly: true });
  const items = data?.items.length ? data.items : undefined;
  return (
    <Section title={t("popular_near")} sub={region} href={`/explore?region=${encodeURIComponent(region)}&stock=1`}>
      <ProductRail products={items} loading={isLoading} />
    </Section>
  );
}

function CustomStudioFeature() {
  const { t, locale } = useT();
  const img = brandImage("emerald-alcove");
  const steps = [
    { icon: Camera, label: locale === "sw" ? "Tuma picha au mchoro" : "Share a photo or sketch" },
    { icon: Ruler, label: locale === "sw" ? "Weka vipimo na bajeti" : "Add sizes and budget" },
    { icon: MessagesSquare, label: locale === "sw" ? "Linganisha bei za mafundi" : "Compare carpenter quotes" },
  ];
  return (
    <section className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden sm:rounded-[2rem]">
        <img src={img.src} srcSet={img.srcSet} sizes="(min-width:1280px) 1240px, 100vw" alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover object-[50%_60%]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(16_45_32/0.7),rgb(16_45_32/0.15)_70%)]" />
        <div className="grid min-h-[34rem] items-end p-4 sm:p-8 lg:min-h-[36rem] lg:grid-cols-2 lg:items-center lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: easeOutExpo }}
            className="glass-dark rounded-[1.75rem] p-6 sm:p-8"
          >
            <h2 className="text-[28px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{t("made_for_you")}</h2>
            <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-white/80">{t("made_for_you_sub")}</p>
            <ol className="mt-6 grid gap-3">
              {steps.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/20">
                    <Icon className="size-4 text-gold" />
                  </span>
                  {label}
                </li>
              ))}
            </ol>
            <Link
              to="/custom-studio"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-[15px] font-semibold text-forest-deep transition-transform active:scale-[0.97]"
            >
              {t("start_request")} <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Affordable() {
  const { t } = useT();
  const { data: sellers } = useSellers();
  const { data, isLoading } = useProducts({ maxPrice: 600000, sort: "popular", pageSize: 4 });
  return (
    <Section title={t("affordable")} sub={t("affordable_sub")} href="/explore?maxPrice=600000&sort=price_asc">
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-square rounded-[var(--radius-card)]" />)
          : data?.items.map((p) => <ProductCard key={p.id} product={p} seller={sellers?.find((s) => s.id === p.sellerId)} />)}
      </div>
    </Section>
  );
}

/** Asymmetric bento: one hero product plus three supporting tiles. */
function Trending() {
  const { t } = useT();
  const { data, isLoading } = useProducts({ sort: "rating", pageSize: 4, minRating: 4.7 });
  const [lead, ...rest] = data?.items ?? [];
  return (
    <Section title={t("trending")} href="/explore?sort=rating">
      {isLoading || !lead ? (
        <Skeleton className="h-[28rem] w-full rounded-[2rem]" />
      ) : (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.35fr_1fr] lg:grid-rows-3">
          <BentoTile product={lead} big />
          {rest.map((p) => (
            <BentoTile key={p.id} product={p} />
          ))}
        </div>
      )}
    </Section>
  );
}

function BentoTile({ product, big }: { product: Product; big?: boolean }) {
  const img = product.images[0]!;
  return (
    <Link
      to={`/product/${product.slug}`}
      className={
        big
          ? "group relative isolate block min-h-[24rem] overflow-hidden rounded-[1.75rem] lg:row-span-3"
          : "group flex items-center gap-4 rounded-[1.5rem] bg-paper p-2.5 pr-4 shadow-soft transition-shadow hover:shadow-lift"
      }
    >
      {big ? (
        <>
          <Img base={img.src} alt={img.alt} sizes="(min-width:1024px) 55vw, 100vw" wrapperClassName="absolute inset-0 -z-10" className="group-hover:scale-[1.03]" />
          <div className="absolute inset-x-3 bottom-3 glass glass-sheen flex items-end justify-between gap-3 rounded-[1.35rem] p-4">
            <div className="min-w-0">
              <h3 className="truncate text-[17px] font-semibold tracking-[-0.02em]">{product.name}</h3>
              <Price price={product.price} compareAt={product.compareAtPrice} className="mt-1" />
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest text-white">
              <ArrowUpRight className="size-5" />
            </span>
          </div>
        </>
      ) : (
        <>
          <Img base={img.src} alt={img.alt} sizes="128px" wrapperClassName="size-24 shrink-0 rounded-[1.1rem] sm:size-28" />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[15px] leading-snug font-medium">{product.name}</h3>
            <Price price={product.price} compareAt={product.compareAtPrice} className="mt-1" />
            <Rating value={product.rating} count={product.reviewCount} className="mt-1.5" />
          </div>
        </>
      )}
    </Link>
  );
}

function Monogram({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /[A-Z]/.test(w[0] ?? ""))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span className={`flex items-center justify-center rounded-full bg-forest text-sm font-semibold tracking-wide text-gold ring-4 ring-paper ${className ?? ""}`} aria-hidden>
      {initials}
    </span>
  );
}

function Carpenters() {
  const { t } = useT();
  const { data, isLoading } = useSellers();
  const list = data?.filter((s) => s.kind === "carpenter" && s.verification === "verified");
  return (
    <Section title={t("featured_carpenters")}>
      <div className="scrollbar-none -mx-4 flex snap-x gap-3 scroll-row scroll-px-4 px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:[contain:none] lg:px-0">
        {isLoading && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64 w-[78%] max-w-80 shrink-0 rounded-[1.5rem] lg:w-auto lg:max-w-none" />)}
        {list?.map((s) => <MakerCard key={s.id} seller={s} />)}
      </div>
    </Section>
  );
}

function MakerCard({ seller }: { seller: SellerSummary }) {
  const { t } = useT();
  return (
    <Link to={`/seller/${seller.slug}`} className="group w-[78%] max-w-80 shrink-0 snap-start overflow-hidden rounded-[1.5rem] bg-paper shadow-soft transition-shadow hover:shadow-lift lg:w-auto lg:max-w-none">
      <Img base={seller.cover} alt="" sizes="(min-width:1024px) 30vw, 78vw" wrapperClassName="h-36" className="group-hover:scale-[1.03]" />
      <div className="relative px-4 pt-8 pb-4">
        <Monogram name={seller.name} className="absolute -top-6 left-4 size-12" />
        <p className="flex items-center gap-1.5 font-semibold tracking-[-0.01em]">
          <span className="truncate">{seller.name}</span>
          <VerifiedMark status={seller.verification} />
        </p>
        <p className="mt-0.5 text-[13px] text-muted">
          {seller.district}, {seller.region}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <Rating value={seller.rating} count={seller.reviewCount} />
          <span className="tabular">
            {seller.completedOrders.toLocaleString()} {t("orders_done")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function VerifiedShops() {
  const { t } = useT();
  const { data, isLoading } = useSellers();
  const shops = data?.filter((s) => s.kind !== "carpenter" && s.verification === "verified");
  return (
    <Section title={t("verified_shops")}>
      <ul className="grid gap-2.5 md:grid-cols-2">
        {isLoading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        {shops?.map((s) => (
          <li key={s.id}>
            <Link to={`/seller/${s.slug}`} className="flex items-center gap-3.5 rounded-2xl bg-paper p-3 pr-4 ring-1 ring-line transition-colors hover:ring-sage-deep">
              <Monogram name={s.name} className="size-12 shrink-0 ring-0" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                  <span className="truncate">{s.name}</span>
                  <VerifiedMark status={s.verification} />
                </p>
                <p className="truncate text-[13px] text-muted">
                  {s.district}, {s.region}
                </p>
              </div>
              <span className="tabular flex items-center gap-1 text-sm font-medium">
                <Star className="size-4 fill-gold text-gold" /> {s.rating.toFixed(1)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function BestSellers() {
  const { t } = useT();
  const { data, isLoading } = useProducts({ sort: "popular", pageSize: 8 });
  return (
    <Section title={t("best_sellers")} href="/explore?sort=popular">
      <ProductRail products={data?.items} loading={isLoading} />
    </Section>
  );
}

function RecentlyAdded() {
  const { t } = useT();
  const { data, isLoading } = useProducts({ sort: "newest", pageSize: 8 });
  return (
    <Section title={t("recently_added")} href="/explore?sort=newest">
      <ProductRail products={data?.items} loading={isLoading} />
    </Section>
  );
}

function Inspiration() {
  const { t, locale } = useT();
  return (
    <Section title={t("inspiration")}>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-[1.25fr_1fr]">
        {inspiration.map((it, i) => {
          const img = brandImage(it.image);
          return (
            <Link
              key={it.image}
              to={`/search?q=${encodeURIComponent(it.query)}`}
              className={`group relative isolate block overflow-hidden rounded-[1.75rem] ${i === 0 ? "aspect-[4/5] md:row-span-2 md:aspect-auto" : "aspect-[16/10]"}`}
            >
              <img src={img.src} srcSet={img.srcSet} sizes="(min-width:768px) 55vw, 100vw" alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_50%,rgb(16_45_32/0.7))]" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 text-white">
                <h3 className="max-w-[18ch] text-xl leading-tight font-semibold tracking-[-0.025em] sm:text-2xl">{it.title[locale]}</h3>
                <span className="glass-dark flex size-11 shrink-0 items-center justify-center rounded-full">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
