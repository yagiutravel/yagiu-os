"use client";

import { useState } from "react";
import { TabBar } from "@/components/ui/TabBar";
import { profiloContentWrap } from "@/lib/clienti/profilo-ui";
import {
  COMUNICAZIONI_SEZIONE_DEFAULT,
  COMUNICAZIONI_SEZIONI,
  type ComunicazioniSezioneId,
} from "@/lib/comunicazioni/sections";
import { ComunicazioniView } from "./ComunicazioniView";
import { EmailTemplateView } from "./template-email/EmailTemplateView";

export function ComunicazioniShell() {
  const [sezioneAttiva, setSezioneAttiva] = useState<ComunicazioniSezioneId>(
    COMUNICAZIONI_SEZIONE_DEFAULT,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-zinc-200/60 bg-white/90 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className={`${profiloContentWrap} py-4`}>
          <TabBar
            items={COMUNICAZIONI_SEZIONI}
            activeId={sezioneAttiva}
            onChange={setSezioneAttiva}
            ariaLabel="Sezioni comunicazioni"
          />
        </div>
      </div>

      {sezioneAttiva === "centro" ? (
        <ComunicazioniView />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className={profiloContentWrap}>
            <EmailTemplateView />
          </div>
        </div>
      )}
    </div>
  );
}
