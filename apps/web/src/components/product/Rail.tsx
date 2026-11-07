import type { Product } from "@samani/shared";
import { useSellers } from "@/api/hooks";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "./ProductCard";

/** Horizontal scroll-snap rail; native momentum scrolling, no JS physics needed. */
export function ProductRail({ products, loading }: { products?: Product[]; loading?: boolean }) {
  const { data: sellers } = useSellers();
  return (
    <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0">
      {loading && !products
        ? Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="w-[44%] max-w-56 shrink-0 lg:w-auto lg:max-w-none">
              <ProductCardSkeleton />
            </div>
          ))
        : products?.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              seller={sellers?.find((s) => s.id === p.sellerId)}
              sizes="(min-width:1024px) 22vw, 44vw"
              className="w-[44%] max-w-56 shrink-0 snap-start lg:w-auto lg:max-w-none"
            />
          ))}
    </div>
  );
}
