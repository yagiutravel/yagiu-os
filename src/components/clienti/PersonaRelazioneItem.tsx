import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatViaggiInsieme } from "@/models/relazioni-viaggiatore";
import { profiloItemCard } from "@/lib/clienti/profilo-ui";
import type { RelazionePersona } from "@/types/relazioni-viaggiatore";

type PersonaRelazioneItemProps = {
  persona: RelazionePersona;
  compact?: boolean;
};

export function PersonaRelazioneItem({
  persona,
  compact = false,
}: PersonaRelazioneItemProps) {
  return (
    <div
      className={`flex items-center gap-3 ${compact ? "" : profiloItemCard}`}
    >
      <Avatar name={persona.nome} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900">{persona.nome}</p>
        <div className="mt-1.5">
          <Badge variant="info">{formatViaggiInsieme(persona.viaggiInsieme)}</Badge>
        </div>
      </div>
    </div>
  );
}
