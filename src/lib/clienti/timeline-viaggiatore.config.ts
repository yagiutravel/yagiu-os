import {
  CalendarCheck,
  CreditCard,
  FileUp,
  Flag,
  Mail,
  Phone,
  Plane,
  Route,
  Shield,
  StickyNote,
  MapPin,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEventoTipo } from "@/types/timeline-viaggiatore";

export type TimelineEventoStyle = {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
  ring: string;
};

export const TIMELINE_EVENTO_CONFIG: Record<TimelineEventoTipo, TimelineEventoStyle> = {
  prenotazione: {
    label: "Prenotazione",
    icon: CalendarCheck,
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
  tour_completato: {
    label: "Tour completato",
    icon: Flag,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/20",
  },
  email_inviata: {
    label: "Email inviata",
    icon: Mail,
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/20",
  },
  nota_interna: {
    label: "Nota interna",
    icon: StickyNote,
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    ring: "ring-zinc-500/15",
  },
  telefonata: {
    label: "Telefonata",
    icon: Phone,
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/20",
  },
  programma_giorno: {
    label: "Programma",
    icon: CalendarDays,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-600/20",
  },
  attivita: {
    label: "Attività",
    icon: MapPin,
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-teal-600/20",
  },
  volo: {
    label: "Volo",
    icon: Plane,
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    ring: "ring-cyan-600/20",
  },
  transfer: {
    label: "Transfer",
    icon: Route,
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-600/20",
  },
  assicurazione: {
    label: "Assicurazione",
    icon: Shield,
    bg: "bg-lime-50",
    text: "text-lime-700",
    ring: "ring-lime-600/20",
  },
};
