import type {
  Category,
  CheckoutInput,
  CustomRequest,
  CustomRequestInput,
  Order,
  Paginated,
  Product,
  ProductQuery,
  Review,
  SellerSummary,
} from "@samani/shared";

export interface CheckoutLineInput {
  productId: string;
  variantId: string | null;
  quantity: number;
}

/** Contract between the frontend and the SAMANI REST API (v1). */
export interface ApiClient {
  categories(): Promise<Category[]>;
  products(q: ProductQuery): Promise<Paginated<Product>>;
  product(slug: string): Promise<Product>;
  productsByIds(ids: string[]): Promise<Product[]>;
  reviews(productId: string): Promise<Review[]>;
  sellers(): Promise<SellerSummary[]>;
  seller(slugOrId: string): Promise<SellerSummary>;
  requestPhotos(productId: string): Promise<void>;
  placeOrder(input: { checkout: CheckoutInput; lines: CheckoutLineInput[] }): Promise<Order>;
  orders(): Promise<Order[]>;
  customRequests(): Promise<CustomRequest[]>;
  submitCustomRequest(input: CustomRequestInput, editingId?: string | null): Promise<CustomRequest>;
  withdrawCustomRequest(id: string): Promise<CustomRequest>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}
