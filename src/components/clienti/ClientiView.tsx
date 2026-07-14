"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, SearchX, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useClientiModal } from "@/hooks/useClientiModal";
import { ClienteFormModal } from "./ClienteFormModal";
import { ClientiTable } from "./ClientiTable";
import { ClientiToolbar } from "./ClientiToolbar";
import {
  EMPTY_CLIENTE_FORM,
  PAGE_SIZE,
  SORT_OPTIONS,
} from "@/lib/clienti/constants";
import { hasFormErrors, validateClienteForm } from "@/lib/clienti/validation";
import { clienteToForm, processClienti } from "@/lib/clienti/utils";
import {
  createCliente,
  deleteCliente,
  getClienti,
  updateCliente,
} from "@/services/clienti.service";
import { getErrorMessage } from "@/shared/utils/error";
import type {
  Cliente,
  ClienteForm,
  ClienteFormErrors,
  ClienteStato,
} from "@/types/cliente";


export function ClientiView() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    modal,
    openCreate,
    openEdit,
    openDelete,
    close,
    isAnyOpen,
    isTableActionsDisabled,
  } = useClientiModal();

  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statoFilter, setStatoFilter] = useState<ClienteStato | "tutti">("tutti");
  const [sortValue, setSortValue] = useState("creatoIl-desc");
  const [page, setPage] = useState(1);

  const [form, setForm] = useState<ClienteForm>(EMPTY_CLIENTE_FORM);
  const [formErrors, setFormErrors] = useState<ClienteFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadClienti = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getClienti();
      setClienti(data);
    } catch (error) {
      showToast(`Impossibile caricare i clienti. ${getErrorMessage(error)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadClienti();
  }, [loadClienti]);

  const sortConfig = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[2],
    [sortValue],
  );

  const processed = useMemo(
    () =>
      processClienti(clienti, {
        search,
        stato: statoFilter,
        sortField: sortConfig.field,
        sortDirection: sortConfig.direction,
        page,
      }),
    [clienti, search, statoFilter, sortConfig, page],
  );

  const resetForm = useCallback(() => {
    setForm(EMPTY_CLIENTE_FORM);
    setFormErrors({});
  }, []);

  const handleOpenCreate = useCallback(() => {
    resetForm();
    openCreate();
  }, [openCreate, resetForm]);

  const handleOpenEdit = useCallback(
    (cliente: Cliente) => {
      if (isTableActionsDisabled) return;
      setForm(clienteToForm(cliente));
      setFormErrors({});
      openEdit(cliente);
    },
    [isTableActionsDisabled, openEdit],
  );

  const handleOpenDelete = useCallback(
    (cliente: Cliente) => {
      if (isTableActionsDisabled) return;
      openDelete(cliente);
    },
    [isTableActionsDisabled, openDelete],
  );

  const handleRowClick = useCallback(
    (cliente: Cliente) => {
      if (isTableActionsDisabled) return;
      router.push(`/clienti/${cliente.id}`);
    },
    [isTableActionsDisabled, router],
  );

  const handleCloseForm = useCallback(() => {
    if (saving) return;
    close();
    resetForm();
  }, [close, resetForm, saving]);

  const clearFieldError = useCallback((field: keyof ClienteForm) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatoChange = useCallback((stato: ClienteStato | "tutti") => {
    setStatoFilter(stato);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortValue(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (isTableActionsDisabled) return;
      setPage(nextPage);
    },
    [isTableActionsDisabled],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validateClienteForm(form);
    setFormErrors(errors);
    if (hasFormErrors(errors)) return;

    const input = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim() || undefined,
      azienda: form.azienda.trim() || undefined,
      stato: form.stato,
    };

    setSaving(true);

    try {
      if (modal.type === "form" && modal.mode === "create") {
        const nuovoCliente = await createCliente(input);
        setClienti((prev) => [nuovoCliente, ...prev]);
        setPage(1);
        showToast("Cliente creato con successo.");
      } else if (modal.type === "form" && modal.mode === "edit" && modal.editingId) {
        const editingId = modal.editingId;
        const previousClienti = clienti;
        const optimisticCliente: Cliente = {
          id: editingId,
          nome: input.nome,
          email: input.email,
          telefono: input.telefono ?? "—",
          azienda: input.azienda ?? "—",
          stato: input.stato,
          creatoIl:
            clienti.find((cliente) => cliente.id === editingId)?.creatoIl ??
            new Date().toISOString().split("T")[0],
        };

        setClienti((prev) =>
          prev.map((cliente) => (cliente.id === editingId ? optimisticCliente : cliente)),
        );

        try {
          const updatedCliente = await updateCliente(editingId, input);
          setClienti((prev) =>
            prev.map((cliente) => (cliente.id === editingId ? updatedCliente : cliente)),
          );
          showToast("Cliente aggiornato con successo.");
        } catch (error) {
          setClienti(previousClienti);
          showToast(`Impossibile aggiornare il cliente. ${getErrorMessage(error)}`, "error");
          return;
        }
      }

      close();
      resetForm();
    } catch (error) {
      showToast(`Impossibile salvare il cliente. ${getErrorMessage(error)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (modal.type !== "delete") return;

    const { cliente: deleteTarget } = modal;
    const previousClienti = clienti;
    setDeleting(true);
    setClienti((prev) => prev.filter((cliente) => cliente.id !== deleteTarget.id));

    try {
      await deleteCliente(deleteTarget.id);
      showToast(`Cliente "${deleteTarget.nome}" eliminato.`);
      close();
    } catch (error) {
      setClienti(previousClienti);
      showToast(`Impossibile eliminare il cliente. ${getErrorMessage(error)}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDelete = useCallback(() => {
    if (!deleting) close();
  }, [close, deleting]);

  const isEmpty = !loading && clienti.length === 0;
  const noResults = !loading && !isEmpty && processed.totalItems === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Clienti"
        description="CRM professionale per gestire anagrafica, relazioni e pipeline commerciale."
        action={
          <Button onClick={handleOpenCreate} disabled={isAnyOpen || loading}>
            <Plus className="h-4 w-4" />
            Nuovo Cliente
          </Button>
        }
      />

      <div className="relative z-0 min-h-0 flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-zinc-200/80 bg-white py-24">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento clienti...
            </div>
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={Users}
            title="Nessun cliente ancora"
            description="Inizia ad aggiungere i tuoi clienti per gestire relazioni, viaggi e pagamenti in un unico posto."
            actionLabel="Aggiungi primo cliente"
            onAction={handleOpenCreate}
          />
        ) : (
          <>
            <ClientiToolbar
              search={search}
              stato={statoFilter}
              sortValue={sortValue}
              resultCount={processed.totalItems}
              onSearchChange={handleSearchChange}
              onStatoChange={handleStatoChange}
              onSortChange={handleSortChange}
            />

            {noResults ? (
              <EmptyState
                icon={SearchX}
                title="Nessun risultato"
                description="Nessun cliente corrisponde ai filtri selezionati. Prova a modificare ricerca o stato."
              />
            ) : (
              <ClientiTable
                clienti={processed.items}
                currentPage={processed.currentPage}
                totalPages={processed.totalPages}
                totalItems={processed.totalItems}
                pageSize={PAGE_SIZE}
                actionsDisabled={isTableActionsDisabled}
                onPageChange={handlePageChange}
                onRowClick={handleRowClick}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            )}
          </>
        )}
      </div>

      {modal.type === "form" && (
        <ClienteFormModal
          open
          mode={modal.mode}
          form={form}
          errors={formErrors}
          loading={saving}
          onClose={handleCloseForm}
          onFormChange={setForm}
          onSubmit={handleSubmit}
          onFieldChange={clearFieldError}
        />
      )}

      {modal.type === "delete" && (
        <ConfirmDialog
          open
          title="Elimina cliente"
          description={`Sei sicuro di voler eliminare "${modal.cliente.nome}"? Questa azione non può essere annullata.`}
          confirmLabel="Elimina"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={handleCloseDelete}
        />
      )}
    </div>
  );
}
