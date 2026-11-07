# SAMANI: Development Log

Furniture, Made Accessible. A multi-vendor furniture marketplace for Tanzania.

## Repository layout

```
apps/web/            Vite + React 19 + TypeScript customer app (PWA + Capacitor 8 shell)
  src/api/           ApiClient contract, HTTP adapter (Fastify /api/v1), demo adapter, TanStack Query hooks
  src/components/    ui/ primitives, layout/ (glass header, tab bar, sheets), product/
  src/data/seed.ts   DEVELOPMENT-ONLY seed catalogue (used only when VITE_API_URL is empty)
  src/features/      cart pricing (delegates to @samani/shared)
  src/lib/           i18n (sw default, en), media srcset helpers, motion presets, env
  src/pages/         route screens (lazy loaded except Home)
  src/stores/        Zustand: cart, wishlist, prefs, recent, studio draft, toasts (persisted, storage-safe)
  public/images/     brand photography (WebP 960/1920) + catalog/ demo product images (600/1200)
packages/shared/     Domain types, Zod schemas, integer-TZS money, multi-seller + commission + delivery math
apps/api/            (Phase 1b, not yet created) Fastify + Drizzle + PostgreSQL
```

## Setup

```bash
npm install            # from repo root (npm workspaces)
npm run dev            # http://localhost:5173, runs on the demo catalogue
npm test               # vitest (16 tests: money, commission, multi-seller checkout, validation, search)
npm run build          # typecheck + production build + service worker
```

Copy `apps/web/.env.example` to `apps/web/.env.local`. Leaving `VITE_API_URL` empty runs the
demo adapter, and a "Demo catalogue" notice shows on the Account page.

## Status

### Done: Phase 1 (frontend foundation) and Phase 2 (customer marketplace, frontend)

- Monorepo with npm workspaces, strict TypeScript (`noUncheckedIndexedAccess`), shared package.
- Design system: brand tokens (forest/ivory/sage/gold), Geist Variable (self-hosted), liquid-glass
  web approximation (`glass`, `glass-dark`, `glass-sheen` utilities) with
  `prefers-reduced-transparency`, `prefers-contrast` and `prefers-reduced-motion` fallbacks.
