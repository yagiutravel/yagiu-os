/**
 * Smoke test end-to-end del modulo Comunicazioni su Supabase.
 * Usage: node --env-file=.env.local scripts/comunicazioni-flow-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { signInTestUser, signOutTestUser } from "./lib/test-auth.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const organizationId =
  process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID ??
  "00000000-0000-4000-8000-000000000001";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

async function main() {
  if (!url || !anonKey) {
    fail("Variabili Supabase mancanti in .env.local");
  }

  const supabase = createClient(url, anonKey);
  await signInTestUser(supabase);
  ok("Sessione test autenticata");

  const { error: probeError } = await supabase
    .from("comunicazioni")
    .select("id")
    .limit(1);

  if (
    probeError &&
    (probeError.code === "PGRST205" ||
      probeError.message.includes("Could not find the table"))
  ) {
    fail(
      "Tabelle comunicazioni non trovate. Esegui prima:\n" +
        "  supabase/migrations/20260715090000_sprint_0_legacy_schema.sql",
    );
  }

  const suffix = Date.now();
  const clienteId = randomUUID();

  const { data: cliente, error: clienteError } = await supabase
    .from("clienti")
    .insert({
      id: clienteId,
      organization_id: organizationId,
      nome: `Smoke Cliente Comunicazioni ${suffix}`,
      email: `comms-${suffix}@example.com`,
      stato: "Attivo",
    })
    .select("id")
    .single();

  if (clienteError) fail(`create cliente: ${clienteError.message}`);
  ok(`Cliente creato (${cliente.id})`);

  const { data: template, error: templateError } = await supabase
    .from("email_templates")
    .insert({
      organization_id: organizationId,
      titolo: `Smoke Template ${suffix}`,
      oggetto: "Conferma prenotazione — {{tour}}",
      corpo_html: "<p>Gentile {{nome}}, conferma inviata.</p>",
      categoria: "prenotazione",
    })
    .select("id")
    .single();

  if (templateError) fail(`create email template: ${templateError.message}`);
  ok(`Template email creato (${template.id})`);

  const { data: comunicazione, error: comunicazioneError } = await supabase
    .from("comunicazioni")
    .insert({
      cliente_id: cliente.id,
      canale: "email",
      tipo: "conferma_prenotazione_inviata",
      stato: "in_coda",
      oggetto: "Conferma prenotazione",
      anteprima: "Smoke test comunicazioni",
    })
    .select("id, stato")
    .single();

  if (comunicazioneError) {
    fail(`create comunicazione: ${comunicazioneError.message}`);
  }
  ok(`Comunicazione creata (${comunicazione.id})`);

  const { data: evento, error: eventoError } = await supabase
    .from("comunicazione_eventi")
    .insert({
      cliente_id: cliente.id,
      tipo: "conferma_prenotazione_inviata",
      titolo: "Conferma prenotazione inviata",
      descrizione: "Smoke test timeline comunicazioni",
      completato: false,
    })
    .select("id")
    .single();

  if (eventoError) fail(`create comunicazione evento: ${eventoError.message}`);
  ok(`Evento comunicazione creato (${evento.id})`);

  const { data: invio, error: invioError } = await supabase
    .from("email_invii")
    .insert({
      cliente_id: cliente.id,
      destinatario: `comms-${suffix}@example.com`,
      oggetto: "Conferma prenotazione",
      messaggio: "Messaggio smoke test comunicazioni",
      template_id: template.id,
      allegati: [],
      utente: "Smoke Test",
    })
    .select("id")
    .single();

  if (invioError) fail(`create email invio: ${invioError.message}`);
  ok(`Email invio registrato (${invio.id})`);

  const { data: comunicazioniList, error: listComunicazioniError } =
    await supabase
      .from("comunicazioni")
      .select("id")
      .eq("cliente_id", cliente.id);

  if (listComunicazioniError) {
    fail(`list comunicazioni: ${listComunicazioniError.message}`);
  }
  if ((comunicazioniList ?? []).length < 1) {
    fail("list comunicazioni: nessun record trovato");
  }
  ok("Lista comunicazioni verificata");

  const { data: eventiList, error: listEventiError } = await supabase
    .from("comunicazione_eventi")
    .select("id")
    .eq("cliente_id", cliente.id);

  if (listEventiError) fail(`list eventi: ${listEventiError.message}`);
  if ((eventiList ?? []).length < 1) {
    fail("list eventi: nessun record trovato");
  }
  ok("Lista eventi comunicazione verificata");

  const { data: templatesList, error: listTemplatesError } = await supabase
    .from("email_templates")
    .select("id")
    .eq("id", template.id)
    .maybeSingle();

  if (listTemplatesError) fail(`read template: ${listTemplatesError.message}`);
  if (!templatesList) fail("read template: record non trovato");
  ok("Template email leggibile");

  const { error: updateError } = await supabase
    .from("comunicazioni")
    .update({ stato: "inviata", inviata_il: new Date().toISOString() })
    .eq("id", comunicazione.id);

  if (updateError) fail(`update comunicazione: ${updateError.message}`);
  ok("Aggiornamento stato comunicazione verificato");

  const { error: timelineError } = await supabase
    .from("cliente_timeline_eventi")
    .insert({
      cliente_id: cliente.id,
      tipo: "email_inviata",
      titolo: "Email inviata: Conferma prenotazione",
      descrizione: "Smoke test timeline da flusso comunicazioni",
      utente: "Smoke Test",
    });

  if (timelineError && !timelineError.message.includes("Could not find the table")) {
    fail(`cliente timeline: ${timelineError.message}`);
  } else if (!timelineError) {
    ok("Timeline cliente registrata");
  }

  await supabase.from("email_templates").delete().eq("id", template.id);
  await supabase.from("clienti").delete().eq("id", cliente.id);
  await signOutTestUser(supabase);
  ok("Cleanup completato");

  console.log("\n✅ Flusso Comunicazioni smoke test completato con successo.");
}

main().catch((error) => fail(error.message));
