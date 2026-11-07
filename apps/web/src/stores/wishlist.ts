import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./storage";

interface WishlistState {
  ids: string[];
  toggle: (id: string) => boolean;
  has: (id: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const on = !get().ids.includes(id);
        set((s) => ({ ids: on ? [id, ...s.ids] : s.ids.filter((x) => x !== id) }));
        return on;
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "samani.wishlist", storage: safeStorage },
  ),
);
