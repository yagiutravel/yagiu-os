"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Compass, Plus, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useClientiModal } from "@/hooks/useClientiModal";
import { ClienteFormModal } from "@/components/clienti/ClienteFormModal";
import { TourPartecipanteModal } from "@/components/tour/TourPartecipanteModal";
import { TourCameraModal } from "@/components/tour/TourCameraModal";
import { TourPickerModal } from "./TourPickerModal";
import { EMPTY_CLIENTE_FORM } from "@/lib/clienti/constants";
import { hasFormErrors, validateClienteForm } from "@/lib/clienti/validation";
import { createCliente } from "@/services/clienti.service";
import { createPartecipazione } from "@/services/tour-partecipazione.service";
import { createCamera } from "@/services/camera.service";
import { getClienti } from "@/services/clienti.service";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import {
  EMPTY_PARTECIPANTE_FORM,
  formToCreateInput,
} from "@/models/tour-partecipazione";
import {
  EMPTY_CAMERA_FORM,
  formToCreateInput as cameraFormToCreateInput,
} from "@/models/camera";
import type { ClienteForm, ClienteFormErrors } from "@/types/cliente";
import type { PartecipanteForm, PartecipazioneTourView } from "@/types/tour-partecipazione";
import type { CameraForm } from "@/types/camera";
import type { Tour } from "@/types/tour";
import { DashboardWidget } from "./DashboardWidget";
import { getErrorMessage } from "@/shared/utils/error";

type QuickAction = "cliente" | "tour" | "camera" | "partecipante";

type TourAction = "camera" | "partecipante";


