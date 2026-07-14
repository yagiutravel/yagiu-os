import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { NOTIFICA_TIPO_CONFIG } from "@/lib/notifiche/tipo.config";
import type { NotificaTipo } from "@/types/notifica";

type NotificaTipoBadgeProps = {
  tipo: NotificaTipo;
};

export function NotificaTipoBadge({ tipo }: NotificaTipoBadgeProps) {
  const config = NOTIFICA_TIPO_CONFIG[tipo];

  return (
    <span
      className={`${profiloBadgeBase} ${config.bg} ${config.text} ${config.ring}`}
    >
      {config.label}
    </span>
  );
}
