"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import {
  Building2,
  CalendarDays,
  Pencil,
  Plane,
  Plus,
  Route,
  Shield,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { formatTourDate } from "@/lib/tour/utils";
import {
  createFlight,
  deleteFlight,
  updateFlight,
} from "@/services/tour-flight.service";
import { getHotelsByTourId } from "@/services/tour-hotel.service";
import {
  createInsurance,
  deleteInsurance,
  updateInsurance,
} from "@/services/tour-insurance.service";
import { getTourLogistica } from "@/services/tour-logistica.service";
import {
  createProgramActivity,
  createProgramDay,
  deleteProgramActivity,
  deleteProgramDay,
  updateProgramActivity,
  updateProgramDay,
} from "@/services/tour-program.service";
import {
  createTransfer,
  deleteTransfer,
  updateTransfer,
} from "@/services/tour-transfer.service";
import type { DirezioneVolo } from "@/types/tour-flight";
import type { StatoAssicurazioneTour } from "@/types/tour-insurance";
import type { TourHotel } from "@/types/tour-hotel";
import type { TourLogisticaData } from "@/types/tour-logistica";
import type {
  TipoAttivitaProgramma,
  TourProgramActivity,
  TourProgramDay,
} from "@/types/tour-program";
import type { TipoTransfer, TourTransfer } from "@/types/tour-transfer";
import type { TourFlight } from "@/types/tour-flight";
import type { TourInsurance } from "@/types/tour-insurance";
import { getErrorMessage } from "@/shared/utils/error";

type TourSchedaProgrammaProps = {
  tourId: string;
};

type ModalState =
  | { type: "closed" }
  | { type: "day"; mode: "create" | "edit"; day?: TourProgramDay }
  | { type: "activity"; mode: "create" | "edit"; dayId: string; activity?: TourProgramActivity }
  | { type: "flight"; mode: "create" | "edit"; flight?: TourFlight }
  | { type: "transfer"; mode: "create" | "edit"; transfer?: TourTransfer }
  | { type: "insurance"; mode: "create" | "edit"; insurance?: TourInsurance }
  | { type: "deleteDay"; day: TourProgramDay }
  | { type: "deleteActivity"; activity: TourProgramActivity }
  | { type: "deleteFlight"; flight: TourFlight }
  | { type: "deleteTransfer"; transfer: TourTransfer }
  | { type: "deleteInsurance"; insurance: TourInsurance };

const ATTIVITA_OPTIONS: { value: TipoAttivitaProgramma; label: string }[] = [
  { value: "Visita", label: "Visita" },
  { value: "Pasto", label: "Pasto" },
  { value: "Trasferimento", label: "Trasferimento" },
  { value: "Libero", label: "Libero" },
  { value: "Altro", label: "Altro" },
];

const DIREZIONE_OPTIONS: { value: DirezioneVolo; label: string }[] = [
  { value: "Andata", label: "Andata" },
  { value: "Ritorno", label: "Ritorno" },
  { value: "Interno", label: "Interno" },
];

const TRANSFER_OPTIONS: { value: TipoTransfer; label: string }[] = [
  { value: "Bus", label: "Bus" },
  { value: "Van", label: "Van" },
  { value: "Treno", label: "Treno" },
  { value: "Barca", label: "Barca" },
  { value: "Privato", label: "Privato" },
  { value: "Altro", label: "Altro" },
];

const STATO_ASSICURAZIONE_OPTIONS: { value: StatoAssicurazioneTour; label: string }[] = [
  { value: "Da emettere", label: "Da emettere" },
  { value: "Attiva", label: "Attiva" },
  { value: "Scaduta", label: "Scaduta" },
  { value: "Annullata", label: "Annullata" },
];

function formatTime(value: string | null): string {
  if (!value) return "—";
  return value.slice(0, 5);
}

