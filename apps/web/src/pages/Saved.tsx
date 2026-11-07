import { Link } from "react-router";
import { Heart } from "lucide-react";
import { useProductsByIds } from "@/api/hooks";
import { PageHeader } from "@/components/layout/Section";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/States";
import { useT } from "@/lib/i18n";
import { useWishlist } from "@/stores/wishlist";

export default function Saved() {
  const { t } = useT();
  const ids = useWishlist((s) => s.ids);
  const { data, isLoading } = useProductsByIds(ids);
  const ordered = data ? ids.flatMap((id) => data.filter((p) => p.id === id)) : undefined;
  return (
    <div>
      <PageHeader title={t("saved_title")} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {ids.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-7" />}
            title={t("saved_empty")}
            body={t("saved_empty_body")}
            action={<Link to="/explore" className="inline-flex h-11 items-center rounded-full bg-forest px-6 font-medium text-white">{t("hero_cta")}</Link>}
          />
        ) : (
          <ProductGrid products={ordered} loading={isLoading} skeletons={Math.min(ids.length, 6)} />
        )}
      </div>
    </div>
  );
}
