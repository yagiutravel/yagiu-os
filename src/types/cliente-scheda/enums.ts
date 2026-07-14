/**
 * Enumerazioni dominio per la scheda cliente.
 * Pattern `as const` + type derivato — coerente con il resto del codebase.
 */

export const PipelineStato = {
  Lead: "Lead",
  Qualificato: "Qualificato",
  Proposta: "Proposta",
  Negoziazione: "Negoziazione",
  Cliente: "Cliente",
  Perso: "Perso",
} as const;

export type PipelineStato = (typeof PipelineStato)[keyof typeof PipelineStato];

export const ValoreCliente = {
  Basso: "Basso",
  Medio: "Medio",
  Alto: "Alto",
  Premium: "Premium",
} as const;

export type ValoreCliente = (typeof ValoreCliente)[keyof typeof ValoreCliente];

export const ProvenienzaLead = {
  Referral: "Referral",
  SitoWeb: "SitoWeb",
  Social: "Social",
  Evento: "Evento",
  Passaparola: "Passaparola",
  Partner: "Partner",
  Altro: "Altro",
} as const;

export type ProvenienzaLead = (typeof ProvenienzaLead)[keyof typeof ProvenienzaLead];

export const TipoDocumento = {
  Passaporto: "Passaporto",
  CartaIdentita: "CartaIdentita",
  Assicurazione: "Assicurazione",
  Altro: "Altro",
} as const;

export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento];

export const StatoDocumento = {
  Valido: "Valido",
  InScadenza: "InScadenza",
  Scaduto: "Scaduto",
  Mancante: "Mancante",
} as const;

export type StatoDocumento = (typeof StatoDocumento)[keyof typeof StatoDocumento];

export const TipoAttivita = {
  Chiamata: "Chiamata",
  Email: "Email",
  Meeting: "Meeting",
  FollowUp: "FollowUp",
  Task: "Task",
  Altro: "Altro",
} as const;

export type TipoAttivita = (typeof TipoAttivita)[keyof typeof TipoAttivita];

export const TipoTimelineEvento = {
  Nota: "Nota",
  Attivita: "Attivita",
  Viaggio: "Viaggio",
  Documento: "Documento",
  StatoPipeline: "StatoPipeline",
  Allegato: "Allegato",
  Sistema: "Sistema",
} as const;

export type TipoTimelineEvento = (typeof TipoTimelineEvento)[keyof typeof TipoTimelineEvento];

export const TipoAllegato = {
  Immagine: "Immagine",
  Pdf: "Pdf",
  Documento: "Documento",
  Altro: "Altro",
} as const;

export type TipoAllegato = (typeof TipoAllegato)[keyof typeof TipoAllegato];

export const ViaggioStato = {
  Pianificato: "Pianificato",
  Confermato: "Confermato",
  InCorso: "InCorso",
  Completato: "Completato",
  Annullato: "Annullato",
} as const;

export type ViaggioStato = (typeof ViaggioStato)[keyof typeof ViaggioStato];
