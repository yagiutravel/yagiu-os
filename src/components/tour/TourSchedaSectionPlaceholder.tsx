import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { TourSchedaSezione } from "@/types/tour-scheda";

type TourSchedaSectionPlaceholderProps = {
  sezione: TourSchedaSezione;
};

export function TourSchedaSectionPlaceholder({
  sezione,
}: TourSchedaSectionPlaceholderProps) {
  return (
    <Card>
      <CardHeader title={sezione.label} description={sezione.description} />
      <CardContent>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/40 px-8 py-16 text-center">
          <div>
            <p className="text-sm font-medium text-zinc-900">Sezione in arrivo</p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              {sezione.label} sarà disponibile nelle prossime fasi.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
