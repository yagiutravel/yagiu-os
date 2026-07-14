"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type SettingToggleProps = {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
};

function SettingToggle({
  label,
  description,
  enabled,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200/70 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-zinc-900" : "bg-zinc-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ImpostazioniView() {
  const { showToast } = useToast();
  const [notificheEmail, setNotificheEmail] = useState(true);
  const [reminderAutomatici, setReminderAutomatici] = useState(true);
  const [vistaCompatta, setVistaCompatta] = useState(false);

  const handleSave = () => {
    showToast("Preferenze workspace salvate.", "success");
  };

  return (
    <PageContent>
      <Card>
        <CardHeader
          title="Impostazioni workspace"
          description="Preferenze operative del team. Le modifiche sono salvate localmente."
          action={
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-500/10">
              <Settings className="h-4 w-4" strokeWidth={1.75} />
            </div>
          }
        />
        <CardContent className="space-y-3">
          <SettingToggle
            label="Notifiche email"
            description="Ricevi avvisi su nuovi clienti, pagamenti e tour in partenza."
            enabled={notificheEmail}
            onChange={setNotificheEmail}
          />
          <SettingToggle
            label="Reminder automatici"
            description="Abilita promemoria per saldi, documenti e partenze imminenti."
            enabled={reminderAutomatici}
            onChange={setReminderAutomatici}
          />
          <SettingToggle
            label="Vista compatta"
            description="Riduce padding e spaziature nelle tabelle operative."
            enabled={vistaCompatta}
            onChange={setVistaCompatta}
          />

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave}>Salva preferenze</Button>
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
