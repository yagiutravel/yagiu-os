/**
 * Smoke test end-to-end del questionario cliente su Supabase.
 * Usage: node --env-file=.env.local scripts/questionario-flow-smoke.mjs
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
    .from("cliente_questionari")
    .select("id")
    .limit(1);

  if (
    probeError &&
    (probeError.code === "PGRST205" ||
      probeError.message.includes("Could not find the table"))
  ) {
    fail(
      "Tabella cliente_questionari non trovata. Esegui prima:\n" +
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
      nome: `Smoke Cliente Questionario ${suffix}`,
      email: `questionario-${suffix}@example.com`,
      stato: "Attivo",
    })
    .select("id")
    .single();

  if (clienteError) fail(`create cliente: ${clienteError.message}`);
  ok(`Cliente creato (${cliente.id})`);

  const { data: questionario, error: questionarioError } = await supabase
    .from("cliente_questionari")
    .insert({
      cliente_id: cliente.id,
      allergie: "Arachidi",
      intolleranze: "Lattosio",
      farmaci: "Nessuno",
      contatto_emergenza: "Mario Rossi",
      numero_emergenza: "+39 333 000 0000",
      taglia_maglietta: "M",
      taglia_felpa: "L",
      camera_preferita: "Singola",
      compagno_richiesto: "",
      note_alimentari: "Senza glutine preferito",
      vegetariano: false,
      vegano: false,
      celiaco: true,
      fumatore: false,
    })
    .select("id, cliente_id, celiaco")
    .single();

  if (questionarioError) {
    fail(`create questionario: ${questionarioError.message}`);
  }
  ok(`Questionario creato (${questionario.id})`);

  const { data: loaded, error: loadError } = await supabase
    .from("cliente_questionari")
    .select("*")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (loadError) fail(`get questionario: ${loadError.message}`);
  if (!loaded) fail("get questionario: record non trovato");
  if (loaded.allergie !== "Arachidi" || !loaded.celiaco) {
    fail("get questionario: dati non corrispondono");
  }
  ok("Lettura questionario per cliente verificata");

  const { error: updateError } = await supabase
    .from("cliente_questionari")
    .update({
      allergie: "Nessuna",
      vegetariano: true,
      note_alimentari: "Aggiornamento smoke test",
    })
    .eq("id", questionario.id);

  if (updateError) fail(`update questionario: ${updateError.message}`);
  ok("Aggiornamento questionario verificato");

  const { data: refreshed, error: refreshError } = await supabase
    .from("cliente_questionari")
    .select("allergie, vegetariano, note_alimentari")
    .eq("id", questionario.id)
    .single();

  if (refreshError) fail(`refresh questionario: ${refreshError.message}`);
  if (
    refreshed.allergie !== "Nessuna" ||
    !refreshed.vegetariano ||
    refreshed.note_alimentari !== "Aggiornamento smoke test"
  ) {
    fail("refresh questionario: persistenza non verificata");
  }
  ok("Persistenza questionario verificata");

  const { data: list, error: listError } = await supabase
    .from("cliente_questionari")
    .select("id")
    .eq("cliente_id", cliente.id);

  if (listError) fail(`list questionari: ${listError.message}`);
  if ((list ?? []).length !== 1) {
    fail("list questionari: conteggio inatteso");
  }
  ok("Lista questionari verificata");

  await supabase.from("clienti").delete().eq("id", cliente.id);
  await signOutTestUser(supabase);
  ok("Cleanup completato");

  console.log("\n✅ Flusso Questionario smoke test completato con successo.");
}

main().catch((error) => fail(error.message));
