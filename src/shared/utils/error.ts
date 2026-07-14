const DEFAULT_ERROR_MESSAGE = "Si è verificato un errore imprevisto.";

export function getErrorMessage(
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): string {
  if (error instanceof Error) return error.message;
  return fallback;
}
