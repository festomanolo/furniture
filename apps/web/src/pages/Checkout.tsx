import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { CheckCircle2, MessageCircle, Phone, Smartphone, Truck, Warehouse, Waypoints } from "lucide-react";
import { checkoutSchema, TZ_REGIONS, TZ_REGION_NAMES, type CheckoutInput, type DeliveryMethod, type Order } from "@samani/shared";
import { usePlaceOrder, useProductsByIds } from "@/api/hooks";
import { ApiError } from "@/api/types";
import { PageHeader } from "@/components/layout/Section";
import { TotalsCard } from "@/components/product/Totals";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { priceCart, resolveLines } from "@/features/pricing";
import { cn } from "@/lib/cn";
import { errorText, useT, type TKey } from "@/lib/i18n";
import { easeOutExpo } from "@/lib/motion";
import { useCart } from "@/stores/cart";
import { usePrefs } from "@/stores/prefs";
import { safeStorage } from "@/stores/storage";
import { toast } from "@/stores/toast";

const ADDRESS_KEY = "samani.saved-address";

function loadSavedAddress(): Partial<CheckoutInput["address"]> | null {
  const raw = safeStorage?.getItem(ADDRESS_KEY);
  return raw && typeof raw === "object" && "state" in raw ? ((raw as { state: Partial<CheckoutInput["address"]> }).state ?? null) : null;
}

