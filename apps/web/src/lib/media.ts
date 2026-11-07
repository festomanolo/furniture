import { env } from "./env";

/**
 * Image paths are stored without width suffix, e.g. "/images/catalog/sofa-rust".
 * Locally we ship 600 and 1200 derivatives; in production the R2 pipeline serves
 * 320/640/960/1440/2048 derivatives under the same base key.
 */
const LOCAL_WIDTHS = [600, 1200] as const;
const CDN_WIDTHS = [320, 640, 960, 1440, 2048] as const;

export function imageSet(base: string) {
  if (env.mediaCdn && !base.startsWith("/images/")) {
    const root = `${env.mediaCdn}/${base.replace(/^\//, "")}`;
    return {
      src: `${root}/960.webp`,
      srcSet: CDN_WIDTHS.map((w) => `${root}/${w}.webp ${w}w`).join(", "),
    };
  }
  return {
    src: `${base}-600.webp`,
    srcSet: LOCAL_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(", "),
  };
}

export function brandImage(name: string) {
  return {
    src: `/images/${name}-960.webp`,
    srcSet: `/images/${name}-960.webp 960w, /images/${name}-1920.webp 1920w`,
  };
}
