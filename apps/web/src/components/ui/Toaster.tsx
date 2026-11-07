import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useToasts } from "@/stores/toast";
import { spring } from "@/lib/motion";

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6rem)] z-[80] flex flex-col items-center gap-2 px-4 md:bottom-8">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.15 } }}
            transition={spring}
            className="glass-dark pointer-events-auto flex min-h-12 items-center gap-3 rounded-full py-2 pr-2 pl-4 text-sm font-medium"
          >
            {t.tone === "success" && <CheckCircle2 className="size-4 text-gold" aria-hidden />}
            {t.tone === "error" && <AlertCircle className="size-4 text-red-300" aria-hidden />}
            <span className="pr-2">{t.message}</span>
            {t.action && (
              <button
                className="h-8 rounded-full bg-white/15 px-3 text-xs font-semibold hover:bg-white/25"
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
