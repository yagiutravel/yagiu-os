"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { TabBar } from "@/components/ui/TabBar";
import { useToast } from "@/components/ui/Toast";
import { mapClienteToProfiloViaggiatore } from "@/lib/clienti/profilo-viaggiatore.mapper";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
import {
  CLIENTE_SCHEDA_SEZIONE_DEFAULT,
  CLIENTE_SCHEDA_SEZIONI,
  type ClienteSchedaSezioneId,
} from "@/lib/clienti/scheda-sections";
import { getCliente } from "@/services/clienti.service";
import type { Cliente } from "@/types/cliente";
import { ClienteInviaEmailModal } from "./ClienteInviaEmailModal";
import { ClienteInviaWhatsAppModal } from "@/components/whatsapp/ClienteInviaWhatsAppModal";
import { ProfiloViaggiatoreHeader } from "./ProfiloViaggiatoreHeader";
import { ProfiloViaggiatorePanoramica } from "./ProfiloViaggiatorePanoramica";
import { ProfiloViaggiatoreTimeline } from "./ProfiloViaggiatoreTimeline";
import { ProfiloViaggiatoreNoteStaff } from "./ProfiloViaggiatoreNoteStaff";
import { ClienteSchedaDocumenti } from "./ClienteSchedaDocumenti";
import { ClienteSchedaQuestionario } from "./ClienteSchedaQuestionario";
import { ClienteSchedaSectionPlaceholder } from "./ClienteSchedaSectionPlaceholder";
import { getErrorMessage } from "@/shared/utils/error";


export function ClienteSchedaView() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sezioneAttiva, setSezioneAttiva] = useState<ClienteSchedaSezioneId>(
    CLIENTE_SCHEDA_SEZIONE_DEFAULT,
  );
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [timelineRefreshKey, setTimelineRefreshKey] = useState(0);

  const clienteId = params.id;

  const profilo = useMemo(
    () => (cliente ? mapClienteToProfiloViaggiatore(cliente) : null),
    [cliente],
  );

  const loadCliente = useCallback(async () => {
    if (!clienteId) return;

    setLoading(true);
    setNotFound(false);

    try {
      const data = await getCliente(clienteId);
      if (!data) {
        setCliente(null);
        setNotFound(true);
        return;
      }
      setCliente(data);
    } catch (error) {
      showToast(`Impossibile caricare il cliente. ${getErrorMessage(error)}`, "error");
      setCliente(null);
    } finally {
      setLoading(false);
    }
  }, [clienteId, showToast]);

  useEffect(() => {
    startTransition(() => {
      void loadCliente();
    });
  }, [loadCliente]);

  const handleIndietro = useCallback(() => {
    router.push("/clienti");
  }, [router]);

  const sezioneCorrente =
    CLIENTE_SCHEDA_SEZIONI.find((sezione) => sezione.id === sezioneAttiva) ??
    CLIENTE_SCHEDA_SEZIONI[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="relative z-10 shrink-0 border-b border-zinc-200/60 bg-white/90 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className={profiloContentWrap}>
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 animate-pulse rounded-full bg-zinc-100" />
              <div className="space-y-2">
                <div className="h-7 w-48 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          </div>
        ) : profilo ? (
          <ProfiloViaggiatoreHeader
            profilo={profilo}
            action={
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setEmailModalOpen(true)}>
                  <Mail className="h-4 w-4" />
                  Invia Email
                </Button>
                <Button variant="secondary" onClick={() => setWhatsappModalOpen(true)}>
                  <MessageCircle className="h-4 w-4" />
                  Invia WhatsApp
                </Button>
              </div>
            }
          />
        ) : null}

        {!loading && profilo && (
          <div className="mt-6">
            <TabBar
              items={CLIENTE_SCHEDA_SEZIONI}
              activeId={sezioneAttiva}
              onChange={setSezioneAttiva}
              ariaLabel="Sezioni profilo viaggiatore"
            />
          </div>
        )}
        </div>
      </header>

      <div className="relative z-0 min-h-0 flex-1 overflow-y-auto bg-[#f7f7f8] px-4 py-6 sm:px-6 lg:px-8">
        <div className={profiloContentWrap}>
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-zinc-200/70 bg-white py-24 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Spinner className="h-5 w-5" />
              Caricamento profilo viaggiatore...
            </div>
          </div>
        ) : notFound || !profilo ? (
          <EmptyState
            icon={ArrowLeft}
            title="Viaggiatore non trovato"
            description="Il viaggiatore richiesto non esiste o non è più disponibile."
            actionLabel="Torna ai clienti"
            onAction={handleIndietro}
          />
        ) : sezioneAttiva === "panoramica" ? (
          <ProfiloViaggiatorePanoramica profilo={profilo} />
        ) : sezioneAttiva === "timeline" ? (
          <ProfiloViaggiatoreTimeline
            profilo={profilo}
            refreshKey={timelineRefreshKey}
          />
        ) : sezioneAttiva === "note" ? (
          <ProfiloViaggiatoreNoteStaff clienteId={profilo.id} />
        ) : sezioneAttiva === "documenti" ? (
          <ClienteSchedaDocumenti clienteId={profilo.id} />
        ) : sezioneAttiva === "questionario" ? (
          <ClienteSchedaQuestionario clienteId={profilo.id} />
        ) : (
          <ClienteSchedaSectionPlaceholder sezione={sezioneCorrente} />
        )}
        </div>
      </div>

      {profilo && (
        <>
          <ClienteInviaEmailModal
            open={emailModalOpen}
            clienteId={profilo.id}
            clienteNome={profilo.profilo.nomeCompleto}
            destinatarioDefault={
              profilo.profilo.email !== "—" ? profilo.profilo.email : cliente?.email ?? ""
            }
            onClose={() => setEmailModalOpen(false)}
            onSent={() => {
              setTimelineRefreshKey((value) => value + 1);
              showToast("Email inviata con successo (simulazione).", "success");
            }}
          />
          <ClienteInviaWhatsAppModal
            open={whatsappModalOpen}
            clienteId={profilo.id}
            clienteNome={profilo.profilo.nomeCompleto}
            numeroDefault={
              profilo.profilo.telefono !== "—"
                ? profilo.profilo.telefono
                : profilo.profilo.whatsapp !== "—"
                  ? profilo.profilo.whatsapp
                  : cliente?.telefono ?? ""
            }
            onClose={() => setWhatsappModalOpen(false)}
            onSent={() => {
              setTimelineRefreshKey((value) => value + 1);
              showToast("WhatsApp inviato con successo (simulazione).", "success");
            }}
          />
        </>
      )}
    </div>
  );
}
