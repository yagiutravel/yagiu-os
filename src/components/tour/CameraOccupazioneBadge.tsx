import { Badge } from "@/components/ui/Badge";
import type { StatoOccupazioneCamera } from "@/types/camera";

type CameraOccupazioneBadgeProps = {
  stato: StatoOccupazioneCamera;
};

function getVariant(
  stato: StatoOccupazioneCamera,
): "default" | "success" | "warning" {
  if (stato === "Completa") return "success";
  if (stato === "Parziale") return "warning";
  return "default";
}

export function CameraOccupazioneBadge({ stato }: CameraOccupazioneBadgeProps) {
  return <Badge variant={getVariant(stato)}>{stato}</Badge>;
}
