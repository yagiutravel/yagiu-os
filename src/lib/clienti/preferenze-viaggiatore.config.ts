import type { TipologiaViaggio } from "@/types/preferenze-viaggiatore";

export type TipologiaViaggioStyle = {
  label: string;
  bg: string;
  text: string;
  ring: string;
};

export const TIPOLOGIA_VIAGGIO_CONFIG: Record<TipologiaViaggio, TipologiaViaggioStyle> = {
  adventure: {
    label: "Adventure",
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-600/20",
  },
  trekking: {
    label: "Trekking",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  yoga: {
    label: "Yoga",
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-600/20",
  },
  relax: {
    label: "Relax",
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-600/20",
  },
  fotografia: {
    label: "Fotografia",
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-600/20",
  },
  cultura: {
    label: "Cultura",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-600/20",
  },
  food: {
    label: "Food",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/20",
  },
};

export const TIPOLOGIE_VIAGGIO_DISPONIBILI: TipologiaViaggio[] = [
  "adventure",
  "trekking",
  "yoga",
  "relax",
  "fotografia",
  "cultura",
  "food",
];
