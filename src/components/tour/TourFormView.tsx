"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  EMPTY_TOUR_FORM,
  formToCreateInput,
  formToUpdateInput,
  hasTourFormErrors,
  tourToForm,
  validateTourForm,
} from "@/models/tour";
import {
  createTour,
  getTour,
  updateTour,
} from "@/services/tour.service";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import { getErrorMessage } from "@/shared/utils/error";
import type { TourForm, TourFormErrors } from "@/types/tour";
import { TourFormFields } from "./TourFormFields";

type TourFormViewProps = {
  mode: "create" | "edit";
  tourId?: string;
};

export function TourFormView({ mode, tourId }: TourFormViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<TourForm>(EMPTY_TOUR_FORM);
  const [errors, setErrors] = useState<TourFormErrors>({});
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const loadTour = useCallback(async () => {
    if (!tourId) return;
    setLoading(true);
    try {
      const tour = await getTour(tourId);
      if (!tour) {
        showToast("Tour non trovato.", "error");
        router.push("/tour");
        return;
      }
      setForm(tourToForm(tour));
    } catch (error) {
      showToast(`Impossibile caricare il tour. ${getErrorMessage(error)}`, "error");
      router.push("/tour");
    } finally {
      setLoading(false);
    }
  }, [router, showToast, tourId]);

  useEffect(() => {
    if (mode === "edit") {
      startTransition(() => {
        void loadTour();
      });
    }
  }, [loadTour, mode]);

  const handleFieldChange = (field: keyof TourForm) => {
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateTourForm(form);
    setErrors(nextErrors);
    if (hasTourFormErrors(nextErrors)) return;

    setSaving(true);
    try {
      if (mode === "create") {
        const created = await createTour(formToCreateInput(form));
        invalidateDashboardCache();
        showToast("Tour creato con successo.", "success");
        router.push(`/tour/${created.id}`);
        return;
      }

      if (!tourId) return;
      await updateTour(tourId, formToUpdateInput(form));
      invalidateDashboardCache();
      showToast("Tour aggiornato.", "success");
      router.push(`/tour/${tourId}`);
    } catch (error) {
      showToast(`Impossibile salvare il tour. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={mode === "create" ? "Nuovo Tour" : "Modifica Tour"}
        description={
          mode === "create"
            ? "Crea un nuovo tour nel catalogo operativo."
            : "Aggiorna le informazioni del tour."
        }
        action={
          <Link href={mode === "edit" && tourId ? `/tour/${tourId}` : "/tour"}>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Indietro
            </Button>
          </Link>
        }
      />

      <PageContent>
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader
              title={mode === "create" ? "Dati tour" : "Modifica dati"}
              description="Compila i campi obbligatori per pubblicare il tour nel gestionale."
            />
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <TourFormFields
                    form={form}
                    errors={errors}
                    loading={saving}
                    onFormChange={setForm}
                    onFieldChange={handleFieldChange}
                  />

                  <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
                    <Link href={mode === "edit" && tourId ? `/tour/${tourId}` : "/tour"}>
                      <Button type="button" variant="secondary" disabled={saving}>
                        Annulla
                      </Button>
                    </Link>
                    <Button type="submit" disabled={saving}>
                      {saving
                        ? "Salvataggio..."
                        : mode === "create"
                          ? "Crea tour"
                          : "Salva modifiche"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </div>
  );
}
