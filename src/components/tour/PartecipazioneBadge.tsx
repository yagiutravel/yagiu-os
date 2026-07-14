import { Badge } from "@/components/ui/Badge";
import type {
  DocumentiPartecipante,
  PagamentoPartecipante,
  QuestionarioPartecipante,
  RuoloPartecipante,
} from "@/types/tour-partecipazione";

type PartecipazioneBadgeProps = {
  kind: "ruolo" | "pagamento" | "documenti" | "questionario";
  value: RuoloPartecipante | PagamentoPartecipante | DocumentiPartecipante | QuestionarioPartecipante;
};

function getVariant(
  kind: PartecipazioneBadgeProps["kind"],
  value: PartecipazioneBadgeProps["value"],
): "default" | "success" | "warning" | "info" {
  if (kind === "ruolo") {
    if (value === "Tour Leader") return "info";
    if (value === "Guida Locale") return "warning";
    return "default";
  }

  if (kind === "pagamento") {
    if (value === "Saldo ricevuto") return "success";
    if (value === "Acconto ricevuto") return "warning";
    return "default";
  }

  if (kind === "documenti") {
    if (value === "Verificati") return "success";
    if (value === "Ricevuti") return "warning";
    return "default";
  }

  if (value === "Compilato") return "success";
  return "default";
}

export function PartecipazioneBadge({ kind, value }: PartecipazioneBadgeProps) {
  return <Badge variant={getVariant(kind, value)}>{value}</Badge>;
}
