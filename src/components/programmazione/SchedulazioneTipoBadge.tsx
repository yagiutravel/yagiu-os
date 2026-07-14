import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { SCHEDULAZIONE_TIPO_CONFIG } from "@/lib/schedulazione/tipo.config";
import type { SchedulazioneTipo } from "@/types/schedulazione";

type SchedulazioneTipoBadgeProps = {
  tipo: SchedulazioneTipo;
};

export function SchedulazioneTipoBadge({ tipo }: SchedulazioneTipoBadgeProps) {
  const config = SCHEDULAZIONE_TIPO_CONFIG[tipo];
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
