import { PageHeader } from "@/components/layout/PageHeader";
import { AuditLogView } from "@/components/audit-log/AuditLogView";

export default function RegistroPage() {
  return (
    <>
      <PageHeader
        title="Registro attività"
        description="Audit log di tutte le modifiche effettuate nel gestionale."
      />
      <AuditLogView />
    </>
  );
}
