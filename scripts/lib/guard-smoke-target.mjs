/**
 * Impedisce l'esecuzione degli smoke test sul database di produzione per default.
 *
 * Override espliciti (solo ambienti controllati):
 *   SMOKE_ALLOW_PRODUCTION=true
 *
 * Blocco per etichetta ambiente:
 *   YAGIU_SUPABASE_ENV=production|prod
 *
 * Blocco per project ref nell'URL Supabase:
 *   SMOKE_BLOCKED_PROJECT_REFS=ref1,ref2
 */
function isTruthy(value) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function assertSmokeTargetAllowed(env = process.env) {
  if (isTruthy(env.SMOKE_ALLOW_PRODUCTION)) {
    return;
  }

  const envLabel = (env.YAGIU_SUPABASE_ENV ?? env.SMOKE_TARGET ?? "")
    .trim()
    .toLowerCase();

  if (envLabel === "production" || envLabel === "prod") {
    throw new Error(
      "Smoke test bloccato: YAGIU_SUPABASE_ENV indica produzione. " +
        "Usa un database staging/local oppure imposta SMOKE_ALLOW_PRODUCTION=true " +
        "solo in un ambiente controllato.",
    );
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const blockedRefs = (env.SMOKE_BLOCKED_PROJECT_REFS ?? "")
    .split(",")
    .map((ref) => ref.trim())
    .filter(Boolean);

  for (const ref of blockedRefs) {
    if (url.includes(ref)) {
      throw new Error(
        `Smoke test bloccato sul progetto Supabase «${ref}». ` +
          "Configura .env.local su staging/dev oppure imposta SMOKE_ALLOW_PRODUCTION=true.",
      );
    }
  }
}
