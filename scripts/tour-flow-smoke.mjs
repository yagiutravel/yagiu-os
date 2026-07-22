/**
 * Smoke test end-to-end del flusso Tour su Supabase.
 * Usage: node --env-file=.env.local scripts/tour-flow-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { assertSmokeTargetAllowed } from "./lib/guard-smoke-target.mjs";
import { cleanupSmokeRecords } from "./lib/smoke-cleanup.mjs";
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
  assertSmokeTargetAllowed();

  if (!url || !anonKey) {
    fail("Variabili Supabase mancanti in .env.local");
  }

  const supabase = createClient(url, anonKey);
  await signInTestUser(supabase);
  ok("Sessione test autenticata");

  const created = {
    tourId: null,
    clienteId: null,
  };

  try {
  const { error: toursProbeError } = await supabase
    .from("tours")
    .select("id")
    .limit(1);

  if (
    toursProbeError &&
    (toursProbeError.code === "PGRST205" ||
      toursProbeError.message.includes("Could not find the table"))
  ) {
    fail(
      "Tabelle tour non trovate. Esegui prima le migration:\n" +
        "  1. SQL Editor: supabase/migrations/*.sql\n" +
        "  2. Oppure: npm run supabase:apply-migrations (con SUPABASE_DB_URL)",
    );
  }

  const suffix = Date.now();
  const tourSlug = `smoke-tour-${suffix}`;

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert({
      organization_id: organizationId,
      nome: `Smoke Tour ${suffix}`,
      slug: tourSlug,
      destinazione: "Test City",
      data_partenza: "2026-09-01",
      data_ritorno: "2026-09-08",
      capienza_massima: 20,
      prezzo_cents: 320000,
      stato: "in_vendita",
    })
    .select("id, nome")
    .single();

  if (tourError) fail(`create tour: ${tourError.message}`);
  created.tourId = tour.id;
  ok(`Tour creato (${tour.id})`);

  const { data: hotel, error: hotelError } = await supabase
    .from("tour_hotels")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      nome: "Hotel Smoke",
      citta: "Test City",
    })
    .select("id")
    .single();

  if (hotelError) fail(`create hotel: ${hotelError.message}`);
  ok(`Hotel creato (${hotel.id})`);

  const { data: room, error: roomError } = await supabase
    .from("tour_rooms")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      hotel_id: hotel.id,
      numero: "101",
      tipologia: "doppia",
      capienza: 2,
    })
    .select("id")
    .single();

  if (roomError) fail(`create room: ${roomError.message}`);
  ok(`Camera creata (${room.id})`);

  const clienteId = randomUUID();
  const { data: cliente, error: clienteError } = await supabase
    .from("clienti")
    .insert({
      id: clienteId,
      organization_id: organizationId,
      nome: `Smoke Cliente ${suffix}`,
      email: `smoke-${suffix}@example.com`,
      stato: "Attivo",
    })
    .select("id, nome")
    .single();

  if (clienteError) fail(`create cliente: ${clienteError.message}`);
  created.clienteId = cliente.id;
  ok(`Cliente creato (${cliente.id})`);

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
  ok(`Partecipante creato (${participant.id})`);

  const { error: assignmentError } = await supabase.from("room_assignments").insert({
    organization_id: organizationId,
    room_id: room.id,
    participant_id: participant.id,
  });

  if (assignmentError) fail(`room assignment: ${assignmentError.message}`);
  ok("Rooming assegnata");

  const { error: paymentError } = await supabase.from("tour_payments").insert({
    organization_id: organizationId,
    tour_id: tour.id,
    participant_id: participant.id,
    importo_cents: 96000,
    data: "2026-07-01",
    metodo: "bonifico",
    tipo: "acconto",
  });

  if (paymentError) fail(`create payment: ${paymentError.message}`);
  ok("Pagamento registrato");

  const { data: templates, error: templateError } = await supabase
    .from("tour_checklist_templates")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      codice: "smoke_test",
      etichetta: "Smoke checklist",
      ordine: 1,
    })
    .select("id")
    .single();

  if (templateError) fail(`create checklist template: ${templateError.message}`);

  const { error: completionError } = await supabase
    .from("tour_checklist_completions")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      template_id: templates.id,
      participant_id: participant.id,
      completato: true,
      completato_il: new Date().toISOString(),
    });

  if (completionError) fail(`checklist completion: ${completionError.message}`);
  ok("Checklist completata");

  const { error: documentError } = await supabase.from("tour_documents").insert({
    organization_id: organizationId,
    tour_id: tour.id,
    nome: "contratto-smoke.pdf",
    categoria: "contratto",
    storage_path: `${organizationId}/${tour.id}/smoke.pdf`,
    mime_type: "application/pdf",
    dimensione_bytes: 1024,
  });

  if (documentError) fail(`create document: ${documentError.message}`);
  ok("Documento metadata salvato");

  const { error: timelineError } = await supabase.from("tour_timeline_events").insert({
    organization_id: organizationId,
    tour_id: tour.id,
    tipo: "prenotazione",
    titolo: "Smoke test",
    descrizione: "Evento timeline di verifica",
  });

  if (timelineError) fail(`timeline event: ${timelineError.message}`);
  ok("Timeline event registrato");

  const { data: programDay, error: programDayError } = await supabase
    .from("tour_program_days")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      giorno_numero: 1,
      data: "2026-09-01",
      titolo: "Giorno 1",
      hotel_id: hotel.id,
    })
    .select("id")
    .single();

  if (programDayError) fail(`create program day: ${programDayError.message}`);
  ok(`Giorno programma creato (${programDay.id})`);

  const { data: activity, error: activityError } = await supabase
    .from("tour_program_activities")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      day_id: programDay.id,
      titolo: "Visita centro storico",
      tipo: "visita",
      luogo: "Test City",
    })
    .select("id")
    .single();

  if (activityError) fail(`create activity: ${activityError.message}`);
  ok(`Attività creata (${activity.id})`);

  const { data: flight, error: flightError } = await supabase
    .from("tour_flights")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      day_id: programDay.id,
      direzione: "andata",
      numero_volo: "AZ123",
      aeroporto_partenza: "FCO",
      aeroporto_arrivo: "TST",
      data_partenza: "2026-09-01",
    })
    .select("id")
    .single();

  if (flightError) fail(`create flight: ${flightError.message}`);
  ok(`Volo creato (${flight.id})`);

  const { data: transfer, error: transferError } = await supabase
    .from("tour_transfers")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      day_id: programDay.id,
      tipo: "bus",
      partenza: "Aeroporto",
      destinazione: "Hotel",
      data: "2026-09-01",
    })
    .select("id")
    .single();

  if (transferError) fail(`create transfer: ${transferError.message}`);
  ok(`Transfer creato (${transfer.id})`);

  const { data: insurance, error: insuranceError } = await supabase
    .from("tour_insurances")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      fornitore: "Smoke Insurance",
      stato: "da_emettere",
      premio_cents: 4500,
    })
    .select("id")
    .single();

  if (insuranceError) fail(`create insurance: ${insuranceError.message}`);
  ok(`Assicurazione creata (${insurance.id})`);

  const { error: logisticaTimelineError } = await supabase
    .from("tour_timeline_events")
    .insert({
      organization_id: organizationId,
      tour_id: tour.id,
      tipo: "programma_giorno",
      titolo: "Smoke programma",
      descrizione: "Verifica timeline Sprint 1B",
    });

  if (logisticaTimelineError) {
    fail(`timeline 1B event: ${logisticaTimelineError.message}`);
  }
  ok("Timeline Sprint 1B verificata");

  const { data: reloadTour, error: reloadError } = await supabase
    .from("tours")
    .select("id")
    .eq("id", tour.id)
    .single();

  if (reloadError || !reloadTour) fail(`reload tour: ${reloadError?.message}`);
  ok("Refresh/persistenza verificata");

    console.log("\n✅ Flusso Tour smoke test completato con successo.");
  } finally {
    await cleanupSmokeRecords(supabase, {
      tourIds: created.tourId ? [created.tourId] : [],
      clienteIds: created.clienteId ? [created.clienteId] : [],
    });
    ok("Cleanup completato");
    await signOutTestUser(supabase);
  }
}

main().catch((error) => fail(error.message));
