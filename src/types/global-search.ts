export type GlobalSearchCategoria =
  | "clienti"
  | "tour"
  | "pagamenti"
  | "camere"
  | "documenti"
  | "questionari"
  | "timeline"
  | "dashboard";

export type GlobalSearchIndexEntry = {
  id: string;
  categoria: GlobalSearchCategoria;
  titolo: string;
  sottotitolo: string;
  href: string;
  keywords: string[];
};

export type GlobalSearchIndex = GlobalSearchIndexEntry[];

export type GlobalSearchGroup = {
  categoria: GlobalSearchCategoria;
  label: string;
  risultati: GlobalSearchIndexEntry[];
};

export type GlobalSearchResponse = {
  query: string;
  gruppi: GlobalSearchGroup[];
  totale: number;
};
