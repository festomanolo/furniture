import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  tone: "default" | "success" | "error";
  action?: { label: string; onClick: () => void };
}

let seq = 0;
export const useToasts = create<{ toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void }>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = (message: string, tone: Toast["tone"] = "default", action?: Toast["action"]) =>
  useToasts.getState().push({ message, tone, action });
