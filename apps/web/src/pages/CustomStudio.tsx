import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Archive, Armchair, BedDouble, BookOpen, Briefcase, Check, ChefHat, ChevronLeft, DoorOpen, ImagePlus, Sofa, Sparkles, Table, TreePine, Tv, X } from "lucide-react";
import { customRequestSchema, TZ_REGIONS, TZ_REGION_NAMES, type CustomRequestInput } from "@samani/shared";
import { useSubmitRequest } from "@/api/hooks";
import { ApiError } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Chip, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { brandImage } from "@/lib/media";
import { cn } from "@/lib/cn";
import { tzs } from "@/lib/format";
import { errorText, useT, type TKey } from "@/lib/i18n";
import { easeOutExpo } from "@/lib/motion";
import { usePrefs } from "@/stores/prefs";
import { useStudioDraft } from "@/stores/studioDraft";
import { toast } from "@/stores/toast";

const TYPES = [
  { id: "sofa", icon: Sofa, en: "Sofa", sw: "Sofa" },
  { id: "bed", icon: BedDouble, en: "Bed", sw: "Kitanda" },
  { id: "wardrobe", icon: Archive, en: "Wardrobe", sw: "Kabati la nguo" },
  { id: "dining", icon: Table, en: "Dining table", sw: "Meza ya chakula" },
  { id: "chair", icon: Armchair, en: "Chair", sw: "Kiti" },
  { id: "tv", icon: Tv, en: "TV stand", sw: "Meza ya TV" },
  { id: "kitchen", icon: ChefHat, en: "Kitchen cabinets", sw: "Makabati ya jikoni" },
  { id: "shelf", icon: BookOpen, en: "Bookshelf", sw: "Rafu ya vitabu" },
  { id: "office", icon: Briefcase, en: "Office desk", sw: "Meza ya ofisi" },
  { id: "door", icon: DoorOpen, en: "Door", sw: "Mlango" },
  { id: "outdoor", icon: TreePine, en: "Outdoor", sw: "Samani za nje" },
  { id: "other", icon: Sparkles, en: "Something else", sw: "Kitu kingine" },
] as const;
const MATERIALS = ["MDF", "Plywood", "Solid wood", "Mahogany", "Mninga", "Teak", "Metal", "Fabric", "Leather", "Glass"];
const FINISHES = ["Natural oil", "Matte lacquer", "Gloss lacquer", "Painted", "Upholstered"];
const COLOURS = [
  { name: "Natural wood", hex: "#b8875a" },
  { name: "Dark walnut", hex: "#5a3a26" },
  { name: "White", hex: "#f4f3ee" },
  { name: "Black", hex: "#1d1f1e" },
  { name: "Forest green", hex: "#153d2c" },
  { name: "Grey", hex: "#8c908b" },
  { name: "Navy", hex: "#2a3550" },
  { name: "Cream", hex: "#e9e0cc" },
];

type StepDef = { title: TKey; fields: (keyof CustomRequestInput)[] };
const STEPS: StepDef[] = [
  { title: "s_type", fields: ["furnitureType"] },
  { title: "s_photos", fields: ["referenceImages"] },
  { title: "s_dims", fields: ["width", "depth", "height", "unit"] },
  { title: "s_materials", fields: ["materials"] },
  { title: "s_finish", fields: ["colour", "finish"] },
  { title: "s_budget", fields: ["budgetMin", "budgetMax"] },
  { title: "s_location", fields: ["region", "district"] },
  { title: "s_notes", fields: ["instructions"] },
  { title: "s_review", fields: [] },
];

/** Downscale a photo on-device before storing in the local draft (originals upload to R2 at submit time). */
async function downscale(file: File, max = 900): Promise<string> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}

