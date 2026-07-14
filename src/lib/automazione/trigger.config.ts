import {
  CalendarDays,
  CreditCard,
  FileWarning,
  Flag,
  type LucideIcon,
} from "lucide-react";
import type { AutomazioneTrigger } from "@/types/automazione";

export const AUTOMAZIONE_TRIGGER_CONFIG: Record<
  AutomazioneTrigger,
  { label: string; icon: LucideIcon; bg: string; text: string; ring: string }
> = {
  saldo_mancante: {
    label: "Saldo mancante",
    icon: CreditCard,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/15",
  },
  passaporto_scadenza: {
    label: "Passaporto in scadenza",
    icon: FileWarning,
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/15",
  },
  una_settimana_mancante: {
    label: "Una settimana alla partenza",
    icon: CalendarDays,
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/15",
  },
  tour_terminato: {
    label: "Tour terminato",
    icon: Flag,
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/15",
  },
};
