import type { ProductQuery } from "@samani/shared";
import { ApiError, type ApiClient } from "./types";

/**
 * HTTP adapter for the Fastify backend (/api/v1). Auth tokens are attached by the
 * auth module (secure storage on native, httpOnly refresh cookie on web) in Phase 1b.
 */
export function createHttpClient(baseUrl: string): ApiClient {
  async function req<T>(path: string, init?: RequestInit, attempt = 0): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        credentials: "include",
        ...init,
        headers: { "Content-Type": "application/json", Accept: "application/json", ...(init?.headers ?? {}) },
      });
    } catch (e) {
      // Retry safe reads on network failure with backoff (patchy mobile networks).
      if ((!init?.method || init.method === "GET") && attempt < 2) {
        await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
        return req<T>(path, init, attempt + 1);
      }
      throw new ApiError("network", 0, "network");
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
      throw new ApiError(body.message ?? res.statusText, res.status, body.code);
    }
    return (res.status === 204 ? undefined : await res.json()) as T;
  }
  const qs = (q: ProductQuery) =>
    "?" +
    new URLSearchParams(Object.entries(q).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])).toString();
  const post = (body: unknown) => ({ method: "POST", body: JSON.stringify(body) });

  return {
    categories: () => req("/catalog/categories"),
    products: (q) => req(`/catalog/products${qs(q)}`),
    product: (slug) => req(`/catalog/products/${encodeURIComponent(slug)}`),
    productsByIds: (ids) => (ids.length ? req(`/catalog/products/batch?ids=${ids.map(encodeURIComponent).join(",")}`) : Promise.resolve([])),
    reviews: (id) => req(`/catalog/products/${id}/reviews`),
    sellers: () => req("/sellers"),
    seller: (slug) => req(`/sellers/${encodeURIComponent(slug)}`),
    requestPhotos: (id) => req(`/catalog/products/${id}/photo-requests`, post({})),
    placeOrder: (input) => req("/orders", { ...post(input), headers: { "Idempotency-Key": crypto.randomUUID() } }),
    orders: () => req("/orders"),
    customRequests: () => req("/custom-requests"),
    submitCustomRequest: (input, editingId) =>
      editingId ? req(`/custom-requests/${editingId}`, { method: "PUT", body: JSON.stringify(input) }) : req("/custom-requests", post(input)),
    withdrawCustomRequest: (id) => req(`/custom-requests/${id}/withdraw`, post({})),
    subscribeNewsletter: (email, locale) => req("/newsletter/subscriptions", post({ email, locale })),
  };
}
