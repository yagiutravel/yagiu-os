export type SupabaseLikeError = {
  message: string;
  code?: string;
};

export function isMissingTableError(error: SupabaseLikeError): boolean {
  return (
    error.code === "PGRST205" ||
    error.message.includes("Could not find the table")
  );
}

export class MissingSupabaseTableError extends Error {
  readonly service: string;
  readonly table: string;
  readonly operation: string;

  constructor(
    service: string,
    table: string,
    operation: string,
    error: SupabaseLikeError,
  ) {
    const codeSuffix = error.code ? ` (${error.code})` : "";
    super(
      `[${service}] Tabella "${table}" non disponibile in produzione (${operation}): ${error.message}${codeSuffix}`,
    );
    this.name = "MissingSupabaseTableError";
    this.service = service;
    this.table = table;
    this.operation = operation;
  }
}

/**
 * Dev/staging: warning console e no-op (ritorna true).
 * Produzione: log errore e throw (fail loud).
 */
export function isDevMissingTableNoOp(
  service: string,
  table: string,
  operation: string,
  error: SupabaseLikeError,
): boolean {
  if (!isMissingTableError(error)) return false;

  if (process.env.NODE_ENV === "production") {
    console.error(
      `[${service}] Tabella "${table}" assente in produzione (${operation})`,
      error,
    );
    throw new MissingSupabaseTableError(service, table, operation, error);
  }

  console.warn(
    `[${service}] Tabella "${table}" non disponibile (${operation}). Verifica le migration Supabase.`,
  );
  return true;
}
