import { motion, useReducedMotion } from "motion/react";
import type { Product } from "@samani/shared";
import { useSellers } from "@/api/hooks";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { easeOutExpo } from "@/lib/motion";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, loading, skeletons = 6 }: { products?: Product[]; loading?: boolean; skeletons?: number }) {
  const { data: sellers } = useSellers();
  const reduce = useReducedMotion();
  const grid = "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4";
  if (loading && !products) {
    return (
      <div className={grid}>
        {Array.from({ length: skeletons }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className={grid}>
      {products?.map((p, i) => (
        <motion.div
          key={p.id}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: (i % 4) * 0.05, ease: easeOutExpo }}
        >
          <ProductCard product={p} seller={sellers?.find((s) => s.id === p.sellerId)} priority={i < 2} sizes="(min-width:1024px) 22vw, (min-width:768px) 30vw, 46vw" />
        </motion.div>
      ))}
    </div>
  );
}
