/**
 * SVG filters referenced by `backdrop-filter: url(#...)` on Chromium (html.refract).
 * Low-frequency turbulence displaces the backdrop so content under the glass bends,
 * approximating Apple's Liquid Glass lensing. Not an Apple API; a web approximation.
 */
export function LiquidFilters() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }} focusable="false">
      <defs>
        <filter id="samani-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="34" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="samani-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="1" seed="3" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.5" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/** Real backdrop refraction only works in Chromium engines; everyone else keeps the frosted blur. */
export function enableRefraction() {
  const nav = navigator as Navigator & { userAgentData?: unknown };
  const chromium = "userAgentData" in nav && !!nav.userAgentData;
  const reduced = matchMedia("(prefers-reduced-transparency: reduce)").matches;
  if (chromium && !reduced) document.documentElement.classList.add("refract");
}
