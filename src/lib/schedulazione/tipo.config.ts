import { Bell, Mail, MessageCircle, type LucideIcon } from "lucide-react";
import type { SchedulazioneTipo } from "@/types/schedulazione";

export const SCHEDULAZIONE_TIPO_CONFIG: Record<
  SchedulazioneTipo,
  { label: string; icon: LucideIcon; bg: string; text: string; ring: string }
> = {
  email: {
    label: "Email",
    icon: Mail,
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/15",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
  reminder: {
    label: "Reminder",
    icon: Bell,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/15",
  },
};
