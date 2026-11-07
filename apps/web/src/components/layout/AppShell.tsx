import { Suspense } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { Toaster } from "@/components/ui/Toaster";
import { Footer } from "./Footer";
import { TabBar } from "./TabBar";
import { TopBar } from "./TopBar";
import { LiquidFilters } from "./LiquidFilters";

/** Fresh document loads all share the key "default"; give each boot its own so we never restore a stale position. */
const BOOT = Date.now();

function PageFallback() {
  return <div className="min-h-[60dvh]" aria-busy />;
}

export function AppShell() {
  const { pathname } = useLocation();
  const immersive = pathname === "/";
  const hideFooter = /^\/(checkout|custom-studio)/.test(pathname);
  return (
    <div className="min-h-[100dvh]">
      <a href="#main" className="sr-only z-[90] rounded-full bg-forest px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <TopBar />
      <main id="main" className={immersive ? "" : "pt-[calc(env(safe-area-inset-top)+5.5rem)] lg:pt-[calc(env(safe-area-inset-top)+6.5rem)]"}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
      <div className="h-24 lg:hidden" />
      <TabBar />
      <Toaster />
      <ScrollRestoration getKey={(l) => (l.key === "default" ? `boot-${BOOT}` : l.key)} />
    </div>
  );
}
