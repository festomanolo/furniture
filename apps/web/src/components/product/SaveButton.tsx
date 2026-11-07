import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { tick } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { toast } from "@/stores/toast";
import { useWishlist } from "@/stores/wishlist";

export function SaveButton({ productId, className, tone = "glass" }: { productId: string; className?: string; tone?: "glass" | "plain" }) {
  const { t } = useT();
  const saved = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t("save")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const on = toggle(productId);
        tick();
        toast(on ? t("saved") : t("removed"), on ? "success" : "default");
      }}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full transition-transform active:scale-90",
        tone === "glass" ? "glass glass-sheen" : "border border-line bg-paper",
        className,
      )}
    >
      <motion.span key={String(saved)} initial={{ scale: saved ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}>
        <Heart className={cn("size-[18px]", saved ? "fill-forest text-forest" : "text-ink")} />
      </motion.span>
    </button>
  );
}
