import type {
  GlobalSearchCategoria,
  GlobalSearchIndexEntry,
} from "@/types/global-search";

export function createSearchEntry(
  categoria: GlobalSearchCategoria,
  id: string,
  titolo: string,
  sottotitolo: string,
  href: string,
  keywords: string[] = [],
): GlobalSearchIndexEntry {
  return {
    id: `${categoria}-${id}`,
    categoria,
    titolo,
    sottotitolo,
    href,
    keywords: [titolo, sottotitolo, ...keywords].map((item) =>
      item.toLowerCase(),
    ),
  };
}

export function matchesSearchQuery(
  entry: GlobalSearchIndexEntry,
  query: string,
): boolean {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return false;

  return entry.keywords.some((keyword) => keyword.includes(normalized));
}
