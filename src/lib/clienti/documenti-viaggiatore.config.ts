import type { DocumentoStato, DocumentoTipo } from "@/types/documenti-viaggiatore";
import {
  FileCheck,
  FileText,
  Plane,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type DocumentoStatoStyle = {
  label: string;
  emoji: string;
  bg: string;
  text: string;
  ring: string;
};

export type DocumentoTipoStyle = {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
};

export const DOCUMENTO_STATO_CONFIG: Record<DocumentoStato, DocumentoStatoStyle> = {
  valido: {
    label: "Valido",
    emoji: "🟢",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  in_scadenza: {
    label: "In scadenza",
    emoji: "🟠",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/20",
  },
  scaduto: {
    label: "Scaduto",
    emoji: "🔴",
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-600/20",
  },
};

export const DOCUMENTO_TIPO_CONFIG: Record<DocumentoTipo, DocumentoTipoStyle> = {
  passaporto: {
    label: "Passaporto",
    icon: FileText,
    bg: "bg-sky-50",
    text: "text-sky-700",
  },
  assicurazione: {
    label: "Assicurazione",
    icon: Shield,
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  visto: {
    label: "Visto",
    icon: Plane,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
  },
  liberatoria: {
    label: "Liberatoria",
    icon: FileCheck,
    bg: "bg-zinc-100",
    text: "text-zinc-700",
  },
};
