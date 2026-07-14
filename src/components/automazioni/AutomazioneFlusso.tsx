import { ArrowRight } from "lucide-react";
import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";
import { AUTOMAZIONE_AZIONE_CONFIG } from "@/lib/automazione/azione.config";
import { AUTOMAZIONE_TRIGGER_CONFIG } from "@/lib/automazione/trigger.config";
import type { AutomazioneView } from "@/types/automazione";

type AutomazioneFlussoProps = {
  item: AutomazioneView;
};

export function AutomazioneFlusso({ item }: AutomazioneFlussoProps) {
  const triggerConfig = AUTOMAZIONE_TRIGGER_CONFIG[item.trigger];
  const azioneConfig = AUTOMAZIONE_AZIONE_CONFIG[item.azione];
  const TriggerIcon = triggerConfig.icon;
  const AzioneIcon = azioneConfig.icon;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 ${profiloBadgeBase} ${triggerConfig.bg} ${triggerConfig.text} ${triggerConfig.ring}`}
      >
        <TriggerIcon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        <span className="max-w-[180px] truncate sm:max-w-none">
          {item.triggerLabel}
        </span>
      </span>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-zinc-300"
        strokeWidth={1.75}
        aria-hidden
      />
      <span
        className={`inline-flex items-center gap-1.5 ${profiloBadgeBase} ${azioneConfig.bg} ${azioneConfig.text} ${azioneConfig.ring}`}
      >
        <AzioneIcon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        {item.azioneLabel}
      </span>
    </div>
  );
}
