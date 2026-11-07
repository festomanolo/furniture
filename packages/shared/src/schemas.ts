import { z } from "zod";
import { TZ_REGIONS } from "./regions";

/** Tanzanian mobile numbers: +255 / 255 / 0 followed by 9 digits starting 6 or 7. */
export const tzPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(?:\+?255|0)[67]\d{8}$/.test(v), { message: "phone_invalid" })
  .transform((v) => "+255" + v.replace(/^(?:\+?255|0)/, ""));

export const deliveryAddressSchema = z
  .object({
    fullName: z.string().trim().min(3, "name_short").max(80),
    phone: tzPhone,
    region: z.string().min(1, "required"),
    district: z.string().min(1, "required"),
    ward: z.string().trim().min(2, "required").max(60),
    street: z.string().trim().min(2, "required").max(120),
    instructions: z.string().trim().max(300).optional(),
  })
  .refine((a) => (TZ_REGIONS[a.region] ?? []).includes(a.district), { path: ["district"], message: "district_mismatch" });

export const checkoutSchema = z.object({
  address: deliveryAddressSchema,
  deliveryPreference: z.enum(["seller_delivery", "samani_transport", "customer_collection"]),
  contactMethod: z.enum(["phone", "whatsapp", "sms"]),
  saveAddress: z.boolean().default(true),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

export const customRequestSchema = z
  .object({
    furnitureType: z.string().min(1, "required"),
    referenceImages: z.array(z.string()).max(8),
    unit: z.enum(["cm", "mm", "m"]),
    width: z.coerce.number().positive("dimension_positive"),
    depth: z.coerce.number().positive("dimension_positive"),
    height: z.coerce.number().positive("dimension_positive"),
    materials: z.array(z.string()).min(1, "pick_material"),
    colour: z.string().min(1, "required"),
    finish: z.string().min(1, "required"),
    budgetMin: z.coerce.number().int().min(10000, "budget_min"),
    budgetMax: z.coerce.number().int(),
    region: z.string().min(1, "required"),
    district: z.string().min(1, "required"),
    instructions: z.string().max(1000).default(""),
  })
  .refine((r) => r.budgetMax >= r.budgetMin, { path: ["budgetMax"], message: "budget_range" });
export type CustomRequestInput = z.input<typeof customRequestSchema>;

/** Converts any supported unit to whole centimetres for storage. */
export function toCentimetres(value: number, unit: "cm" | "mm" | "m"): number {
  const cm = unit === "mm" ? value / 10 : unit === "m" ? value * 100 : value;
  return Math.round(cm * 10) / 10;
}

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("email_invalid").max(254),
});
