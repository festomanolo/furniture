import { useState } from "react";
import { TZ_REGIONS, TZ_REGION_NAMES } from "@samani/shared";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { useT } from "@/lib/i18n";
import { usePrefs } from "@/stores/prefs";

export function LocationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const { region, district, setLocation } = usePrefs();
  const [r, setR] = useState(region);
  const [d, setD] = useState(district);
  const districts = TZ_REGIONS[r] ?? [];
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("deliver_to")}
      footer={
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            setLocation(r, d);
            onClose();
          }}
        >
          {t("apply")}
        </Button>
      }
    >
      <div className="grid gap-4 pt-2">
        <Field label={t("region")}>
          {(id) => (
            <Select
              id={id}
              value={r}
              onChange={(e) => {
                setR(e.target.value);
                setD(TZ_REGIONS[e.target.value]?.[0] ?? "");
              }}
            >
              {TZ_REGION_NAMES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t("district")}>
          {(id) => (
            <Select id={id} value={d} onChange={(e) => setD(e.target.value)}>
              {districts.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </Select>
          )}
        </Field>
      </div>
    </Sheet>
  );
}
