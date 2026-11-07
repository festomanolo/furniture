import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./storage";

/** Recently viewed product slugs, kept for offline access and "continue browsing". */
export const useRecent = create<{ slugs: string[]; push: (slug: string) => void }>()(
  persist(
    (set) => ({
      slugs: [],
      push: (slug) => set((s) => ({ slugs: [slug, ...s.slugs.filter((x) => x !== slug)].slice(0, 20) })),
    }),
    { name: "samani.recent", storage: safeStorage },
  ),
);
