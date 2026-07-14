import { Paperclip } from "lucide-react";
import {
  CLIENTE_DOCUMENTO_STATO_BORDER,
  CLIENTE_DOCUMENTO_TIPO_CONFIG,
} from "@/lib/clienti/cliente-documento.config";
import { formatScadenzaDocumento } from "@/models/cliente-documento";
import { profiloIconBox, profiloSectionLabel } from "@/lib/clienti/profilo-ui";
import type { ClienteDocumentoView } from "@/types/cliente-documento";
import { DocumentoStatoBadge } from "./DocumentoStatoBadge";

type ClienteDocumentoCardProps = {
  documento: ClienteDocumentoView;
};

export function ClienteDocumentoCard({ documento }: ClienteDocumentoCardProps) {
  const tipoConfig = CLIENTE_DOCUMENTO_TIPO_CONFIG[documento.tipo];
  const Icon = tipoConfig.icon;
  const borderClass = CLIENTE_DOCUMENTO_STATO_BORDER[documento.stato];

  return (
    <div
      className={`rounded-xl border border-zinc-200/60 border-l-4 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${borderClass}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`${profiloIconBox} ${tipoConfig.bg} ${tipoConfig.text}`}>
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900">
              {tipoConfig.label}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Documento di viaggio del cliente
            </p>
          </div>
        </div>

        <DocumentoStatoBadge stato={documento.stato} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-zinc-50/60 px-4 py-3 ring-1 ring-inset ring-zinc-200/50">
          <p className={profiloSectionLabel}>Numero</p>
          <p className="mt-1 text-sm font-medium text-zinc-900">
            {documento.numero}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50/60 px-4 py-3 ring-1 ring-inset ring-zinc-200/50">
          <p className={profiloSectionLabel}>Scadenza</p>
          <p className="mt-1 text-sm font-medium text-zinc-900">
            {formatScadenzaDocumento(documento.scadenza)}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50/60 px-4 py-3 ring-1 ring-inset ring-zinc-200/50">
          <p className={profiloSectionLabel}>Stato</p>
          <div className="mt-1">
            <DocumentoStatoBadge stato={documento.stato} />
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50/60 px-4 py-3 ring-1 ring-inset ring-zinc-200/50">
          <p className={profiloSectionLabel}>Allegato</p>
          {documento.allegatoNome ? (
            <button
              type="button"
              className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-sky-700 transition-colors duration-200 hover:text-sky-900"
              onClick={() => {
                /* mock — nessun download reale */
              }}
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{documento.allegatoNome}</span>
            </button>
          ) : (
            <p className="mt-1 text-sm text-zinc-400">Nessun allegato</p>
          )}
        </div>
      </div>
    </div>
  );
}
