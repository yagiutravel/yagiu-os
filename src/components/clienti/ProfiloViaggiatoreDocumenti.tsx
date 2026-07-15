"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getDocumentiViaggiatoreByClienteId } from "@/services/documenti-viaggiatore.service";
import type { DocumentoViaggiatore } from "@/types/documenti-viaggiatore";
import { DocumentoItem } from "./DocumentoItem";
import { getErrorMessage } from "@/shared/utils/error";

type ProfiloViaggiatoreDocumentiProps = {
  clienteId: string;
};

export function ProfiloViaggiatoreDocumenti({
  clienteId,
}: ProfiloViaggiatoreDocumentiProps) {
  const { showToast } = useToast();
  const [documenti, setDocumenti] = useState<DocumentoViaggiatore[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocumentiViaggiatoreByClienteId(clienteId);
      setDocumenti(data.documenti);
    } catch (error) {
      showToast(
        `Impossibile caricare i documenti. ${getErrorMessage(error)}`,
        "error",
      );
      setDocumenti([]);
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
        title="Documenti"
        description="Documenti di viaggio, identità e assicurazione del viaggiatore."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento documenti...
            </div>
          </div>
        ) : documenti.length > 0 ? (
          <div className="space-y-3">
            {documenti.map((documento) => (
              <DocumentoItem key={documento.id} documento={documento} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Nessun documento registrato.</p>
        )}
      </CardContent>
    </Card>
  );
}
