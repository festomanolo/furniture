import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useT } from "@/lib/i18n";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function Section({ title, sub, href, children, className }: { title: string; sub?: string; href?: string; children: ReactNode; className?: string }) {
  const { t } = useT();
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: easeOutExpo }}
      className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[22px] leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-2xl">{title}</h2>
          {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
        </div>
        {href && (
          <Link to={href} className="-mr-2 inline-flex h-10 shrink-0 items-center gap-0.5 rounded-full px-2 text-sm font-medium text-forest hover:bg-sage/60">
            {t("see_all")} <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 pt-4 pb-5 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1.5 max-w-[60ch] text-[15px] text-muted">{sub}</p>}
      </div>
      {actions}
    </div>
  );
}
