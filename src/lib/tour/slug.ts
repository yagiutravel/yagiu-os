export function slugifyTourName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildTourSlug(name: string, suffix?: string): string {
  const base = slugifyTourName(name) || "tour";
  if (!suffix) return base;
  return `${base}-${suffix}`;
}

export async function ensureUniqueTourSlug(
  baseSlug: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!(await exists(baseSlug))) return baseSlug;

  for (let index = 2; index <= 99; index += 1) {
    const candidate = `${baseSlug}-${index}`;
    if (!(await exists(candidate))) return candidate;
  }

  return `${baseSlug}-${Date.now()}`;
}
