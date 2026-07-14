import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { AUDIT_LOG_TIPO_CONFIG } from "@/lib/audit-log/tipo.config";
import type { AuditLogEntitaTipo } from "@/types/audit-log";

type AuditLogTipoBadgeProps = {
  tipo: AuditLogEntitaTipo;
};

export function AuditLogTipoBadge({ tipo }: AuditLogTipoBadgeProps) {
  const config = AUDIT_LOG_TIPO_CONFIG[tipo];
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
