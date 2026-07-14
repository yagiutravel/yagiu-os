"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, SearchX } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
import {
  filterAuditLogEntries,
  getAuditLogEntries,
} from "@/services/audit-log.service";
import type { AuditLogEntitaTipo, AuditLogView } from "@/types/audit-log";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogToolbar } from "./AuditLogToolbar";
import { getErrorMessage } from "@/shared/utils/error";


export function AuditLogView() {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<AuditLogView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<AuditLogEntitaTipo | "tutti">("tutti");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAuditLogEntries();
      setEntries(data);
    } catch (error) {
      showToast(
        `Impossibile caricare il registro. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(
    () => filterAuditLogEntries(entries, search, tipo),
    [entries, search, tipo],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${profiloContentWrap} space-y-6`}>
          <Card>
            <CardHeader
              title="Registro attività"
              description="Cronologia completa delle modifiche effettuate nel gestionale."
            />
            <CardContent className="space-y-4">
              <AuditLogToolbar
                search={search}
                tipo={tipo}
                resultCount={filteredEntries.length}
                onSearchChange={setSearch}
                onTipoChange={setTipo}
              />

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <Spinner className="h-5 w-5" />
                    Caricamento registro...
                  </div>
                </div>
              ) : filteredEntries.length === 0 ? (
                <EmptyState
                  icon={search || tipo !== "tutti" ? SearchX : ClipboardList}
                  title={
                    search || tipo !== "tutti"
                      ? "Nessuna registrazione trovata"
                      : "Registro vuoto"
                  }
                  description={
                    search || tipo !== "tutti"
                      ? "Prova a modificare i filtri di ricerca."
                      : "Le attività del gestionale appariranno qui."
                  }
                />
              ) : (
                <AuditLogTable entries={filteredEntries} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
