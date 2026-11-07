import { MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/Section";
import { EmptyState } from "@/components/ui/States";
import { env } from "@/lib/env";
import { useT } from "@/lib/i18n";

export default function Messages() {
  const { t } = useT();
  return (
    <div>
      <PageHeader title={t("messages")} />
      <EmptyState
        icon={<MessagesSquare className="size-7" />}
        title={t("messages_empty")}
        body={t("messages_empty_body")}
        action={
          env.supportWhatsapp ? (
            <a href={`https://wa.me/${env.supportWhatsapp}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-full bg-forest px-6 font-medium text-white">
              WhatsApp
            </a>
          ) : undefined
        }
      />
    </div>
  );
}
