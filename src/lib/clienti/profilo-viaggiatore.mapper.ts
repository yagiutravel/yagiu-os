import { EMPTY_PREFERENZE } from "@/models/preferenze-viaggiatore";
import { mapClienteToClienteScheda } from "@/lib/clienti/scheda/mappers/scheda.mapper";
import { EMPTY_DISPLAY } from "@/models/cliente-scheda/defaults";
import type { Cliente } from "@/types/cliente";
import type { ClienteScheda } from "@/types/cliente-scheda/scheda";
import type { ProfiloViaggiatore } from "@/types/profilo-viaggiatore";

function toDisplayField(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY_DISPLAY;
}

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return EMPTY_DISPLAY;

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return EMPTY_DISPLAY;

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildNomeCompleto(nome: string, cognome: string): string {
  const parts = [nome.trim(), cognome.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : EMPTY_DISPLAY;
}

function buildCittaPaese(citta: string, paese: string): string {
  const cittaDisplay = citta.trim();
  const paeseDisplay = paese.trim();

  if (cittaDisplay && paeseDisplay) return `${cittaDisplay} / ${paeseDisplay}`;
  if (cittaDisplay) return cittaDisplay;
  if (paeseDisplay) return paeseDisplay;
  return EMPTY_DISPLAY;
}

export function mapClienteSchedaToProfiloViaggiatore(
  scheda: ClienteScheda,
  stato: Cliente["stato"],
): ProfiloViaggiatore {
  const { personali, viaggi } = scheda;
  const cognome = toDisplayField(personali.cognome);
  const viaggioAttivo = viaggi.attivi[0];
  const numeroViaggi = viaggi.attivi.length + viaggi.storico.length;

  return {
    id: scheda.id,
    stato,
    creatoIl: scheda.creatoIl.split("T")[0],
    profilo: {
      nome: personali.nome,
      cognome,
      nomeCompleto: buildNomeCompleto(personali.nome, personali.cognome),
      email: personali.email,
      telefono: personali.telefono,
      whatsapp: toDisplayField(personali.whatsapp),
      nazionalita: toDisplayField(personali.nazionalita),
      dataNascita: formatDisplayDate(personali.dataNascita),
      cittaPaese: buildCittaPaese(
        personali.indirizzo.citta,
        personali.indirizzo.paese,
      ),
    },
    esperienzaYagiu: {
      tourLeaderAssegnato: EMPTY_DISPLAY,
      guidaLocale: EMPTY_DISPLAY,
      viaggioAttuale: viaggioAttivo ? viaggioAttivo.titolo : EMPTY_DISPLAY,
      numeroViaggiEffettuati:
        numeroViaggi > 0 ? String(numeroViaggi) : EMPTY_DISPLAY,
      clienteAbituale: false,
    },
    preferenze: EMPTY_PREFERENZE,
    documenti: { documenti: [] },
  };
}

export function mapClienteToProfiloViaggiatore(cliente: Cliente): ProfiloViaggiatore {
  const scheda = mapClienteToClienteScheda(cliente);
  return mapClienteSchedaToProfiloViaggiatore(scheda, cliente.stato);
}
