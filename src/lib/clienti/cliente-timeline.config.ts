import {
  BedDouble,
  CheckSquare,
  CreditCard,
  FileText,
  FileUp,
  Flag,
  Mail,
  MessageCircle,
  Send,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ClienteTimelineEventoTipo } from "@/types/cliente-timeline";

export type ClienteTimelineEventoStyle = {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
  ring: string;
};

export const CLIENTE_TIMELINE_EVENTO_CONFIG: Record<
  ClienteTimelineEventoTipo,
  ClienteTimelineEventoStyle
> = {
  cliente_creato: {
    label: "Cliente creato",
    icon: UserPlus,
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    ring: "ring-zinc-500/15",
  },
  iscritto_tour: {
    label: "Iscritto al Tour",
    icon: Users,
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/20",
  },
  pagamento: {
    label: "Pagamento",
    icon: CreditCard,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  documento_caricato: {
    label: "Documento caricato",
    icon: FileUp,
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/20",
  },
  camera_assegnata: {
    label: "Camera assegnata",
    icon: BedDouble,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-600/20",
  },
  email_inviata: {
    label: "Email inviata",
    icon: Mail,
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/20",
  },
  whatsapp_inviato: {
    label: "WhatsApp inviato",
    icon: MessageCircle,
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-teal-600/20",
  },
  checklist_completata: {
    label: "Checklist completata",
    icon: CheckSquare,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/20",
  },
  tour_concluso: {
    label: "Tour concluso",
    icon: Flag,
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/20",
  },
  preventivo_creato: {
    label: "Preventivo creato",
    icon: FileText,
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    ring: "ring-fuchsia-600/20",
  },
  preventivo_inviato: {
    label: "Preventivo inviato",
    icon: Send,
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/20",
  },
  preventivo_accettato: {
    label: "Preventivo accettato",
    icon: CheckSquare,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  preventivo_convertito: {
    label: "Iscrizione da preventivo",
    icon: UserPlus,
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/20",
  },
};
