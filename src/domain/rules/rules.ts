import type { DomainRule } from "./types";
import type { OperationalAlert } from "@/domain/types/alerts";
import { DOMAIN_TOUR_DEPARTING_SOON_DAYS } from "@/domain/constants";
import { daysUntil } from "@/domain/helpers/date";
import { isTourActive } from "@/domain/helpers/tour";
import {
  getIncompleteCamere,
  getTourWithMostIncompleteRooms,
} from "@/domain/selectors/camera.selectors";
import {
  getClientsWithoutDocuments,
  getMissingQuestionnaires,
  getUnpaidBalances,
} from "@/domain/selectors/partecipazione.selectors";
import { getNewClients } from "@/domain/selectors/cliente.selectors";

export const RULE_TOUR_DEPARTING_SOON: DomainRule = {
  id: "tour-departing-soon",
  description: "Tour in partenza entro 7 giorni",
  evaluate(snapshot, { now }) {
    const alerts: OperationalAlert[] = [];

    for (const tour of snapshot.tours.filter(isTourActive)) {
      const giorni = daysUntil(tour.dataPartenza, now);
      if (giorni >= 0 && giorni <= DOMAIN_TOUR_DEPARTING_SOON_DAYS) {
        alerts.push({
          id: `rule-tour-soon-${tour.id}`,
          ruleId: "tour-departing-soon",
          severity: giorni <= 1 ? "critical" : "info",
          entityType: "tour",
          entityId: tour.id,
          message: `Tour "${tour.nomeTour}" parte ${
            giorni === 0 ? "oggi" : giorni === 1 ? "domani" : `tra ${giorni} giorni`
          }`,
          tourId: tour.id,
          metadata: { giorniMancanti: giorni },
        });
      }
    }

    return alerts;
  },
};

export const RULE_MISSING_PASSPORT: DomainRule = {
  id: "missing-passport",
  description: "Passaporto mancante per partecipante",
  evaluate(snapshot) {
    return getClientsWithoutDocuments(snapshot).map((item) => ({
      id: `rule-pass-${item.id}`,
      ruleId: "missing-passport",
      severity: "warning",
      entityType: "documento",
      entityId: item.id,
      message: `Passaporto mancante per partecipante ${item.clienteId}`,
      tourId: item.tourId,
      clienteId: item.clienteId,
      metadata: { documenti: item.documenti },
    }));
  },
};

export const RULE_MISSING_QUESTIONNAIRE: DomainRule = {
  id: "missing-questionnaire",
  description: "Questionario non compilato",
  evaluate(snapshot) {
    return getMissingQuestionnaires(snapshot).map((item) => ({
      id: `rule-quest-${item.id}`,
      ruleId: "missing-questionnaire",
      severity: "warning",
      entityType: "documento",
      entityId: item.id,
      message: `Questionario da compilare per partecipante ${item.clienteId}`,
      tourId: item.tourId,
      clienteId: item.clienteId,
      metadata: { questionario: item.questionario },
    }));
  },
};

export const RULE_UNPAID_BALANCE: DomainRule = {
  id: "unpaid-balance",
  description: "Saldo mancante",
  evaluate(snapshot) {
    return getUnpaidBalances(snapshot).map((item) => ({
      id: `rule-saldo-${item.id}`,
      ruleId: "unpaid-balance",
      severity: "critical",
      entityType: "pagamento",
      entityId: item.id,
      message: `Saldo da ricevere per partecipante ${item.clienteId}`,
      tourId: item.tourId,
      clienteId: item.clienteId,
      metadata: { pagamento: item.pagamento },
    }));
  },
};

export const RULE_INCOMPLETE_ROOM: DomainRule = {
  id: "incomplete-room",
  description: "Camera incompleta nella rooming list",
  evaluate(snapshot) {
    return getIncompleteCamere(snapshot).map((camera) => ({
      id: `rule-room-${camera.id}`,
      ruleId: "incomplete-room",
      severity: "warning",
      entityType: "camera",
      entityId: camera.id,
      message: `Camera ${camera.numero} incompleta`,
      tourId: camera.tourId,
      metadata: { numero: camera.numero, tipologia: camera.tipologia },
    }));
  },
};

export const RULE_TOUR_DEPARTING_WITH_ISSUES: DomainRule = {
  id: "tour-departing-with-issues",
  description: "Tour in partenza con documenti o pagamenti pendenti",
  evaluate(snapshot, { now }) {
    const alerts: OperationalAlert[] = [];

    for (const tour of snapshot.tours.filter(isTourActive)) {
      const giorni = daysUntil(tour.dataPartenza, now);
      if (giorni > DOMAIN_TOUR_DEPARTING_SOON_DAYS) continue;

      const partecipazioni =
        snapshot.partecipazioniByTourId.get(tour.id) ?? [];
      const hasIssues = partecipazioni.some(
        (item) =>
          item.documenti === "Da inviare" ||
          item.questionario === "Da compilare" ||
          item.pagamento !== "Saldo ricevuto",
      );

      if (hasIssues) {
        alerts.push({
          id: `rule-tour-issues-${tour.id}`,
          ruleId: "tour-departing-with-issues",
          severity: "critical",
          entityType: "tour",
          entityId: tour.id,
          message: `Tour "${tour.nomeTour}" parte presto con operazioni pendenti`,
          tourId: tour.id,
          metadata: { giorniMancanti: giorni },
        });
      }
    }

    return alerts;
  },
};

export const RULE_NEW_CLIENTS: DomainRule = {
  id: "new-clients-week",
  description: "Nuovi clienti nella settimana corrente",
  evaluate(snapshot, { now }) {
    const nuovi = getNewClients(snapshot, 7, now);
    if (nuovi.length === 0) return [];

    return [
      {
        id: "rule-new-clients",
        ruleId: "new-clients-week",
        severity: "success",
        entityType: "cliente",
        entityId: "aggregate",
        message: `${nuovi.length} nuovi clienti questa settimana`,
        metadata: { count: nuovi.length },
      },
    ];
  },
};

export const RULE_INCOMPLETE_ROOMS_SUMMARY: DomainRule = {
  id: "incomplete-rooms-summary",
  description: "Riepilogo camere incomplete",
  evaluate(snapshot) {
    const incomplete = getIncompleteCamere(snapshot);
    if (incomplete.length === 0) return [];

    const tourId = getTourWithMostIncompleteRooms(snapshot);

    return [
      {
        id: "rule-rooms-summary",
        ruleId: "incomplete-rooms-summary",
        severity: "warning",
        entityType: "camera",
        entityId: "aggregate",
        message: `${incomplete.length} camere incomplete`,
        tourId: tourId ?? undefined,
        metadata: { count: incomplete.length },
      },
    ];
  },
};

export const DOMAIN_RULES: DomainRule[] = [
  RULE_TOUR_DEPARTING_SOON,
  RULE_MISSING_PASSPORT,
  RULE_MISSING_QUESTIONNAIRE,
  RULE_UNPAID_BALANCE,
  RULE_INCOMPLETE_ROOM,
  RULE_TOUR_DEPARTING_WITH_ISSUES,
  RULE_NEW_CLIENTS,
  RULE_INCOMPLETE_ROOMS_SUMMARY,
];
