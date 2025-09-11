export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      airtime_orders: {
        Row: {
          account_reference: string
          amount: number
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_enum"]
          customer_msisdn: string | null
          description: string | null
          id: string
          idempotency_key: string | null
          kyanda_tx_id: string | null
          metadata: Json
          mpesa_payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status_enum"]
          recipient_msisdn: string
          requires_recon: boolean
          telco_code: Database["public"]["Enums"]["telco_enum"]
          updated_at: string
          vend_status: Database["public"]["Enums"]["vend_status_enum"]
          vendor_id: string
          vendor_reference: string | null
        }
        Insert: {
          account_reference: string
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_enum"]
          customer_msisdn?: string | null
          description?: string | null
          id?: string
          idempotency_key?: string | null
          kyanda_tx_id?: string | null
          metadata?: Json
          mpesa_payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status_enum"]
          recipient_msisdn: string
          requires_recon?: boolean
          telco_code: Database["public"]["Enums"]["telco_enum"]
          updated_at?: string
          vend_status?: Database["public"]["Enums"]["vend_status_enum"]
          vendor_id: string
          vendor_reference?: string | null
        }
        Update: {
          account_reference?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_enum"]
          customer_msisdn?: string | null
          description?: string | null
          id?: string
          idempotency_key?: string | null
          kyanda_tx_id?: string | null
          metadata?: Json
          mpesa_payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status_enum"]
          recipient_msisdn?: string
          requires_recon?: boolean
          telco_code?: Database["public"]["Enums"]["telco_enum"]
          updated_at?: string
          vend_status?: Database["public"]["Enums"]["vend_status_enum"]
          vendor_id?: string
          vendor_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "airtime_orders_telco_code_fkey"
            columns: ["telco_code"]
            isOneToOne: false
            referencedRelation: "telcos"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "airtime_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_kyanda"
            columns: ["kyanda_tx_id"]
            isOneToOne: true
            referencedRelation: "kyanda_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_mpesa"
            columns: ["mpesa_payment_id"]
            isOneToOne: true
            referencedRelation: "mpesa_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string | null
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      inbound_webhooks: {
        Row: {
          error: string | null
          event_type: string | null
          external_id: string | null
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          received_at: string
          source: string
        }
        Insert: {
          error?: string | null
          event_type?: string | null
          external_id?: string | null
          id?: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          received_at?: string
          source: string
        }
        Update: {
          error?: string | null
          event_type?: string | null
          external_id?: string | null
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          received_at?: string
          source?: string
        }
        Relationships: []
      }
      kyanda_callback: {
        Row: {
          created_at: string
          data: Json | null
          id: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: number
        }
        Relationships: []
      }
      kyanda_error_codes: {
        Row: {
          code: string
          description: string | null
          severity: string | null
          short_message: string | null
        }
        Insert: {
          code: string
          description?: string | null
          severity?: string | null
          short_message?: string | null
        }
        Update: {
          code?: string
          description?: string | null
          severity?: string | null
          short_message?: string | null
        }
        Relationships: []
      }
      kyanda_transactions: {
        Row: {
          amount: number | null
          biller_receipt: string | null
          category: string | null
          created_at: string
          destination_msisdn: string | null
          id: string
          merchant_id: string | null
          occurred_at: string | null
          phone_number_msisdn: string | null
          raw_payload: Json
          source_msisdn: string | null
          status_code: string | null
          status_text: string | null
          telco_reference: string | null
          transaction_id: string | null
          transaction_ref: string | null
          unique_ref: string | null
          updated_at: string
          vend_status: Database["public"]["Enums"]["vend_status_enum"]
          vendor_id: string
        }
        Insert: {
          amount?: number | null
          biller_receipt?: string | null
          category?: string | null
          created_at?: string
          destination_msisdn?: string | null
          id?: string
          merchant_id?: string | null
          occurred_at?: string | null
          phone_number_msisdn?: string | null
          raw_payload: Json
          source_msisdn?: string | null
          status_code?: string | null
          status_text?: string | null
          telco_reference?: string | null
          transaction_id?: string | null
          transaction_ref?: string | null
          unique_ref?: string | null
          updated_at?: string
          vend_status?: Database["public"]["Enums"]["vend_status_enum"]
          vendor_id: string
        }
        Update: {
          amount?: number | null
          biller_receipt?: string | null
          category?: string | null
          created_at?: string
          destination_msisdn?: string | null
          id?: string
          merchant_id?: string | null
          occurred_at?: string | null
          phone_number_msisdn?: string | null
          raw_payload?: Json
          source_msisdn?: string | null
          status_code?: string | null
          status_text?: string | null
          telco_reference?: string | null
          transaction_id?: string | null
          transaction_ref?: string | null
          unique_ref?: string | null
          updated_at?: string
          vend_status?: Database["public"]["Enums"]["vend_status_enum"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyanda_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_callback: {
        Row: {
          created_at: string
          data: Json | null
          id: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: number
        }
        Relationships: []
      }
      mpesa_payments: {
        Row: {
          account_reference: string
          amount: number
          business_shortcode: string
          callback_raw: Json | null
          callback_url: string
          checkout_request_id: string | null
          created_at: string
          customer_message: string | null
          id: string
          merchant_request_id: string | null
          mpesa_receipt_number: string | null
          paid_amount: number | null
          party_a_msisdn: string
          party_b_shortcode: string
          payer_msisdn: string | null
          phone_number_msisdn: string
          response_code: string | null
          response_description: string | null
          result_code: number | null
          result_desc: string | null
          status: Database["public"]["Enums"]["payment_status_enum"]
          transaction_desc: string | null
          transaction_time: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          account_reference: string
          amount: number
          business_shortcode?: string
          callback_raw?: Json | null
          callback_url: string
          checkout_request_id?: string | null
          created_at?: string
          customer_message?: string | null
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          paid_amount?: number | null
          party_a_msisdn: string
          party_b_shortcode?: string
          payer_msisdn?: string | null
          phone_number_msisdn: string
          response_code?: string | null
          response_description?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          transaction_desc?: string | null
          transaction_time?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Update: {
          account_reference?: string
          amount?: number
          business_shortcode?: string
          callback_raw?: Json | null
          callback_url?: string
          checkout_request_id?: string | null
          created_at?: string
          customer_message?: string | null
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          paid_amount?: number | null
          party_a_msisdn?: string
          party_b_shortcode?: string
          payer_msisdn?: string | null
          phone_number_msisdn?: string
          response_code?: string | null
          response_description?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          transaction_desc?: string | null
          transaction_time?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel: string
          created_at: string
          id: string
          level: string
          message: string
          order_id: string | null
          seen_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          level?: string
          message: string
          order_id?: string | null
          seen_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          level?: string
          message?: string
          order_id?: string | null
          seen_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "airtime_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_dashboard"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          metadata: Json | null
          phone: string | null
          phone_verified_at: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          metadata?: Json | null
          phone?: string | null
          phone_verified_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          metadata?: Json | null
          phone?: string | null
          phone_verified_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      telcos: {
        Row: {
          active: boolean
          code: Database["public"]["Enums"]["telco_enum"]
          display_name: string
          vendor_name: string
        }
        Insert: {
          active?: boolean
          code: Database["public"]["Enums"]["telco_enum"]
          display_name: string
          vendor_name: string
        }
        Update: {
          active?: boolean
          code?: Database["public"]["Enums"]["telco_enum"]
          display_name?: string
          vendor_name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          amount_integer: number
          biller_receipt: string | null
          canonical_status: string | null
          category: string | null
          checkout_request_id: string | null
          created_at: string | null
          currency: string
          description: string | null
          direction: string | null
          external_id: string | null
          id: string
          initiator_phone: string
          kyanda_message: string | null
          kyanda_status_code: string | null
          kyanda_transaction_ref: string | null
          merchant_request_id: string | null
          meta: Json | null
          mpesa_receipt: string | null
          network: string
          parent_transaction_id: string | null
          payer_first_name: string | null
          payer_last_name: string | null
          payer_middle_name: string | null
          provider: string
          provider_status_code: string | null
          recipient_phone: string
          reference: string | null
          result_code: number | null
          result_desc: string | null
          status: string
          telco_reference: string | null
          transaction_date: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          amount_integer: number
          biller_receipt?: string | null
          canonical_status?: string | null
          category?: string | null
          checkout_request_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          direction?: string | null
          external_id?: string | null
          id?: string
          initiator_phone: string
          kyanda_message?: string | null
          kyanda_status_code?: string | null
          kyanda_transaction_ref?: string | null
          merchant_request_id?: string | null
          meta?: Json | null
          mpesa_receipt?: string | null
          network: string
          parent_transaction_id?: string | null
          payer_first_name?: string | null
          payer_last_name?: string | null
          payer_middle_name?: string | null
          provider: string
          provider_status_code?: string | null
          recipient_phone: string
          reference?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: string
          telco_reference?: string | null
          transaction_date?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          amount_integer?: number
          biller_receipt?: string | null
          canonical_status?: string | null
          category?: string | null
          checkout_request_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          direction?: string | null
          external_id?: string | null
          id?: string
          initiator_phone?: string
          kyanda_message?: string | null
          kyanda_status_code?: string | null
          kyanda_transaction_ref?: string | null
          merchant_request_id?: string | null
          meta?: Json | null
          mpesa_receipt?: string | null
          network?: string
          parent_transaction_id?: string | null
          payer_first_name?: string | null
          payer_last_name?: string | null
          payer_middle_name?: string | null
          provider?: string
          provider_status_code?: string | null
          recipient_phone?: string
          reference?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: string
          telco_reference?: string | null
          transaction_date?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_parent"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "mv_failed_topups"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "fk_transactions_parent"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "mv_failed_topups"
            referencedColumns: ["topup_id"]
          },
          {
            foreignKeyName: "fk_transactions_parent"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_daily_payments: {
        Row: {
          day: string | null
          payments_count: number | null
          payments_total_kes: number | null
        }
        Relationships: []
      }
      mv_failed_topups: {
        Row: {
          kyanda_message: string | null
          kyanda_status_code: string | null
          parent_transaction_id: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_id: string | null
          topup_amount: number | null
          topup_date: string | null
          topup_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_parent"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "mv_failed_topups"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "fk_transactions_parent"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "mv_failed_topups"
            referencedColumns: ["topup_id"]
          },
          {
            foreignKeyName: "fk_transactions_parent"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      v_orders_dashboard: {
        Row: {
          account_reference: string | null
          amount: number | null
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_enum"] | null
          customer_msisdn: string | null
          description: string | null
          id: string | null
          kyanda_tx_id: string | null
          metadata: Json | null
          mpesa_payment_id: string | null
          mpesa_receipt_number: string | null
          order_state: string | null
          payment_status:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          recipient_msisdn: string | null
          requires_recon: boolean | null
          status_text: string | null
          telco_code: Database["public"]["Enums"]["telco_enum"] | null
          transaction_id: string | null
          transaction_ref: string | null
          transaction_time: string | null
          updated_at: string | null
          vend_status: Database["public"]["Enums"]["vend_status_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "airtime_orders_telco_code_fkey"
            columns: ["telco_code"]
            isOneToOne: false
            referencedRelation: "telcos"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "fk_orders_kyanda"
            columns: ["kyanda_tx_id"]
            isOneToOne: true
            referencedRelation: "kyanda_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_mpesa"
            columns: ["mpesa_payment_id"]
            isOneToOne: true
            referencedRelation: "mpesa_payments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      claim_transactions_for_user: {
        Args: { p_days?: number; p_phone: string; p_user: string }
        Returns: number
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { uid: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      auth_provider: "password" | "phone" | "google"
      currency_code: "KES"
      currency_enum: "KES"
      payment_provider: "MPESA"
      payment_status_enum:
        | "initiated"
        | "awaiting_customer"
        | "paid"
        | "cancelled"
        | "timed_out"
        | "failed"
        | "reversed"
        | "refunded"
        | "unknown"
      telco_enum: "SAFARICOM" | "AIRTEL" | "TELKOM" | "EQUITEL" | "FAIBA"
      txn_status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "EXPIRED"
      vend_status_enum:
        | "submitted"
        | "pending"
        | "success"
        | "failed"
        | "reversed"
        | "unknown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      auth_provider: ["password", "phone", "google"],
      currency_code: ["KES"],
      currency_enum: ["KES"],
      payment_provider: ["MPESA"],
      payment_status_enum: [
        "initiated",
        "awaiting_customer",
        "paid",
        "cancelled",
        "timed_out",
        "failed",
        "reversed",
        "refunded",
        "unknown",
      ],
      telco_enum: ["SAFARICOM", "AIRTEL", "TELKOM", "EQUITEL", "FAIBA"],
      txn_status: ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "EXPIRED"],
      vend_status_enum: [
        "submitted",
        "pending",
        "success",
        "failed",
        "reversed",
        "unknown",
      ],
    },
  },
} as const
