export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      reservations: {
        Row: {
          id: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string | null;
          checkin_date: string;
          checkout_date: string;
          guest_count: number;
          property_name: string;
          reservation_code: string;
          pin_code: string | null;
          checkin_time_note: string | null;
          emergency_contact: string | null;
          notes: string | null;
          status: Database["public"]["Enums"]["reservation_status"];
          guest_access_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_name: string;
          guest_email: string;
          guest_phone?: string | null;
          checkin_date: string;
          checkout_date: string;
          guest_count?: number;
          property_name: string;
          reservation_code: string;
          pin_code?: string | null;
          checkin_time_note?: string | null;
          emergency_contact?: string | null;
          notes?: string | null;
          status?: Database["public"]["Enums"]["reservation_status"];
          guest_access_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_name?: string;
          guest_email?: string;
          guest_phone?: string | null;
          checkin_date?: string;
          checkout_date?: string;
          guest_count?: number;
          property_name?: string;
          reservation_code?: string;
          pin_code?: string | null;
          checkin_time_note?: string | null;
          emergency_contact?: string | null;
          notes?: string | null;
          status?: Database["public"]["Enums"]["reservation_status"];
          guest_access_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mail_logs: {
        Row: {
          id: string;
          reservation_id: string;
          subject: string;
          body: string;
          sent_at: string | null;
          send_status: Database["public"]["Enums"]["mail_send_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          subject: string;
          body: string;
          sent_at?: string | null;
          send_status?: Database["public"]["Enums"]["mail_send_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          subject?: string;
          body?: string;
          sent_at?: string | null;
          send_status?: Database["public"]["Enums"]["mail_send_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mail_logs_reservation_id_fkey";
            columns: ["reservation_id"];
            isOneToOne: false;
            referencedRelation: "reservations";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          id: string;
          property_name: string;
          address: string;
          emergency_contact: string;
          sender_name: string;
          email_subject_template: string;
          email_body_template: string;
          checkin_guide_text: string;
          caution_text: string;
          checkout_guide_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_name: string;
          address: string;
          emergency_contact: string;
          sender_name: string;
          email_subject_template?: string;
          email_body_template?: string;
          checkin_guide_text?: string;
          caution_text?: string;
          checkout_guide_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_name?: string;
          address?: string;
          emergency_contact?: string;
          sender_name?: string;
          email_subject_template?: string;
          email_body_template?: string;
          checkin_guide_text?: string;
          caution_text?: string;
          checkout_guide_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      reservation_status:
        | "registered"
        | "pin_set"
        | "mail_sent"
        | "ready_for_checkin"
        | "checked_in"
        | "checked_out";
      mail_send_status: "pending" | "sent" | "failed";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"];

export type Enums<EnumName extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][EnumName];
