/** Light haptic tick on meaningful commits (add to cart, save). No-ops where unsupported. */
export function tick(ms = 8) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    /* unsupported: ignore */
  }
}
