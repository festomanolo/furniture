import { BadgeCheck, Star } from "lucide-react";
import type { Availability, FulfilmentType, VerificationStatus } from "@samani/shared";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";

/** Only rendered for server-verified sellers. Never derived from client state. */
export function VerifiedMark({ status, withLabel, className }: { status: VerificationStatus; withLabel?: boolean; className?: string }) {
  const { t } = useT();
  if (status !== "verified") return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-forest", className)} title={t("verified")}>
      <BadgeCheck className="size-[1.05em] shrink-0" aria-hidden />
      {withLabel ? <span className="text-xs font-medium">{t("verified")}</span> : <span className="sr-only">{t("verified")}</span>}
    </span>
  );
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("tabular inline-flex items-center gap-1 text-xs text-muted", className)}>
      <Star className="size-3.5 fill-gold text-gold" aria-hidden />
      <span className="font-medium text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span>({count})</span>}
    </span>
  );
}

export function FulfilmentTag({ type, className }: { type: FulfilmentType; className?: string }) {
  const { t } = useT();
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium",
        type === "made_to_order" ? "bg-gold/20 text-gold-deep" : "bg-sage text-forest",
        className,
      )}
    >
      {type === "made_to_order" ? t("made_to_order") : t("ready_made")}
    </span>
  );
}

export function AvailabilityText({ value }: { value: Availability }) {
  const { t } = useT();
  const map = { in_stock: ["in_stock", "text-success"], low_stock: ["low_stock", "text-gold-deep"], made_to_order: ["made_to_order", "text-gold-deep"], out_of_stock: ["out_of_stock", "text-danger"] } as const;
  const [k, c] = map[value];
  return <span className={cn("text-sm font-medium", c)}>{t(k)}</span>;
}
