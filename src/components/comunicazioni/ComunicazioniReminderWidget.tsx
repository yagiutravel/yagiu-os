import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { ComunicazioneView } from "@/types/comunicazione";
import { ComunicazioneListItem } from "./ComunicazioneListItem";

type ComunicazioniReminderWidgetProps = {
  items: ComunicazioneView[];
};

export function ComunicazioniReminderWidget({
  items,
}: ComunicazioniReminderWidgetProps) {
  return (
    <Card>
      <CardHeader
        title="Reminder automatici"
        description="Promemoria programmati dal sistema."
        action={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15">
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </div>
        }
      />
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Nessun reminder programmato.
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
