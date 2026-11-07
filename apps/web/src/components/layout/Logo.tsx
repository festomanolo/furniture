import { cn } from "@/lib/cn";

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 64 64" className="size-7 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="16" fill={inverted ? "#F5F5F0" : "#153D2C"} />
        <path d="M41 22.5c-1.8-2.6-5-4.1-9-4.1-5.6 0-9.4 2.9-9.4 7.2 0 9.4 18.6 5.5 18.6 13.4 0 3.1-3.1 5.3-7.7 5.3-4.3 0-7.4-1.7-9.2-4.6" fill="none" stroke="#C6A56B" strokeWidth="4.2" strokeLinecap="round" />
      </svg>
      <span className={cn("text-[17px] font-semibold tracking-[0.14em]", inverted ? "text-white" : "text-forest")}>SAMANI</span>
    </span>
  );
}
