import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { TIPOLOGIA_VIAGGIO_CONFIG } from "@/lib/clienti/preferenze-viaggiatore.config";
import type { TipologiaViaggio } from "@/types/preferenze-viaggiatore";

type TipologiaViaggioBadgeProps = {
  tipologia: TipologiaViaggio;
};

export function TipologiaViaggioBadge({ tipologia }: TipologiaViaggioBadgeProps) {
  const config = TIPOLOGIA_VIAGGIO_CONFIG[tipologia];

  return (
    <span
      className={`${profiloBadgeBase} transition-colors duration-200 hover:ring-2 ${config.bg} ${config.text} ${config.ring}`}
    >
      {config.label}
    </span>
  );
}
