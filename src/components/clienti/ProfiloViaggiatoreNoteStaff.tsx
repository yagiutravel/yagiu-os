"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getNoteStaffByClienteId } from "@/services/cliente-note-staff.service";
import type { NotaStaff } from "@/types/note-staff";
import { NotaStaffItem } from "./NotaStaffItem";
import { getErrorMessage } from "@/shared/utils/error";

type ProfiloViaggiatoreNoteStaffProps = {
  clienteId: string;
};

export function ProfiloViaggiatoreNoteStaff({
  clienteId,
}: ProfiloViaggiatoreNoteStaffProps) {
  const { showToast } = useToast();
  const [note, setNote] = useState<NotaStaff[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNoteStaffByClienteId(clienteId);
      setNote(data);
    } catch (error) {
      showToast(
        `Impossibile caricare le note staff. ${getErrorMessage(error)}`,
        "error",
      );
      setNote([]);
    } finally {
      setLoading(false);
    }
  }, [clienteId, showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  return (
    <Card>
      <CardHeader
        title="Note Staff"
        description="Note interne del team visibili solo allo staff Yagiu."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento note staff...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {note.map((nota) => (
              <NotaStaffItem key={nota.id} nota={nota} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
