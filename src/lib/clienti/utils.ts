import type { Cliente, ClienteFilters } from "@/types/cliente";
import { PAGE_SIZE } from "./constants";

export function filterClienti(clienti: Cliente[], filters: ClienteFilters): Cliente[] {
  const query = filters.search.toLowerCase().trim();

  return clienti.filter((cliente) => {
    const matchesStato =
      filters.stato === "tutti" || cliente.stato === filters.stato;

    const matchesSearch =
      !query ||
      cliente.nome.toLowerCase().includes(query) ||
      cliente.email.toLowerCase().includes(query) ||
      cliente.azienda.toLowerCase().includes(query);

    return matchesStato && matchesSearch;
  });
}

export function sortClienti(clienti: Cliente[], filters: ClienteFilters): Cliente[] {
  const sorted = [...clienti];

  sorted.sort((a, b) => {
    let comparison = 0;

    if (filters.sortField === "nome") {
      comparison = a.nome.localeCompare(b.nome, "it");
    } else {
      comparison = new Date(a.creatoIl).getTime() - new Date(b.creatoIl).getTime();
    }

    return filters.sortDirection === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function paginateClienti<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    totalItems,
    totalPages,
    currentPage: safePage,
    pageSize,
  };
}

export function processClienti(clienti: Cliente[], filters: ClienteFilters) {
  const filtered = filterClienti(clienti, filters);
  const sorted = sortClienti(filtered, filters);
  return paginateClienti(sorted, filters.page);
}

export function clienteToForm(cliente: Cliente) {
  return {
    nome: cliente.nome,
    email: cliente.email === "—" ? "" : cliente.email,
    telefono: cliente.telefono === "—" ? "" : cliente.telefono,
    azienda: cliente.azienda === "—" ? "" : cliente.azienda,
    stato: cliente.stato,
  };
}
