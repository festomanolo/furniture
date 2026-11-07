import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomRequestInput } from "@samani/shared";
import { safeStorage } from "./storage";

export const emptyDraft: CustomRequestInput = {
  furnitureType: "",
  referenceImages: [],
  unit: "cm",
  width: "" as unknown as number,
  depth: "" as unknown as number,
  height: "" as unknown as number,
  materials: [],
  colour: "",
  finish: "",
  budgetMin: "" as unknown as number,
  budgetMax: "" as unknown as number,
  region: "",
  district: "",
  instructions: "",
};

/** Draft survives reloads and network loss; it is never auto-submitted. */
export const useStudioDraft = create<{
  draft: CustomRequestInput;
  step: number;
  editingId: string | null;
  save: (d: Partial<CustomRequestInput>, step?: number) => void;
  load: (d: CustomRequestInput, editingId: string) => void;
  reset: () => void;
}>()(
  persist(
    (set) => ({
      draft: emptyDraft,
      step: 0,
      editingId: null,
      save: (d, step) => set((s) => ({ draft: { ...s.draft, ...d }, step: step ?? s.step })),
      load: (draft, editingId) => set({ draft, editingId, step: 0 }),
      reset: () => set({ draft: emptyDraft, step: 0, editingId: null }),
    }),
    { name: "samani.studio-draft", storage: safeStorage },
  ),
);
