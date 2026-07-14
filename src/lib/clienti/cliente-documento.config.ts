import {
  CreditCard,
  FileText,
  Plane,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { ClienteDocumentoTipo } from "@/types/cliente-documento";

export type ClienteDocumentoTipoStyle = {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
};

export const CLIENTE_DOCUMENTO_TIPO_CONFIG: Record<
  ClienteDocumentoTipo,
  ClienteDocumentoTipoStyle
> = {
  passaporto: {
    label: "Passaporto",
    icon: FileText,
    bg: "bg-sky-50",
    text: "text-sky-700",
  },
  carta_identita: {
    label: "Carta Identità",
    icon: CreditCard,
    bg: "bg-zinc-100",
    text: "text-zinc-700",
  },
  visto: {
    label: "Visto",
    icon: Plane,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
  },
  assicurazione: {
    label: "Assicurazione",
    icon: Shield,
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
};

export const CLIENTE_DOCUMENTO_STATO_BORDER: Record<
  "valido" | "in_scadenza" | "scaduto",
  string
> = {
  valido: "border-l-emerald-500",
  in_scadenza: "border-l-amber-500",
  scaduto: "border-l-red-500",
};
