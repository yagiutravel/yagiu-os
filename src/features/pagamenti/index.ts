/** Modulo Pagamenti — API pubblica del dominio pagamenti. */
export * from "@/types/pagamento";

export {
  getPagamentiByTourId,
  createPagamento,
  updatePagamento,
  deletePagamento,
} from "@/services/pagamento.service";
