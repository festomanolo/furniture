import { Link, useNavigate } from "react-router";
import { FileText, Hourglass } from "lucide-react";
import { useCustomRequests, useWithdrawRequest } from "@/api/hooks";
import { PageHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { formatDate, tzs } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useStudioDraft } from "@/stores/studioDraft";
import { toast } from "@/stores/toast";

export default function Quotations() {
  const { t, locale } = useT();
  const nav = useNavigate();
  const { data, isLoading, isError, refetch } = useCustomRequests();
  const withdraw = useWithdrawRequest();
  const load = useStudioDraft((s) => s.load);

  return (
    <div>
      <PageHeader
        title={t("quotations")}
        actions={
          <Link to="/custom-studio" className="inline-flex h-10 items-center rounded-full bg-forest px-4 text-sm font-medium text-white">
            {t("start_request")}
          </Link>
        }
      />
      <div className="mx-auto grid max-w-3xl gap-3 px-4 sm:px-6">
        {isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-36 rounded-[1.5rem]" />)}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data?.length === 0 && (
          <EmptyState
            icon={<FileText className="size-7" />}
            title={t("quotations_empty")}
            body={t("quotations_empty_body")}
            action={<Link to="/custom-studio" className="inline-flex h-11 items-center rounded-full bg-forest px-6 font-medium text-white">{t("start_request")}</Link>}
          />
        )}
        {data?.map((r) => (
          <article key={r.id} className="rounded-[1.5rem] bg-paper p-5 ring-1 ring-line">
            <div className="flex items-start gap-4">
              {r.referenceImages[0] ? (
                <img src={r.referenceImages[0]} alt="" className="size-16 shrink-0 rounded-2xl object-cover" />
              ) : (
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sage text-forest">
                  <FileText className="size-6" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold capitalize">{r.furnitureType}</h2>
                <p className="tabular text-sm text-muted">
                  {r.width} × {r.depth} × {r.height} cm · {r.materials.join(", ")}
                </p>
                <p className="tabular mt-0.5 text-sm">
                  {tzs(r.budgetMin, locale)} - {tzs(r.budgetMax, locale)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              {r.status === "open" ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-deep">
                  <Hourglass className="size-4" /> {t("awaiting_quotes")}
                </span>
              ) : (
                <span className="text-sm text-muted">{t("withdrawn")}</span>
              )}
              <span className="text-xs text-muted">· {formatDate(r.createdAt, locale)}</span>
              {r.status === "open" && (
                <div className="ml-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      load({ ...r, instructions: r.instructions ?? "" }, r.id);
                      nav("/custom-studio");
                    }}
                  >
                    {t("edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={withdraw.isPending && withdraw.variables === r.id}
                    onClick={() => withdraw.mutate(r.id, { onSuccess: () => toast(t("withdrawn")), onError: () => toast(t("error_title"), "error") })}
                  >
                    {t("withdraw")}
                  </Button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
