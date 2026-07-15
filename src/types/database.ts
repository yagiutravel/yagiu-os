export type { ClienteStato } from "@/types/cliente";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TimestampFields = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      clienti: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          nome: string;
          cognome: string | null;
          email: string | null;
          telefono: string | null;
          azienda: string | null;
          stato: string | null;
          data_nascita: string | null;
          indirizzo: string | null;
          citta: string | null;
          provincia: string | null;
          cap: string | null;
          paese: string | null;
          note: string | null;
          created_by: string | null;
          organization_id: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          nome: string;
          cognome?: string | null;
          email?: string | null;
          telefono?: string | null;
          azienda?: string | null;
          stato?: string | null;
          data_nascita?: string | null;
          indirizzo?: string | null;
          citta?: string | null;
          provincia?: string | null;
          cap?: string | null;
          paese?: string | null;
          note?: string | null;
          created_by?: string | null;
          organization_id?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          nome?: string;
          cognome?: string | null;
          email?: string | null;
          telefono?: string | null;
          azienda?: string | null;
          stato?: string | null;
          data_nascita?: string | null;
          indirizzo?: string | null;
          citta?: string | null;
          provincia?: string | null;
          cap?: string | null;
          paese?: string | null;
          note?: string | null;
          created_by?: string | null;
          organization_id?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          organization_id: string;
          workspace_id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          job_title: string;
          phone: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id: string;
          organization_id: string;
          workspace_id: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          job_title?: string;
          phone?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          workspace_id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          job_title?: string;
          phone?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          workspace_id: string | null;
          role_key: string;
          scope: string;
          status: string;
          joined_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          workspace_id?: string | null;
          role_key: string;
          scope: string;
          status?: string;
          joined_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          workspace_id?: string | null;
          role_key?: string;
          scope?: string;
          status?: string;
          joined_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      auth_audit_events: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          event_type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          event_type: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          event_type?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tours: {
        Row: {
          id: string;
          organization_id: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          nome: string;
          slug: string;
          destinazione: string;
          descrizione: string;
          stato: string;
          data_apertura_vendite: string | null;
          data_chiusura_vendite: string | null;
          data_partenza: string;
          data_ritorno: string;
          durata_giorni: number | null;
          capienza_massima: number;
          prezzo_cents: number;
          valuta: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          nome: string;
          slug: string;
          destinazione?: string;
          descrizione?: string;
          stato?: string;
          data_apertura_vendite?: string | null;
          data_chiusura_vendite?: string | null;
          data_partenza: string;
          data_ritorno: string;
          durata_giorni?: number | null;
          capienza_massima: number;
          prezzo_cents?: number;
          valuta?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          nome?: string;
          slug?: string;
          destinazione?: string;
          descrizione?: string;
          stato?: string;
          data_apertura_vendite?: string | null;
          data_chiusura_vendite?: string | null;
          data_partenza?: string;
          data_ritorno?: string;
          durata_giorni?: number | null;
          capienza_massima?: number;
          prezzo_cents?: number;
          valuta?: string;
        };
        Relationships: [];
      };
      tour_staff: {
        Row: {
          id: string;
          organization_id: string;
          tour_id: string;
          ruolo: string;
          nome: string;
          email: string | null;
          telefono: string | null;
          user_id: string | null;
          ordine: number;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          ruolo: string;
          nome: string;
          email?: string | null;
          telefono?: string | null;
          user_id?: string | null;
          ordine?: number;
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          ruolo?: string;
          nome?: string;
          email?: string | null;
          telefono?: string | null;
          user_id?: string | null;
          ordine?: number;
          note?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tour_hotels: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          nome: string;
          indirizzo: string;
          citta: string;
          paese: string;
          check_in: string | null;
          check_out: string | null;
          telefono: string | null;
          note: string;
          ordine: number;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          nome: string;
          indirizzo?: string;
          citta?: string;
          paese?: string;
          check_in?: string | null;
          check_out?: string | null;
          telefono?: string | null;
          note?: string;
          ordine?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          nome?: string;
          indirizzo?: string;
          citta?: string;
          paese?: string;
          check_in?: string | null;
          check_out?: string | null;
          telefono?: string | null;
          note?: string;
          ordine?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_participants: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          cliente_id: string;
          stato_iscrizione: string;
          posizione_lista_attesa: number | null;
          ruolo: string;
          pagamento: string;
          documenti: string;
          questionario: string;
          quota_cents: number | null;
          note: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          cliente_id: string;
          stato_iscrizione?: string;
          posizione_lista_attesa?: number | null;
          ruolo?: string;
          pagamento?: string;
          documenti?: string;
          questionario?: string;
          quota_cents?: number | null;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          cliente_id?: string;
          stato_iscrizione?: string;
          posizione_lista_attesa?: number | null;
          ruolo?: string;
          pagamento?: string;
          documenti?: string;
          questionario?: string;
          quota_cents?: number | null;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_rooms: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          hotel_id: string | null;
          numero: string;
          tipologia: string;
          capienza: number;
          note: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          hotel_id?: string | null;
          numero: string;
          tipologia: string;
          capienza: number;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          hotel_id?: string | null;
          numero?: string;
          tipologia?: string;
          capienza?: number;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_assignments: {
        Row: {
          id: string;
          organization_id: string;
          room_id: string;
          participant_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          room_id: string;
          participant_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          room_id?: string;
          participant_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tour_payments: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          participant_id: string;
          importo_cents: number;
          data: string;
          metodo: string;
          tipo: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          participant_id: string;
          importo_cents: number;
          data: string;
          metodo: string;
          tipo: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          participant_id?: string;
          importo_cents?: number;
          data?: string;
          metodo?: string;
          tipo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_checklist_templates: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          codice: string;
          etichetta: string;
          descrizione: string;
          ordine: number;
          obbligatorio: boolean;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          codice: string;
          etichetta: string;
          descrizione?: string;
          ordine?: number;
          obbligatorio?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          codice?: string;
          etichetta?: string;
          descrizione?: string;
          ordine?: number;
          obbligatorio?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_checklist_completions: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          template_id: string;
          participant_id: string;
          completato: boolean;
          completato_il: string | null;
          note: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          template_id: string;
          participant_id: string;
          completato?: boolean;
          completato_il?: string | null;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          template_id?: string;
          participant_id?: string;
          completato?: boolean;
          completato_il?: string | null;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_documents: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          nome: string;
          categoria: string;
          storage_path: string;
          mime_type: string;
          dimensione_bytes: number;
          note: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          nome: string;
          categoria?: string;
          storage_path: string;
          mime_type?: string;
          dimensione_bytes?: number;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          nome?: string;
          categoria?: string;
          storage_path?: string;
          mime_type?: string;
          dimensione_bytes?: number;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_timeline_events: {
        Row: {
          id: string;
          organization_id: string;
          tour_id: string;
          tipo: string;
          titolo: string;
          descrizione: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          tipo: string;
          titolo: string;
          descrizione?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          tipo?: string;
          titolo?: string;
          descrizione?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tour_program_days: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          giorno_numero: number;
          data: string | null;
          titolo: string;
          descrizione: string;
          hotel_id: string | null;
          ordine: number;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          giorno_numero: number;
          data?: string | null;
          titolo?: string;
          descrizione?: string;
          hotel_id?: string | null;
          ordine?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          giorno_numero?: number;
          data?: string | null;
          titolo?: string;
          descrizione?: string;
          hotel_id?: string | null;
          ordine?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_program_activities: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          day_id: string;
          titolo: string;
          descrizione: string;
          ora_inizio: string | null;
          ora_fine: string | null;
          luogo: string;
          tipo: string;
          ordine: number;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          day_id: string;
          titolo: string;
          descrizione?: string;
          ora_inizio?: string | null;
          ora_fine?: string | null;
          luogo?: string;
          tipo?: string;
          ordine?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          day_id?: string;
          titolo?: string;
          descrizione?: string;
          ora_inizio?: string | null;
          ora_fine?: string | null;
          luogo?: string;
          tipo?: string;
          ordine?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_flights: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          day_id: string | null;
          direzione: string;
          compagnia: string;
          numero_volo: string;
          aeroporto_partenza: string;
          aeroporto_arrivo: string;
          data_partenza: string;
          ora_partenza: string | null;
          data_arrivo: string | null;
          ora_arrivo: string | null;
          note: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          day_id?: string | null;
          direzione?: string;
          compagnia?: string;
          numero_volo: string;
          aeroporto_partenza?: string;
          aeroporto_arrivo?: string;
          data_partenza: string;
          ora_partenza?: string | null;
          data_arrivo?: string | null;
          ora_arrivo?: string | null;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          day_id?: string | null;
          direzione?: string;
          compagnia?: string;
          numero_volo?: string;
          aeroporto_partenza?: string;
          aeroporto_arrivo?: string;
          data_partenza?: string;
          ora_partenza?: string | null;
          data_arrivo?: string | null;
          ora_arrivo?: string | null;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_transfers: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          day_id: string | null;
          tipo: string;
          partenza: string;
          destinazione: string;
          data: string;
          ora: string | null;
          fornitore: string;
          note: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          day_id?: string | null;
          tipo?: string;
          partenza: string;
          destinazione: string;
          data: string;
          ora?: string | null;
          fornitore?: string;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          day_id?: string | null;
          tipo?: string;
          partenza?: string;
          destinazione?: string;
          data?: string;
          ora?: string | null;
          fornitore?: string;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tour_insurances: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          tour_id: string;
          fornitore: string;
          polizza_numero: string;
          copertura: string;
          premio_cents: number;
          data_inizio: string | null;
          data_fine: string | null;
          stato: string;
          note: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          tour_id: string;
          fornitore: string;
          polizza_numero?: string;
          copertura?: string;
          premio_cents?: number;
          data_inizio?: string | null;
          data_fine?: string | null;
          stato?: string;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          tour_id?: string;
          fornitore?: string;
          polizza_numero?: string;
          copertura?: string;
          premio_cents?: number;
          data_inizio?: string | null;
          data_fine?: string | null;
          stato?: string;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      preventivi: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          numero: string;
          cliente_id: string;
          tour_id: string | null;
          titolo: string;
          stato: string;
          subtotale_cents: number;
          tasse_percentuale: number;
          tasse_cents: number;
          totale_cents: number;
          valido_fino: string | null;
          note: string;
          partecipante_id: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          numero: string;
          cliente_id: string;
          tour_id?: string | null;
          titolo?: string;
          stato?: string;
          subtotale_cents?: number;
          tasse_percentuale?: number;
          tasse_cents?: number;
          totale_cents?: number;
          valido_fino?: string | null;
          note?: string;
          partecipante_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          numero?: string;
          cliente_id?: string;
          tour_id?: string | null;
          titolo?: string;
          stato?: string;
          subtotale_cents?: number;
          tasse_percentuale?: number;
          tasse_cents?: number;
          totale_cents?: number;
          valido_fino?: string | null;
          note?: string;
          partecipante_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      preventivo_righe: {
        Row: TimestampFields & {
          id: string;
          organization_id: string;
          preventivo_id: string;
          descrizione: string;
          quantita: number;
          prezzo_unitario_cents: number;
          ordine: number;
        };
        Insert: {
          id?: string;
          organization_id: string;
          preventivo_id: string;
          descrizione: string;
          quantita?: number;
          prezzo_unitario_cents?: number;
          ordine?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          preventivo_id?: string;
          descrizione?: string;
          quantita?: number;
          prezzo_unitario_cents?: number;
          ordine?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          creato_il: string;
          utente: string;
          azione: string;
          tipo: string;
          azione_tipo: string;
          entita_id: string | null;
          entita_label: string;
          data: string;
          organization_id: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          creato_il?: string;
          utente?: string;
          azione?: string;
          tipo: string;
          azione_tipo: string;
          entita_id?: string | null;
          entita_label?: string;
          data?: string;
          organization_id: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          creato_il?: string;
          utente?: string;
          azione?: string;
          tipo?: string;
          azione_tipo?: string;
          entita_id?: string | null;
          entita_label?: string;
          data?: string;
          organization_id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      notifiche: {
        Row: {
          id: string;
          creato_il: string;
          tipo: string;
          titolo: string;
          messaggio: string;
          href: string | null;
          letta: boolean;
          data: string;
          organization_id: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          creato_il?: string;
          tipo: string;
          titolo?: string;
          messaggio?: string;
          href?: string | null;
          letta?: boolean;
          data?: string;
          organization_id: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          creato_il?: string;
          tipo?: string;
          titolo?: string;
          messaggio?: string;
          href?: string | null;
          letta?: boolean;
          data?: string;
          organization_id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      cliente_timeline_eventi: {
        Row: {
          id: string;
          cliente_id: string;
          creato_il: string;
          tipo: string;
          titolo: string;
          descrizione: string;
          data: string;
          utente: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          creato_il?: string;
          tipo: string;
          titolo?: string;
          descrizione?: string;
          data?: string;
          utente?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          creato_il?: string;
          tipo?: string;
          titolo?: string;
          descrizione?: string;
          data?: string;
          utente?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      tour_stats: {
        Row: {
          tour_id: string;
          numero_partecipanti: number;
          numero_lista_attesa: number;
          posti_disponibili: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      set_updated_at: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ClienteRow = Database["public"]["Tables"]["clienti"]["Row"];
export type ClienteInsert = Database["public"]["Tables"]["clienti"]["Insert"];
export type ClienteUpdate = Database["public"]["Tables"]["clienti"]["Update"];

export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type TourRow = Database["public"]["Tables"]["tours"]["Row"];
export type TourInsert = Database["public"]["Tables"]["tours"]["Insert"];
export type TourUpdate = Database["public"]["Tables"]["tours"]["Update"];
export type TourStaffRow = Database["public"]["Tables"]["tour_staff"]["Row"];
export type TourStaffInsert = Database["public"]["Tables"]["tour_staff"]["Insert"];
export type TourHotelRow = Database["public"]["Tables"]["tour_hotels"]["Row"];
export type TourHotelInsert = Database["public"]["Tables"]["tour_hotels"]["Insert"];
export type TourHotelUpdate = Database["public"]["Tables"]["tour_hotels"]["Update"];
export type TourParticipantRow =
  Database["public"]["Tables"]["tour_participants"]["Row"];
export type TourParticipantInsert =
  Database["public"]["Tables"]["tour_participants"]["Insert"];
export type TourParticipantUpdate =
  Database["public"]["Tables"]["tour_participants"]["Update"];
export type TourRoomRow = Database["public"]["Tables"]["tour_rooms"]["Row"];
export type TourRoomInsert = Database["public"]["Tables"]["tour_rooms"]["Insert"];
export type TourRoomUpdate = Database["public"]["Tables"]["tour_rooms"]["Update"];
export type RoomAssignmentRow =
  Database["public"]["Tables"]["room_assignments"]["Row"];
export type RoomAssignmentInsert =
  Database["public"]["Tables"]["room_assignments"]["Insert"];
export type TourStatsRow = Database["public"]["Views"]["tour_stats"]["Row"];
export type TourPaymentRow = Database["public"]["Tables"]["tour_payments"]["Row"];
export type TourPaymentInsert = Database["public"]["Tables"]["tour_payments"]["Insert"];
export type TourPaymentUpdate = Database["public"]["Tables"]["tour_payments"]["Update"];
export type TourChecklistTemplateRow =
  Database["public"]["Tables"]["tour_checklist_templates"]["Row"];
export type TourChecklistTemplateInsert =
  Database["public"]["Tables"]["tour_checklist_templates"]["Insert"];
export type TourChecklistTemplateUpdate =
  Database["public"]["Tables"]["tour_checklist_templates"]["Update"];
export type TourChecklistCompletionRow =
  Database["public"]["Tables"]["tour_checklist_completions"]["Row"];
export type TourChecklistCompletionInsert =
  Database["public"]["Tables"]["tour_checklist_completions"]["Insert"];
export type TourChecklistCompletionUpdate =
  Database["public"]["Tables"]["tour_checklist_completions"]["Update"];
export type TourDocumentRow = Database["public"]["Tables"]["tour_documents"]["Row"];
export type TourDocumentInsert = Database["public"]["Tables"]["tour_documents"]["Insert"];
export type TourDocumentUpdate = Database["public"]["Tables"]["tour_documents"]["Update"];
export type TourTimelineEventRow =
  Database["public"]["Tables"]["tour_timeline_events"]["Row"];
export type TourTimelineEventInsert =
  Database["public"]["Tables"]["tour_timeline_events"]["Insert"];
export type TourProgramDayRow =
  Database["public"]["Tables"]["tour_program_days"]["Row"];
export type TourProgramDayInsert =
  Database["public"]["Tables"]["tour_program_days"]["Insert"];
export type TourProgramDayUpdate =
  Database["public"]["Tables"]["tour_program_days"]["Update"];
export type TourProgramActivityRow =
  Database["public"]["Tables"]["tour_program_activities"]["Row"];
export type TourProgramActivityInsert =
  Database["public"]["Tables"]["tour_program_activities"]["Insert"];
export type TourProgramActivityUpdate =
  Database["public"]["Tables"]["tour_program_activities"]["Update"];
export type TourFlightRow = Database["public"]["Tables"]["tour_flights"]["Row"];
export type TourFlightInsert = Database["public"]["Tables"]["tour_flights"]["Insert"];
export type TourFlightUpdate = Database["public"]["Tables"]["tour_flights"]["Update"];
export type TourTransferRow =
  Database["public"]["Tables"]["tour_transfers"]["Row"];
export type TourTransferInsert =
  Database["public"]["Tables"]["tour_transfers"]["Insert"];
export type TourTransferUpdate =
  Database["public"]["Tables"]["tour_transfers"]["Update"];
export type TourInsuranceRow =
  Database["public"]["Tables"]["tour_insurances"]["Row"];
export type TourInsuranceInsert =
  Database["public"]["Tables"]["tour_insurances"]["Insert"];
export type TourInsuranceUpdate =
  Database["public"]["Tables"]["tour_insurances"]["Update"];
export type PreventivoRow = Database["public"]["Tables"]["preventivi"]["Row"];
export type PreventivoInsert = Database["public"]["Tables"]["preventivi"]["Insert"];
export type PreventivoUpdate = Database["public"]["Tables"]["preventivi"]["Update"];
export type PreventivoRigaRow =
  Database["public"]["Tables"]["preventivo_righe"]["Row"];
export type PreventivoRigaInsert =
  Database["public"]["Tables"]["preventivo_righe"]["Insert"];
export type PreventivoRigaUpdate =
  Database["public"]["Tables"]["preventivo_righe"]["Update"];
