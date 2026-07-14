import {
  Bell,
  Mail,
  MessageSquare,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { AutomazioneAzione } from "@/types/automazione";

export const AUTOMAZIONE_AZIONE_CONFIG: Record<
  AutomazioneAzione,
  { label: string; icon: LucideIcon; bg: string; text: string; ring: string }
> = {
  invia_reminder: {
    label: "Reminder",
    icon: Bell,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/15",
  },
  crea_notifica: {
    label: "Notifica",
    icon: MessageSquare,
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/15",
  },
  invia_email: {
    label: "Email",
    icon: Mail,
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/15",
  },
  invia_richiesta_recensione: {
    label: "Recensione",
    icon: Star,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
};
