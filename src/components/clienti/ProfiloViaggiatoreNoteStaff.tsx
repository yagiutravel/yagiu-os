import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getNoteStaffPlaceholder } from "@/lib/clienti/note-staff.data";
import { NotaStaffItem } from "./NotaStaffItem";

type ProfiloViaggiatoreNoteStaffProps = {
  clienteId: string;
};

export function ProfiloViaggiatoreNoteStaff({
  clienteId,
}: ProfiloViaggiatoreNoteStaffProps) {
  const { note } = getNoteStaffPlaceholder(clienteId);

  return (
    <Card>
      <CardHeader
        title="Note Staff"
        description="Note interne del team visibili solo allo staff Yagiu."
      />
      <CardContent>
        <div className="space-y-4">
          {note.map((nota) => (
            <NotaStaffItem key={nota.id} nota={nota} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
