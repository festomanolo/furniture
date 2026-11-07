import { discountPercent } from "@samani/shared";
import { cn } from "@/lib/cn";
import { tzs } from "@/lib/format";
import { useT } from "@/lib/i18n";

export function Price({ price, compareAt, size = "md", className }: { price: number; compareAt?: number | null; size?: "md" | "lg"; className?: string }) {
  const { locale } = useT();
  return (
    <div className={cn("tabular flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-semibold tracking-[-0.02em] text-ink", size === "lg" ? "text-2xl" : "text-[15px]")}>{tzs(price, locale)}</span>
      {compareAt && compareAt > price && (
        <span className={cn("text-muted line-through", size === "lg" ? "text-base" : "text-xs")}>{tzs(compareAt, locale)}</span>
      )}
    </div>
  );
}

export function DiscountPill({ price, compareAt, className }: { price: number; compareAt?: number | null; className?: string }) {
  const pct = discountPercent(price, compareAt);
  if (!pct) return null;
  return <span className={cn("tabular inline-flex h-6 items-center rounded-full bg-forest px-2 text-[11px] font-semibold text-white", className)}>-{pct}%</span>;
}
