import { EMPTY_DISPLAY } from "@/models/cliente-scheda/defaults";
import type { PreferenzeViaggiatore } from "@/types/preferenze-viaggiatore";

export const EMPTY_PREFERENZE: PreferenzeViaggiatore = {
  tipologieViaggio: [],
  lingue: EMPTY_DISPLAY,
  allergie: EMPTY_DISPLAY,
  dieta: EMPTY_DISPLAY,
  livelloTrekking: EMPTY_DISPLAY,
};
