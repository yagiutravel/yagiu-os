import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { EMAIL_TEMPLATE_CATEGORIA_LABELS } from "@/lib/email-template/constants";
import type { EmailTemplateCategoria } from "@/types/email-template";

const CATEGORIA_STYLES: Record<
  EmailTemplateCategoria,
  { bg: string; text: string; ring: string }
> = {
  prenotazione: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/15",
  },
  pagamenti: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
  documenti: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/15",
  },
  partenza: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/15",
  },
  post_viaggio: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/15",
  },
  generale: {
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    ring: "ring-zinc-500/10",
  },
};

type EmailTemplateCategoriaBadgeProps = {
  categoria: EmailTemplateCategoria;
};

export function EmailTemplateCategoriaBadge({
  categoria,
}: EmailTemplateCategoriaBadgeProps) {
  const style = CATEGORIA_STYLES[categoria];

  return (
    <span
      className={`${profiloBadgeBase} ${style.bg} ${style.text} ${style.ring}`}
    >
      {EMAIL_TEMPLATE_CATEGORIA_LABELS[categoria]}
    </span>
  );
}
