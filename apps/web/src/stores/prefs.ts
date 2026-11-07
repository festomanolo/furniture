import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@samani/shared";
import { safeStorage } from "./storage";

interface PrefsState {
  locale: Locale;
  region: string;
  district: string;
  setLocale: (l: Locale) => void;
  setLocation: (region: string, district: string) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      locale: "sw",
      region: "Dar es Salaam",
      district: "Kinondoni",
      setLocale: (locale) => {
        document.documentElement.lang = locale;
        set({ locale });
      },
      setLocation: (region, district) => set({ region, district }),
    }),
    { name: "samani.prefs", storage: safeStorage },
  ),
);
