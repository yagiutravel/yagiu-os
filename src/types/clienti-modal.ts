import type { Cliente } from "@/types/cliente";

export type ClientiModalState =
  | { type: "none" }
  | { type: "form"; mode: "create" | "edit"; editingId?: string }
  | { type: "delete"; cliente: Cliente };
