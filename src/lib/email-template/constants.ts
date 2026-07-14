import type {
  EmailTemplateCategoria,
  EmailTemplateVariabile,
} from "@/types/email-template";

export const EMAIL_TEMPLATE_CATEGORIE: Array<{
  value: EmailTemplateCategoria | "tutte";
  label: string;
}> = [
  { value: "tutte", label: "Tutte" },
  { value: "prenotazione", label: "Prenotazione" },
  { value: "pagamenti", label: "Pagamenti" },
  { value: "documenti", label: "Documenti" },
  { value: "partenza", label: "Partenza" },
  { value: "post_viaggio", label: "Post viaggio" },
  { value: "generale", label: "Generale" },
];

export const EMAIL_TEMPLATE_CATEGORIA_LABELS: Record<
  EmailTemplateCategoria,
  string
> = {
  prenotazione: "Prenotazione",
  pagamenti: "Pagamenti",
  documenti: "Documenti",
  partenza: "Partenza",
  post_viaggio: "Post viaggio",
  generale: "Generale",
};

export const EMAIL_TEMPLATE_VARIABILI: EmailTemplateVariabile[] = [
  "nome",
  "tour",
  "partenza",
  "saldo",
  "guida",
  "telefono",
];

export const EMPTY_EMAIL_TEMPLATE_FORM = {
  titolo: "",
  oggetto: "",
  corpoHtml: "",
  categoria: "generale" as EmailTemplateCategoria,
};
