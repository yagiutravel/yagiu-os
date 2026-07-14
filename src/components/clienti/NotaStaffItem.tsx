import { Avatar } from "@/components/ui/Avatar";
import { formatNotaStaffData } from "@/lib/clienti/note-staff.data";
import { profiloItemCard } from "@/lib/clienti/profilo-ui";
import type { NotaStaff } from "@/types/note-staff";

type NotaStaffItemProps = {
  nota: NotaStaff;
};

export function NotaStaffItem({ nota }: NotaStaffItemProps) {
  return (
    <article className={profiloItemCard}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={nota.autore} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900">{nota.autore}</p>
            <time
              dateTime={nota.data}
              className="text-xs text-zinc-500 sm:hidden"
            >
              {formatNotaStaffData(nota.data)}
            </time>
          </div>
        </div>
        <time
          dateTime={nota.data}
          className="hidden shrink-0 text-xs text-zinc-500 sm:block"
        >
          {formatNotaStaffData(nota.data)}
        </time>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">{nota.contenuto}</p>
    </article>
  );
}
