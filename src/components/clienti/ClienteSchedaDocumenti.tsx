"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getDocumentiByClienteId } from "@/services/cliente-documento.service";
import type { ClienteDocumentoView } from "@/types/cliente-documento";
import { ClienteDocumentoCard } from "./ClienteDocumentoCard";
import { getErrorMessage } from "@/shared/utils/error";

type ClienteSchedaDocumentiProps = {
  clienteId: string;
};


export function ClienteSchedaDocumenti({
  clienteId,
}: ClienteSchedaDocumentiProps) {
  const { showToast } = useToast();
  const [documenti, setDocumenti] = useState<ClienteDocumentoView[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocumentiByClienteId(clienteId);
      setDocumenti(data.documenti);
    } catch (error) {
      showToast(
        `Impossibile caricare i documenti. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [clienteId, showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <Card>
      <CardHeader
        title="Documenti"
        description="Passaporto, carta d'identità, visto e assicurazione del viaggiatore."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento documenti...
            </div>
          </div>
        ) : documenti.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nessun documento"
            description="I documenti del viaggiatore compariranno qui."
          />
        ) : (
          <div className="space-y-4">
            {documenti.map((documento) => (
              <ClienteDocumentoCard key={documento.id} documento={documento} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
