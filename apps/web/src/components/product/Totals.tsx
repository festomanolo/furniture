import type { CheckoutTotals } from "@samani/shared";
import { Info } from "lucide-react";
import { tzs } from "@/lib/format";
import { useT } from "@/lib/i18n";

export function TotalsCard({ totals, requiresConfirmation, children }: { totals: CheckoutTotals; requiresConfirmation: boolean; children?: React.ReactNode }) {
  const { t, locale } = useT();
  const row = (label: string, value: string, strong?: boolean) => (
    <div className={strong ? "flex items-baseline justify-between pt-3 text-[17px] font-semibold" : "flex justify-between text-[15px] text-ink/80"}>
      <dt>{label}</dt>
      <dd className="tabular">{value}</dd>
    </div>
  );
  return (
    <div className="rounded-[1.5rem] bg-paper p-5 ring-1 ring-line">
      <dl className="grid gap-2">
        {row(t("products_cost"), tzs(totals.products, locale))}
        {row(t("delivery_cost"), totals.deliveryPendingQuote ? `${tzs(totals.delivery, locale)} + ${t("quote_required").toLowerCase()}` : tzs(totals.delivery, locale))}
        {totals.installation > 0 && row(t("installation_cost"), tzs(totals.installation, locale))}
        {totals.discount > 0 && row(t("discount"), `- ${tzs(totals.discount, locale)}`)}
        <div className="border-t border-line" />
        {row(t("total_payable"), tzs(totals.payable, locale), true)}
      </dl>
      {(totals.deliveryPendingQuote || requiresConfirmation) && (
        <div className="mt-4 grid gap-2 rounded-2xl bg-sage/60 p-3.5 text-[13px] leading-relaxed text-ink/80">
          {totals.deliveryPendingQuote && (
            <p className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-forest" /> {t("delivery_quote_note")}
            </p>
          )}
          {requiresConfirmation && (
            <p className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-forest" /> {t("confirmation_note")}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
