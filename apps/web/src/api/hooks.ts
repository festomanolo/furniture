import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductQuery } from "@samani/shared";
import { api } from "./client";

export const qk = {
  categories: ["categories"] as const,
  products: (q: ProductQuery) => ["products", q] as const,
  product: (slug: string) => ["product", slug] as const,
  productsByIds: (ids: string[]) => ["products-by-id", [...ids].sort()] as const,
  reviews: (id: string) => ["reviews", id] as const,
  sellers: ["sellers"] as const,
  seller: (slug: string) => ["seller", slug] as const,
  orders: ["orders"] as const,
  requests: ["custom-requests"] as const,
};

export const useCategories = () => useQuery({ queryKey: qk.categories, queryFn: api.categories, staleTime: 1000 * 60 * 30 });
export const useProducts = (q: ProductQuery, enabled = true) =>
  useQuery({ queryKey: qk.products(q), queryFn: () => api.products(q), placeholderData: keepPreviousData, enabled });
export const useProduct = (slug: string) => useQuery({ queryKey: qk.product(slug), queryFn: () => api.product(slug), enabled: !!slug });
export const useProductsByIds = (ids: string[]) =>
  useQuery({ queryKey: qk.productsByIds(ids), queryFn: () => api.productsByIds(ids), placeholderData: keepPreviousData });
export const useReviews = (id?: string) => useQuery({ queryKey: qk.reviews(id ?? ""), queryFn: () => api.reviews(id!), enabled: !!id });
export const useSellers = () => useQuery({ queryKey: qk.sellers, queryFn: api.sellers, staleTime: 1000 * 60 * 10 });
export const useSeller = (slug: string) => useQuery({ queryKey: qk.seller(slug), queryFn: () => api.seller(slug), enabled: !!slug });
export const useOrders = () => useQuery({ queryKey: qk.orders, queryFn: api.orders });
export const useCustomRequests = () => useQuery({ queryKey: qk.requests, queryFn: api.customRequests });

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.placeOrder, onSuccess: () => qc.invalidateQueries({ queryKey: qk.orders }) });
}
export function useSubmitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { input: Parameters<typeof api.submitCustomRequest>[0]; editingId?: string | null }) => api.submitCustomRequest(v.input, v.editingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.requests }),
  });
}
export function useWithdrawRequest() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.withdrawCustomRequest, onSuccess: () => qc.invalidateQueries({ queryKey: qk.requests }) });
}
