import type { RelazionePersona, RelazioniViaggiatore } from "@/types/relazioni-viaggiatore";

export function formatViaggiInsieme(count: number): string {
  if (count === 1) return "1 viaggio";
  return `${count} viaggi insieme`;
}

export const EMPTY_RELAZIONE_PERSONA: RelazionePersona = {
  id: "—",
  nome: "—",
  viaggiInsieme: 0,
};

export const EMPTY_RELAZIONI: RelazioniViaggiatore = {
  tourLeader: EMPTY_RELAZIONE_PERSONA,
  guidaLocale: EMPTY_RELAZIONE_PERSONA,
  driver: EMPTY_RELAZIONE_PERSONA,
  compagnoCamera: EMPTY_RELAZIONE_PERSONA,
  haViaggiatoCon: [],
};
