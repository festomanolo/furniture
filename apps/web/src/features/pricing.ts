import { checkoutTotals, groupBySeller, sellerDeliveryFee, type DeliveryMethod, type Product, type Tzs } from "@samani/shared";
import type { CartItem } from "@/stores/cart";

export interface ResolvedLine {
  item: CartItem;
  product: Product;
  unitPrice: Tzs;
  variantLabel?: string;
}

export function resolveLines(items: CartItem[], products: Product[] | undefined): ResolvedLine[] {
  if (!products) return [];
  return items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return [];
    const v = product.variants.find((x) => x.id === item.variantId);
    return [{ item, product, unitPrice: (product.price + (v?.priceDelta ?? 0)) as Tzs, variantLabel: v?.label }];
  });
}

export function deliveryFeeFor(lines: ResolvedLine[], method: DeliveryMethod, region: string): Tzs | null {
  return sellerDeliveryFee(
    lines.map((l) => ({ unitPrice: l.unitPrice, quantity: l.item.quantity, delivery: l.product.delivery })),
    method,
    region,
  );
}

export function priceCart(lines: ResolvedLine[], method: DeliveryMethod, region: string) {
  const bySeller = new Map<string, ResolvedLine[]>();
  for (const l of lines) bySeller.set(l.product.sellerId, [...(bySeller.get(l.product.sellerId) ?? []), l]);
  const choices = [...bySeller.entries()].map(([sellerId, own]) => ({
    sellerId,
    method,
    fee: deliveryFeeFor(own, method, region),
    installationFee: 0 as Tzs,
  }));
  const groups = groupBySeller(
    lines.map((l) => ({
      sellerId: l.product.sellerId,
      unitPrice: l.unitPrice,
      quantity: l.item.quantity,
      fulfilment: l.product.fulfilment,
      needsConfirmation: l.product.availability !== "in_stock",
    })),
    choices,
  );
  return { bySeller, groups, totals: checkoutTotals(groups) };
}
