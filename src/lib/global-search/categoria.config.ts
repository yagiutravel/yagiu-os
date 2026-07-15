import {
  BedDouble,
  ClipboardList,
  Compass,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { GlobalSearchCategoria } from "@/types/global-search";

export type GlobalSearchCategoriaStyle = {
  icon: LucideIcon;
  bg: string;
  text: string;
};

export const GLOBAL_SEARCH_CATEGORIA_CONFIG: Record<
  GlobalSearchCategoria,
  GlobalSearchCategoriaStyle
> = {
  clienti: {
    icon: Users,
    bg: "bg-sky-50",
    text: "text-sky-700",
  },
  tour: {
    icon: Compass,
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  preventivi: {
    icon: FileText,
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
  },
  pagamenti: {
    icon: CreditCard,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  camere: {
    icon: BedDouble,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
  },
  documenti: {
    icon: FileText,
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  questionari: {
    icon: ClipboardList,
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  timeline: {
    icon: History,
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
  dashboard: {
    icon: LayoutDashboard,
    bg: "bg-zinc-100",
    text: "text-zinc-700",
  },
};
