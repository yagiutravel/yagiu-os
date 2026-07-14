import { createEmailTemplate } from "@/models/email-template";
import type {
  EmailTemplate,
  EmailTemplateForm,
} from "@/types/email-template";

const templatesStore: EmailTemplate[] = [];
let seeded = false;

const SEED_TEMPLATES: Array<Omit<EmailTemplate, "id" | "creatoIl" | "aggiornatoIl">> = [
  {
    titolo: "Conferma prenotazione",
    oggetto: "Conferma prenotazione — {{tour}}",
    categoria: "prenotazione",
    corpoHtml: `<p>Gentile <strong>{{nome}}</strong>,</p>
<p>la sua prenotazione per il tour <strong>{{tour}}</strong> è confermata.</p>
<p>Data di partenza: <strong>{{partenza}}</strong></p>
<p>La guida del tour sarà <strong>{{guida}}</strong>. Per qualsiasi informazione può contattarci al <strong>{{telefono}}</strong>.</p>
<p>A presto,<br/>Team Yagiu</p>`,
  },
  {
    titolo: "Richiesta acconto",
    oggetto: "Acconto viaggio {{tour}}",
    categoria: "pagamenti",
    corpoHtml: `<p>Ciao <strong>{{nome}}</strong>,</p>
<p>per confermare il suo posto sul tour <strong>{{tour}}</strong> (partenza {{partenza}}) le chiediamo di versare l'acconto.</p>
<p>Importo saldo residuo: <strong>{{saldo}}</strong></p>
<p>Per assistenza: <strong>{{telefono}}</strong></p>`,
  },
  {
    titolo: "Richiesta saldo",
    oggetto: "Saldo viaggio {{tour}} — partenza {{partenza}}",
    categoria: "pagamenti",
    corpoHtml: `<p>Gentile <strong>{{nome}}</strong>,</p>
<p>manca poco alla partenza del tour <strong>{{tour}}</strong> del {{partenza}}.</p>
<p>Le ricordiamo di saldare l'importo residuo di <strong>{{saldo}}</strong>.</p>
<p>La guida <strong>{{guida}}</strong> la aspetta! Contatti: <strong>{{telefono}}</strong></p>`,
  },
  {
    titolo: "Documenti richiesti",
    oggetto: "Documenti necessari per {{tour}}",
    categoria: "documenti",
    corpoHtml: `<p>Buongiorno <strong>{{nome}}</strong>,</p>
<p>per il viaggio <strong>{{tour}}</strong> in partenza il {{partenza}} abbiamo bisogno dei suoi documenti aggiornati.</p>
<p>Carichi passaporto e assicurazione entro 7 giorni.</p>
<p>Supporto: <strong>{{telefono}}</strong></p>`,
  },
  {
    titolo: "Reminder partenza",
    oggetto: "Manca poco! {{tour}} — {{partenza}}",
    categoria: "partenza",
    corpoHtml: `<p>Ciao <strong>{{nome}}</strong>!</p>
<p>il tour <strong>{{tour}}</strong> parte il <strong>{{partenza}}</strong>.</p>
<p>Punto di ritrovo e dettagli logistici saranno inviati a breve. La guida <strong>{{guida}}</strong> è pronta!</p>
<p>Urgente: <strong>{{telefono}}</strong></p>`,
  },
  {
    titolo: "Bentornato",
    oggetto: "Bentornato da {{tour}}!",
    categoria: "post_viaggio",
    corpoHtml: `<p>Caro <strong>{{nome}}</strong>,</p>
<p>speriamo che il tour <strong>{{tour}}</strong> sia stato un'esperienza indimenticabile!</p>
<p>Grazie per aver viaggiato con noi. La guida <strong>{{guida}}</strong> ci ha raccontato bei momenti.</p>
<p>Per il prossimo viaggio: <strong>{{telefono}}</strong></p>`,
  },
];

function seedTemplates(): void {
  if (seeded) return;
  templatesStore.push(...SEED_TEMPLATES.map(createEmailTemplate));
  seeded = true;
}

export function listEmailTemplatesMock(): EmailTemplate[] {
  seedTemplates();
  return [...templatesStore].sort(
    (a, b) => new Date(b.aggiornatoIl).getTime() - new Date(a.aggiornatoIl).getTime(),
  );
}

export function findEmailTemplateByIdMock(id: string): EmailTemplate | undefined {
  seedTemplates();
  return templatesStore.find((item) => item.id === id);
}

export function createEmailTemplateMock(data: EmailTemplateForm): EmailTemplate {
  seedTemplates();
  const template = createEmailTemplate(data);
  templatesStore.unshift(template);
  return template;
}

export function updateEmailTemplateMock(
  id: string,
  data: EmailTemplateForm,
): EmailTemplate | null {
  seedTemplates();
  const index = templatesStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: EmailTemplate = {
    ...templatesStore[index],
    ...data,
    aggiornatoIl: new Date().toISOString(),
  };
  templatesStore[index] = updated;
  return updated;
}

export function deleteEmailTemplateMock(id: string): boolean {
  seedTemplates();
  const index = templatesStore.findIndex((item) => item.id === id);
  if (index === -1) return false;
  templatesStore.splice(index, 1);
  return true;
}

export function resetEmailTemplatesMockForTests(): void {
  templatesStore.length = 0;
  seeded = false;
}
