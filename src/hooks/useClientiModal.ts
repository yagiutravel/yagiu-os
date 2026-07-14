"use client";

import { useCallback, useState } from "react";
import type { Cliente } from "@/types/cliente";
import type { ClientiModalState } from "@/types/clienti-modal";

const CLOSED: ClientiModalState = { type: "none" };

export function useClientiModal() {
  const [modal, setModal] = useState<ClientiModalState>(CLOSED);

  const openCreate = useCallback(() => {
    setModal((current) => {
      if (current.type !== "none") return current;
      return { type: "form", mode: "create" };
    });
  }, []);

  const openEdit = useCallback((cliente: Cliente) => {
    setModal((current) => {
      if (current.type !== "none") return current;
      return { type: "form", mode: "edit", editingId: cliente.id };
    });
  }, []);

  const openDelete = useCallback((cliente: Cliente) => {
    setModal((current) => {
      if (current.type !== "none") return current;
      return { type: "delete", cliente };
    });
  }, []);

  const close = useCallback(() => {
    setModal(CLOSED);
  }, []);

  const isAnyOpen = modal.type !== "none";

  return {
    modal,
    openCreate,
    openEdit,
    openDelete,
    close,
    isAnyOpen,
    isTableActionsDisabled: isAnyOpen,
  };
}
