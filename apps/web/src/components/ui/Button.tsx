import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "glass" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_8px_20px_-10px_rgb(21_61_44/0.7)] hover:bg-forest-deep",
  secondary: "bg-paper text-ink border border-line hover:border-sage-deep",
  ghost: "text-ink hover:bg-sage/60",
  glass: "glass glass-sheen text-ink",
  gold: "bg-gold text-forest-deep hover:brightness-95",
  danger: "bg-paper text-danger border border-danger/30 hover:bg-danger/5",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-6 text-base gap-2.5",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-medium tracking-[-0.01em]",
        "transition-[transform,background-color,box-shadow,border-color] duration-150 ease-out active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <span className="absolute inset-0 m-auto size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
      <span className={cn("inline-flex items-center gap-[inherit]", loading && "invisible")}>{children}</span>
    </button>
  );
});

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: "glass" | "plain" | "dark" }>(
  function IconButton({ label, tone = "plain", className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.92]",
          tone === "glass" && "glass glass-sheen text-ink",
          tone === "dark" && "glass-dark",
          tone === "plain" && "text-ink hover:bg-sage/60",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
