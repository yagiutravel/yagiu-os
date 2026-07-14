import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import {
  DOCUMENTO_STATO_CONFIG,
} from "@/lib/clienti/documenti-viaggiatore.config";
import type { DocumentoStato } from "@/types/documenti-viaggiatore";

type DocumentoStatoBadgeProps = {
  stato: DocumentoStato;
};

export function DocumentoStatoBadge({ stato }: DocumentoStatoBadgeProps) {
  const config = DOCUMENTO_STATO_CONFIG[stato];

  return (
    <span
      className={`${profiloBadgeBase} gap-1 ${config.bg} ${config.text} ${config.ring}`}
    >
      <span aria-hidden>{config.emoji}</span>
      {config.label}
    </span>
  );
}
