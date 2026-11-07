import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { ArrowDownUp, PenTool, Search, SlidersHorizontal, X } from "lucide-react";
import { Link } from "react-router";
import { TZ_REGION_NAMES, type FulfilmentType, type ProductQuery, type ProductSort } from "@samani/shared";
import { useCategories, useProducts } from "@/api/hooks";
import { PageHeader } from "@/components/layout/Section";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Chip, Field, Input, Select } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useDebounced } from "@/lib/useDebounced";
import { useT, type TKey } from "@/lib/i18n";

const SORTS: ProductSort[] = ["recommended", "newest", "price_asc", "price_desc", "popular", "rating"];
const MATERIALS = ["Mninga", "Teak", "Oak", "Velvet", "Leather", "Plywood", "MDF", "Steel", "Glass"];
const PAGE = 12;

export default function Explore({ mode }: { mode: "explore" | "category" | "search" }) {
  const { t, locale } = useT();
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: categories } = useCategories();
  const [text, setText] = useState(params.get("q") ?? "");
  const debounced = useDebounced(text, 300);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [pages, setPages] = useState(1);

  // Keep the URL as the single source of truth for search text (shareable, back-button safe).
  useEffect(() => {
    if ((params.get("q") ?? "") === debounced) return;
    const next = new URLSearchParams(params);
    if (debounced) next.set("q", debounced);
    else next.delete("q");
    setParams(next, { replace: true });
  }, [debounced, params, setParams]);

  const query: ProductQuery = useMemo(() => {
    const num = (k: string) => (params.get(k) ? Number(params.get(k)) : undefined);
    return {
      q: params.get("q") ?? undefined,
      category: slug ?? params.get("category") ?? undefined,
      minPrice: num("minPrice"),
      maxPrice: num("maxPrice"),
      region: params.get("region") ?? undefined,
      material: params.get("material") ?? undefined,
      fulfilment: (params.get("type") as FulfilmentType) ?? undefined,
      minRating: num("rating"),
      inStockOnly: params.get("stock") === "1" || undefined,
      sort: (params.get("sort") as ProductSort) ?? "recommended",
      page: 1,
      pageSize: PAGE * pages,
    };
  }, [params, slug, pages]);

  useEffect(() => setPages(1), [params, slug]);

  const { data, isLoading, isError, refetch, isFetching } = useProducts(query);
  const category = categories?.find((c) => c.slug === slug);
  const activeCount = ["minPrice", "maxPrice", "region", "material", "type", "rating", "stock"].filter((k) => params.get(k)).length;

  const title = mode === "category" ? (category?.name[locale] ?? "") : mode === "search" ? (locale === "sw" ? "Tafuta" : "Search") : t("nav_explore");

  return (
    <div>
      <PageHeader title={title} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {mode !== "category" && (
          <label className="mb-4 flex h-13 items-center gap-3 rounded-full bg-paper px-5 ring-1 ring-line focus-within:ring-2 focus-within:ring-forest">
            <Search className="size-5 text-forest" />
            <span className="sr-only">Search</span>
            <input
              autoFocus={mode === "search"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("search_placeholder")}
              enterKeyHint="search"
              className="h-full w-full bg-transparent text-[16px] outline-none placeholder:text-muted"
            />
            {text && (
              <button aria-label={t("clear")} onClick={() => setText("")} className="-mr-2 flex size-9 items-center justify-center rounded-full hover:bg-sage">
                <X className="size-4" />
              </button>
            )}
          </label>
        )}

        {mode === "explore" && (
          <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
            <Chip selected={!params.get("category")} onClick={() => update(setParams, params, { category: null })}>
              {t("any")}
            </Chip>
            {categories?.map((c) => (
              <Chip key={c.id} selected={params.get("category") === c.slug} onClick={() => update(setParams, params, { category: c.slug })}>
                {c.name[locale]}
              </Chip>
            ))}
          </div>
        )}

        <div className="sticky top-[calc(env(safe-area-inset-top)+4.6rem)] z-30 -mx-4 mb-5 flex items-center gap-2 bg-ivory/85 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-[calc(env(safe-area-inset-top)+5.4rem)] lg:mx-0 lg:px-0">
          <Button variant="secondary" size="sm" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="size-4" /> {t("filters")}
            {activeCount > 0 && <span className="tabular ml-0.5 flex size-5 items-center justify-center rounded-full bg-forest text-[11px] text-white">{activeCount}</span>}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSortOpen(true)}>
            <ArrowDownUp className="size-4" /> {t(`sort_${query.sort}` as TKey)}
          </Button>
          <span className="tabular ml-auto text-sm whitespace-nowrap text-muted" aria-live="polite">
            {data ? `${data.total} ${t("results")}` : ""}
          </span>
        </div>

        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : data && data.total === 0 ? (
          <EmptyState
            icon={<Search className="size-7" />}
            title={t("no_results_title")}
            body={t("no_results_body")}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {activeCount > 0 && (
                  <Button variant="secondary" onClick={() => setParams(params.get("q") ? { q: params.get("q")! } : {})}>
                    {t("clear")}
                  </Button>
                )}
                <Link to="/custom-studio" className="inline-flex h-11 items-center gap-2 rounded-full bg-forest px-5 text-[15px] font-medium text-white">
                  <PenTool className="size-4" /> {t("hero_cta_custom")}
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <ProductGrid products={data?.items} loading={isLoading} />
            {data && data.items.length < data.total && (
              <div className="mt-10 flex justify-center">
                <Button variant="secondary" loading={isFetching} onClick={() => setPages((p) => p + 1)}>
                  {locale === "sw" ? "Pakia zaidi" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} />

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title={t("sort")}>
        <div className="grid gap-1 pb-2" role="radiogroup">
          {SORTS.map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={query.sort === s}
              onClick={() => {
                update(setParams, params, { sort: s === "recommended" ? null : s });
                setSortOpen(false);
              }}
              className="flex h-13 items-center justify-between rounded-2xl px-4 text-left text-[15px] hover:bg-sage/60 aria-checked:bg-sage aria-checked:font-semibold"
            >
              {t(`sort_${s}` as TKey)}
              {query.sort === s && <span className="size-2.5 rounded-full bg-forest" />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

function update(set: ReturnType<typeof useSearchParams>[1], params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  }
  set(next, { replace: true });
}

function FilterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => {
    if (open) setDraft(Object.fromEntries(["minPrice", "maxPrice", "region", "material", "type", "rating", "stock"].map((k) => [k, params.get(k) ?? ""])));
  }, [open, params]);
  const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: d[k] === v ? "" : v }));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("filters")}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDraft({})}>
            {t("clear")}
          </Button>
          <Button
            className="flex-[2]"
            onClick={() => {
              update(setParams, params, Object.fromEntries(["minPrice", "maxPrice", "region", "material", "type", "rating", "stock"].map((k) => [k, draft[k] || null])));
              onClose();
            }}
          >
            {t("apply")}
          </Button>
        </div>
      }
    >
      <div className="grid gap-7 pt-2">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{t("type")}</legend>
          <div className="flex flex-wrap gap-2">
            <Chip selected={draft.type === "ready_made"} onClick={() => set("type", "ready_made")}>
              {t("ready_made")}
            </Chip>
            <Chip selected={draft.type === "made_to_order"} onClick={() => set("type", "made_to_order")}>
              {t("made_to_order")}
            </Chip>
            <Chip selected={draft.stock === "1"} onClick={() => set("stock", "1")}>
              {t("in_stock_only")}
            </Chip>
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("min_price")}>
            {(id) => <Input id={id} inputMode="numeric" placeholder="0" value={draft.minPrice ?? ""} onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value.replace(/\D/g, "") }))} />}
          </Field>
          <Field label={t("max_price")}>
            {(id) => <Input id={id} inputMode="numeric" placeholder="5,000,000" value={draft.maxPrice ?? ""} onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value.replace(/\D/g, "") }))} />}
          </Field>
        </div>
        <Field label={t("region")}>
          {(id) => (
            <Select id={id} value={draft.region ?? ""} onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}>
              <option value="">{t("any")}</option>
              {TZ_REGION_NAMES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          )}
        </Field>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{t("materials")}</legend>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((m) => (
              <Chip key={m} selected={draft.material === m} onClick={() => set("material", m)}>
                {m}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{t("rating_min")}</legend>
          <div className="flex flex-wrap gap-2">
            {["4", "4.5", "4.8"].map((r) => (
              <Chip key={r} selected={draft.rating === r} onClick={() => set("rating", r)}>
                {r}+
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>
    </Sheet>
  );
}
