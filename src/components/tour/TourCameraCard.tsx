import {
  ArrowRightLeft,
  BedDouble,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { CameraPartecipanteView, CameraView } from "@/types/camera";
import { PartecipazioneBadge } from "./PartecipazioneBadge";
import { CameraOccupazioneBadge } from "./CameraOccupazioneBadge";

type TourCameraCardProps = {
  camera: CameraView;
  canAddPartecipante: boolean;
  onEdit: (camera: CameraView) => void;
  onDelete: (camera: CameraView) => void;
  onAddPartecipante: (camera: CameraView) => void;
  onMovePartecipante: (
    camera: CameraView,
    partecipante: CameraPartecipanteView,
  ) => void;
  onRemovePartecipante: (
    camera: CameraView,
    partecipante: CameraPartecipanteView,
  ) => void;
};

export function TourCameraCard({
  camera,
  canAddPartecipante,
  onEdit,
  onDelete,
  onAddPartecipante,
  onMovePartecipante,
  onRemovePartecipante,
}: TourCameraCardProps) {
  const hasSpace = camera.occupazione < camera.capienza;

  return (
    <Card>
      <CardHeader
        title={`Camera ${camera.numero}`}
        description={camera.note || undefined}
        action={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(camera)}
              aria-label={`Modifica camera ${camera.numero}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(camera)}
              aria-label={`Elimina camera ${camera.numero}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">{camera.tipologia}</Badge>
          <span className="text-sm font-medium text-zinc-700">
            {camera.occupazione} / {camera.capienza}
          </span>
          <CameraOccupazioneBadge stato={camera.statoOccupazione} />
        </div>

        {camera.partecipanti.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/40 px-4 py-6 text-center">
            <BedDouble
              className="mx-auto mb-2 h-5 w-5 text-zinc-400"
              strokeWidth={1.75}
            />
            <p className="text-sm text-zinc-500">Nessun partecipante assegnato</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200/70">
            {camera.partecipanti.map((partecipante) => (
              <div
                key={partecipante.assegnazioneId}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Avatar name={partecipante.clienteNome} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {partecipante.clienteNome}
                  </p>
                  <div className="mt-1">
                    <PartecipazioneBadge kind="ruolo" value={partecipante.ruolo} />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMovePartecipante(camera, partecipante)}
                    aria-label={`Sposta ${partecipante.clienteNome}`}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onRemovePartecipante(camera, partecipante)}
                    aria-label={`Rimuovi ${partecipante.clienteNome} dalla camera`}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => onAddPartecipante(camera)}
          disabled={!canAddPartecipante || !hasSpace}
        >
          <Plus className="h-4 w-4" />
          Aggiungi partecipante
        </Button>
      </CardContent>
    </Card>
  );
}
