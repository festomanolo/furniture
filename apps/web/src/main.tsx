import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { Capacitor } from "@capacitor/core";
import { router } from "./router";
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

if (Capacitor.isNativePlatform()) {
  void import("@capacitor/status-bar").then(({ StatusBar, Style }) => StatusBar.setStyle({ style: Style.Light }).catch(() => undefined));
  void import("@capacitor/splash-screen").then(({ SplashScreen }) => SplashScreen.hide().catch(() => undefined));
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