- Motion: critically damped springs by default; bottom sheets dismiss on projected momentum
  (Apple's projection function); tab-bar pill uses shared layout animation; scroll reveals use
  `whileInView` (no scroll listeners). Everything degrades under reduced motion.
- Customer routes: `/`, `/explore`, `/category/:slug`, `/search`, `/product/:slug`, `/seller/:slug`,
  `/custom-studio`, `/quotations`, `/cart`, `/checkout`, `/orders`, `/orders/:id`, `/saved`,
  `/messages`, `/account`, 404.
- Home: the 10 sections from the spec, with each section using a different layout.
- Discovery: URL-driven filters (category, price, region, material, type, rating, availability),
  6 sort orders, debounced Kiswahili/English search, load-more pagination, skeleton/empty/error states.
- Product detail: swipe gallery + thumbnails, full-screen zoom (pinch on touch, click-to-zoom on desktop),
  variants with price deltas, specs, delivery options per method/region, installation, seller card with
  WhatsApp, request-more-photos, reviews, related items, sticky mobile purchase bar, share sheet.
- Cart: grouped per seller ("delivered separately"), quantity steppers, undo on remove, delivery per seller.
- Checkout: React Hook Form + Zod, Tanzanian phone normalisation (+255), region→district validation,
  delivery preference, contact preference, saved address, clear cost breakdown. Orders are created as
  `awaiting_seller_confirmation`; nothing is ever marked paid on the client.
- Custom Studio: 9-step wizard, draft persisted across reloads/network loss, on-device photo downscale,
  cm/mm/m units (stored as cm), per-step validation; requests can be edited or withdrawn while open.
- i18n: Kiswahili default, English toggle in Account; all validation messages localised.
- PWA: manifest, auto-updating service worker, CacheFirst images, StaleWhileRevalidate catalog API.
- Capacitor 8 config (`tz.samani.app`), status bar + splash handled on native.

### Verified

- `tsc -b` clean, `vite build` succeeds, 16/16 unit tests pass.
- Manually exercised in Chrome at desktop width and 390px mobile: home, explore + filters + sort,
  product → variant → buy now → cart → checkout (validation errors, then success) → order detail,
  Custom Studio validation. No console errors.
- Bug found and fixed in that pass: order totals ignored the seller's free-delivery threshold. The
  delivery rule now lives in `@samani/shared` (`sellerDeliveryFee`) and a regression test covers it.

### Not done yet (next phases)

| Phase | Item | Notes |
| --- | --- | --- |
| 1b | `apps/api` Fastify + Drizzle + PostgreSQL, migrations, OpenAPI | `ApiClient` in `src/api/types.ts` is the contract the API must satisfy |
| 1b | Auth: password hashing, refresh rotation, roles; secure token storage on native | "Sign in" currently shows a notice |
| 1b | CI (GitHub Actions: typecheck, test, build) | |
| 3 | Seller registration, verification, dashboard (`/seller-dashboard/*`) | Not routed yet. No placeholder screens |
| 3 | R2 presigned uploads + Sharp pipeline (320/640/960/1440/2048, AVIF/WebP/JPEG) | `lib/media.ts` already reads CDN derivatives when `VITE_MEDIA_CDN_URL` is set |
| 4 | Seller quotations, comparison, acceptance → immutable order snapshot, production tracking | Customer side of requests exists |
| 5 | Payment provider abstraction (Selcom / AzamPay / ClickPesa / Pesapal), webhooks, idempotency | Client already sends `Idempotency-Key` on order creation |
| 6 | Delivery tracking, transporters, evidence, damage reports | |
| 7 | Admin dashboard (`/admin/*`), audit log, analytics | |
| 8 | Backups, Docker, monitoring, store builds | |
| - | Messaging inbox | Currently an empty state plus WhatsApp contact |
| - | SEO prerendering of product/seller pages, sitemap | `robots.txt` is in place; dynamic `document.title` only |
| - | Dark mode | Light-first by spec; tokens are centralised to make it a contained change |

## Technical decisions

- **Money** is an integer TZS everywhere; percentages are basis points (`applyBps`). Commission
  defaults: 4% ready-made, 3% custom, on product value minus refunds, never on delivery.
- **Pricing has one source of truth**: `@samani/shared` (`groupBySeller`, `checkoutTotals`,
  `sellerDeliveryFee`, `commissionFor`). The API must reuse it; the client total is only a preview.
- **Multi-seller**: each seller becomes its own fulfilment order; sellers never ship together.
  Delivery is charged once per seller (largest item fee) and waived at the seller's threshold.
- **Demo adapter** exists only so the UI can be built and tested before the API. It is selected solely
  by an empty `VITE_API_URL`, and seed data lives in one clearly labelled file.
- **Images**: brand photos supplied by the client are used for the hero, the Custom Studio panel,
  inspiration tiles and seller covers; some product shots are crops of those photos. Other demo
  product photos are Unsplash images stored locally for development. Replace them with seller uploads
  before launch.
- **Icons**: Lucide (as specified).
- **Liquid glass** is a CSS approximation of Apple's native material, not an Apple web API.

## Android debug build (verified on Galaxy S21, Android 15, WebView 156)

```bash
cd apps/web
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"   # Capacitor 8 needs JDK 21
export ANDROID_HOME=$HOME/Library/Android/sdk
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

`android/local.properties` (sdk.dir) is machine-specific and git-ignored by the Android project.

Liquid glass UI (dock + footer):
- `Dock.tsx`: frosted pill with a sliding liquid lens (shared layout animation) that rests on the
  active route, follows the mouse on hover and expands the item's label; separate cart orb with an
  animated count badge. Top centre on desktop, bottom on mobile.
- `Footer.tsx`: frosted panel over a room photo, newsletter (validated, `subscribeNewsletter` API),
  link columns with a hover lens, pointer-following sheen, language pill and a see-through wordmark
  whose background is aligned to the photo by `useCoverAlign`.
Lessons from the first device run:
- Horizontal scroll rows must use the `scroll-row` utility (`contain: paint`). Without it Android
  WebView sized the layout viewport to ~1720px and pushed the fixed header and tab bar off-screen.
- The service worker is registered on the web only. Inside Capacitor it served stale bundles after
  an update, so `main.tsx` unregisters any existing worker on native.

## Native builds (once API is live)

```bash
cd apps/web
npm run build && npx cap add android && npx cap add ios   # first time only
npm run cap:sync
npx cap open android    # Android Studio → Build → Generate Signed Bundle
npx cap open ios        # Xcode → Product → Archive (requires macOS + Apple Developer account)
```

PWA: deploy `apps/web/dist` behind Cloudflare with SPA fallback to `index.html`; `sw.js` must be
served with `Cache-Control: no-cache`.
