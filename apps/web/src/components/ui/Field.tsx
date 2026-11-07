import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-2xl border border-line bg-paper px-4 text-[16px] text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] outline-none focus:border-forest focus:shadow-[0_0_0_4px_rgb(21_61_44/0.1)] aria-[invalid=true]:border-danger";

export function Field({ label, error, hint, children, id }: { label: string; error?: string; hint?: string; children: (id: string, describedBy?: string) => ReactNode; id?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  const desc = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fid} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children(fid, desc)}
      {error ? (
        <p id={`${fid}-err`} className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fid}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(control, "h-12", className)} {...p} />;
});
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...p }, ref) {
  return (
    <select ref={ref} className={cn(control, "h-12 appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5l5 5 5-5' stroke='%23646a64' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E\")] bg-[right_1rem_center] bg-no-repeat pr-10", className)} {...p}>
      {children}
    </select>
  );
});
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...p} />;
});

export function Chip({ selected, children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.96]",
        selected ? "border-forest bg-forest text-white" : "border-line bg-paper text-ink hover:border-sage-deep",
        className,
      )}
      {...p}
    >
      {children}
    </button>
  );
}