export default function CustomStudio() {
  const { t, locale } = useT();
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const prefs = usePrefs();
  const { draft, step, editingId, save, reset } = useStudioDraft();
  const submit = useSubmitRequest();
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const d: CustomRequestInput = { ...draft, region: draft.region || prefs.region, district: draft.district || prefs.district };

  const validateStep = (i: number) => {
    const res = customRequestSchema.safeParse(d);
    if (res.success) return {};
    const fields = i === STEPS.length - 1 ? STEPS.flatMap((s) => s.fields) : STEPS[i]!.fields;
    const errs: Record<string, string> = {};
    for (const issue of res.error.issues) {
      const k = String(issue.path[0]);
      if (fields.includes(k as keyof CustomRequestInput) && !errs[k]) errs[k] = issue.message;
    }
    return errs;
  };

  const go = (to: number) => {
    if (to > step) {
      const errs = validateStep(step);
      setErrors(errs);
      if (Object.keys(errs).length) return;
    } else setErrors({});
    setDir(to > step ? 1 : -1);
    save({}, to);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const onSubmit = async () => {
    const errs = validateStep(STEPS.length - 1);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const firstBad = STEPS.findIndex((s) => s.fields.some((f) => errs[f]));
      if (firstBad >= 0) go(firstBad);
      return;
    }
    try {
      await submit.mutateAsync({ input: d, editingId });
      reset();
      setDone(true);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t("error_title"), "error");
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = 8 - d.referenceImages.length;
    const picked = [...files].filter((f) => f.type.startsWith("image/")).slice(0, room);
    try {
      const urls = await Promise.all(picked.map((f) => downscale(f)));
      save({ referenceImages: [...d.referenceImages, ...urls] });
    } catch {
      toast(locale === "sw" ? "Picha haikuweza kusomwa" : "That photo could not be read", "error");
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
        <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.45, duration: 0.6 }} className="flex size-20 items-center justify-center rounded-full bg-forest text-gold">
          <Check className="size-10" />
        </motion.span>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{t("request_sent")}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("request_sent_body")}</p>
        <Button size="lg" className="mt-8 w-full" onClick={() => nav("/quotations")}>
          {t("quotations")}
        </Button>
      </div>
    );
  }

  const cover = brandImage("emerald-alcove");
  const current = STEPS[step]!;
  const typeLabel = (id: string) => TYPES.find((x) => x.id === id)?.[locale] ?? id;
  const err = (k: string) => errorText(locale, errors[k]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-8">
      <aside className="relative hidden overflow-hidden rounded-[2rem] lg:sticky lg:top-28 lg:block lg:h-[calc(100dvh-9rem)]">
        <img src={cover.src} srcSet={cover.srcSet} sizes="40vw" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(16_45_32/0.85))]" />
        <div className="absolute inset-x-8 bottom-8 text-white">
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.04em]">{t("studio_title")}</h1>
          <p className="mt-3 max-w-[40ch] text-white/80">{t("studio_intro")}</p>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="lg:hidden">
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.035em]">{t("studio_title")}</h1>
          <p className="mt-1.5 text-[15px] text-muted">{t("studio_intro")}</p>
        </div>

        <div className="mt-6 lg:mt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="tabular font-medium text-forest">
              {t("step")} {step + 1} {t("of")} {STEPS.length}
            </span>
            <span className="text-xs text-muted">{t("draft_saved")}</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sage" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
            <motion.div className="h-full rounded-full bg-forest" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5, ease: easeOutExpo }} />
          </div>
        </div>

        <div className="relative mt-8 min-h-[24rem] overflow-x-clip">
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.section
              key={step}
              custom={dir}
              variants={{
                enter: (k: number) => (reduce ? { opacity: 0 } : { x: k * 48, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (k: number) => (reduce ? { opacity: 0 } : { x: k * -48, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", bounce: 0, duration: 0.38 }}
              aria-labelledby="step-title"
            >
              <h2 id="step-title" className="text-2xl font-semibold tracking-[-0.03em]">
                {t(current.title)}
              </h2>

              {step === 0 && (
                <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4" role="radiogroup">
                  {TYPES.map(({ id, icon: Icon, ...l }) => (
                    <button
                      key={id}
                      role="radio"
                      aria-checked={d.furnitureType === id}
                      onClick={() => {
                        save({ furnitureType: id });
                        setErrors({});
                      }}
                      className={cn(
                        "flex aspect-square flex-col items-center justify-center gap-2 rounded-[1.25rem] border p-2 text-center text-[13px] font-medium transition-[background-color,border-color,transform] active:scale-[0.96]",
                        d.furnitureType === id ? "border-forest bg-forest text-white" : "border-line bg-paper hover:border-sage-deep",
                      )}
                    >
                      <Icon className={cn("size-7", d.furnitureType === id ? "text-gold" : "text-forest")} strokeWidth={1.6} />
                      {l[locale]}
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="mt-2">
                  <p className="text-[15px] text-muted">{t("s_photos_sub")}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {d.referenceImages.map((src, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-[1.1rem] bg-sage">
                        <img src={src} alt="" className="size-full object-cover" />
                        <button
                          aria-label={t("remove")}
                          onClick={() => save({ referenceImages: d.referenceImages.filter((_, j) => j !== i) })}
                          className="glass absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                    {d.referenceImages.length < 8 && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[1.1rem] border-2 border-dashed border-sage-deep bg-paper text-[13px] font-medium text-forest hover:bg-sage/40"
                      >
                        <ImagePlus className="size-6" /> {t("add_photos")}
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple hidden onChange={(e) => onFiles(e.target.files).then(() => (e.target.value = ""))} />
                </div>
              )}

              {step === 2 && (
                <div className="mt-5 grid gap-5">
                  <div className="inline-flex w-fit rounded-full bg-sage p-1" role="radiogroup" aria-label={t("unit")}>
                    {(["cm", "mm", "m"] as const).map((u) => (
                      <button key={u} role="radio" aria-checked={d.unit === u} onClick={() => save({ unit: u })} className={cn("h-10 rounded-full px-5 text-sm font-medium", d.unit === u ? "bg-paper shadow-soft" : "text-ink/70")}>
                        {u}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["width", "depth", "height"] as const).map((k) => (
                      <Field key={k} label={`${t(k)} (${d.unit})`} error={err(k)}>
                        {(id, desc) => (
                          <Input
                            id={id}
                            inputMode="decimal"
                            aria-invalid={!!errors[k]}
                            aria-describedby={desc}
                            value={String(d[k] ?? "")}
                            onChange={(e) => save({ [k]: e.target.value.replace(/[^\d.]/g, "") } as Partial<CustomRequestInput>)}
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-5">
                  <div className="flex flex-wrap gap-2">
                    {MATERIALS.map((m) => (
                      <Chip
                        key={m}
                        selected={d.materials.includes(m)}
                        onClick={() => save({ materials: d.materials.includes(m) ? d.materials.filter((x) => x !== m) : [...d.materials, m] })}
                      >
                        {m}
                      </Chip>
                    ))}
                  </div>
                  {err("materials") && <p className="mt-3 text-[13px] text-danger">{err("materials")}</p>}
                </div>
              )}

              {step === 4 && (
                <div className="mt-5 grid gap-7">
                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold">{t("colour")}</legend>
                    <div className="grid grid-cols-4 gap-2.5" role="radiogroup">
                      {COLOURS.map((c) => (
                        <button key={c.name} role="radio" aria-checked={d.colour === c.name} onClick={() => save({ colour: c.name })} className="flex flex-col items-center gap-1.5 text-center text-[12px]">
                          <span className={cn("size-12 rounded-full ring-1 ring-black/10 transition-shadow", d.colour === c.name && "ring-3 ring-forest ring-offset-2 ring-offset-ivory")} style={{ background: c.hex }} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                    {err("colour") && <p className="mt-3 text-[13px] text-danger">{err("colour")}</p>}
                  </fieldset>
                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold">{t("finish")}</legend>
                    <div className="flex flex-wrap gap-2">
                      {FINISHES.map((f) => (
                        <Chip key={f} selected={d.finish === f} onClick={() => save({ finish: f })}>
                          {f}
                        </Chip>
                      ))}
                    </div>
                    {err("finish") && <p className="mt-3 text-[13px] text-danger">{err("finish")}</p>}
                  </fieldset>
                </div>
              )}

              {step === 5 && (
                <div className="mt-5 grid gap-5">
                  <div className="flex flex-wrap gap-2">
                    {[
                      [100000, 400000],
                      [400000, 1000000],
                      [1000000, 2500000],
                      [2500000, 6000000],
                    ].map(([a, b]) => (
                      <Chip key={a} selected={Number(d.budgetMin) === a && Number(d.budgetMax) === b} onClick={() => save({ budgetMin: a!, budgetMax: b! })}>
                        <span className="tabular">
                          {tzs(a!, locale).replace("TSh ", "")} - {tzs(b!, locale).replace("TSh ", "")}
                        </span>
                      </Chip>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(["budgetMin", "budgetMax"] as const).map((k) => (
                      <Field key={k} label={t(k === "budgetMin" ? "budget_min" : "budget_max")} error={err(k)}>
                        {(id, desc) => (
                          <Input
                            id={id}
                            inputMode="numeric"
                            aria-invalid={!!errors[k]}
                            aria-describedby={desc}
                            value={d[k] ? Number(d[k]).toLocaleString("en") : ""}
                            onChange={(e) => save({ [k]: e.target.value.replace(/\D/g, "") } as Partial<CustomRequestInput>)}
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label={t("region")}>
                    {(id) => (
                      <Select id={id} value={d.region} onChange={(e) => save({ region: e.target.value, district: TZ_REGIONS[e.target.value]?.[0] ?? "" })}>
                        {TZ_REGION_NAMES.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <Field label={t("district")} error={err("district")}>
                    {(id) => (
                      <Select id={id} value={d.district} onChange={(e) => save({ district: e.target.value, region: d.region })}>
                        {(TZ_REGIONS[d.region] ?? []).map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </div>
              )}

              {step === 7 && (
                <div className="mt-5">
                  <Field label={t("s_notes")}>
                    {(id) => <Textarea id={id} rows={5} maxLength={1000} placeholder={t("notes_placeholder")} value={d.instructions ?? ""} onChange={(e) => save({ instructions: e.target.value })} />}
                  </Field>
                </div>
              )}

              {step === 8 && (
                <dl className="mt-5 divide-y divide-line overflow-hidden rounded-[1.5rem] bg-paper ring-1 ring-line">
                  {[
                    [t("type"), typeLabel(d.furnitureType), 0],
                    [t("s_photos"), `${d.referenceImages.length}`, 1],
                    [t("dimensions"), `${d.width} × ${d.depth} × ${d.height} ${d.unit}`, 2],
                    [t("materials"), d.materials.join(", "), 3],
                    [t("s_finish"), `${d.colour}, ${d.finish}`, 4],
                    [t("s_budget"), `${tzs(Number(d.budgetMin) || 0, locale)} - ${tzs(Number(d.budgetMax) || 0, locale)}`, 5],
                    [t("s_location"), `${d.district}, ${d.region}`, 6],
                    [t("s_notes"), d.instructions || "-", 7],
                  ].map(([label, value, idx]) => (
                    <div key={String(label)} className="flex items-start gap-4 px-5 py-3.5">
                      <dt className="w-28 shrink-0 text-sm text-muted">{label}</dt>
                      <dd className={cn("tabular flex-1 text-[15px]", errors[STEPS[idx as number]!.fields[0] as string] && "text-danger")}>{value}</dd>
                      <button onClick={() => go(idx as number)} className="text-sm font-medium text-forest">
                        {t("edit")}
                      </button>
                    </div>
                  ))}
                </dl>
              )}
            </motion.section>
          </AnimatePresence>
        </div>

        <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-30 mt-8 flex gap-3 lg:bottom-6">
          {step > 0 && (
            <Button variant="glass" size="lg" onClick={() => go(step - 1)} className="px-5">
              <ChevronLeft className="size-5" /> {t("back")}
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button size="lg" className="flex-1" onClick={() => go(step + 1)}>
              {t("next")}
            </Button>
          ) : (
            <Button size="lg" className="flex-1" loading={submit.isPending} onClick={onSubmit}>
              {t("submit_request")}
            </Button>
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link to="/quotations" className="font-medium text-forest">
            {t("quotations")}
          </Link>
        </p>
      </div>
    </div>
  );
}
