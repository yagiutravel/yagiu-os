import { Badge } from "@/components/ui/Badge";
import { formatComunicazioneStatoLabel } from "@/models/comunicazione";
import type { ComunicazioneStato } from "@/types/comunicazione";

type ComunicazioneStatoBadgeProps = {
  stato: ComunicazioneStato;
};

function getVariant(
  stato: ComunicazioneStato,
): "default" | "success" | "warning" | "info" {
  switch (stato) {
    case "inviata":
    case "consegnata":
    case "letta":
      return "success";
    case "in_coda":
      return "warning";
    case "fallita":
      return "default";
    case "programmata":
      return "info";
    default:
      return "default";
  }
}

export function ComunicazioneStatoBadge({ stato }: ComunicazioneStatoBadgeProps) {
  return (
    <Badge variant={getVariant(stato)}>
      {formatComunicazioneStatoLabel(stato)}
    </Badge>
  );
}
