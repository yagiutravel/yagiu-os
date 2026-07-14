import type { DomainSnapshot } from "@/domain/types/snapshot";
import type {
  DocumentMissing,
  PaymentOutstanding,
} from "@/domain/types/analytics";
import {
  DOMAIN_IMPORTO_ACCONTO_MEDIO,
  DOMAIN_IMPORTO_SALDO_MEDIO,
  DOMAIN_MOCK_ASSICURAZIONI_MANCANTI,
  DOMAIN_MOCK_LIBERATORIE_MANCANTI,
} from "@/domain/constants";
import type { PartecipazioneTour } from "@/types/tour-partecipazione";

export function getAllPartecipazioni(
  snapshot: DomainSnapshot,
): PartecipazioneTour[] {
  return snapshot.allPartecipazioni;
}

export function getOutstandingPayments(
  snapshot: DomainSnapshot,
): PaymentOutstanding[] {
  return snapshot.allPartecipazioni
    .filter(
      (item) =>
        item.pagamento === "Non iniziato" ||
        item.pagamento === "Acconto ricevuto",
    )
    .map((item) => ({
      partecipazioneId: item.id,
      clienteId: item.clienteId,
      tourId: item.tourId,
      tipo: item.pagamento === "Non iniziato" ? "acconto" : "saldo",
      pagamento: item.pagamento,
    }));
}

export function getUnpaidBalances(snapshot: DomainSnapshot): PartecipazioneTour[] {
  return snapshot.allPartecipazioni.filter(
    (item) => item.pagamento === "Acconto ricevuto",
  );
}

export function getMissingDeposits(snapshot: DomainSnapshot): PartecipazioneTour[] {
  return snapshot.allPartecipazioni.filter(
    (item) => item.pagamento === "Non iniziato",
  );
}

export function getOutstandingPaymentTotals(snapshot: DomainSnapshot) {
  const acconti = getMissingDeposits(snapshot).length;
  const saldi = getUnpaidBalances(snapshot).length;

  return {
    accontiMancanti: acconti,
    saldiMancanti: saldi,
    importoTotaleDaIncassare:
      acconti * DOMAIN_IMPORTO_ACCONTO_MEDIO +
      saldi * DOMAIN_IMPORTO_SALDO_MEDIO,
  };
}

export function getClientsWithoutDocuments(
  snapshot: DomainSnapshot,
): PartecipazioneTour[] {
  return snapshot.allPartecipazioni.filter(
    (item) => item.documenti === "Da inviare",
  );
}

export function getMissingQuestionnaires(
  snapshot: DomainSnapshot,
): PartecipazioneTour[] {
  return snapshot.allPartecipazioni.filter(
    (item) => item.questionario === "Da compilare",
  );
}

export function getMissingDocuments(
  snapshot: DomainSnapshot,
): DocumentMissing[] {
  const fromPartecipazioni = snapshot.allPartecipazioni.flatMap((item) => {
    const missing: DocumentMissing[] = [];

    if (item.documenti === "Da inviare") {
      missing.push({
        partecipazioneId: item.id,
        clienteId: item.clienteId,
        tourId: item.tourId,
        tipo: "passaporto",
        stato: item.documenti,
      });
    }

    if (item.questionario === "Da compilare") {
      missing.push({
        partecipazioneId: item.id,
        clienteId: item.clienteId,
        tourId: item.tourId,
        tipo: "questionario",
        stato: item.questionario,
      });
    }

    return missing;
  });

  return fromPartecipazioni;
}

export function getDocumentCounts(snapshot: DomainSnapshot) {
  return {
    passaportiMancanti: getClientsWithoutDocuments(snapshot).length,
    questionariMancanti: getMissingQuestionnaires(snapshot).length,
    assicurazioniMancanti: DOMAIN_MOCK_ASSICURAZIONI_MANCANTI,
    liberatorieMancanti: DOMAIN_MOCK_LIBERATORIE_MANCANTI,
  };
}

export function getPartecipazioneById(
  snapshot: DomainSnapshot,
  partecipazioneId: string,
): PartecipazioneTour | undefined {
  return snapshot.allPartecipazioni.find((item) => item.id === partecipazioneId);
}
