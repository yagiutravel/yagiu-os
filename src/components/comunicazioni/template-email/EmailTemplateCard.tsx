import { Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { EmailTemplate } from "@/types/email-template";
import { EmailTemplateCategoriaBadge } from "./EmailTemplateCategoriaBadge";

type EmailTemplateCardProps = {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDuplicate: (template: EmailTemplate) => void;
  onDelete: (template: EmailTemplate) => void;
  disabled?: boolean;
};

export function EmailTemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  disabled = false,
}: EmailTemplateCardProps) {
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200/70 bg-white p-5 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-900">{template.titolo}</h3>
          <p className="mt-1 truncate text-sm text-zinc-500">{template.oggetto}</p>
        </div>
        <EmailTemplateCategoriaBadge categoria={template.categoria} />
      </div>

      <p
        className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-600"
        dangerouslySetInnerHTML={{ __html: template.corpoHtml }}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(template)}
          disabled={disabled}
        >
          <Pencil className="h-3.5 w-3.5" />
          Modifica
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(template)}
          disabled={disabled}
        >
          <Copy className="h-3.5 w-3.5" />
          Duplica
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(template)}
          disabled={disabled}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Elimina
        </Button>
      </div>
    </article>
  );
}
