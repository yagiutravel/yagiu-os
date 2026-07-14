import { InfoGrid } from "@/components/ui/InfoGrid";
import { formatImportoPagamento } from "@/models/pagamento";
import type { TourPagamentiRiepilogo } from "@/types/pagamento";

type TourPagamentiRiepilogoProps = {
  riepilogo: TourPagamentiRiepilogo;
};

export function TourPagamentiRiepilogo({
  riepilogo,
}: TourPagamentiRiepilogoProps) {
  return (
    <InfoGrid
      columns={3}
      fields={[
        {
          label: "Totale tour",
          value: formatImportoPagamento(riepilogo.totaleTour),
        },
        {
          label: "Incassato",
          value: formatImportoPagamento(riepilogo.incassato),
        },
        {
          label: "Residuo da incassare",
          value: formatImportoPagamento(riepilogo.residuoDaIncassare),
        },
        {
          label: "Clienti pagati",
          value: String(riepilogo.clientiPagati),
        },
        {
          label: "Clienti con saldo aperto",
          value: String(riepilogo.clientiSaldoAperto),
        },
      ]}
    />
  );
}
