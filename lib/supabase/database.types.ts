export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WebinarRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  event_type: "ONLINE" | "ONSITE" | "HYBRID";
  topics: Json[];
  benefits: Json[];
  rundown: Json[];
  facilities: Json[];
  audience: string;
  speakers: Json[];
  city: string | null;
  venue: string | null;
  venue_address: string | null;
  price: number;
  credits: number;
  registration_status: "OPEN" | "COMING_SOON" | "SOLD_OUT" | "CLOSED";
  start_date: string;
  end_date: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RegistrationRow = {
  id: string;
  webinar_id: string;
  registration_reference: string;
  ticket_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: "pending" | "lunas" | "batal";
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  registration_id: string;
  amount: number;
  payment_method: "qris" | "virtual-account" | "card";
  status: "pending" | "paid" | "failed";
  transaction_id: string | null;
  paid_at: string | null;
  receipt_sent_at: string | null;
  receipt_message_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CertificateRow = {
  id: string;
  registration_id: string;
  certificate_number: string;
  verification_token: string;
  file_url: string | null;
  status: "valid" | "revoked";
  email_sent_at: string | null;
  email_message_id: string | null;
  download_count: number;
  last_download_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      platform_records: {
        Row: { collection:string; id:string; data:Json; owner_email:string|null; published:boolean; revision:number; created_at:string; updated_at:string };
        Insert: { collection:string; id:string; data:Json; owner_email?:string|null; published?:boolean; revision?:number };
        Update: { data?:Json; owner_email?:string|null; published?:boolean; revision?:number };
        Relationships: [];
      };

      webinars: {
        Row: WebinarRow;
        Insert: Omit<WebinarRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<WebinarRow, "id" | "created_at">>;
        Relationships: [];
      };
      registrations: {
        Row: RegistrationRow;
        Insert: Omit<
          RegistrationRow,
          "id" | "registration_reference" | "status" | "created_at" | "updated_at"
        > & {
          id?: string;
          registration_reference?: string;
          status?: RegistrationRow["status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<RegistrationRow, "id" | "registration_reference" | "created_at">
        >;
        Relationships: [
          {
            foreignKeyName: "registrations_webinar_id_fkey";
            columns: ["webinar_id"];
            isOneToOne: false;
            referencedRelation: "webinars";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: PaymentRow;
        Insert: Omit<
          PaymentRow,
          | "id"
          | "status"
          | "transaction_id"
          | "paid_at"
          | "receipt_sent_at"
          | "receipt_message_id"
          | "created_at"
          | "updated_at"
        > & {
          id?: string;
          status?: PaymentRow["status"];
          transaction_id?: string | null;
          paid_at?: string | null;
          receipt_sent_at?: string | null;
          receipt_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PaymentRow, "id" | "registration_id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: true;
            referencedRelation: "registrations";
            referencedColumns: ["id"];
          },
        ];
      };
      certificates: {
        Row: CertificateRow;
        Insert: Omit<
          CertificateRow,
          | "id"
          | "certificate_number"
          | "verification_token"
          | "file_url"
          | "status"
          | "email_sent_at"
          | "email_message_id"
          | "download_count"
          | "last_download_at"
          | "created_at"
          | "updated_at"
        > & {
          id?: string;
          certificate_number?: string;
          verification_token?: string;
          file_url?: string | null;
          status?: CertificateRow["status"];
          email_sent_at?: string | null;
          email_message_id?: string | null;
          download_count?: number;
          last_download_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<
            CertificateRow,
            | "id"
            | "registration_id"
            | "certificate_number"
            | "verification_token"
            | "created_at"
          >
        >;
        Relationships: [
          {
            foreignKeyName: "certificates_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: true;
            referencedRelation: "registrations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      commit_platform_changes: { Args:{p_changes:Json}; Returns:undefined };
      consume_api_limit: { Args:{p_key:string;p_limit:number;p_seconds:number}; Returns:boolean };

      apply_payment_callback: {
        Args: {
          p_transaction_id: string;
          p_status: PaymentRow["status"];
          p_paid_at?: string | null;
        };
        Returns: Array<{
          payment_id: string;
          registration_id: string;
          payment_status: PaymentRow["status"];
          registration_status: RegistrationRow["status"];
        }>;
      };
      get_certificate_generation_candidates: {
        Args: {
          p_now?: string;
          p_limit?: number;
        };
        Returns: Array<{
          registration_id: string;
        }>;
      };
      record_certificate_download: {
        Args: {
          p_verification_token: string;
          p_downloaded_at?: string;
        };
        Returns: Array<{
          certificate_id: string;
          file_url: string;
          download_count: number;
          last_download_at: string;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