export default function Checkout() {
  const { t, locale } = useT();
  const { items, clear } = useCart();
  const prefs = usePrefs();
  const place = usePlaceOrder();
  const [placed, setPlaced] = useState<Order | null>(null);
  const { data: products } = useProductsByIds([...new Set(items.map((i) => i.productId))]);

  const saved = loadSavedAddress();
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      address: {
        fullName: saved?.fullName ?? "",
        phone: saved?.phone ?? "",
        region: saved?.region ?? prefs.region,
        district: saved?.district ?? prefs.district,
        ward: saved?.ward ?? "",
        street: saved?.street ?? "",
        instructions: saved?.instructions ?? "",
      },
      deliveryPreference: "seller_delivery",
      contactMethod: "whatsapp",
      saveAddress: true,
    },
  });
  const { register, handleSubmit, control, setValue, formState } = form;
  const errors = formState.errors.address;
  const region = useWatch({ control, name: "address.region" });
  const method = useWatch({ control, name: "deliveryPreference" }) as DeliveryMethod;
  const contact = useWatch({ control, name: "contactMethod" });
  const districts = TZ_REGIONS[region] ?? [];

  useEffect(() => {
    const current = form.getValues("address.district");
    if (!districts.includes(current)) setValue("address.district", districts[0] ?? "");
  }, [region]); // eslint-disable-line react-hooks/exhaustive-deps

  if (placed) return <OrderPlaced order={placed} />;
  if (!items.length) return <Navigate to="/cart" replace />;

  const lines = resolveLines(items, products);
  const { groups, totals } = priceCart(lines, method, region);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await place.mutateAsync({ checkout: values, lines: items });
      if (values.saveAddress) safeStorage?.setItem(ADDRESS_KEY, { state: values.address, version: 0 });
      clear();
      setPlaced(order);
      window.scrollTo({ top: 0 });
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t("error_title"), "error");
    }
  });

  const methods: { id: DeliveryMethod; icon: typeof Truck }[] = [
    { id: "seller_delivery", icon: Truck },
    { id: "samani_transport", icon: Waypoints },
    { id: "customer_collection", icon: Warehouse },
  ];
  const contacts = [
    { id: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
    { id: "phone", icon: Phone, label: locale === "sw" ? "Simu" : "Call" },
    { id: "sms", icon: Smartphone, label: "SMS" },
  ] as const;

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <PageHeader title={t("checkout")} />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="grid gap-8">
          <fieldset className="grid gap-4">
            <legend className="mb-4 text-lg font-semibold tracking-[-0.02em]">{t("your_details")}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("full_name")} error={errorText(locale, errors?.fullName?.message)}>
                {(id, d) => <Input id={id} autoComplete="name" aria-invalid={!!errors?.fullName} aria-describedby={d} {...register("address.fullName")} />}
              </Field>
              <Field label={t("phone")} error={errorText(locale, errors?.phone?.message)} hint="0712 345 678">
                {(id, d) => <Input id={id} type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!errors?.phone} aria-describedby={d} {...register("address.phone")} />}
              </Field>
              <Field label={t("region")} error={errorText(locale, errors?.region?.message)}>
                {(id) => (
                  <Select id={id} {...register("address.region")}>
                    {TZ_REGION_NAMES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={t("district")} error={errorText(locale, errors?.district?.message)}>
                {(id) => (
                  <Select id={id} aria-invalid={!!errors?.district} {...register("address.district")}>
                    {districts.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={t("ward")} error={errorText(locale, errors?.ward?.message)}>
                {(id, d) => <Input id={id} aria-invalid={!!errors?.ward} aria-describedby={d} {...register("address.ward")} />}
              </Field>
              <Field label={t("street")} error={errorText(locale, errors?.street?.message)}>
                {(id, d) => <Input id={id} autoComplete="street-address" aria-invalid={!!errors?.street} aria-describedby={d} {...register("address.street")} />}
              </Field>
            </div>
            <Field label={t("instructions")}>{(id) => <Textarea id={id} rows={2} {...register("address.instructions")} />}</Field>
          </fieldset>

          <fieldset>
            <legend className="mb-4 text-lg font-semibold tracking-[-0.02em]">{t("delivery_pref")}</legend>
            <div className="grid gap-2.5" role="radiogroup">
              {methods.map(({ id, icon: Icon }) => (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-2xl border bg-paper p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest",
                    method === id ? "border-forest ring-1 ring-forest" : "border-line",
                  )}
                >
                  <input type="radio" value={id} className="sr-only" {...register("deliveryPreference")} />
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", method === id ? "bg-forest text-white" : "bg-sage text-forest")}>
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium">{t(id as TKey)}</span>
                    <span className="block text-[13px] text-muted">{t(`${id}_sub` as TKey)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 text-lg font-semibold tracking-[-0.02em]">{t("contact_pref")}</legend>
            <div className="flex flex-wrap gap-2">
              {contacts.map(({ id, icon: Icon, label }) => (
                <label
                  key={id}
                  className={cn(
                    "inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest",
                    contact === id ? "border-forest bg-forest text-white" : "border-line bg-paper",
                  )}
                >
                  <input type="radio" value={id} className="sr-only" {...register("contactMethod")} />
                  <Icon className="size-4" /> {label}
                </label>
              ))}
            </div>
            <label className="mt-5 flex items-center gap-3 text-[15px]">
              <input type="checkbox" className="size-5 accent-forest" {...register("saveAddress")} />
              {t("save_address")}
            </label>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-28">
          <TotalsCard totals={totals} requiresConfirmation={groups.some((g) => g.requiresConfirmation)}>
            <Button type="submit" size="lg" className="mt-5 w-full" loading={place.isPending}>
              {t("place_order")}
            </Button>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted">
              {locale === "sw"
                ? "Hutalipa sasa. Malipo yanaombwa baada ya muuzaji kuthibitisha."
                : "You don't pay now. Payment is requested after the seller confirms."}
            </p>
          </TotalsCard>
        </aside>
      </div>
    </form>
  );
}

function OrderPlaced({ order }: { order: Order }) {
  const { t } = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOutExpo }}
      className="mx-auto flex max-w-md flex-col items-center px-6 py-14 text-center"
    >
      <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.45, duration: 0.6 }} className="flex size-20 items-center justify-center rounded-full bg-forest text-gold">
        <CheckCircle2 className="size-10" />
      </motion.span>
      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{t("order_placed")}</h1>
      <p className="tabular mt-1 text-sm font-medium text-forest">{order.reference}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("order_placed_body")}</p>
      <div className="mt-8 flex w-full flex-col gap-2.5">
        <Link to={`/orders/${order.id}`} className="inline-flex h-12 items-center justify-center rounded-full bg-forest font-medium text-white">
          {t("view_orders")}
        </Link>
        <Link to="/explore" className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-paper font-medium">
          {t("continue_shopping")}
        </Link>
      </div>
    </motion.div>
  );
}
