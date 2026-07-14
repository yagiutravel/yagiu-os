import {
  buildGlobalSearchIndex,
  searchGlobalIndex,
} from "@/mappers/global-search.mapper";
import type {
  GlobalSearchIndex,
  GlobalSearchResponse,
} from "@/types/global-search";

let cachedIndex: GlobalSearchIndex | null = null;

export class GlobalSearchServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GlobalSearchServiceError";
  }
}

export async function getGlobalSearchIndex(): Promise<GlobalSearchIndex> {
  if (!cachedIndex) {
    cachedIndex = await buildGlobalSearchIndex();
  }
  return cachedIndex;
}

export async function searchGlobal(query: string): Promise<GlobalSearchResponse> {
  const index = await getGlobalSearchIndex();
  return searchGlobalIndex(index, query);
}

export function invalidateGlobalSearchIndex(): void {
  cachedIndex = null;
}
