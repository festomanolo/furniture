import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useT } from "@/lib/i18n";
import { Button } from "./Button";

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-sage text-forest">{icon}</div>
      <h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useT();
  return (
    <div role="alert" className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
      <h2 className="text-lg font-semibold">{t("error_title")}</h2>
      <p className="mt-2 text-[15px] text-muted">{t("error_body")}</p>
      <Button variant="secondary" className="mt-6" onClick={onRetry}>
        <RotateCcw className="size-4" /> {t("retry")}
      </Button>
    </div>
  );
}
