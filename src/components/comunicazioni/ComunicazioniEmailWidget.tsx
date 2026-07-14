import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { ComunicazioneView } from "@/types/comunicazione";
import { ComunicazioneListItem } from "./ComunicazioneListItem";

type ComunicazioniEmailWidgetProps = {
  items: ComunicazioneView[];
};

export function ComunicazioniEmailWidget({
  items,
}: ComunicazioniEmailWidgetProps) {
  return (
    <Card>
      <CardHeader
        title="Email da inviare"
        description="Messaggi email in coda di invio."
        action={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15">
            <Mail className="h-4 w-4" strokeWidth={1.75} />
          </div>
        }
      />
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Nessuna email in coda.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <ComunicazioneListItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
