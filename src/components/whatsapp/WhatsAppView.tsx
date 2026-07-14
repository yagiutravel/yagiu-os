"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, SearchX } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
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
    void loadData();
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${profiloContentWrap} space-y-6`}>
          <Card>
            <CardHeader
              title="WhatsApp Center"
              description="Conversazioni WhatsApp con i viaggiatori."
              action={
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                  <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                </div>
              }
            />
            <CardContent className="space-y-4">
              <div className="relative max-w-md">
                <input
                  type="search"
                  placeholder="Cerca per cliente, numero o messaggio..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
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
        </div>
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
            showToast("WhatsApp inviato con successo (simulazione).", "success");
          }}
        />
      )}
    </div>
  );
}
