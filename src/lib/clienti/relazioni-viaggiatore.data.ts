import type { RelazioniViaggiatore } from "@/types/relazioni-viaggiatore";

export function getRelazioniViaggiatorePlaceholder(
  clienteId: string,
): RelazioniViaggiatore {
  return {
    tourLeader: {
      id: `${clienteId}-rl-tl`,
      nome: "Marco Bianchi",
      viaggiInsieme: 4,
    },
    guidaLocale: {
      id: `${clienteId}-rl-gl`,
      nome: "Yuki Tanaka",
      viaggiInsieme: 1,
    },
    driver: {
      id: `${clienteId}-rl-dr`,
      nome: "Alessandro Rossi",
      viaggiInsieme: 2,
    },
    compagnoCamera: {
      id: `${clienteId}-rl-cc`,
      nome: "Laura Verdi",
      viaggiInsieme: 1,
    },
    haViaggiatoCon: [
      {
        id: `${clienteId}-rl-hv-1`,
        nome: "Giulia Neri",
        viaggiInsieme: 3,
      },
      {
        id: `${clienteId}-rl-hv-2`,
        nome: "Paolo Colombo",
        viaggiInsieme: 1,
      },
      {
        id: `${clienteId}-rl-hv-3`,
        nome: "Elena Fontana",
        viaggiInsieme: 2,
      },
    ],
  };
}

export function formatViaggiInsieme(count: number): string {
  if (count === 1) return "1 viaggio";
  return `${count} viaggi insieme`;
}
