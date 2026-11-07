import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "@/stores/cart";

export function QtyStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-10 items-center rounded-full border border-line bg-paper">
      <button className="flex size-10 items-center justify-center rounded-full active:scale-90" aria-label="-" onClick={() => onChange(value - 1)}>
        <Minus className="size-4" />
      </button>
      <span className="tabular w-6 text-center text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button className="flex size-10 items-center justify-center rounded-full active:scale-90 disabled:opacity-40" aria-label="+" disabled={value >= MAX_QTY} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}
