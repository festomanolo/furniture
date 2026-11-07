import { describe, expect, it } from "vitest";
import { applyBps, checkoutSchema, checkoutTotals, commissionFor, customRequestSchema, groupBySeller, toCentimetres, tzPhone, type Tzs } from "@samani/shared";
import { searchProducts } from "@/api/demo";
import { products } from "@/data/seed";
import { deliveryFeeFor, priceCart, resolveLines } from "@/features/pricing";

const T = (n: number) => n as Tzs;

describe("money and commission", () => {
  it("applies basis points with integer rounding", () => {
    expect(applyBps(T(2_450_000), 400)).toBe(98_000);
    expect(applyBps(T(999), 300)).toBe(30);
  });
  it("charges 4% ready-made, 3% custom, excluding refunds", () => {
    expect(commissionFor(T(1_000_000), T(0), "ready_made")).toBe(40_000);
    expect(commissionFor(T(1_000_000), T(200_000), "made_to_order")).toBe(24_000);
    expect(commissionFor(T(500_000), T(500_000), "ready_made")).toBe(0);
  });
});

describe("multi-seller checkout", () => {
  const lines = [
    { sellerId: "a", unitPrice: T(100_000), quantity: 2, fulfilment: "ready_made" as const, needsConfirmation: false },
    { sellerId: "b", unitPrice: T(300_000), quantity: 1, fulfilment: "made_to_order" as const, needsConfirmation: true },
  ];
  it("creates one fulfilment group per seller", () => {
    const g = groupBySeller(lines, [
      { sellerId: "a", method: "seller_delivery", fee: T(20_000), installationFee: T(0) },
      { sellerId: "b", method: "seller_delivery", fee: null, installationFee: T(0) },
    ]);
    expect(g).toHaveLength(2);
    expect(g[0]).toMatchObject({ subtotal: 200_000, deliveryFee: 20_000, requiresConfirmation: false });
    expect(g[1]).toMatchObject({ subtotal: 300_000, deliveryFee: null, requiresConfirmation: true });
    const totals = checkoutTotals(g);
    expect(totals).toMatchObject({ products: 500_000, delivery: 20_000, deliveryPendingQuote: true, payable: 520_000 });
  });
  it("collection is always free and never needs a quote", () => {
    const g = groupBySeller(lines, [
      { sellerId: "a", method: "customer_collection", fee: null, installationFee: T(0) },
      { sellerId: "b", method: "customer_collection", fee: null, installationFee: T(0) },
    ]);
    expect(checkoutTotals(g).deliveryPendingQuote).toBe(false);
  });
  it("discount can never exceed product value", () => {
    const g = groupBySeller(lines.slice(0, 1), [{ sellerId: "a", method: "customer_collection", fee: T(0), installationFee: T(0) }]);
    expect(checkoutTotals(g, T(999_999)).payable).toBe(0);
  });
  it("rejects invalid quantities", () => {
    expect(() => groupBySeller([{ ...lines[0]!, quantity: 0 }], [])).toThrow();
  });
});

describe("cart pricing against the catalogue", () => {
  const sofa = products.find((p) => p.slug === "navy-track-arm-sofa")!;
  const lakeside = products.find((p) => p.slug === "rust-weekend-sofa")!;
  it("waives seller delivery above the free threshold", () => {
    const l = resolveLines([{ productId: sofa.id, variantId: null, quantity: 1 }], products);
    expect(deliveryFeeFor(l, "seller_delivery", "Dar es Salaam")).toBe(0);
  });
  it("needs a quote when the seller does not deliver to the region", () => {
    const l = resolveLines([{ productId: lakeside.id, variantId: null, quantity: 1 }], products);
    expect(deliveryFeeFor(l, "seller_delivery", "Dar es Salaam")).toBeNull();
    expect(priceCart(l, "seller_delivery", "Dar es Salaam").totals.deliveryPendingQuote).toBe(true);
  });
  it("adds variant price deltas", () => {
    const kiti = products.find((p) => p.slug === "kiti-velvet-channel-sofa")!;
    const [line] = resolveLines([{ productId: kiti.id, variantId: "v_ch", quantity: 1 }], products);
    expect(line!.unitPrice).toBe(kiti.price + 80_000);
  });
});

describe("validation", () => {
  it("normalises Tanzanian phone numbers", () => {
    expect(tzPhone.parse("0712 345 678")).toBe("+255712345678");
    expect(tzPhone.parse("+255 754-118-930")).toBe("+255754118930");
    expect(tzPhone.safeParse("0812345678").success).toBe(false);
  });
  it("rejects a district outside the region", () => {
    const r = checkoutSchema.safeParse({
      address: { fullName: "Halima Mussa", phone: "0712345678", region: "Arusha", district: "Ilala", ward: "Kaloleni", street: "Sokoine Rd" },
      deliveryPreference: "seller_delivery",
      contactMethod: "phone",
    });
    expect(r.success).toBe(false);
  });
  it("custom request budget range must be ordered", () => {
    const base = { furnitureType: "bed", referenceImages: [], unit: "cm", width: 160, depth: 200, height: 110, materials: ["Mninga"], colour: "White", finish: "Painted", region: "Mwanza", district: "Ilemela", instructions: "" };
    expect(customRequestSchema.safeParse({ ...base, budgetMin: 500000, budgetMax: 400000 }).success).toBe(false);
    expect(customRequestSchema.safeParse({ ...base, budgetMin: 400000, budgetMax: 900000 }).success).toBe(true);
  });
  it("converts units to centimetres", () => {
    expect(toCentimetres(1.85, "m")).toBe(185);
    expect(toCentimetres(905, "mm")).toBe(90.5);
  });
});

describe("search", () => {
  it("matches Kiswahili terms, materials and seller names", () => {
    expect(searchProducts(products, { q: "kitanda" }).total).toBeGreaterThan(0);
    expect(searchProducts(products, { q: "mninga" }).items.every((p) => p.materials.some((m) => /mninga/i.test(m)) || p.sellerId === "sel_mninga" || p.tags.includes("mninga"))).toBe(true);
    expect(searchProducts(products, { q: "kariakoo" }).items.every((p) => p.sellerId === "sel_kariakoo")).toBe(true);
  });
  it("sorts by price ascending and filters by max price", () => {
    const r = searchProducts(products, { maxPrice: 600000, sort: "price_asc" });
    const prices = r.items.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(Math.max(...prices)).toBeLessThanOrEqual(600000);
  });
});

describe("demo order placement matches cart pricing", () => {
  it("applies the seller's free-delivery threshold exactly like the cart", async () => {
    const { createDemoClient } = await import("@/api/demo");
    const kiti = products.find((p) => p.slug === "kiti-velvet-channel-sofa")!;
    const items = [{ productId: kiti.id, variantId: "v_ch", quantity: 1 }];
    const cart = priceCart(resolveLines(items, products), "seller_delivery", "Dar es Salaam").totals;
    const order = await createDemoClient().placeOrder({
      lines: items,
      checkout: {
        address: { fullName: "Halima Mussa", phone: "0712345678", region: "Dar es Salaam", district: "Kinondoni", ward: "Msasani", street: "Haile Selassie Rd" },
        deliveryPreference: "seller_delivery",
        contactMethod: "whatsapp",
      },
    });
    expect(order.totals).toEqual(cart);
    expect(order.totals.delivery).toBe(0);
    expect(order.sellerOrders[0]!.status).toBe("awaiting_seller_confirmation");
  });
});
