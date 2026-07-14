"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getQuestionarioByClienteId } from "@/services/cliente-questionario.service";
import type { ClienteQuestionarioView } from "@/types/cliente-questionario";
import { ClienteQuestionarioContent } from "./ClienteQuestionarioContent";
import { getErrorMessage } from "@/shared/utils/error";

type ClienteSchedaQuestionarioProps = {
  clienteId: string;
};


export function ClienteSchedaQuestionario({
  clienteId,
}: ClienteSchedaQuestionarioProps) {
  const { showToast } = useToast();
  const [questionario, setQuestionario] =
    useState<ClienteQuestionarioView | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuestionarioByClienteId(clienteId);
      setQuestionario(data);
    } catch (error) {
      showToast(
        `Impossibile caricare il questionario. ${getErrorMessage(error)}`,
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
        title="Questionario"
        description="Informazioni sanitarie, alimentari e logistiche del viaggiatore."
      />
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento questionario...
            </div>
          </div>
        ) : !questionario ? (
          <EmptyState
            icon={ClipboardList}
            title="Questionario non compilato"
            description="Il viaggiatore non ha ancora inviato il questionario."
          />
        ) : (
          <ClienteQuestionarioContent questionario={questionario} />
        )}
      </CardContent>
    </Card>
  );
}
