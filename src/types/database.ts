export type { ClienteStato } from "@/types/cliente";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
    };
    Views: Record<string, never>;
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
