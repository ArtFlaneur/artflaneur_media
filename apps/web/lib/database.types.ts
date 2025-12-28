// TypeScript types for Supabase database
// Keep in sync with supabase-schema.sql

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
      gallery_claim_requests: {
        Row: {
          id: string;
          created_at: string;
          gallery_external_id: string;
          gallery_name: string | null;
          gallery_city: string | null;
          gallery_country: string | null;
          applicant_email: string;
          applicant_name: string | null;
          applicant_phone: string | null;
          message: string | null;
          status: string;
          reviewed_at: string | null;
          reviewer_note: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          gallery_external_id: string;
          gallery_name?: string | null;
          gallery_city?: string | null;
          gallery_country?: string | null;
          applicant_email: string;
          applicant_name?: string | null;
          applicant_phone?: string | null;
          message?: string | null;
          status?: string;
          reviewed_at?: string | null;
          reviewer_note?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          gallery_external_id?: string;
          gallery_name?: string | null;
          gallery_city?: string | null;
          gallery_country?: string | null;
          applicant_email?: string;
          applicant_name?: string | null;
          applicant_phone?: string | null;
          message?: string | null;
          status?: string;
          reviewed_at?: string | null;
          reviewer_note?: string | null;
        };
        Relationships: [];
      };
      galleries: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'galleries_owner_user_id_fkey';
            columns: ['owner_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_managers: {
        Row: {
          id: string;
          gallery_id: string;
          user_id: string;
          role: 'owner' | 'manager' | 'editor';
          created_at: string;
        };
        Insert: {
          id?: string;
          gallery_id: string;
          user_id: string;
          role: 'owner' | 'manager' | 'editor';
          created_at?: string;
        };
        Update: {
          id?: string;
          gallery_id?: string;
          user_id?: string;
          role?: 'owner' | 'manager' | 'editor';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_managers_gallery_id_fkey';
            columns: ['gallery_id'];
            isOneToOne: false;
            referencedRelation: 'galleries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gallery_managers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      exhibition_submissions: {
        Row: {
          id: string;
          gallery_id: string;
          sanity_exhibition_id: string | null;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          artists: string[] | null;
          curators: string[] | null;
          image_url: string | null;
          ticketing_access: 'free' | 'ticketed';
          ticketing_price: string | null;
          ticketing_link: string | null;
          ticketing_cta_label: string | null;
          venue_override: string | null;
          status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
          rejection_reason: string | null;
          submitted_at: string | null;
          approved_at: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gallery_id: string;
          sanity_exhibition_id?: string | null;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          artists?: string[] | null;
          curators?: string[] | null;
          image_url?: string | null;
          ticketing_access?: 'free' | 'ticketed';
          ticketing_price?: string | null;
          ticketing_link?: string | null;
          ticketing_cta_label?: string | null;
          venue_override?: string | null;
          status?: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
          rejection_reason?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gallery_id?: string;
          sanity_exhibition_id?: string | null;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          artists?: string[] | null;
          curators?: string[] | null;
          image_url?: string | null;
          ticketing_access?: 'free' | 'ticketed';
          ticketing_price?: string | null;
          ticketing_link?: string | null;
          ticketing_cta_label?: string | null;
          venue_override?: string | null;
          status?: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
          rejection_reason?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'exhibition_submissions_gallery_id_fkey';
            columns: ['gallery_id'];
            isOneToOne: false;
            referencedRelation: 'galleries';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_audit_log: {
        Row: {
          id: string;
          gallery_id: string;
          user_id: string | null;
          action: string;
          description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gallery_id: string;
          user_id?: string | null;
          action: string;
          description: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gallery_id?: string;
          user_id?: string | null;
          action?: string;
          description?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_audit_log_gallery_id_fkey';
            columns: ['gallery_id'];
            isOneToOne: false;
            referencedRelation: 'galleries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gallery_audit_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      gallery_dashboard_stats: {
        Row: {
          gallery_id: string;
          gallery_name: string;
          draft_exhibitions: number;
          pending_exhibitions: number;
          published_exhibitions: number;
          team_members: number;
          last_exhibition_created: string | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Helper types
export type Gallery = Database['public']['Tables']['galleries']['Row'];
export type GalleryInsert = Database['public']['Tables']['galleries']['Insert'];
export type GalleryUpdate = Database['public']['Tables']['galleries']['Update'];

export type ExhibitionSubmission = Database['public']['Tables']['exhibition_submissions']['Row'];
export type ExhibitionSubmissionInsert = Database['public']['Tables']['exhibition_submissions']['Insert'];
export type ExhibitionSubmissionUpdate = Database['public']['Tables']['exhibition_submissions']['Update'];

export type GalleryManager = Database['public']['Tables']['gallery_managers']['Row'];
export type AuditLog = Database['public']['Tables']['gallery_audit_log']['Row'];
export type DashboardStats = Database['public']['Views']['gallery_dashboard_stats']['Row'];
