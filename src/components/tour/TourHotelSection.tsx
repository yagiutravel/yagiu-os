"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  createHotel,
  deleteHotel,
  getHotelsByTourId,
  updateHotel,
} from "@/services/tour-hotel.service";
import type {
  CreateTourHotelInput,
  TourHotel,
  TourHotelForm,
} from "@/types/tour-hotel";
import { TourHotelModal } from "./TourHotelModal";
import { getErrorMessage } from "@/shared/utils/error";

const EMPTY_HOTEL_FORM: TourHotelForm = {
  nome: "",
  indirizzo: "",
  citta: "",
  paese: "",
  checkIn: "",
  checkOut: "",
  telefono: "",
  note: "",
};

type ModalState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; hotel: TourHotel }
  | { type: "delete"; hotel: TourHotel };

type TourHotelSectionProps = {
  tourId: string;
  onHotelsChanged?: () => void;
};

function hotelToForm(hotel: TourHotel): TourHotelForm {
  return {
    nome: hotel.nome,
    indirizzo: hotel.indirizzo,
    citta: hotel.citta,
    paese: hotel.paese,
    checkIn: hotel.checkIn ?? "",
    checkOut: hotel.checkOut ?? "",
    telefono: hotel.telefono ?? "",
    note: hotel.note,
  };
}

function formToInput(tourId: string, form: TourHotelForm): CreateTourHotelInput {
  return {
    tourId,
    nome: form.nome.trim(),
    indirizzo: form.indirizzo.trim(),
    citta: form.citta.trim(),
    paese: form.paese.trim(),
    checkIn: form.checkIn || null,
    checkOut: form.checkOut || null,
    telefono: form.telefono.trim() || null,
    note: form.note.trim(),
  };
}

export function TourHotelSection({
  tourId,
  onHotelsChanged,
}: TourHotelSectionProps) {
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<TourHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "closed" });
  const [form, setForm] = useState<TourHotelForm>(EMPTY_HOTEL_FORM);
  const [formError, setFormError] = useState<string | undefined>();

  const loadHotels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHotelsByTourId(tourId);
      setHotels(data);
    } catch (error) {
      showToast(`Impossibile caricare gli hotel. ${getErrorMessage(error)}`, "error");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [tourId, showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadHotels();
    });
  }, [loadHotels]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.nome.trim()) {
      setFormError("Il nome dell'hotel è obbligatorio.");
      return;
    }

    setSaving(true);
    setFormError(undefined);

    try {
      if (modal.type === "create") {
        await createHotel(formToInput(tourId, form));
        showToast("Hotel creato.", "success");
      } else if (modal.type === "edit") {
        await updateHotel(modal.hotel.id, formToInput(tourId, form));
        showToast("Hotel aggiornato.", "success");
      }
      setModal({ type: "closed" });
      setForm(EMPTY_HOTEL_FORM);
      await loadHotels();
      onHotelsChanged?.();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (modal.type !== "delete") return;
    setSaving(true);
    try {
      await deleteHotel(modal.hotel.id);
      showToast("Hotel eliminato.", "success");
      setModal({ type: "closed" });
      await loadHotels();
      onHotelsChanged?.();
    } catch (error) {
      showToast(`Impossibile eliminare l'hotel. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Hotel"
          description="Soggiorni e strutture ricettive del tour."
          action={
            <Button size="sm" onClick={() => setModal({ type: "create" })}>
              <Plus className="h-4 w-4" />
              Aggiungi hotel
            </Button>
          }
        />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-5 w-5" />
            </div>
          ) : hotels.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Nessun hotel"
              description="Aggiungi il primo soggiorno per organizzare le camere."
              actionLabel="Aggiungi hotel"
              onAction={() => setModal({ type: "create" })}
            />
          ) : (
            <div className="space-y-3">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-zinc-200/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{hotel.nome}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {[hotel.citta, hotel.paese].filter(Boolean).join(", ") || "—"}
                    </p>
                    {(hotel.checkIn || hotel.checkOut) && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {hotel.checkIn ?? "—"} → {hotel.checkOut ?? "—"}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setForm(hotelToForm(hotel));
                        setModal({ type: "edit", hotel });
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifica
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setModal({ type: "delete", hotel })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Elimina
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TourHotelModal
        open={modal.type === "create" || modal.type === "edit"}
        mode={modal.type === "edit" ? "edit" : "create"}
        form={form}
        loading={saving}
        error={formError}
        onClose={() => {
          setModal({ type: "closed" });
          setForm(EMPTY_HOTEL_FORM);
          setFormError(undefined);
        }}
        onFormChange={setForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={modal.type === "delete"}
        title="Elimina hotel"
        description={
          modal.type === "delete"
            ? `Eliminare "${modal.hotel.nome}"? Le camere collegate resteranno senza hotel.`
            : ""
        }
        confirmLabel="Elimina"
        loading={saving}
        onConfirm={() => void handleDelete()}
        onClose={() => {
          if (!saving) setModal({ type: "closed" });
        }}
      />
    </>
  );
}
