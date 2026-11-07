import { applyBps, assertTzs, sumTzs, type Tzs } from "./money";
import type { CheckoutTotals, DeliveryMethod, DeliveryOption, FulfilmentType } from "./domain";

export interface PricedLine {
  sellerId: string;
  unitPrice: Tzs;
  quantity: number;
  fulfilment: FulfilmentType;
  needsConfirmation: boolean;
}

export interface SellerDeliveryChoice {
  sellerId: string;
  method: DeliveryMethod;
  /** null when a delivery quotation is required. */
  fee: Tzs | null;
  installationFee: Tzs;
}

export interface SellerGroupTotals {
  sellerId: string;
  subtotal: Tzs;
  deliveryFee: Tzs | null;
  installationFee: Tzs;
  requiresConfirmation: boolean;
}

/** Groups lines per seller. Different sellers never ship together, so each group becomes its own fulfilment order. */
export function groupBySeller(lines: readonly PricedLine[], choices: readonly SellerDeliveryChoice[]): SellerGroupTotals[] {
  const sellers = [...new Set(lines.map((l) => l.sellerId))];
  return sellers.map((sellerId) => {
    const own = lines.filter((l) => l.sellerId === sellerId);
    const choice = choices.find((c) => c.sellerId === sellerId);
    for (const l of own) if (!Number.isInteger(l.quantity) || l.quantity < 1) throw new RangeError("quantity");
    return {
      sellerId,
      subtotal: sumTzs(own.map((l) => l.unitPrice * l.quantity)),
      deliveryFee: choice ? (choice.method === "customer_collection" ? assertTzs(0) : choice.fee) : null,
      installationFee: choice?.installationFee ?? assertTzs(0),
      requiresConfirmation: own.some((l) => l.needsConfirmation || l.fulfilment === "made_to_order"),
    };
  });
}

export function checkoutTotals(groups: readonly SellerGroupTotals[], discount: Tzs = assertTzs(0)): CheckoutTotals {
  const products = sumTzs(groups.map((g) => g.subtotal));
  const delivery = sumTzs(groups.map((g) => g.deliveryFee ?? 0));
  const installation = sumTzs(groups.map((g) => g.installationFee));
  const safeDiscount = Math.min(discount, products);
  return {
    products,
    delivery,
    deliveryPendingQuote: groups.some((g) => g.deliveryFee === null),
    installation,
    discount: assertTzs(safeDiscount),
    payable: assertTzs(products + delivery + installation - safeDiscount),
  };
}

export interface CommissionRates {
  readyMadeBps: number;
  customBps: number;
}
export const DEFAULT_COMMISSION: CommissionRates = { readyMadeBps: 400, customBps: 300 };

/** Commission is charged on eligible product value only: never on delivery, never on refunded amounts. */
export function commissionFor(productValue: Tzs, refunded: Tzs, fulfilment: FulfilmentType, rates: CommissionRates = DEFAULT_COMMISSION): Tzs {
  const eligible = assertTzs(Math.max(0, productValue - refunded));
  return applyBps(eligible, fulfilment === "made_to_order" ? rates.customBps : rates.readyMadeBps);
}

export interface DeliverableLine {
  unitPrice: Tzs;
  quantity: number;
  delivery: readonly DeliveryOption[];
}

/**
 * Delivery fee one seller charges for a method and region. Returns null when a quotation
 * is required (fee not configured, or the seller does not cover the region).
 * One trip per seller: the largest item fee applies, and the seller's free-delivery
 * threshold is checked against that seller's subtotal.
 */
export function sellerDeliveryFee(lines: readonly DeliverableLine[], method: DeliveryMethod, region: string): Tzs | null {
  if (method === "customer_collection") return assertTzs(0);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  let fee = 0;
  for (const l of lines) {
    const opt = l.delivery.find((d) => d.method === method && (d.regions.length === 0 || d.regions.includes(region)));
    if (!opt || opt.fee === null) return null;
    if (opt.freeAbove && subtotal >= opt.freeAbove) continue;
    fee = Math.max(fee, opt.fee);
  }
  return assertTzs(fee);
}
