import { renderAnteprimaTemplate } from "@/models/email-template";

type EmailTemplatePreviewProps = {
  oggetto: string;
  corpoHtml: string;
};

export function EmailTemplatePreview({
  oggetto,
  corpoHtml,
}: EmailTemplatePreviewProps) {
  const anteprima = renderAnteprimaTemplate(oggetto, corpoHtml);

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200/70 bg-white">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Anteprima live
        </p>
        <p className="mt-1.5 text-sm font-medium text-zinc-900">
          {anteprima.oggetto || "Oggetto email..."}
        </p>
      </div>
      <div
        className="min-h-[280px] flex-1 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-zinc-700 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-zinc-900"
        dangerouslySetInnerHTML={{
          __html: anteprima.corpoHtml || "<p>Il corpo del messaggio apparirà qui...</p>",
        }}
      />
    </div>
  );
}
