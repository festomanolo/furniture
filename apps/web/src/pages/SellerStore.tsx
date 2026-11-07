import { useParams } from "react-router";
import { MapPin, MessageCircle, Store } from "lucide-react";
import { useProducts, useSeller } from "@/api/hooks";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Rating, VerifiedMark } from "@/components/ui/Badges";
import { Img } from "@/components/ui/Img";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useT } from "@/lib/i18n";

export default function SellerStore() {
  const { slug = "" } = useParams();
  const { t, locale } = useT();
  const { data: s, isLoading, isError, refetch } = useSeller(slug);
  const { data: products, isLoading: pl } = useProducts({ sellerId: s?.id, pageSize: 40 }, !!s?.id);
  if (isLoading) return <Skeleton className="mx-4 h-64 rounded-[1.75rem]" />;
  if (isError || !s) return <ErrorState onRetry={() => refetch()} />;
  const kind = { shop: ["Furniture shop", "Duka la samani"], carpenter: ["Carpenter", "Fundi seremala"], manufacturer: ["Manufacturer", "Kiwanda"], interior_designer: ["Interior designer", "Mbunifu wa ndani"] }[s.kind][locale === "sw" ? 1 : 0];
  return (
    <div>
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Img base={s.cover} alt="" sizes="100vw" priority wrapperClassName="h-52 sm:h-72 sm:rounded-[1.75rem]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-10 rounded-[1.5rem] bg-paper p-5 shadow-soft ring-1 ring-line sm:mx-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-[-0.03em]">
                {s.name} <VerifiedMark status={s.verification} />
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Store className="size-3.5" /> {kind} <span aria-hidden>·</span> <MapPin className="size-3.5" /> {s.district}, {s.region}
              </p>
            </div>
            <Rating value={s.rating} count={s.reviewCount} className="text-sm" />
          </div>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ink/80">{s.bio}</p>
          <div className="tabular mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <span>
              <b className="text-ink">{s.yearsActive}</b> {t("years_active")}
            </span>
            <span>
              <b className="text-ink">{s.completedOrders.toLocaleString()}</b> {t("orders_done")}
            </span>
            <span>
              {t("replies_in")} <b className="text-ink">{s.responseHours}{t("hours")}</b>
            </span>
          </div>
          {s.whatsapp && (
            <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-medium text-white">
              <MessageCircle className="size-4" /> {t("contact_seller")}
            </a>
          )}
        </div>
        <h2 className="mt-10 mb-4 text-xl font-semibold tracking-[-0.02em]">
          {t("storefront_products")} <span className="tabular text-base font-normal text-muted">({products?.total ?? 0})</span>
        </h2>
        {products?.total === 0 ? <EmptyState icon={<Store className="size-7" />} title={t("no_results_title")} body="" /> : <ProductGrid products={products?.items} loading={pl} />}
      </div>
    </div>
  );
}
