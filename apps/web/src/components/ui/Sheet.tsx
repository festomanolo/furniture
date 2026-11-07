import { useEffect, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from "motion/react";
import { X } from "lucide-react";
import { sheetSpring } from "@/lib/motion";
import { IconButton } from "./Button";

/** Apple's projection: where would a flick come to rest? */
const project = (v: number, d = 0.998) => ((v / 1000) * d) / (1 - d);

/**
 * Bottom sheet on mobile, centred panel on desktop. Drag the grabber to dismiss:
 * the dismiss decision uses projected momentum, not just release position.
 */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const id = useId();
  const reduce = useReducedMotion();
  const controls = useDragControls();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const h = panel.current?.offsetHeight ?? 600;
    if (info.offset.y + project(info.velocity.y) > h * 0.4) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
          <motion.div
            className="absolute inset-0 bg-forest-deep/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            tabIndex={-1}
            drag={reduce ? false : "y"}
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.9 }}
            onDragEnd={onDragEnd}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={sheetSpring}
            className="relative flex max-h-[88dvh] w-full flex-col rounded-t-[1.75rem] bg-ivory shadow-lift outline-none md:max-w-lg md:rounded-[1.75rem]"
          >
            <div className="flex cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing md:hidden" onPointerDown={(e) => controls.start(e)}>
              <span className="h-1.5 w-10 rounded-full bg-ink/15" />
            </div>
            <div className="flex items-center justify-between px-5 pt-1 pb-2 md:pt-4" onPointerDown={(e) => !reduce && controls.start(e)}>
              <h2 id={id} className="text-lg font-semibold tracking-[-0.02em]">
                {title}
              </h2>
              <IconButton label="Close" onClick={onClose} className="-mr-2">
                <X className="size-5" />
              </IconButton>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
            {footer && <div className="border-t border-line px-5 py-4 pb-safe">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
