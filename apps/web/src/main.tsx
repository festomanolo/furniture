import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { Capacitor } from "@capacitor/core";
import { router } from "./router";
import { enableRefraction } from "./components/layout/LiquidFilters";
import { usePrefs } from "./stores/prefs";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 1000 * 60 * 30,
      retry: (count, err) => count < 2 && !(err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404),
      refetchOnWindowFocus: false,
    },
  },
});

document.documentElement.lang = usePrefs.getState().locale;
enableRefraction();

if (Capacitor.isNativePlatform()) {
  // A service worker inside the native shell would serve stale bundles after app updates.
  void navigator.serviceWorker?.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  void import("@capacitor/status-bar").then(({ StatusBar, Style }) => StatusBar.setStyle({ style: Style.Light }).catch(() => undefined));
  void import("@capacitor/splash-screen").then(({ SplashScreen }) => SplashScreen.hide().catch(() => undefined));
} else if (import.meta.env.PROD) {
  void import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true }));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MotionConfig>
  </StrictMode>,
);
