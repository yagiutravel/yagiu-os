import { variabileToken } from "@/models/email-template";
import { EMAIL_TEMPLATE_VARIABILI } from "@/lib/email-template/constants";
import type { EmailTemplateVariabile } from "@/types/email-template";

type EmailTemplateVariabiliChipsProps = {
  onInsert: (token: string) => void;
  disabled?: boolean;
};

export function EmailTemplateVariabiliChips({
  onInsert,
  disabled = false,
}: EmailTemplateVariabiliChipsProps) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500">Variabili dinamiche</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {EMAIL_TEMPLATE_VARIABILI.map((variabile: EmailTemplateVariabile) => (
          <button
            key={variabile}
            type="button"
            disabled={disabled}
            onClick={() => onInsert(variabileToken(variabile))}
            className="rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-xs text-zinc-700 ring-1 ring-inset ring-zinc-200 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {variabileToken(variabile)}
          </button>
        ))}
      </div>
    </div>
  );
}
