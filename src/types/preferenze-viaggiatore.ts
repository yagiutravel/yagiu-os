export type TipologiaViaggio =
  | "adventure"
  | "trekking"
  | "yoga"
  | "relax"
  | "fotografia"
  | "cultura"
  | "food";

export type PreferenzeViaggiatore = {
  tipologieViaggio: TipologiaViaggio[];
  lingue: string;
  allergie: string;
  dieta: string;
  livelloTrekking: string;
};
