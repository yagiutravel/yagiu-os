import {
  Bell,
  Check,
  Circle,
  CreditCard,
  FileText,
  Heart,
  Mail,
  Plane,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { ComunicazioneEventoTipo } from "@/types/comunicazione";

export type ComunicazioneEventoStyle = {
  icon: LucideIcon;
  bg: string;
  text: string;
  ring: string;
};

export const COMUNICAZIONE_EVENTO_CONFIG: Record<
  ComunicazioneEventoTipo,
  ComunicazioneEventoStyle
> = {
  conferma_prenotazione_inviata: {
    icon: Send,
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/20",
  },
  acconto_richiesto: {
    icon: CreditCard,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/20",
  },
  acconto_ricevuto: {
    icon: Check,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  saldo_richiesto: {
    icon: CreditCard,
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-600/20",
  },
  saldo_ricevuto: {
    icon: Check,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  documenti_richiesti: {
    icon: FileText,
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/20",
  },
  documenti_ricevuti: {
    icon: Check,
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/20",
  },
  reminder_partenza: {
    icon: Plane,
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/20",
  },
  bentornato: {
    icon: Heart,
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/20",
  },
};

export const COMUNICAZIONE_CANALE_CONFIG = {
  email: {
    label: "Email",
    icon: Mail,
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/20",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: Send,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  reminder: {
    label: "Reminder",
    icon: Bell,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/20",
  },
  sistema: {
    label: "Sistema",
    icon: Circle,
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    ring: "ring-zinc-500/15",
  },
} as const;
