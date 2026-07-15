export type TourChecklistTemplate = {
  id: string;
  tourId: string;
  codice: string;
  etichetta: string;
  descrizione: string;
  ordine: number;
  obbligatorio: boolean;
};

export type TourChecklistCompletion = {
  id: string;
  tourId: string;
  templateId: string;
  participantId: string;
  completato: boolean;
  completatoIl: string | null;
  note: string;
};

export type TourChecklistItemView = {
  template: TourChecklistTemplate;
  completion: TourChecklistCompletion | null;
};

export type TourChecklistParticipantView = {
  participantId: string;
  clienteNome: string;
  items: TourChecklistItemView[];
  completati: number;
  totali: number;
};

export type TourChecklistData = {
  templates: TourChecklistTemplate[];
  partecipanti: TourChecklistParticipantView[];
};

export type CreateChecklistTemplateInput = {
  tourId: string;
  codice: string;
  etichetta: string;
  descrizione?: string;
  ordine?: number;
  obbligatorio?: boolean;
};

export type UpdateChecklistTemplateInput = Partial<
  Omit<CreateChecklistTemplateInput, "tourId" | "codice">
>;

export type UpdateChecklistCompletionInput = {
  tourId: string;
  templateId: string;
  participantId: string;
  completato: boolean;
  note?: string;
};
