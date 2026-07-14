import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { COMUNICAZIONE_CANALE_CONFIG } from "@/lib/comunicazioni/timeline.config";
import type { ComunicazioneCanale } from "@/types/comunicazione";

type ComunicazioneCanaleBadgeProps = {
  canale: ComunicazioneCanale;
};

export function ComunicazioneCanaleBadge({
  canale,
}: ComunicazioneCanaleBadgeProps) {
  const config = COMUNICAZIONE_CANALE_CONFIG[canale];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${profiloBadgeBase} ${config.bg} ${config.text} ${config.ring}`}
    >
      <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
      {config.label}
    </span>
  );
}
