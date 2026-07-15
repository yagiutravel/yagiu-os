export {
  createPreventivo,
  updatePreventivo,
  deletePreventivo,
  duplicatePreventivo,
  convertPreventivoToIscrizione,
  getPreventivoById,
  listPreventivi,
  countPreventiviInAttesa,
} from "@/services/preventivo.service";
export type {
  Preventivo,
  PreventivoListItem,
  PreventivoRiga,
  StatoPreventivo,
} from "@/types/preventivo";
