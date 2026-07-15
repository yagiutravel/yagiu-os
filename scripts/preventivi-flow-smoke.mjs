/**
 * Smoke test end-to-end del modulo Preventivi su Supabase.
 * Usage: node --env-file=.env.local scripts/preventivi-flow-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

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

  const { error: probeError } = await supabase.from("preventivi").select("id").limit(1);
  if (
    probeError &&
    (probeError.code === "PGRST205" ||
      probeError.message.includes("Could not find the table"))
  ) {
    fail(
      "Tabelle preventivi non trovate. Esegui prima:\n" +
        "  supabase/migrations/20260715200000_sprint_2_preventivi.sql",
    );
  }

  const suffix = Date.now();
  const tourSlug = `smoke-preventivo-tour-${suffix}`;

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert({
      organization_id: organizationId,
      nome: `Smoke Preventivo Tour ${suffix}`,
      slug: tourSlug,
      destinazione: "Test City",
      data_partenza: "2026-10-01",
      data_ritorno: "2026-10-08",
      capienza_massima: 12,
      prezzo_cents: 250000,
      stato: "in_vendita",
    })
    .select("id")
    .single();

  if (tourError) fail(`create tour: ${tourError.message}`);
  ok(`Tour creato (${tour.id})`);

  const clienteId = randomUUID();
  const { data: cliente, error: clienteError } = await supabase
    .from("clienti")
    .insert({
      id: clienteId,
      nome: `Smoke Cliente Preventivo ${suffix}`,
      email: `preventivo-${suffix}@example.com`,
      stato: "Attivo",
    })
    .select("id")
    .single();

  if (clienteError) fail(`create cliente: ${clienteError.message}`);
  ok(`Cliente creato (${cliente.id})`);

  const { data: preventivo, error: preventivoError } = await supabase
    .from("preventivi")
    .insert({
      organization_id: organizationId,
      numero: `PREV-SMOKE-${suffix}`,
      cliente_id: cliente.id,
      tour_id: tour.id,
      titolo: "Pacchetto viaggio test",
      stato: "inviato",
      subtotale_cents: 200000,
      tasse_percentuale: 22,
      tasse_cents: 44000,
      totale_cents: 244000,
    })
    .select("id, numero")
    .single();

  if (preventivoError) fail(`create preventivo: ${preventivoError.message}`);
  ok(`Preventivo creato (${preventivo.id})`);

  const { data: riga, error: rigaError } = await supabase
    .from("preventivo_righe")
    .insert({
      organization_id: organizationId,
      preventivo_id: preventivo.id,
      descrizione: "Quota partecipazione",
      quantita: 1,
      prezzo_unitario_cents: 200000,
      ordine: 1,
    })
    .select("id")
    .single();

  if (rigaError) fail(`create riga: ${rigaError.message}`);
  ok(`Riga preventivo creata (${riga.id})`);

  const { data: participant, error: participantError } = await supabase
    .from("tour_participants")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      cliente_id: cliente.id,
      stato_iscrizione: "iscritto",
    })
    .select("id")
    .single();

  if (participantError) fail(`create participant: ${participantError.message}`);

  const { error: convertError } = await supabase
    .from("preventivi")
    .update({
      stato: "convertito",
      partecipante_id: participant.id,
    })
    .eq("id", preventivo.id);

  if (convertError) fail(`convert preventivo: ${convertError.message}`);
  ok("Conversione preventivo → iscrizione verificata");

  const { error: auditError } = await supabase.from("audit_log").insert({
    utente: "Smoke Test",
    azione: "Preventivo smoke test",
    tipo: "preventivo",
    azione_tipo: "creato",
    entita_id: preventivo.id,
    entita_label: preventivo.numero,
  });

  if (auditError && !auditError.message.includes("Could not find the table")) {
    fail(`audit log: ${auditError.message}`);
  } else if (!auditError) {
    ok("Audit log registrato");
  }

  const { error: timelineError } = await supabase.from("cliente_timeline_eventi").insert({
    cliente_id: cliente.id,
    tipo: "preventivo_creato",
    titolo: `Preventivo ${preventivo.numero}`,
    descrizione: "Smoke test Sprint 2",
    utente: "Smoke Test",
  });

  if (timelineError && !timelineError.message.includes("Could not find the table")) {
    fail(`cliente timeline: ${timelineError.message}`);
  } else if (!timelineError) {
    ok("Timeline cliente registrata");
  }

  const { error: notificaError } = await supabase.from("notifiche").insert({
    tipo: "preventivo_creato",
    titolo: `Preventivo ${preventivo.numero}`,
    messaggio: "Smoke test notifica",
    href: `/preventivi/${preventivo.id}`,
    letta: false,
  });

  if (notificaError && !notificaError.message.includes("Could not find the table")) {
    fail(`notifica: ${notificaError.message}`);
  } else if (!notificaError) {
    ok("Notifica registrata");
  }

  await supabase.from("tours").delete().eq("id", tour.id);
  await supabase.from("clienti").delete().eq("id", cliente.id);
  ok("Cleanup completato");

  console.log("\n✅ Flusso Preventivi smoke test completato con successo.");
}

main().catch((error) => fail(error.message));
