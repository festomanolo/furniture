import { memo } from "react";
import { Link } from "react-router";
import type { Product, SellerSummary } from "@samani/shared";
import { Img } from "@/components/ui/Img";
import { FulfilmentTag, VerifiedMark } from "@/components/ui/Badges";
import { cn } from "@/lib/cn";
import { DiscountPill, Price } from "./Price";
import { SaveButton } from "./SaveButton";

export const ProductCard = memo(function ProductCard({
  product,
  seller,
  className,
  priority,
  sizes,
}: {
  product: Product;
  seller?: SellerSummary;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
  return (
    <Link to={`/product/${product.slug}`} className={cn("group block rounded-[var(--radius-card)] focus-visible:outline-offset-4", className)}>
      <div className="relative">
        <Img
          base={primary?.src ?? ""}
          alt={primary?.alt ?? product.name}
          priority={priority}
          sizes={sizes}
          wrapperClassName="aspect-square rounded-[var(--radius-card)]"
          className="group-hover:scale-[1.03]"
        />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <DiscountPill price={product.price} compareAt={product.compareAtPrice} />
        </div>
        <SaveButton productId={product.id} className="absolute top-2 right-2" />
        <FulfilmentTag type={product.fulfilment} className="glass absolute bottom-2.5 left-2.5 border-white/60 bg-white/70" />
      </div>
      <div className="px-0.5 pt-3">
        <h3 className="line-clamp-2 text-[14px] leading-snug font-medium text-ink">{product.name}</h3>
        <Price price={product.price} compareAt={product.compareAtPrice} className="mt-1" />
        {seller && (
          <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted">
            <span className="truncate">{seller.name}</span>
            <VerifiedMark status={seller.verification} />
          </p>
        )}
      </div>
    </Link>
  );
});
