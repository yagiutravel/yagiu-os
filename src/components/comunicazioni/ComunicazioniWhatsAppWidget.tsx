import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { ComunicazioneView } from "@/types/comunicazione";
import { ComunicazioneListItem } from "./ComunicazioneListItem";

type ComunicazioniWhatsAppWidgetProps = {
  items: ComunicazioneView[];
};

export function ComunicazioniWhatsAppWidget({
  items,
}: ComunicazioniWhatsAppWidgetProps) {
  return (
    <Card>
      <CardHeader
        title="Messaggi WhatsApp"
        description="Comunicazioni via WhatsApp con i viaggiatori."
        action={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
          </div>
        }
      />
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Nessun messaggio WhatsApp.
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
