import { Bell } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/States";
import { useT } from "@/lib/i18n";

export function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = useT();
  return (
    <Sheet open={open} onClose={onClose} title={t("notifications")}>
      <EmptyState
        icon={<Bell className="size-7" />}
        title={locale === "sw" ? "Uko sawa kabisa" : "You're all caught up"}
        body={locale === "sw" ? "Tutakujulisha oda, makadirio na usafirishaji vikibadilika." : "We'll let you know when orders, quotations or deliveries change."}
      />
    </Sheet>
  );
}
