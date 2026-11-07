import type { Tzs } from "./money";

export type Locale = "sw" | "en";
export type Role = "customer" | "seller" | "admin" | "super_admin";
export type SellerKind = "shop" | "carpenter" | "manufacturer" | "interior_designer";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected" | "suspended";
export type FulfilmentType = "ready_made" | "made_to_order";
export type Availability = "in_stock" | "low_stock" | "made_to_order" | "out_of_stock";
export type DeliveryMethod = "seller_delivery" | "samani_transport" | "customer_collection";

export interface Category {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  parentId: string | null;
  image: string;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  /** Base path for derivatives; render with srcset helpers. */
  src: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  label: string;
  colourHex?: string;
  priceDelta: Tzs;
  stock: number | null;
}

export interface Dimensions {
  widthCm: number;
  depthCm: number;
  heightCm: number;
  weightKg?: number;
}

export interface DeliveryOption {
  method: DeliveryMethod;
  /** null = quotation required before payment. */
  fee: Tzs | null;
  regions: string[];
  etaDays: [number, number];
  freeAbove?: Tzs;
}

export interface SellerSummary {
  id: string;
  slug: string;
  name: string;
  kind: SellerKind;
  verification: VerificationStatus;
  rating: number;
  reviewCount: number;
  region: string;
  district: string;
  avatar: string;
  cover: string;
  bio: string;
  yearsActive: number;
  completedOrders: number;
  responseHours: number;
  whatsapp?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
  region: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  sellerId: string;
  price: Tzs;
  compareAtPrice: Tzs | null;
  fulfilment: FulfilmentType;
  availability: Availability;
  productionDays: [number, number] | null;
  materials: string[];
  colours: string[];
  dimensions: Dimensions;
  variants: ProductVariant[];
  images: ProductImage[];
  delivery: DeliveryOption[];
  installation: { available: boolean; fee: Tzs | null };
  warrantyMonths: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  createdAt: string;
}

export type ProductSort = "recommended" | "newest" | "price_asc" | "price_desc" | "popular" | "rating";

export interface ProductQuery {
  q?: string;
  category?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  region?: string;
  material?: string;
  fulfilment?: FulfilmentType;
  minRating?: number;
  inStockOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type CustomRequestStatus = "draft" | "open" | "quoted" | "accepted" | "withdrawn" | "expired";

export interface CustomRequest {
  id: string;
  furnitureType: string;
  referenceImages: string[];
  unit: "cm" | "mm" | "m";
  width: number;
  depth: number;
  height: number;
  materials: string[];
  colour: string;
  finish: string;
  budgetMin: Tzs;
  budgetMax: Tzs;
  region: string;
  district: string;
  instructions: string;
  status: CustomRequestStatus;
  createdAt: string;
}

export interface Quotation {
  id: string;
  requestId: string;
  sellerId: string;
  totalPrice: Tzs;
  materialsCost: Tzs;
  labourCost: Tzs;
  deliveryFee: Tzs;
  productionDays: number;
  designNotes: string;
  warrantyMonths: number;
  expiresAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
}

export const PRODUCTION_STAGES = [
  "order_confirmed",
  "materials_preparing",
  "production_started",
  "assembly",
  "finishing",
  "quality_inspection",
  "ready_for_dispatch",
  "dispatched",
  "delivered",
] as const;
export type ProductionStage = (typeof PRODUCTION_STAGES)[number];

export type SellerOrderStatus =
  | "awaiting_seller_confirmation"
  | "confirmed"
  | "in_production"
  | "ready"
  | "dispatched"
  | "delivered"
  | "completed"
  | "cancelled"
  | "rejected";

export interface OrderLine {
  productId: string;
  variantId: string | null;
  name: string;
  image: string;
  unitPrice: Tzs;
  quantity: number;
}

export interface SellerOrder {
  id: string;
  sellerId: string;
  sellerName: string;
  status: SellerOrderStatus;
  lines: OrderLine[];
  subtotal: Tzs;
  deliveryMethod: DeliveryMethod;
  deliveryFee: Tzs | null;
  installationFee: Tzs;
  requiresConfirmation: boolean;
}

export interface Order {
  id: string;
  reference: string;
  createdAt: string;
  sellerOrders: SellerOrder[];
  totals: CheckoutTotals;
  address: DeliveryAddress;
  contactMethod: "phone" | "whatsapp" | "sms";
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  region: string;
  district: string;
  ward: string;
  street: string;
  instructions?: string;
}

export interface CheckoutTotals {
  products: Tzs;
  delivery: Tzs;
  deliveryPendingQuote: boolean;
  installation: Tzs;
  discount: Tzs;
  payable: Tzs;
}
