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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          detail: Json
          device: string
          duration_seconds: number | null
          id: string
          kind: string
          label: string
          path: string
          user_id: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          device?: string
          duration_seconds?: number | null
          id?: string
          kind: string
          label?: string
          path?: string
          user_id?: string
          visit_id?: string
        }
        Update: {
          created_at?: string
          detail?: Json
          device?: string
          duration_seconds?: number | null
          id?: string
          kind?: string
          label?: string
          path?: string
          user_id?: string
          visit_id?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          feature: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          note: string
          owner_id: string
          path: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          owner_id?: string
          path: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          owner_id?: string
          path?: string
          title?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          owner_id: string
          passages: Json | null
          role: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          owner_id?: string
          passages?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          passages?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_pages: {
        Row: {
          brief: string
          content: string
          created_at: string
          id: string
          menu_group: string
          owner_id: string
          passages: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          brief?: string
          content?: string
          created_at?: string
          id?: string
          menu_group?: string
          owner_id: string
          passages?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          brief?: string
          content?: string
          created_at?: string
          id?: string
          menu_group?: string
          owner_id?: string
          passages?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_overrides: {
        Row: {
          doc_key: string
          hidden: boolean
          note: string | null
          sort_order: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          doc_key: string
          hidden?: boolean
          note?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          doc_key?: string
          hidden?: boolean
          note?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      generated_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          image_path: string | null
          owner_id: string
          page_key: string
          section: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          image_path?: string | null
          owner_id: string
          page_key: string
          section?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_path?: string | null
          owner_id?: string
          page_key?: string
          section?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      library_items: {
        Row: {
          category: string | null
          cover_path: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          id: string
          kind: string
          mime_type: string | null
          owner_id: string
          sections: Json | null
          shared_with_space: boolean
          size_bytes: number | null
          title: string
        }
        Insert: {
          category?: string | null
          cover_path?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          id?: string
          kind?: string
          mime_type?: string | null
          owner_id?: string
          sections?: Json | null
          shared_with_space?: boolean
          size_bytes?: number | null
          title: string
        }
        Update: {
          category?: string | null
          cover_path?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          id?: string
          kind?: string
          mime_type?: string | null
          owner_id?: string
          sections?: Json | null
          shared_with_space?: boolean
          size_bytes?: number | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          birth_time: string | null
          chart: Json | null
          created_at: string
          display_name: string
          house_system: string
          id: string
          lat: number | null
          lon: number | null
          onboarded_at: string | null
          place_label: string
          tz: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          birth_time?: string | null
          chart?: Json | null
          created_at?: string
          display_name?: string
          house_system?: string
          id: string
          lat?: number | null
          lon?: number | null
          onboarded_at?: string | null
          place_label?: string
          tz?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          birth_time?: string | null
          chart?: Json | null
          created_at?: string
          display_name?: string
          house_system?: string
          id?: string
          lat?: number | null
          lon?: number | null
          onboarded_at?: string | null
          place_label?: string
          tz?: string
          updated_at?: string
        }
        Relationships: []
      }
      relationships: {
        Row: {
          birth_date: string
          birth_time: string | null
          created_at: string
          id: string
          lat: number
          lon: number
          name: string
          notes: string
          owner_id: string
          place_label: string
          relation: string
          sex: string
          tz: string
          updated_at: string
        }
        Insert: {
          birth_date: string
          birth_time?: string | null
          created_at?: string
          id?: string
          lat: number
          lon: number
          name: string
          notes?: string
          owner_id: string
          place_label?: string
          relation?: string
          sex?: string
          tz: string
          updated_at?: string
        }
        Update: {
          birth_date?: string
          birth_time?: string | null
          created_at?: string
          id?: string
          lat?: number
          lon?: number
          name?: string
          notes?: string
          owner_id?: string
          place_label?: string
          relation?: string
          sex?: string
          tz?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_account_refs: {
        Row: {
          account_owner: string
          created_at: string
          created_by: string
          id: string
          notes: string
          service_name: string
          updated_at: string
          url: string
          username: string
        }
        Insert: {
          account_owner?: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string
          service_name: string
          updated_at?: string
          url?: string
          username?: string
        }
        Update: {
          account_owner?: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string
          service_name?: string
          updated_at?: string
          url?: string
          username?: string
        }
        Relationships: []
      }
      shared_annotations: {
        Row: {
          author_id: string
          created_at: string
          document_id: string
          edited_at: string | null
          id: string
          note: string
          page: number | null
          quote: string
        }
        Insert: {
          author_id: string
          created_at?: string
          document_id: string
          edited_at?: string | null
          id?: string
          note: string
          page?: number | null
          quote?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          document_id?: string
          edited_at?: string | null
          id?: string
          note?: string
          page?: number | null
          quote?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_annotations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "shared_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          message_id: string | null
          mime_type: string | null
          post_id: string | null
          size_bytes: number | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          message_id?: string | null
          mime_type?: string | null
          post_id?: string | null
          size_bytes?: number | null
          uploaded_by?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          message_id?: string | null
          mime_type?: string | null
          post_id?: string | null
          size_bytes?: number | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "shared_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "shared_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_conversation_reads: {
        Row: {
          conversation_id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          last_read_at?: string
          user_id?: string
        }
        Update: {
          conversation_id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_conversation_reads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "shared_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kind: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_documents: {
        Row: {
          created_at: string
          description: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      shared_future_topics: {
        Row: {
          created_at: string
          created_by: string
          details: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          details?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          details?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_item_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          item_id: string
          item_type: string
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          id?: string
          item_id: string
          item_type: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
        }
        Relationships: []
      }
      shared_item_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          item_id: string
          item_type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_media: {
        Row: {
          caption: string
          created_at: string
          file_name: string
          file_path: string
          folder_id: string | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          uploaded_by: string
        }
        Insert: {
          caption?: string
          created_at?: string
          file_name: string
          file_path: string
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by?: string
        }
        Update: {
          caption?: string
          created_at?: string
          file_name?: string
          file_path?: string
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_media_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "shared_media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_media_folders: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      shared_message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "shared_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          body?: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "shared_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "shared_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_notes: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          title: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      shared_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_recommendations: {
        Row: {
          author_id: string
          category: string
          created_at: string
          id: string
          link: string
          note: string
          title: string
        }
        Insert: {
          author_id?: string
          category?: string
          created_at?: string
          id?: string
          link?: string
          note?: string
          title: string
        }
        Update: {
          author_id?: string
          category?: string
          created_at?: string
          id?: string
          link?: string
          note?: string
          title?: string
        }
        Relationships: []
      }
      shared_wondering_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          edited_at: string | null
          id: string
          wondering_id: string
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          edited_at?: string | null
          id?: string
          wondering_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          wondering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_wondering_comments_wondering_id_fkey"
            columns: ["wondering_id"]
            isOneToOne: false
            referencedRelation: "shared_wonderings"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_wondering_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          user_id: string
          wondering_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          user_id?: string
          wondering_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
          wondering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_wondering_reactions_wondering_id_fkey"
            columns: ["wondering_id"]
            isOneToOne: false
            referencedRelation: "shared_wonderings"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_wondering_reads: {
        Row: {
          last_read_at: string
          user_id: string
        }
        Insert: {
          last_read_at?: string
          user_id?: string
        }
        Update: {
          last_read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_wonderings: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          status: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          id?: string
          status?: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          status?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_messages: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          parts: Json
          role: string
          session_id: string
          ui_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string
          parts?: Json
          role: string
          session_id: string
          ui_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          parts?: Json
          role?: string
          session_id?: string
          ui_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "social_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      social_sessions: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      space_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          space_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          space_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          space_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_invites_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_members: {
        Row: {
          joined_at: string
          role: string
          space_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          role?: string
          space_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          role?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          plan: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          plan?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          plan?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      therapy_messages: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          parts: Json
          role: string
          session_id: string
          ui_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string
          parts?: Json
          role: string
          session_id: string
          ui_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          parts?: Json
          role?: string
          session_id?: string
          ui_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_sessions: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workbook_entries: {
        Row: {
          answer: string
          created_at: string
          data: Json
          feedback: string
          id: string
          kind: string
          module: string
          owner_id: string
          prompt_key: string
          question: string
          updated_at: string
        }
        Insert: {
          answer?: string
          created_at?: string
          data?: Json
          feedback?: string
          id?: string
          kind?: string
          module?: string
          owner_id?: string
          prompt_key?: string
          question?: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          data?: Json
          feedback?: string
          id?: string
          kind?: string
          module?: string
          owner_id?: string
          prompt_key?: string
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_space_invite: { Args: { _token: string }; Returns: string }
      claim_admin: { Args: never; Returns: boolean }
      create_space: { Args: { _name: string }; Returns: string }
      ensure_shared_main_conversation: { Args: never; Returns: string }
      get_document_overrides: {
        Args: never
        Returns: {
          doc_key: string
          hidden: boolean
          note: string
          sort_order: number
          title: string
        }[]
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_shared_space_member: { Args: never; Returns: boolean }
      is_shared_space_user_id: { Args: { _user_id: string }; Returns: boolean }
      is_space_member: { Args: { _space_id: string }; Returns: boolean }
      is_space_owner: { Args: { _space_id: string }; Returns: boolean }
      recent_library_items: {
        Args: never
        Returns: {
          created_at: string
          description: string
          id: string
          kind: string
          title: string
        }[]
      }
      shared_member_directory: {
        Args: never
        Returns: {
          display_name: string
          user_id: string
        }[]
      }
      shared_unread_counts: {
        Args: never
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
