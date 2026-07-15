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
