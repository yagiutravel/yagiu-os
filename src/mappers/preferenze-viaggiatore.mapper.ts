import { EMPTY_DISPLAY } from "@/models/cliente-scheda/defaults";
import { EMPTY_PREFERENZE } from "@/models/preferenze-viaggiatore";
import type { ClienteQuestionarioView } from "@/types/cliente-questionario";
import type { PreferenzeViaggiatore } from "@/types/preferenze-viaggiatore";

function formatAllergie(questionario: ClienteQuestionarioView): string {
  const parts = [questionario.allergie, questionario.intolleranze]
    .map((value) => value.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : EMPTY_DISPLAY;
}

function formatDieta(questionario: ClienteQuestionarioView): string {
  const labels: string[] = [];

  if (questionario.vegetariano) labels.push("Vegetariana");
  if (questionario.vegano) labels.push("Vegana");
  if (questionario.celiaco) labels.push("Celiaco");

  const note = questionario.noteAlimentari.trim();
  if (note) labels.push(note);

  return labels.length > 0 ? labels.join(" · ") : EMPTY_DISPLAY;
}

export function mapQuestionarioToPreferenzeViaggiatore(
  questionario: ClienteQuestionarioView | null,
): PreferenzeViaggiatore {
  if (!questionario) {
    return EMPTY_PREFERENZE;
  }

  return {
    tipologieViaggio: [],
    lingue: EMPTY_DISPLAY,
    allergie: formatAllergie(questionario),
    dieta: formatDieta(questionario),
    livelloTrekking: EMPTY_DISPLAY,
  };
}
