"use client";

import { Archive, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Tour } from "@/types/tour";

type TourRowActionsProps = {
  tour: Tour;
  onEdit?: (tour: Tour) => void;
  onArchive?: (tour: Tour) => void;
  onDelete?: (tour: Tour) => void;
};

export function TourRowActions({
  tour,
  onEdit,
  onArchive,
  onDelete,
}: TourRowActionsProps) {
  const stop = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className="inline-flex items-center gap-1"
      onClick={stop}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 px-0"
          aria-label={`Modifica ${tour.nomeTour}`}
          onClick={() => onEdit(tour)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onArchive && tour.stato !== "Archiviato" && (
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 px-0"
          aria-label={`Archivia ${tour.nomeTour}`}
          onClick={() => onArchive(tour)}
        >
          <Archive className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 px-0 text-red-600 hover:text-red-700"
          aria-label={`Elimina ${tour.nomeTour}`}
          onClick={() => onDelete(tour)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <MoreHorizontal className="hidden h-4 w-4 text-zinc-300" aria-hidden />
    </div>
  );
}
