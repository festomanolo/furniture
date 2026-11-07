import { Link, useParams } from "react-router";
import { ChevronRight, Package } from "lucide-react";
import type { SellerOrderStatus } from "@samani/shared";
import { useOrders } from "@/api/hooks";
import { PageHeader } from "@/components/layout/Section";
import { TotalsCard } from "@/components/product/Totals";
import { Img } from "@/components/ui/Img";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { formatDate, tzs } from "@/lib/format";
import { useT, type TKey } from "@/lib/i18n";

const STEPS: SellerOrderStatus[] = ["awaiting_seller_confirmation", "confirmed", "in_production", "dispatched", "delivered"];
const stepLabel: Record<string, { en: string; sw: string }> = {
  awaiting_seller_confirmation: { en: "Awaiting seller", sw: "Inasubiri muuzaji" },
  confirmed: { en: "Confirmed", sw: "Imekubaliwa" },
  in_production: { en: "Preparing", sw: "Inaandaliwa" },
  dispatched: { en: "On the way", sw: "Njiani" },
  delivered: { en: "Delivered", sw: "Imefika" },
};

export function OrdersList() {
  const { t, locale } = useT();
  const { data, isLoading, isError, refetch } = useOrders();
  return (
    <div>
      <PageHeader title={t("orders")} />
      <div className="mx-auto grid max-w-3xl gap-3 px-4 sm:px-6">
        {isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-28 rounded-[1.5rem]" />)}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data?.length === 0 && (
          <EmptyState
            icon={<Package className="size-7" />}
            title={t("orders_empty")}
            body={t("orders_empty_body")}
            action={<Link to="/explore" className="inline-flex h-11 items-center rounded-full bg-forest px-6 font-medium text-white">{t("hero_cta")}</Link>}
          />
        )}
        {data?.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center gap-4 rounded-[1.5rem] bg-paper p-4 ring-1 ring-line hover:ring-sage-deep">
            <div className="flex -space-x-4">
              {o.sellerOrders.flatMap((s) => s.lines).slice(0, 3).map((l, i) => (
                <Img key={i} base={l.image} alt="" sizes="64px" wrapperClassName="size-14 rounded-2xl ring-2 ring-paper" />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="tabular font-semibold">{o.reference}</p>
              <p className="text-sm text-muted">
                {formatDate(o.createdAt, locale)} · {o.sellerOrders.length} {locale === "sw" ? "wauzaji" : o.sellerOrders.length === 1 ? "seller" : "sellers"}
              </p>
              <p className="tabular mt-0.5 text-sm font-medium">{tzs(o.totals.payable, locale)}</p>
            </div>
            <ChevronRight className="size-5 text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { t, locale } = useT();
  const { data, isLoading } = useOrders();
  const o = data?.find((x) => x.id === id);
  if (isLoading) return <Skeleton className="mx-auto mt-6 h-96 max-w-3xl rounded-[1.5rem]" />;
  if (!o) return <EmptyState icon={<Package className="size-7" />} title="404" body={t("orders_empty_body")} />;
  return (
    <div>
      <PageHeader title={o.reference} sub={formatDate(o.createdAt, locale)} />
      <div className="mx-auto grid max-w-3xl gap-5 px-4 sm:px-6">
        {o.sellerOrders.map((so) => {
          const idx = Math.max(0, STEPS.indexOf(so.status));
          return (
            <section key={so.id} className="rounded-[1.5rem] bg-paper p-5 ring-1 ring-line">
              <h2 className="font-semibold">{so.sellerName}</h2>
              <p className="text-sm text-muted">{t(so.deliveryMethod as TKey)}</p>
              <ol className="mt-5 grid grid-cols-5 gap-1" aria-label="Progress">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex flex-col gap-2">
                    <span className={`h-1.5 rounded-full ${i <= idx ? "bg-forest" : "bg-sage"}`} />
                    <span className={`text-[11px] leading-tight [overflow-wrap:anywhere] ${i === idx ? "font-semibold text-forest" : "text-muted"}`}>{stepLabel[s]![locale]}</span>
                  </li>
                ))}
              </ol>
              <ul className="mt-5 divide-y divide-line">
                {so.lines.map((l) => (
                  <li key={l.productId + (l.variantId ?? "")} className="flex items-center gap-3 py-3">
                    <Img base={l.image} alt="" sizes="56px" wrapperClassName="size-14 rounded-xl" />
                    <span className="flex-1 text-sm">
                      {l.name} <span className="text-muted">× {l.quantity}</span>
                    </span>
                    <span className="tabular text-sm font-medium">{tzs(l.unitPrice * l.quantity, locale)}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <TotalsCard totals={o.totals} requiresConfirmation={o.sellerOrders.some((s) => s.requiresConfirmation)} />
      </div>
    </div>
  );
}
