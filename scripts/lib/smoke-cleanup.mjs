/**
 * Cleanup smoke test rispettando le foreign key:
 * preventivi → tours (cascade partecipanti) → clienti (cascade figli cliente).
 */

function formatCleanupError(step, error) {
  return `${step}: ${error?.message ?? "errore sconosciuto"}`;
}

export async function assertDelete(step, result) {
  if (result.error) {
    throw new Error(formatCleanupError(step, result.error));
  }
}

export async function cleanupSmokeRecords(
  supabase,
  {
    preventivoIds = [],
    tourIds = [],
    clienteIds = [],
  } = {},
) {
  for (const preventivoId of preventivoIds) {
    await assertDelete(
      `cleanup preventivo ${preventivoId}`,
      await supabase.from("preventivi").delete().eq("id", preventivoId),
    );
  }

  for (const tourId of tourIds) {
    await assertDelete(
      `cleanup tour ${tourId}`,
      await supabase.from("tours").delete().eq("id", tourId),
    );
  }

  for (const clienteId of clienteIds) {
    await assertDelete(
      `cleanup cliente ${clienteId}`,
      await supabase.from("clienti").delete().eq("id", clienteId),
    );
  }
}

export async function cleanupSmokeEmailTemplate(supabase, templateId) {
  if (!templateId) return;
  await assertDelete(
    `cleanup email template ${templateId}`,
    await supabase.from("email_templates").delete().eq("id", templateId),
  );
}
