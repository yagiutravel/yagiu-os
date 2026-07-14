import type { Tour, CreateTourInput } from "@/types/tour";

const PREZZI_SEED: Record<string, string> = {
  "tour-1": "€ 3.200",
  "tour-2": "€ 2.450",
  "tour-3": "€ 2.890",
  "tour-4": "€ 1.980",
  "tour-5": "€ 1.150",
  "tour-6": "€ 2.750",
  "tour-7": "€ 2.100",
  "tour-8": "€ 4.500",
};

const DESCRIZIONI_SEED: Record<string, string> = {
  "tour-1":
    "Tour culturale di 12 giorni tra le città iconiche del Giappone, con guide locali e esperienze gastronomiche.",
  "tour-2":
    "Viaggio balinese tra templi, risaie e spiagge, con soggiorno in resort boutique selezionati.",
  "tour-3":
    "Trekking guidato nell'Annapurna region con pernottamenti in lodge e supporto portatori locale.",
  "tour-4":
    "Percorso tra medina, deserto del Sahara e città imperiali, con notte in campo tendato.",
  "tour-5":
    "Retreat di yoga e benessere in Toscana, con lezioni quotidiane e cucina biologica.",
  "tour-6":
    "Avventura in altitudine tra Cusco, Valle Sacra e Machu Picchu con acclimatamento graduale.",
  "tour-7":
    "Tour invernale alla ricerca dell'aurora boreale, con escursioni su ghiacciai e sorgenti termali.",
  "tour-8":
    "Safari fotografico in Kenya e Tanzania con estensione balneare a Zanzibar.",
};

const SEED_TOURS: Array<
  Omit<Tour, "prezzo" | "descrizione" | "creatoIl" | "aggiornatoIl">
> = [
  {
    id: "tour-1",
    nomeTour: "Tour del Giappone — Primavera 2026",
    destinazione: "Tokyo, Kyoto, Osaka",
    dataPartenza: "2026-04-12",
    dataRitorno: "2026-04-24",
    stato: "In vendita",
    numeroPartecipanti: 8,
    capienzaMassima: 14,
    tourLeader: "Marco Bianchi",
  },
  {
    id: "tour-2",
    nomeTour: "Bali Esotica 2026",
    destinazione: "Ubud, Seminyak, Gili Islands",
    dataPartenza: "2026-05-03",
    dataRitorno: "2026-05-15",
    stato: "Completo",
    numeroPartecipanti: 16,
    capienzaMassima: 16,
    tourLeader: "Elena Rossi",
  },
  {
    id: "tour-3",
    nomeTour: "Trekking Himalaya",
    destinazione: "Kathmandu, Annapurna",
    dataPartenza: "2026-03-18",
    dataRitorno: "2026-03-30",
    stato: "In corso",
    numeroPartecipanti: 10,
    capienzaMassima: 12,
    tourLeader: "Alessandro Verdi",
  },
  {
    id: "tour-4",
    nomeTour: "Magia del Marocco",
    destinazione: "Marrakech, Sahara, Fès",
    dataPartenza: "2025-11-05",
    dataRitorno: "2025-11-14",
    stato: "Terminato",
    numeroPartecipanti: 14,
    capienzaMassima: 14,
    tourLeader: "Giulia Neri",
  },
  {
    id: "tour-5",
    nomeTour: "Yoga Retreat Toscana",
    destinazione: "Val d'Orcia, Siena",
    dataPartenza: "2026-06-10",
    dataRitorno: "2026-06-17",
    stato: "In vendita",
    numeroPartecipanti: 5,
    capienzaMassima: 20,
    tourLeader: "Sara Lombardi",
  },
  {
    id: "tour-6",
    nomeTour: "Avventura in Perù",
    destinazione: "Cusco, Machu Picchu, Lima",
    dataPartenza: "2026-09-01",
    dataRitorno: "2026-09-14",
    stato: "In vendita",
    numeroPartecipanti: 9,
    capienzaMassima: 15,
    tourLeader: "Marco Bianchi",
  },
  {
    id: "tour-7",
    nomeTour: "Islanda Aurora Boreale",
    destinazione: "Reykjavik, Golden Circle",
    dataPartenza: "2025-12-01",
    dataRitorno: "2025-12-08",
    stato: "Terminato",
    numeroPartecipanti: 12,
    capienzaMassima: 12,
    tourLeader: "Paolo Colombo",
  },
  {
    id: "tour-8",
    nomeTour: "Safari Kenya & Tanzania",
    destinazione: "Nairobi, Serengeti, Zanzibar",
    dataPartenza: "2026-07-20",
    dataRitorno: "2026-08-02",
    stato: "Completo",
    numeroPartecipanti: 18,
    capienzaMassima: 18,
    tourLeader: "Elena Rossi",
  },
];

const toursStore: Tour[] = [];
let seeded = false;

function timestamp(): string {
  return new Date().toISOString();
}

function seedTours(): void {
  if (seeded) return;
  const now = timestamp();

  for (const tour of SEED_TOURS) {
    toursStore.push({
      ...tour,
      prezzo: PREZZI_SEED[tour.id] ?? "€ —",
      descrizione: DESCRIZIONI_SEED[tour.id] ?? "",
      creatoIl: now,
      aggiornatoIl: now,
    });
  }

  seeded = true;
}

function ensureSeeded(): void {
  seedTours();
}

export function listToursMock(): Tour[] {
  ensureSeeded();
  return toursStore.map((tour) => ({ ...tour }));
}

export function findTourByIdMock(id: string): Tour | null {
  ensureSeeded();
  const tour = toursStore.find((item) => item.id === id);
  return tour ? { ...tour } : null;
}

export function insertTourMock(tour: Tour): Tour {
  ensureSeeded();
  toursStore.unshift(tour);
  return { ...tour };
}

export function updateTourMock(id: string, patch: Partial<Tour>): Tour | null {
  ensureSeeded();
  const index = toursStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: Tour = {
    ...toursStore[index],
    ...patch,
    id: toursStore[index].id,
    aggiornatoIl: timestamp(),
  };
  toursStore[index] = updated;
  return { ...updated };
}

export function deleteTourMock(id: string): boolean {
  ensureSeeded();
  const index = toursStore.findIndex((item) => item.id === id);
  if (index === -1) return false;
  toursStore.splice(index, 1);
  return true;
}

export function createTourSeedRecord(input: CreateTourInput): Tour {
  const now = timestamp();
  return {
    id: `tour-${crypto.randomUUID()}`,
    nomeTour: input.nomeTour.trim(),
    destinazione: input.destinazione.trim(),
    dataPartenza: input.dataPartenza,
    dataRitorno: input.dataRitorno,
    stato: input.stato,
    numeroPartecipanti: 0,
    capienzaMassima: input.capienzaMassima,
    tourLeader: input.tourLeader.trim(),
    prezzo: input.prezzo.trim(),
    descrizione: input.descrizione.trim(),
    creatoIl: now,
    aggiornatoIl: now,
  };
}
