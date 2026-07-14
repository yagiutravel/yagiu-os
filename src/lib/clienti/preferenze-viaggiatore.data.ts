import type { PreferenzeViaggiatore } from "@/types/preferenze-viaggiatore";

export function getPreferenzeViaggiatorePlaceholder(): PreferenzeViaggiatore {
  return {
    tipologieViaggio: [
      "adventure",
      "trekking",
      "cultura",
      "food",
      "fotografia",
    ],
    lingue: "Italiano, Inglese, Francese",
    allergie: "Noci, crostacei",
    dieta: "Vegetariana",
    livelloTrekking: "Intermedio",
  };
}