export function TourSchedaProgramma({ tourId }: TourSchedaProgrammaProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<TourLogisticaData | null>(null);
  const [hotels, setHotels] = useState<TourHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "closed" });

  const [dayForm, setDayForm] = useState({
    giornoNumero: 1,
    data: "",
    titolo: "",
    descrizione: "",
    hotelId: "",
  });
  const [activityForm, setActivityForm] = useState({
    titolo: "",
    descrizione: "",
    oraInizio: "",
    oraFine: "",
    luogo: "",
    tipo: "Visita" as TipoAttivitaProgramma,
  });
  const [flightForm, setFlightForm] = useState({
    dayId: "",
    direzione: "Andata" as DirezioneVolo,
    compagnia: "",
    numeroVolo: "",
    aeroportoPartenza: "",
    aeroportoArrivo: "",
    dataPartenza: "",
    oraPartenza: "",
    dataArrivo: "",
    oraArrivo: "",
    note: "",
  });
  const [transferForm, setTransferForm] = useState({
    dayId: "",
    tipo: "Bus" as TipoTransfer,
    partenza: "",
    destinazione: "",
    data: "",
    ora: "",
    fornitore: "",
    note: "",
  });
  const [insuranceForm, setInsuranceForm] = useState({
    fornitore: "",
    polizzaNumero: "",
    copertura: "",
    premio: "",
    dataInizio: "",
    dataFine: "",
    stato: "Da emettere" as StatoAssicurazioneTour,
    note: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [logistica, hotelList] = await Promise.all([
        getTourLogistica(tourId),
        getHotelsByTourId(tourId),
      ]);
      setData(logistica);
      setHotels(hotelList);
    } catch (error) {
      showToast(`Impossibile caricare il programma. ${getErrorMessage(error)}`, "error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [showToast, tourId]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  const hotelOptions = [
    { value: "", label: "Nessun hotel" },
    ...hotels.map((hotel) => ({ value: hotel.id, label: hotel.nome })),
  ];

  const dayOptions = [
    { value: "", label: "Nessun giorno collegato" },
    ...(data?.programma.giorni ?? []).map((day) => ({
      value: day.id,
      label: `Giorno ${day.giornoNumero}${day.data ? ` (${formatTourDate(day.data)})` : ""}`,
    })),
  ];

  const closeModal = () => setModal({ type: "closed" });

  const handleSaveDay = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (modal.type === "day" && modal.mode === "create") {
        await createProgramDay({
          tourId,
          giornoNumero: dayForm.giornoNumero,
          data: dayForm.data || null,
          titolo: dayForm.titolo,
          descrizione: dayForm.descrizione,
          hotelId: dayForm.hotelId || null,
        });
        showToast("Giorno aggiunto.", "success");
      } else if (modal.type === "day" && modal.mode === "edit" && modal.day) {
        await updateProgramDay(modal.day.id, {
          data: dayForm.data || null,
          titolo: dayForm.titolo,
          descrizione: dayForm.descrizione,
          hotelId: dayForm.hotelId || null,
        });
        showToast("Giorno aggiornato.", "success");
      }
      closeModal();
      await loadData();
    } catch (error) {
      showToast(`Salvataggio non riuscito. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveActivity = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modal.type !== "activity") return;
    setSaving(true);
    try {
      const payload = {
        tourId,
        dayId: modal.dayId,
        titolo: activityForm.titolo,
        descrizione: activityForm.descrizione,
        oraInizio: activityForm.oraInizio || null,
        oraFine: activityForm.oraFine || null,
        luogo: activityForm.luogo,
        tipo: activityForm.tipo,
      };
      if (modal.mode === "create") {
        await createProgramActivity(payload);
        showToast("Attività aggiunta.", "success");
      } else if (modal.activity) {
        await updateProgramActivity(modal.activity.id, payload);
        showToast("Attività aggiornata.", "success");
      }
      closeModal();
      await loadData();
    } catch (error) {
      showToast(`Salvataggio non riuscito. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFlight = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modal.type !== "flight") return;
    setSaving(true);
    try {
      const payload = {
        tourId,
        dayId: flightForm.dayId || null,
        direzione: flightForm.direzione,
        compagnia: flightForm.compagnia,
        numeroVolo: flightForm.numeroVolo,
        aeroportoPartenza: flightForm.aeroportoPartenza,
        aeroportoArrivo: flightForm.aeroportoArrivo,
        dataPartenza: flightForm.dataPartenza,
        oraPartenza: flightForm.oraPartenza || null,
        dataArrivo: flightForm.dataArrivo || null,
        oraArrivo: flightForm.oraArrivo || null,
        note: flightForm.note,
      };
      if (modal.mode === "create") {
        await createFlight(payload);
        showToast("Volo aggiunto.", "success");
      } else if (modal.flight) {
        await updateFlight(modal.flight.id, payload);
        showToast("Volo aggiornato.", "success");
      }
      closeModal();
      await loadData();
    } catch (error) {
      showToast(`Salvataggio non riuscito. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTransfer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modal.type !== "transfer") return;
    setSaving(true);
    try {
      const payload = {
        tourId,
        dayId: transferForm.dayId || null,
        tipo: transferForm.tipo,
        partenza: transferForm.partenza,
        destinazione: transferForm.destinazione,
        data: transferForm.data,
        ora: transferForm.ora || null,
        fornitore: transferForm.fornitore,
        note: transferForm.note,
      };
      if (modal.mode === "create") {
        await createTransfer(payload);
        showToast("Transfer aggiunto.", "success");
      } else if (modal.transfer) {
        await updateTransfer(modal.transfer.id, payload);
        showToast("Transfer aggiornato.", "success");
      }
      closeModal();
      await loadData();
    } catch (error) {
      showToast(`Salvataggio non riuscito. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInsurance = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modal.type !== "insurance") return;
    setSaving(true);
    try {
      const payload = {
        tourId,
        fornitore: insuranceForm.fornitore,
        polizzaNumero: insuranceForm.polizzaNumero,
        copertura: insuranceForm.copertura,
        premio: insuranceForm.premio ? Number(insuranceForm.premio) : 0,
        dataInizio: insuranceForm.dataInizio || null,
        dataFine: insuranceForm.dataFine || null,
        stato: insuranceForm.stato,
        note: insuranceForm.note,
      };
      if (modal.mode === "create") {
        await createInsurance(payload);
        showToast("Assicurazione aggiunta.", "success");
      } else if (modal.insurance) {
        await updateInsurance(modal.insurance.id, payload);
        showToast("Assicurazione aggiornata.", "success");
      }
      closeModal();
      await loadData();
    } catch (error) {
      showToast(`Salvataggio non riuscito. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSaving(true);
    try {
      if (modal.type === "deleteDay") {
        await deleteProgramDay(modal.day.id);
        showToast("Giorno eliminato.", "success");
      } else if (modal.type === "deleteActivity") {
        await deleteProgramActivity(modal.activity.id);
        showToast("Attività eliminata.", "success");
      } else if (modal.type === "deleteFlight") {
        await deleteFlight(modal.flight.id);
        showToast("Volo eliminato.", "success");
      } else if (modal.type === "deleteTransfer") {
        await deleteTransfer(modal.transfer.id);
        showToast("Transfer eliminato.", "success");
      } else if (modal.type === "deleteInsurance") {
        await deleteInsurance(modal.insurance.id);
        showToast("Assicurazione eliminata.", "success");
      }
      closeModal();
      await loadData();
    } catch (error) {
      showToast(`Eliminazione non riuscita. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Programma non disponibile"
        description="Impossibile caricare itinerario e logistica del tour."
      />
    );
  }

  const nextGiornoNumero =
    (data.programma.giorni.reduce((max, day) => Math.max(max, day.giornoNumero), 0) || 0) + 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Itinerario giorno per giorno"
          description="Programma del tour con attività e hotel collegati."
          action={
            <Button
              size="sm"
              onClick={() => {
                setDayForm({
                  giornoNumero: nextGiornoNumero,
                  data: "",
                  titolo: `Giorno ${nextGiornoNumero}`,
                  descrizione: "",
                  hotelId: "",
                });
                setModal({ type: "day", mode: "create" });
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Giorno
            </Button>
          }
        />
        <CardContent>
          {data.programma.giorni.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nessun giorno programmato"
              description="Aggiungi giorni all'itinerario o verifica le date del tour."
            />
          ) : (
            <div className="space-y-4">
              {data.programma.giorni.map((day) => (
                <div
                  key={day.id}
                  className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Giorno {day.giornoNumero}
                        {day.data ? ` · ${formatTourDate(day.data)}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-zinc-700">{day.titolo || "Senza titolo"}</p>
                      {day.descrizione && (
                        <p className="mt-1 text-sm text-zinc-500">{day.descrizione}</p>
                      )}
                      {day.hotelNome && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-600">
                          <Building2 className="h-3.5 w-3.5" />
                          {day.hotelNome}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setActivityForm({
                            titolo: "",
                            descrizione: "",
                            oraInizio: "",
                            oraFine: "",
                            luogo: "",
                            tipo: "Visita",
                          });
                          setModal({ type: "activity", mode: "create", dayId: day.id });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDayForm({
                            giornoNumero: day.giornoNumero,
                            data: day.data ?? "",
                            titolo: day.titolo,
                            descrizione: day.descrizione,
                            hotelId: day.hotelId ?? "",
                          });
                          setModal({ type: "day", mode: "edit", day });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setModal({ type: "deleteDay", day })}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    </div>
                  </div>

                  {day.attivita.length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
                      {day.attivita.map((activity) => (
                        <li
                          key={activity.id}
                          className="flex items-start justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900">{activity.titolo}</p>
                            <p className="text-xs text-zinc-500">
                              {activity.tipo}
                              {activity.oraInizio
                                ? ` · ${formatTime(activity.oraInizio)}`
                                : ""}
                              {activity.luogo ? ` · ${activity.luogo}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setActivityForm({
                                  titolo: activity.titolo,
                                  descrizione: activity.descrizione,
                                  oraInizio: activity.oraInizio ?? "",
                                  oraFine: activity.oraFine ?? "",
                                  luogo: activity.luogo,
                                  tipo: activity.tipo,
                                });
                                setModal({
                                  type: "activity",
                                  mode: "edit",
                                  dayId: day.id,
                                  activity,
                                });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setModal({ type: "deleteActivity", activity })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Voli"
          description="Collegamenti aerei del tour."
          action={
            <Button
              size="sm"
              onClick={() => {
                setFlightForm({
                  dayId: "",
                  direzione: "Andata",
                  compagnia: "",
                  numeroVolo: "",
                  aeroportoPartenza: "",
                  aeroportoArrivo: "",
                  dataPartenza: "",
                  oraPartenza: "",
                  dataArrivo: "",
                  oraArrivo: "",
                  note: "",
                });
                setModal({ type: "flight", mode: "create" });
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Volo
            </Button>
          }
        />
        <CardContent>
          {data.voli.length === 0 ? (
            <p className="text-sm text-zinc-500">Nessun volo registrato.</p>
          ) : (
            <ul className="space-y-2">
              {data.voli.map((flight) => (
                <li
                  key={flight.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      <Plane className="mr-1.5 inline h-4 w-4" />
                      {flight.numeroVolo} · {flight.direzione}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {flight.aeroportoPartenza} → {flight.aeroportoArrivo} ·{" "}
                      {formatTourDate(flight.dataPartenza)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setFlightForm({
                          dayId: flight.dayId ?? "",
                          direzione: flight.direzione,
                          compagnia: flight.compagnia,
                          numeroVolo: flight.numeroVolo,
                          aeroportoPartenza: flight.aeroportoPartenza,
                          aeroportoArrivo: flight.aeroportoArrivo,
                          dataPartenza: flight.dataPartenza,
                          oraPartenza: flight.oraPartenza ?? "",
                          dataArrivo: flight.dataArrivo ?? "",
                          oraArrivo: flight.oraArrivo ?? "",
                          note: flight.note,
                        });
                        setModal({ type: "flight", mode: "edit", flight });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setModal({ type: "deleteFlight", flight })}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Transfer"
          description="Trasferimenti terrestri e marittimi."
          action={
            <Button
              size="sm"
              onClick={() => {
                setTransferForm({
                  dayId: "",
                  tipo: "Bus",
                  partenza: "",
                  destinazione: "",
                  data: "",
                  ora: "",
                  fornitore: "",
                  note: "",
                });
                setModal({ type: "transfer", mode: "create" });
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Transfer
            </Button>
          }
        />
        <CardContent>
          {data.transfers.length === 0 ? (
            <p className="text-sm text-zinc-500">Nessun transfer registrato.</p>
          ) : (
            <ul className="space-y-2">
              {data.transfers.map((transfer) => (
                <li
                  key={transfer.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      <Route className="mr-1.5 inline h-4 w-4" />
                      {transfer.tipo}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {transfer.partenza} → {transfer.destinazione} ·{" "}
                      {formatTourDate(transfer.data)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTransferForm({
                          dayId: transfer.dayId ?? "",
                          tipo: transfer.tipo,
                          partenza: transfer.partenza,
                          destinazione: transfer.destinazione,
                          data: transfer.data,
                          ora: transfer.ora ?? "",
                          fornitore: transfer.fornitore,
                          note: transfer.note,
                        });
                        setModal({ type: "transfer", mode: "edit", transfer });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setModal({ type: "deleteTransfer", transfer })}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Assicurazioni"
          description="Polizze e coperture del tour."
          action={
            <Button
              size="sm"
              onClick={() => {
                setInsuranceForm({
                  fornitore: "",
                  polizzaNumero: "",
                  copertura: "",
                  premio: "",
                  dataInizio: "",
                  dataFine: "",
                  stato: "Da emettere",
                  note: "",
                });
                setModal({ type: "insurance", mode: "create" });
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Assicurazione
            </Button>
          }
        />
        <CardContent>
          {data.assicurazioni.length === 0 ? (
            <p className="text-sm text-zinc-500">Nessuna assicurazione registrata.</p>
          ) : (
            <ul className="space-y-2">
              {data.assicurazioni.map((insurance) => (
                <li
                  key={insurance.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      <Shield className="mr-1.5 inline h-4 w-4" />
                      {insurance.fornitore}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {insurance.stato}
                      {insurance.polizzaNumero ? ` · ${insurance.polizzaNumero}` : ""}
                      {insurance.premio > 0
                        ? ` · € ${insurance.premio.toLocaleString("it-IT")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setInsuranceForm({
                          fornitore: insurance.fornitore,
                          polizzaNumero: insurance.polizzaNumero,
                          copertura: insurance.copertura,
                          premio: insurance.premio ? String(insurance.premio) : "",
                          dataInizio: insurance.dataInizio ?? "",
                          dataFine: insurance.dataFine ?? "",
                          stato: insurance.stato,
                          note: insurance.note,
                        });
                        setModal({ type: "insurance", mode: "edit", insurance });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setModal({ type: "deleteInsurance", insurance })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modal.type === "day"}
        onClose={closeModal}
        title={
          modal.type === "day" && modal.mode === "create"
            ? "Nuovo giorno"
            : "Modifica giorno"
        }
      >
        <form onSubmit={handleSaveDay} className="space-y-4">
          {modal.type === "day" && modal.mode === "create" && (
            <Input
              label="Numero giorno"
              type="number"
              min={1}
              value={dayForm.giornoNumero}
              onChange={(event) =>
                setDayForm((current) => ({
                  ...current,
                  giornoNumero: Number(event.target.value),
                }))
              }
              disabled={saving}
            />
          )}
          <Input
            label="Data"
            type="date"
            value={dayForm.data}
            onChange={(event) =>
              setDayForm((current) => ({ ...current, data: event.target.value }))
            }
            disabled={saving}
          />
          <Input
            label="Titolo"
            value={dayForm.titolo}
            onChange={(event) =>
              setDayForm((current) => ({ ...current, titolo: event.target.value }))
            }
            disabled={saving}
          />
          <Input
            label="Descrizione"
            value={dayForm.descrizione}
            onChange={(event) =>
              setDayForm((current) => ({ ...current, descrizione: event.target.value }))
            }
            disabled={saving}
          />
          <Select
            label="Hotel collegato"
            options={hotelOptions}
            value={dayForm.hotelId}
            onChange={(event) =>
              setDayForm((current) => ({ ...current, hotelId: event.target.value }))
            }
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving}>
              Salva
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal.type === "activity"}
        onClose={closeModal}
        title={
          modal.type === "activity" && modal.mode === "create"
            ? "Nuova attività"
            : "Modifica attività"
        }
      >
        <form onSubmit={handleSaveActivity} className="space-y-4">
          <Input
            label="Titolo"
            value={activityForm.titolo}
            onChange={(event) =>
              setActivityForm((current) => ({ ...current, titolo: event.target.value }))
            }
            disabled={saving}
            required
          />
          <Select
            label="Tipo"
            options={ATTIVITA_OPTIONS}
            value={activityForm.tipo}
            onChange={(event) =>
              setActivityForm((current) => ({
                ...current,
                tipo: event.target.value as TipoAttivitaProgramma,
              }))
            }
            disabled={saving}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Ora inizio"
              type="time"
              value={activityForm.oraInizio}
              onChange={(event) =>
                setActivityForm((current) => ({
                  ...current,
                  oraInizio: event.target.value,
                }))
              }
              disabled={saving}
            />
            <Input
              label="Ora fine"
              type="time"
              value={activityForm.oraFine}
              onChange={(event) =>
                setActivityForm((current) => ({ ...current, oraFine: event.target.value }))
              }
              disabled={saving}
            />
          </div>
          <Input
            label="Luogo"
            value={activityForm.luogo}
            onChange={(event) =>
              setActivityForm((current) => ({ ...current, luogo: event.target.value }))
            }
            disabled={saving}
          />
          <Input
            label="Descrizione"
            value={activityForm.descrizione}
            onChange={(event) =>
              setActivityForm((current) => ({
                ...current,
                descrizione: event.target.value,
              }))
            }
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving}>
              Salva
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal.type === "flight"}
        onClose={closeModal}
        title={
          modal.type === "flight" && modal.mode === "create" ? "Nuovo volo" : "Modifica volo"
        }
      >
        <form onSubmit={handleSaveFlight} className="space-y-4">
          <Select
            label="Giorno collegato"
            options={dayOptions}
            value={flightForm.dayId}
            onChange={(event) =>
              setFlightForm((current) => ({ ...current, dayId: event.target.value }))
            }
            disabled={saving}
          />
          <Select
            label="Direzione"
            options={DIREZIONE_OPTIONS}
            value={flightForm.direzione}
            onChange={(event) =>
              setFlightForm((current) => ({
                ...current,
                direzione: event.target.value as DirezioneVolo,
              }))
            }
            disabled={saving}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Compagnia"
              value={flightForm.compagnia}
              onChange={(event) =>
                setFlightForm((current) => ({ ...current, compagnia: event.target.value }))
              }
              disabled={saving}
            />
            <Input
              label="Numero volo"
              value={flightForm.numeroVolo}
              onChange={(event) =>
                setFlightForm((current) => ({ ...current, numeroVolo: event.target.value }))
              }
              disabled={saving}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Aeroporto partenza"
              value={flightForm.aeroportoPartenza}
              onChange={(event) =>
                setFlightForm((current) => ({
                  ...current,
                  aeroportoPartenza: event.target.value,
                }))
              }
              disabled={saving}
            />
            <Input
              label="Aeroporto arrivo"
              value={flightForm.aeroportoArrivo}
              onChange={(event) =>
                setFlightForm((current) => ({
                  ...current,
                  aeroportoArrivo: event.target.value,
                }))
              }
              disabled={saving}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Data partenza"
              type="date"
              value={flightForm.dataPartenza}
              onChange={(event) =>
                setFlightForm((current) => ({
                  ...current,
                  dataPartenza: event.target.value,
                }))
              }
              disabled={saving}
              required
            />
            <Input
              label="Ora partenza"
              type="time"
              value={flightForm.oraPartenza}
              onChange={(event) =>
                setFlightForm((current) => ({
                  ...current,
                  oraPartenza: event.target.value,
                }))
              }
              disabled={saving}
            />
          </div>
          <Input
            label="Note"
            value={flightForm.note}
            onChange={(event) =>
              setFlightForm((current) => ({ ...current, note: event.target.value }))
            }
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving}>
              Salva
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal.type === "transfer"}
        onClose={closeModal}
        title={
          modal.type === "transfer" && modal.mode === "create"
            ? "Nuovo transfer"
            : "Modifica transfer"
        }
      >
        <form onSubmit={handleSaveTransfer} className="space-y-4">
          <Select
            label="Giorno collegato"
            options={dayOptions}
            value={transferForm.dayId}
            onChange={(event) =>
              setTransferForm((current) => ({ ...current, dayId: event.target.value }))
            }
            disabled={saving}
          />
          <Select
            label="Tipo"
            options={TRANSFER_OPTIONS}
            value={transferForm.tipo}
            onChange={(event) =>
              setTransferForm((current) => ({
                ...current,
                tipo: event.target.value as TipoTransfer,
              }))
            }
            disabled={saving}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Partenza"
              value={transferForm.partenza}
              onChange={(event) =>
                setTransferForm((current) => ({ ...current, partenza: event.target.value }))
              }
              disabled={saving}
              required
            />
            <Input
              label="Destinazione"
              value={transferForm.destinazione}
              onChange={(event) =>
                setTransferForm((current) => ({
                  ...current,
                  destinazione: event.target.value,
                }))
              }
              disabled={saving}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Data"
              type="date"
              value={transferForm.data}
              onChange={(event) =>
                setTransferForm((current) => ({ ...current, data: event.target.value }))
              }
              disabled={saving}
              required
            />
            <Input
              label="Ora"
              type="time"
              value={transferForm.ora}
              onChange={(event) =>
                setTransferForm((current) => ({ ...current, ora: event.target.value }))
              }
              disabled={saving}
            />
          </div>
          <Input
            label="Fornitore"
            value={transferForm.fornitore}
            onChange={(event) =>
              setTransferForm((current) => ({ ...current, fornitore: event.target.value }))
            }
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving}>
              Salva
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal.type === "insurance"}
        onClose={closeModal}
        title={
          modal.type === "insurance" && modal.mode === "create"
            ? "Nuova assicurazione"
            : "Modifica assicurazione"
        }
      >
        <form onSubmit={handleSaveInsurance} className="space-y-4">
          <Input
            label="Fornitore"
            value={insuranceForm.fornitore}
            onChange={(event) =>
              setInsuranceForm((current) => ({ ...current, fornitore: event.target.value }))
            }
            disabled={saving}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Numero polizza"
              value={insuranceForm.polizzaNumero}
              onChange={(event) =>
                setInsuranceForm((current) => ({
                  ...current,
                  polizzaNumero: event.target.value,
                }))
              }
              disabled={saving}
            />
            <Input
              label="Premio (€)"
              type="number"
              min={0}
              step="0.01"
              value={insuranceForm.premio}
              onChange={(event) =>
                setInsuranceForm((current) => ({ ...current, premio: event.target.value }))
              }
              disabled={saving}
            />
          </div>
          <Input
            label="Copertura"
            value={insuranceForm.copertura}
            onChange={(event) =>
              setInsuranceForm((current) => ({ ...current, copertura: event.target.value }))
            }
            disabled={saving}
          />
          <Select
            label="Stato"
            options={STATO_ASSICURAZIONE_OPTIONS}
            value={insuranceForm.stato}
            onChange={(event) =>
              setInsuranceForm((current) => ({
                ...current,
                stato: event.target.value as StatoAssicurazioneTour,
              }))
            }
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving}>
              Salva
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={
          modal.type === "deleteDay" ||
          modal.type === "deleteActivity" ||
          modal.type === "deleteFlight" ||
          modal.type === "deleteTransfer" ||
          modal.type === "deleteInsurance"
        }
        title="Conferma eliminazione"
        description="L'operazione non può essere annullata."
        confirmLabel="Elimina"
        loading={saving}
        onConfirm={() => void handleConfirmDelete()}
        onClose={closeModal}
      />
    </div>
  );
}
