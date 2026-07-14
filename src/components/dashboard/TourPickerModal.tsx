"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { getActiveTours } from "@/services/tour.service";
import type { Tour } from "@/types/tour";

type TourPickerModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSelect: (tour: Tour) => void;
};

export function TourPickerModal({
  open,
  title,
  onClose,
  onSelect,
}: TourPickerModalProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void getActiveTours()
      .then(setTours)
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-2">
        <p className="text-sm text-zinc-500">
          Seleziona il tour su cui operare.
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-5 w-5" />
          </div>
        ) : tours.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
            Nessun tour attivo disponibile.
          </p>
        ) : (
          tours.map((tour) => (
            <button
              key={tour.id}
              type="button"
              onClick={() => onSelect(tour)}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-200/70 px-4 py-3 text-left transition-all duration-200 hover:border-zinc-300/80 hover:bg-zinc-50/60"
            >
              <div className="min-w-0 pr-3">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {tour.nomeTour}
                </p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {tour.destinazione}
                </p>
              </div>
              <Badge variant="default">{tour.stato}</Badge>
            </button>
          ))
        )}
        <div className="flex justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annulla
          </Button>
        </div>
      </div>
    </Modal>
  );
}
