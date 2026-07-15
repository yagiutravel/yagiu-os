import {
  AlertTriangle,
  BedDouble,
  Calendar,
  CheckSquare,
  CreditCard,
  FileText,
  FileWarning,
  Send,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { NotificaTipo } from "@/types/notifica";

export type NotificaTipoStyle = {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
  ring: string;
};

export const NOTIFICA_TIPO_CONFIG: Record<NotificaTipo, NotificaTipoStyle> = {
  saldo_mancante: {
    label: "Saldo mancante",
    icon: AlertTriangle,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/15",
  },
  documento_scadenza: {
    label: "Documento in scadenza",
    icon: FileWarning,
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-600/15",
  },
  tour_partenza: {
    label: "Tour in partenza",
    icon: Calendar,
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/15",
  },
  camera_incompleta: {
    label: "Camera incompleta",
    icon: BedDouble,
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/15",
  },
  pagamento_ricevuto: {
    label: "Pagamento ricevuto",
    icon: CreditCard,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
  cliente_nuovo: {
    label: "Cliente nuovo",
    icon: UserPlus,
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/15",
  },
  preventivo_creato: {
    label: "Preventivo creato",
    icon: FileText,
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    ring: "ring-fuchsia-600/15",
  },
  preventivo_inviato: {
    label: "Preventivo inviato",
    icon: Send,
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/15",
  },
  preventivo_accettato: {
    label: "Preventivo accettato",
    icon: CheckSquare,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
  preventivo_convertito: {
    label: "Preventivo convertito",
    icon: UserPlus,
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/15",
  },
};
