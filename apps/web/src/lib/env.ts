export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "",
  mediaCdn: (import.meta.env.VITE_MEDIA_CDN_URL as string | undefined)?.replace(/\/$/, "") || "",
  supportWhatsapp: (import.meta.env.VITE_SUPPORT_WHATSAPP as string | undefined) || "",
};

/** True when no backend is configured: the app runs on the in-browser demo catalogue. */
export const isDemoMode = env.apiUrl === "";
