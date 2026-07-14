import { Badge } from "@/components/ui/Badge";
import type { StatoPagamentoPartecipante } from "@/types/pagamento";

type PagamentoStatoBadgeProps = {
  stato: StatoPagamentoPartecipante;
};

function getVariant(
  stato: StatoPagamentoPartecipante,
): "default" | "success" | "warning" {
  if (stato === "Saldo completato") return "success";
  if (stato === "Acconto versato") return "warning";
  return "default";
}

export function PagamentoStatoBadge({ stato }: PagamentoStatoBadgeProps) {
  return <Badge variant={getVariant(stato)}>{stato}</Badge>;
}
