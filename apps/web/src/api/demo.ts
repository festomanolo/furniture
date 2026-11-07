/**
 * DEMO ADAPTER (development only). Simulates the API against seed data with realistic
 * latency so loading states are exercised. Orders and requests persist in localStorage.
 * It deliberately never marks anything as paid: payment confirmation only comes from the server.
 */
import {
  checkoutSchema,
  checkoutTotals,
  customRequestSchema,
  groupBySeller,
  sellerDeliveryFee,
  toCentimetres,
  type CustomRequest,
  type Order,
  type Product,
  type ProductQuery,
  type SellerOrder,
  type Tzs,
} from "@samani/shared";
import { categories, products, reviewsFor, sellers } from "@/data/seed";
import { ApiError, type ApiClient } from "./types";

const wait = (ms = 280 + Math.random() * 320) => new Promise((r) => setTimeout(r, ms));

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchProducts(all: Product[], q: ProductQuery) {
  const terms = fold(q.q ?? "").split(/\s+/).filter(Boolean);
  let list = all.filter((p) => {
    if (q.category) {
      const cat = categories.find((c) => c.slug === q.category);
      if (!cat || p.categoryId !== cat.id) return false;
    }
    if (q.sellerId && p.sellerId !== q.sellerId) return false;
    if (q.minPrice && p.price < q.minPrice) return false;
    if (q.maxPrice && p.price > q.maxPrice) return false;
    if (q.fulfilment && p.fulfilment !== q.fulfilment) return false;
    if (q.inStockOnly && !(p.availability === "in_stock" || p.availability === "low_stock")) return false;
    if (q.material && !p.materials.some((m) => fold(m).includes(fold(q.material!)))) return false;
    const seller = sellers.find((s) => s.id === p.sellerId)!;
    if (q.region && seller.region !== q.region && !p.delivery.some((d) => d.regions.includes(q.region!))) return false;
    if (q.minRating && seller.rating < q.minRating) return false;
    if (terms.length) {
      const cat = categories.find((c) => c.id === p.categoryId)!;
      const hay = fold([p.name, p.description, ...p.materials, ...p.colours, ...p.tags, seller.name, cat.name.en, cat.name.sw].join(" "));
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const sort = q.sort ?? "recommended";
  const score = (p: Product) => p.rating * Math.log10(p.soldCount + 10);
  list = [...list].sort((a, b) => {
    switch (sort) {
      case "newest":
        return b.createdAt.localeCompare(a.createdAt);
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "popular":
        return b.soldCount - a.soldCount;
      case "rating":
        return b.rating - a.rating;
      default:
        return score(b) - score(a);
    }
  });
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 20;
  return { items: list.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: list.length };
}

export function createDemoClient(): ApiClient {
  return {
    async categories() {
      await wait(120);
      return categories;
    },
    async products(q) {
      await wait();
      return searchProducts(products, q);
    },
    async product(slug) {
      await wait();
      const p = products.find((x) => x.slug === slug);
      if (!p) throw new ApiError("Product not found", 404, "not_found");
      return p;
    },
    async productsByIds(ids) {
      await wait(150);
      return products.filter((p) => ids.includes(p.id));
    },
    async reviews(id) {
      await wait(200);
      return reviewsFor(id);
    },
    async sellers() {
      await wait(150);
      return sellers;
    },
    async seller(slug) {
      await wait();
      const s = sellers.find((x) => x.slug === slug || x.id === slug);
      if (!s) throw new ApiError("Seller not found", 404, "not_found");
      return s;
    },
    async requestPhotos() {
      await wait(400);
    },
    async placeOrder({ checkout, lines }) {
      await wait(700);
      const parsed = checkoutSchema.parse(checkout);
      if (!lines.length) throw new ApiError("Cart is empty", 422, "empty_cart");
      const priced = lines.map((l) => {
        const p = products.find((x) => x.id === l.productId);
        if (!p) throw new ApiError("Product unavailable", 409, "unavailable");
        const v = p.variants.find((x) => x.id === l.variantId);
        return { l, p, unit: (p.price + (v?.priceDelta ?? 0)) as Tzs };
      });
      const choices = [...new Set(priced.map((x) => x.p.sellerId))].map((sellerId) => {
        const own = priced.filter((x) => x.p.sellerId === sellerId);
        const method = parsed.deliveryPreference;
        const fee = sellerDeliveryFee(
          own.map((x) => ({ unitPrice: x.unit, quantity: x.l.quantity, delivery: x.p.delivery })),
          method,
          parsed.address.region,
        );
        return { sellerId, method, fee, installationFee: 0 as Tzs };
      });
      const groups = groupBySeller(
        priced.map((x) => ({ sellerId: x.p.sellerId, unitPrice: x.unit, quantity: x.l.quantity, fulfilment: x.p.fulfilment, needsConfirmation: x.p.availability !== "in_stock" })),
        choices,
      );
      const sellerOrders: SellerOrder[] = groups.map((g, i) => ({
        id: `so_${Date.now()}_${i}`,
        sellerId: g.sellerId,
        sellerName: sellers.find((s) => s.id === g.sellerId)!.name,
        status: "awaiting_seller_confirmation",
        lines: priced
          .filter((x) => x.p.sellerId === g.sellerId)
          .map((x) => ({ productId: x.p.id, variantId: x.l.variantId, name: x.p.name, image: x.p.images[0]!.src, unitPrice: x.unit, quantity: x.l.quantity })),
        subtotal: g.subtotal,
        deliveryMethod: parsed.deliveryPreference,
        deliveryFee: g.deliveryFee,
        installationFee: g.installationFee,
        requiresConfirmation: true,
      }));
      const order: Order = {
        id: `ord_${Date.now()}`,
        reference: `SAM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        createdAt: new Date().toISOString(),
        sellerOrders,
        totals: checkoutTotals(groups),
        address: { ...parsed.address },
        contactMethod: parsed.contactMethod,
      };
      write("samani.demo.orders", [order, ...read<Order[]>("samani.demo.orders", [])]);
      return order;
    },
    async orders() {
      await wait(200);
      return read<Order[]>("samani.demo.orders", []);
    },
    async customRequests() {
      await wait(200);
      return read<CustomRequest[]>("samani.demo.requests", []);
    },
    async submitCustomRequest(input, editingId) {
      await wait(600);
      const r = customRequestSchema.parse(input);
      const all = read<CustomRequest[]>("samani.demo.requests", []);
      const existing = editingId ? all.find((x) => x.id === editingId) : undefined;
      if (existing && existing.status !== "open") throw new ApiError("Only open requests can be edited", 409, "not_editable");
      const rec: CustomRequest = {
        ...r,
        width: toCentimetres(r.width, r.unit),
        depth: toCentimetres(r.depth, r.unit),
        height: toCentimetres(r.height, r.unit),
        unit: "cm",
        budgetMin: r.budgetMin as Tzs,
        budgetMax: r.budgetMax as Tzs,
        id: existing?.id ?? `req_${Date.now()}`,
        status: "open",
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      write("samani.demo.requests", existing ? all.map((x) => (x.id === rec.id ? rec : x)) : [rec, ...all]);
      return rec;
    },
    async withdrawCustomRequest(id) {
      await wait(300);
      const all = read<CustomRequest[]>("samani.demo.requests", []);
      const r = all.find((x) => x.id === id);
      if (!r) throw new ApiError("Not found", 404);
      if (r.status === "accepted") throw new ApiError("Accepted requests cannot be withdrawn", 409);
      const next = { ...r, status: "withdrawn" as const };
      write("samani.demo.requests", all.map((x) => (x.id === id ? next : x)));
      return next;
    },
    async subscribeNewsletter(email) {
      await wait(500);
      const all = read<string[]>("samani.demo.newsletter", []);
      const key = email.trim().toLowerCase();
      if (all.includes(key)) return { alreadySubscribed: true };
      write("samani.demo.newsletter", [...all, key]);
      return { alreadySubscribed: false };
    },
  };
}
