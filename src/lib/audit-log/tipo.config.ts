import {
  BedDouble,
  CheckSquare,
  ClipboardList,
  Compass,
  CreditCard,
  FileText,
  Mail,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AuditLogEntitaTipo } from "@/types/audit-log";

export type AuditLogTipoStyle = {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
  ring: string;
};

export const AUDIT_LOG_TIPO_CONFIG: Record<
  AuditLogEntitaTipo,
  AuditLogTipoStyle
> = {
  cliente: {
    label: "Cliente",
    icon: Users,
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/15",
  },
  pagamento: {
    label: "Pagamento",
    icon: CreditCard,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/15",
  },
  camera: {
    label: "Camera",
    icon: BedDouble,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-600/15",
  },
  tour: {
    label: "Tour",
    icon: Compass,
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/15",
  },
  documento: {
    label: "Documento",
    icon: FileText,
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/15",
  },
  partecipante: {
    label: "Partecipante",
    icon: UserPlus,
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-teal-600/15",
  },
  comunicazione: {
    label: "Comunicazione",
    icon: Mail,
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/15",
  },
  template_email: {
    label: "Template email",
    icon: ClipboardList,
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/15",
  },
  checklist: {
    label: "Checklist",
    icon: CheckSquare,
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-600/15",
  },
  generale: {
    label: "Generale",
    icon: Settings,
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    ring: "ring-zinc-500/10",
  },
};
