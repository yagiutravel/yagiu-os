import {
  DOCUMENTO_TIPO_CONFIG,
} from "@/lib/clienti/documenti-viaggiatore.config";
import { formatDocumentoScadenza } from "@/models/documenti-viaggiatore";
import { profiloIconBox, profiloItemCard, profiloSectionLabel } from "@/lib/clienti/profilo-ui";
import type { DocumentoViaggiatore } from "@/types/documenti-viaggiatore";
import { DocumentoStatoBadge } from "./DocumentoStatoBadge";

type DocumentoItemProps = {
  documento: DocumentoViaggiatore;
};

export function DocumentoItem({ documento }: DocumentoItemProps) {
  const tipoConfig = DOCUMENTO_TIPO_CONFIG[documento.tipo];
  const Icon = tipoConfig.icon;

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${profiloItemCard}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className={`${profiloIconBox} ${tipoConfig.bg} ${tipoConfig.text}`}>
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className={profiloSectionLabel}>{tipoConfig.label}</p>
          <p className="mt-1 truncate text-sm font-medium text-zinc-900">
            {documento.nome}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
        <DocumentoStatoBadge stato={documento.stato} />
        <div className="text-left sm:min-w-[140px] sm:text-right">
          <p className={profiloSectionLabel}>Scadenza</p>
          <p className="mt-1 text-sm text-zinc-700">
            {formatDocumentoScadenza(documento.dataScadenza)}
          </p>
        </div>
      </div>
    </div>
  );
}