export function DashboardQuickActions() {
  const router = useRouter();
  const { showToast } = useToast();
  const { modal: clienteModal, openCreate, close } = useClientiModal();

  const [clienteForm, setClienteForm] = useState<ClienteForm>(EMPTY_CLIENTE_FORM);
  const [clienteErrors, setClienteErrors] = useState<ClienteFormErrors>({});
  const [saving, setSaving] = useState(false);

  const [tourPickerOpen, setTourPickerOpen] = useState(false);
  const [tourAction, setTourAction] = useState<TourAction | null>(null);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const [partecipanteForm, setPartecipanteForm] =
    useState<PartecipanteForm>(EMPTY_PARTECIPANTE_FORM);
  const [cameraForm, setCameraForm] = useState<CameraForm>(EMPTY_CAMERA_FORM);
  const [clienti, setClienti] = useState<Awaited<ReturnType<typeof getClienti>>>([]);
  const [partecipanti, setPartecipanti] = useState<PartecipazioneTourView[]>([]);
  const [formError, setFormError] = useState<string | undefined>();

  const loadTourContext = useCallback(async (tour: Tour) => {
    const [clientiData, partecipazioniData] = await Promise.all([
      getClienti(),
      getPartecipazioniByTourId(tour.id),
    ]);
    setClienti(clientiData);
    setPartecipanti(partecipazioniData);
  }, []);

  const handleNuovoCliente = () => {
    setClienteForm(EMPTY_CLIENTE_FORM);
    setClienteErrors({});
    openCreate();
  };

  const handleNuovoTour = () => {
    router.push("/tour");
  };

  const openTourPicker = (action: TourAction) => {
    setTourAction(action);
    setTourPickerOpen(true);
  };

  const handleTourSelected = async (tour: Tour) => {
    setTourPickerOpen(false);
    setSelectedTour(tour);
    setFormError(undefined);

    if (tourAction === "camera") {
      setCameraForm(EMPTY_CAMERA_FORM);
    } else if (tourAction === "partecipante") {
      setPartecipanteForm(EMPTY_PARTECIPANTE_FORM);
      await loadTourContext(tour);
    }
  };

  const handleClienteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateClienteForm(clienteForm);
    setClienteErrors(errors);
    if (hasFormErrors(errors)) return;

    setSaving(true);
    try {
      await createCliente({
        nome: clienteForm.nome.trim(),
        email: clienteForm.email.trim(),
        telefono: clienteForm.telefono.trim() || undefined,
        azienda: clienteForm.azienda.trim() || undefined,
        stato: clienteForm.stato,
      });
      invalidateDashboardCache();
      showToast("Cliente creato con successo.");
      close();
      setClienteForm(EMPTY_CLIENTE_FORM);
    } catch (error) {
      showToast(`Impossibile salvare il cliente. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePartecipanteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTour || !partecipanteForm.clienteId) {
      setFormError("Seleziona un cliente.");
      return;
    }

    setSaving(true);
    setFormError(undefined);

    try {
      const created = await createPartecipazione(
        formToCreateInput(selectedTour.id, partecipanteForm),
      );
      invalidateDashboardCache();
      showToast(`${created.clienteNome} aggiunto al tour.`);
      setSelectedTour(null);
      setTourAction(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleCameraSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTour) return;

    setSaving(true);
    setFormError(undefined);

    try {
      const created = await createCamera(
        cameraFormToCreateInput(selectedTour.id, cameraForm),
      );
      invalidateDashboardCache();
      showToast(`Camera ${created.numero} creata.`);
      setSelectedTour(null);
      setTourAction(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const excludeClienteIds = partecipanti.map((item) => item.clienteId);

  const actions: {
    id: QuickAction;
    label: string;
    icon: typeof Plus;
    onClick: () => void;
  }[] = [
    { id: "cliente", label: "Nuovo Cliente", icon: UserPlus, onClick: handleNuovoCliente },
    { id: "tour", label: "Nuovo Tour", icon: Compass, onClick: handleNuovoTour },
    {
      id: "camera",
      label: "Nuova Camera",
      icon: BedDouble,
      onClick: () => openTourPicker("camera"),
    },
    {
      id: "partecipante",
      label: "Aggiungi Partecipante",
      icon: Users,
      onClick: () => openTourPicker("partecipante"),
    },
  ];

  return (
    <>
      <DashboardWidget
        title="Azioni rapide"
        description="Operazioni frequenti senza cambiare schermata."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="secondary"
                className="h-auto justify-start px-4 py-3"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </DashboardWidget>

      {clienteModal.type === "form" && (
        <ClienteFormModal
          open
          mode="create"
          form={clienteForm}
          errors={clienteErrors}
          loading={saving}
          onClose={() => {
            if (!saving) close();
          }}
          onFormChange={setClienteForm}
          onSubmit={handleClienteSubmit}
          onFieldChange={(field) => {
            setClienteErrors((prev) => {
              if (!prev[field]) return prev;
              const next = { ...prev };
              delete next[field];
              return next;
            });
          }}
        />
      )}

      <TourPickerModal
        open={tourPickerOpen}
        title={
          tourAction === "camera"
            ? "Seleziona tour per nuova camera"
            : "Seleziona tour per nuovo partecipante"
        }
        onClose={() => setTourPickerOpen(false)}
        onSelect={handleTourSelected}
      />

      {selectedTour && tourAction === "partecipante" && (
        <TourPartecipanteModal
          open
          mode="create"
          form={partecipanteForm}
          clienti={clienti}
          excludeClienteIds={excludeClienteIds}
          loading={saving}
          error={formError}
          onClose={() => {
            if (!saving) {
              setSelectedTour(null);
              setTourAction(null);
            }
          }}
          onFormChange={setPartecipanteForm}
          onSubmit={handlePartecipanteSubmit}
        />
      )}

      {selectedTour && tourAction === "camera" && (
        <TourCameraModal
          open
          mode="create"
          form={cameraForm}
          loading={saving}
          error={formError}
          onClose={() => {
            if (!saving) {
              setSelectedTour(null);
              setTourAction(null);
            }
          }}
          onFormChange={setCameraForm}
          onSubmit={handleCameraSubmit}
        />
      )}
    </>
  );
}
