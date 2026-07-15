"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { MessageCircle, SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContent } from "@/shared/components/layout/PageContent";
import {
  filterWhatsAppConversazioni,
  getWhatsAppConversazioni,
} from "@/services/whatsapp.service";
import type { WhatsAppConversazioneView } from "@/types/whatsapp";
import { ClienteInviaWhatsAppModal } from "./ClienteInviaWhatsAppModal";
import { WhatsAppConversazioniTable } from "./WhatsAppConversazioniTable";
import { getErrorMessage } from "@/shared/utils/error";


export function WhatsAppView() {
  const { showToast } = useToast();
  const [conversazioni, setConversazioni] = useState<
    WhatsAppConversazioneView[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<WhatsAppConversazioneView | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWhatsAppConversazioni();
      setConversazioni(data);
    } catch (error) {
      showToast(
        `Impossibile caricare WhatsApp. ${getErrorMessage(error)}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData, refreshKey]);

  const filtered = useMemo(
    () => filterWhatsAppConversazioni(conversazioni, search),
    [conversazioni, search],
  );

  const handleInvia = (conversazione: WhatsAppConversazioneView) => {
    setSelected(conversazione);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="WhatsApp"
          description="Centro messaggi WhatsApp con i viaggiatori."
        />

        <PageContent className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="search"
              placeholder="Cerca per cliente, numero o messaggio..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          <Card>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={search ? SearchX : MessageCircle}
                  title={
                    search
                      ? "Nessuna conversazione trovata"
                      : "Nessuna conversazione"
                  }
                  description={
                    search
                      ? "Prova a modificare la ricerca."
                      : "Le conversazioni WhatsApp appariranno qui."
                  }
                />
              ) : (
                <WhatsAppConversazioniTable
                  conversazioni={filtered}
                  onInvia={handleInvia}
                />
              )}
            </CardContent>
          </Card>
        </PageContent>
      </div>

      {selected && (
        <ClienteInviaWhatsAppModal
          open={modalOpen}
          clienteId={selected.clienteId}
          clienteNome={selected.clienteNome}
          numeroDefault={selected.numero}
          onClose={() => {
            setModalOpen(false);
            setSelected(null);
          }}
          onSent={() => {
            setRefreshKey((value) => value + 1);
            showToast("WhatsApp inviato con successo.", "success");
          }}
        />
      )}
    </>
  );
}
