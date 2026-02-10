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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_history: {
        Row: {
          action_taken: string
          admin_id: string
          created_at: string | null
          id: string
          related_insight_id: string | null
          result: string | null
        }
        Insert: {
          action_taken: string
          admin_id: string
          created_at?: string | null
          id?: string
          related_insight_id?: string | null
          result?: string | null
        }
        Update: {
          action_taken?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          related_insight_id?: string | null
          result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_history_related_insight_id_fkey"
            columns: ["related_insight_id"]
            isOneToOne: false
            referencedRelation: "decision_insights"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          module: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          module: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          module?: string
        }
        Relationships: []
      }
      analytics_cache: {
        Row: {
          data: Json
          date_range: string
          id: string
          last_fetched_at: string
          metric_type: string
        }
        Insert: {
          data?: Json
          date_range: string
          id?: string
          last_fetched_at?: string
          metric_type: string
        }
        Update: {
          data?: Json
          date_range?: string
          id?: string
          last_fetched_at?: string
          metric_type?: string
        }
        Relationships: []
      }
      analytics_settings: {
        Row: {
          click_tracking: boolean
          geo_tracking: boolean
          id: string
          refresh_interval: number
          scroll_tracking: boolean
          tracking_enabled: boolean
          updated_at: string
        }
        Insert: {
          click_tracking?: boolean
          geo_tracking?: boolean
          id?: string
          refresh_interval?: number
          scroll_tracking?: boolean
          tracking_enabled?: boolean
          updated_at?: string
        }
        Update: {
          click_tracking?: boolean
          geo_tracking?: boolean
          id?: string
          refresh_interval?: number
          scroll_tracking?: boolean
          tracking_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      click_events: {
        Row: {
          clicked_at: string
          element_id: string | null
          element_text: string | null
          event_type: string
          id: string
          metadata: Json | null
          page_path: string
          session_id: string | null
          visitor_id: string | null
        }
        Insert: {
          clicked_at?: string
          element_id?: string | null
          element_text?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_path: string
          session_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          clicked_at?: string
          element_id?: string | null
          element_text?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string
          session_id?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "click_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_events_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_insights: {
        Row: {
          created_at: string
          description: string | null
          id: string
          insight_type: string
          priority: string
          status: string
          suggested_action: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          insight_type: string
          priority?: string
          status?: string
          suggested_action?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          insight_type?: string
          priority?: string
          status?: string
          suggested_action?: string | null
          title?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string | null
          email: string | null
          event_date: string | null
          event_type: string | null
          id: string
          location: string | null
          message: string | null
          name: string
          phone: string
          source: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          message?: string | null
          name: string
          phone: string
          source?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          message?: string | null
          name?: string
          phone?: string
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      films: {
        Row: {
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          location: string | null
          thumbnail_type: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          location?: string | null
          thumbnail_type?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          location?: string | null
          thumbnail_type?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      galleries: {
        Row: {
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          location: string | null
          project_name: string
          story_text: string | null
          thumbnail_type: string | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          project_name: string
          story_text?: string | null
          thumbnail_type?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          project_name?: string
          story_text?: string | null
          thumbnail_type?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          gallery_id: string
          id: string
          image_type: string | null
          image_url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          gallery_id: string
          id?: string
          image_type?: string | null
          image_url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          gallery_id?: string
          id?: string
          image_type?: string | null
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_metrics: {
        Row: {
          calculated_at: string | null
          current_value: number | null
          date_range: string
          growth_percent: number | null
          id: string
          metric_name: string
          previous_value: number | null
        }
        Insert: {
          calculated_at?: string | null
          current_value?: number | null
          date_range: string
          growth_percent?: number | null
          id?: string
          metric_name: string
          previous_value?: number | null
        }
        Update: {
          calculated_at?: string | null
          current_value?: number | null
          date_range?: string
          growth_percent?: number | null
          id?: string
          metric_name?: string
          previous_value?: number | null
        }
        Relationships: []
      }
      home_films: {
        Row: {
          created_at: string | null
          display_order: number | null
          film_id: string | null
          id: string
          is_visible: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          film_id?: string | null
          id?: string
          is_visible?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          film_id?: string | null
          id?: string
          is_visible?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_films_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
        ]
      }
      home_projects: {
        Row: {
          category: string | null
          created_at: string | null
          display_order: number | null
          film_id: string | null
          gallery_id: string | null
          id: string
          image_type: string | null
          image_url: string | null
          is_visible: boolean | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          film_id?: string | null
          gallery_id?: string | null
          id?: string
          image_type?: string | null
          image_url?: string | null
          is_visible?: boolean | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          film_id?: string | null
          gallery_id?: string | null
          id?: string
          image_type?: string | null
          image_url?: string | null
          is_visible?: boolean | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_projects_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_projects_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city_name: string
          created_at: string | null
          display_order: number | null
          google_map_url: string | null
          id: string
          status: string | null
        }
        Insert: {
          city_name: string
          created_at?: string | null
          display_order?: number | null
          google_map_url?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          city_name?: string
          created_at?: string | null
          display_order?: number | null
          google_map_url?: string | null
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: string
          page_path: string
          page_title: string | null
          referrer_path: string | null
          scroll_depth: number | null
          session_id: string
          time_on_page: number | null
          viewed_at: string
          visitor_id: string
        }
        Insert: {
          id?: string
          page_path: string
          page_title?: string | null
          referrer_path?: string | null
          scroll_depth?: number | null
          session_id: string
          time_on_page?: number | null
          viewed_at?: string
          visitor_id: string
        }
        Update: {
          id?: string
          page_path?: string
          page_title?: string | null
          referrer_path?: string | null
          scroll_depth?: number | null
          session_id?: string
          time_on_page?: number | null
          viewed_at?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_views_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts: {
        Row: {
          detected_at: string | null
          id: string
          issue_type: string
          message: string | null
          page_url: string
          resolved: boolean | null
          severity: string | null
        }
        Insert: {
          detected_at?: string | null
          id?: string
          issue_type: string
          message?: string | null
          page_url: string
          resolved?: boolean | null
          severity?: string | null
        }
        Update: {
          detected_at?: string | null
          id?: string
          issue_type?: string
          message?: string | null
          page_url?: string
          resolved?: boolean | null
          severity?: string | null
        }
        Relationships: []
      }
      performance_pages: {
        Row: {
          cls: number | null
          device_type: string | null
          id: string
          inp: number | null
          last_checked: string | null
          lcp: number | null
          load_time: number | null
          page_url: string
          score: number | null
          status: string | null
        }
        Insert: {
          cls?: number | null
          device_type?: string | null
          id?: string
          inp?: number | null
          last_checked?: string | null
          lcp?: number | null
          load_time?: number | null
          page_url: string
          score?: number | null
          status?: string | null
        }
        Update: {
          cls?: number | null
          device_type?: string | null
          id?: string
          inp?: number | null
          last_checked?: string | null
          lcp?: number | null
          load_time?: number | null
          page_url?: string
          score?: number | null
          status?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          bonus_items: string[] | null
          created_at: string | null
          display_order: number | null
          duration: string | null
          id: string
          is_active: boolean | null
          is_highlighted: boolean | null
          plan_name: string
          price: string
          services: string[] | null
          updated_at: string | null
        }
        Insert: {
          bonus_items?: string[] | null
          created_at?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_highlighted?: boolean | null
          plan_name: string
          price: string
          services?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bonus_items?: string[] | null
          created_at?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_highlighted?: boolean | null
          plan_name?: string
          price?: string
          services?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_cache: {
        Row: {
          data: Json
          date_range: string
          id: string
          last_fetched_at: string | null
          metric_type: string
        }
        Insert: {
          data?: Json
          date_range: string
          id?: string
          last_fetched_at?: string | null
          metric_type: string
        }
        Update: {
          data?: Json
          date_range?: string
          id?: string
          last_fetched_at?: string | null
          metric_type?: string
        }
        Relationships: []
      }
      seo_keywords: {
        Row: {
          avg_position: number | null
          clicks: number | null
          ctr: number | null
          date_range: string
          id: string
          impressions: number | null
          keyword: string
          page_url: string | null
          updated_at: string | null
        }
        Insert: {
          avg_position?: number | null
          clicks?: number | null
          ctr?: number | null
          date_range?: string
          id?: string
          impressions?: number | null
          keyword: string
          page_url?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_position?: number | null
          clicks?: number | null
          ctr?: number | null
          date_range?: string
          id?: string
          impressions?: number | null
          keyword?: string
          page_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          avg_position: number | null
          clicks: number | null
          id: string
          impressions: number | null
          indexed: boolean | null
          last_checked: string | null
          page_url: string
          status: string | null
        }
        Insert: {
          avg_position?: number | null
          clicks?: number | null
          id?: string
          impressions?: number | null
          indexed?: boolean | null
          last_checked?: string | null
          page_url: string
          status?: string | null
        }
        Update: {
          avg_position?: number | null
          clicks?: number | null
          id?: string
          impressions?: number | null
          indexed?: boolean | null
          last_checked?: string | null
          page_url?: string
          status?: string | null
        }
        Relationships: []
      }
      service_films: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          film_id: string
          id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          film_id: string
          id?: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          film_id?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_films_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_films_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_galleries: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          gallery_id: string
          id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          gallery_id: string
          id?: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          gallery_id?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_galleries_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_galleries_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_type: string | null
          image_url: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_photos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          thumbnail_type: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_type?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_type?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          entry_page: string | null
          exit_page: string | null
          id: string
          is_active: boolean | null
          page_count: number | null
          referrer: string | null
          started_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          is_active?: boolean | null
          page_count?: number | null
          referrer?: string | null
          started_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          is_active?: boolean | null
          page_count?: number | null
          referrer?: string | null
          started_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          facebook_url: string | null
          id: string
          instagram_url: string | null
          updated_at: string | null
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          name: string
          photo_type: string | null
          photo_url: string | null
          role: string
          updated_at: string | null
          view_work_enabled: boolean | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          name: string
          photo_type?: string | null
          photo_url?: string | null
          role: string
          updated_at?: string | null
          view_work_enabled?: boolean | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          name?: string
          photo_type?: string | null
          photo_url?: string | null
          role?: string
          updated_at?: string | null
          view_work_enabled?: boolean | null
        }
        Relationships: []
      }
      team_work: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_type: string | null
          image_url: string
          team_member_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          team_member_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_work_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          fingerprint: string
          first_visit: string
          id: string
          last_visit: string
          os: string | null
          region: string | null
          screen_resolution: string | null
          total_visits: number
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          fingerprint: string
          first_visit?: string
          id?: string
          last_visit?: string
          os?: string | null
          region?: string | null
          screen_resolution?: string | null
          total_visits?: number
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          fingerprint?: string
          first_visit?: string
          id?: string
          last_visit?: string
          os?: string | null
          region?: string | null
          screen_resolution?: string | null
          total_visits?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator"
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
      app_role: ["admin", "moderator"],
    },
  },
} as const
