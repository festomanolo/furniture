import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./storage";

export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

const key = (i: Pick<CartItem, "productId" | "variantId">) => `${i.productId}:${i.variantId ?? "-"}`;

interface CartState {
  items: CartItem[];
  add: (productId: string, variantId: string | null, qty?: number) => void;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  remove: (productId: string, variantId: string | null) => void;
  clear: () => void;
}

export const MAX_QTY = 20;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, variantId, qty = 1) =>
        set((s) => {
          const k = key({ productId, variantId });
          const existing = s.items.find((i) => key(i) === k);
          if (existing) {
            return { items: s.items.map((i) => (key(i) === k ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + qty) } : i)) };
          }
          return { items: [...s.items, { productId, variantId, quantity: Math.min(MAX_QTY, qty) }] };
        }),
      setQty: (productId, variantId, qty) =>
        set((s) => {
          const k = key({ productId, variantId });
          if (qty < 1) return { items: s.items.filter((i) => key(i) !== k) };
          return { items: s.items.map((i) => (key(i) === k ? { ...i, quantity: Math.min(MAX_QTY, qty) } : i)) };
        }),
      remove: (productId, variantId) => set((s) => ({ items: s.items.filter((i) => key(i) !== key({ productId, variantId })) })),
      clear: () => set({ items: [] }),
    }),
    { name: "samani.cart", storage: safeStorage, version: 1 },
  ),
);

export const useCartCount = () => useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
