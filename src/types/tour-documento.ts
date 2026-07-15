export type CategoriaDocumentoTour =
  | "Contratto"
  | "Assicurazione"
  | "Programma"
  | "Voucher"
  | "Fattura"
  | "Immagine"
  | "Altro";

export type TourDocumento = {
  id: string;
  tourId: string;
  nome: string;
  categoria: CategoriaDocumentoTour;
  storagePath: string;
  url: string;
  mimeType: string;
  dimensioneBytes: number;
  note: string;
  caricatoIl: string;
};

export type CreateTourDocumentoInput = {
  tourId: string;
  nome: string;
  categoria: CategoriaDocumentoTour;
  file: File;
  note?: string;
};

export type UpdateTourDocumentoInput = {
  nome?: string;
  categoria?: CategoriaDocumentoTour;
  note?: string;
};
