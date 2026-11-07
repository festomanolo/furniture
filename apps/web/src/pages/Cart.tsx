import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, Store, Trash2 } from "lucide-react";
import { useProductsByIds, useSellers } from "@/api/hooks";
import { PageHeader } from "@/components/layout/Section";
import { TotalsCard } from "@/components/product/Totals";
import { VerifiedMark } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { priceCart, resolveLines } from "@/features/pricing";
import { tzs } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { spring } from "@/lib/motion";
import { useCart } from "@/stores/cart";
import { usePrefs } from "@/stores/prefs";
import { toast } from "@/stores/toast";

export default function Cart() {
  const { t, locale } = useT();
  const nav = useNavigate();
  const { items, setQty, remove, add } = useCart();
  const region = usePrefs((s) => s.region);
  const ids = [...new Set(items.map((i) => i.productId))];
  const { data: products, isLoading, isError, refetch } = useProductsByIds(ids);
  const { data: sellers } = useSellers();

  if (!items.length) {
    return (
      <>
        <PageHeader title={t("cart_title")} />
        <EmptyState
          icon={<ShoppingBag className="size-7" />}
          title={t("cart_empty_title")}
          body={t("cart_empty_body")}
          action={
            <Link to="/explore" className="inline-flex h-11 items-center rounded-full bg-forest px-6 font-medium text-white">
              {t("hero_cta")}
            </Link>
          }
        />
      </>
    );
  }
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const lines = resolveLines(items, products);
  const { bySeller, groups, totals } = priceCart(lines, "seller_delivery", region);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <PageHeader title={t("cart_title")} />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="grid gap-5">
          {isLoading && !products && <Skeleton className="h-48 rounded-[1.5rem]" />}
          {[...bySeller.entries()].map(([sellerId, own]) => {
            const seller = sellers?.find((s) => s.id === sellerId);
            const group = groups.find((g) => g.sellerId === sellerId)!;
            return (
              <section key={sellerId} className="rounded-[1.5rem] bg-paper p-4 ring-1 ring-line sm:p-5">
                <header className="mb-1 flex items-center gap-2">
                  <Store className="size-4 text-forest" />
                  <Link to={`/seller/${seller?.slug ?? ""}`} className="flex min-w-0 items-center gap-1.5 font-semibold">
                    <span className="truncate">{seller?.name}</span>
                    {seller && <VerifiedMark status={seller.verification} />}
                  </Link>
                </header>
                <p className="mb-3 text-xs text-muted">{t("delivered_separately")}</p>
                <ul className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {own.map(({ item, product, unitPrice, variantLabel }) => (
                      <motion.li
                        key={`${item.productId}:${item.variantId}`}
                        layout
                        exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
                        transition={spring}
                        className="flex gap-3.5 py-3.5"
                      >
                        <Link to={`/product/${product.slug}`} className="shrink-0">
                          <Img base={product.images[0]!.src} alt={product.name} sizes="96px" wrapperClassName="size-22 rounded-2xl sm:size-24" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link to={`/product/${product.slug}`} className="line-clamp-2 text-[14.5px] leading-snug font-medium">
                            {product.name}
                          </Link>
                          {variantLabel && <span className="text-xs text-muted">{variantLabel}</span>}
                          <span className="tabular mt-1 text-[15px] font-semibold">{tzs(unitPrice * item.quantity, locale)}</span>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QtyStepper value={item.quantity} label={t("qty")} onChange={(n) => setQty(item.productId, item.variantId, n)} />
                            <button
                              aria-label={t("remove")}
                              className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-sage hover:text-danger"
                              onClick={() => {
                                remove(item.productId, item.variantId);
                                toast(t("removed"), "default", { label: locale === "sw" ? "Rudisha" : "Undo", onClick: () => add(item.productId, item.variantId, item.quantity) });
                              }}
                            >
                              <Trash2 className="size-[18px]" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="tabular mt-2 flex justify-between border-t border-line pt-3 text-sm">
                  <span className="text-muted">
                    {t("subtotal")} · {t("delivery")}: {group.deliveryFee === null ? t("quote_required") : group.deliveryFee === 0 ? t("free") : tzs(group.deliveryFee, locale)}
                  </span>
                  <span className="font-semibold">{tzs(group.subtotal, locale)}</span>
                </div>
              </section>
            );
          })}
        </div>
        <aside className="lg:sticky lg:top-28">
          <TotalsCard totals={totals} requiresConfirmation={groups.some((g) => g.requiresConfirmation)}>
            <Button size="lg" className="mt-5 w-full" onClick={() => nav("/checkout")} disabled={!lines.length}>
              {t("checkout")}
            </Button>
          </TotalsCard>
        </aside>
      </div>
    </div>
  );
}
