import type { Transition } from "motion/react";

/** Critically damped default, no overshoot (Apple: damping 1.0, response ~0.35). */
export const spring: Transition = { type: "spring", bounce: 0, duration: 0.4 };
/** Sheets and drawers: a touch of give, because a drag usually precedes them. */
export const sheetSpring: Transition = { type: "spring", bounce: 0.12, duration: 0.42 };
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
};

export const stagger = (each = 0.06) => ({
  hidden: {},
  show: { transition: { staggerChildren: each } },
});
