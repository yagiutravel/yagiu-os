import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { WHATSAPP_STATO_LABELS } from "@/models/whatsapp";
import type { WhatsAppStato } from "@/types/whatsapp";

const STATO_STYLES: Record<
  WhatsAppStato,
  { bg: string; text: string; ring: string }
> = {
  inviato: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/15",
  },
  consegnato: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
  letto: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/15",
  },
  in_coda: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/15",
  },
  fallito: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/15",
  },
};

type WhatsAppStatoBadgeProps = {
  stato: WhatsAppStato;
};

export function WhatsAppStatoBadge({ stato }: WhatsAppStatoBadgeProps) {
  const style = STATO_STYLES[stato];
  return (
    <span
      className={`${profiloBadgeBase} ${style.bg} ${style.text} ${style.ring}`}
    >
      {WHATSAPP_STATO_LABELS[stato]}
    </span>
  );
}
