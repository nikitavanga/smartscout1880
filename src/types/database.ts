export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      break_windows: {
        Row: {
          break_date: string
          break_reason: string | null
          break_type: Database["public"]["Enums"]["break_type"]
          created_at: string
          end_time: string
          event_id: number
          id: number
          start_time: string
          user_id: string
        }
        Insert: {
          break_date: string
          break_reason?: string | null
          break_type?: Database["public"]["Enums"]["break_type"]
          created_at?: string
          end_time: string
          event_id: number
          id?: number
          start_time: string
          user_id: string
        }
        Update: {
          break_date?: string
          break_reason?: string | null
          break_type?: Database["public"]["Enums"]["break_type"]
          created_at?: string
          end_time?: string
          event_id?: number
          id?: number
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "break_windows_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_windows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_quality_flags: {
        Row: {
          created_at: string
          event_id: number | null
          flag_message: string
          flag_type: string
          id: number
          match_id: number | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          source_row_id: number | null
          source_table_name: string
          status: Database["public"]["Enums"]["quality_flag_status"]
          team_id: number | null
        }
        Insert: {
          created_at?: string
          event_id?: number | null
          flag_message: string
          flag_type: string
          id?: number
          match_id?: number | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          source_row_id?: number | null
          source_table_name: string
          status?: Database["public"]["Enums"]["quality_flag_status"]
          team_id?: number | null
        }
        Update: {
          created_at?: string
          event_id?: number | null
          flag_message?: string
          flag_type?: string
          id?: number
          match_id?: number | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          source_row_id?: number | null
          source_table_name?: string
          status?: Database["public"]["Enums"]["quality_flag_status"]
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_flags_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_quality_flags_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_quality_flags_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string
          event_id: number
          id: number
          is_active_for_event: boolean
          notes: string | null
          primary_role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          is_active_for_event?: boolean
          notes?: string | null
          primary_role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          is_active_for_event?: boolean
          notes?: string | null
          primary_role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_role_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by_user_id: string | null
          event_id: number
          id: number
          new_role: Database["public"]["Enums"]["app_role"]
          previous_role: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by_user_id?: string | null
          event_id: number
          id?: number
          new_role: Database["public"]["Enums"]["app_role"]
          previous_role?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by_user_id?: string | null
          event_id?: number
          id?: number
          new_role?: Database["public"]["Enums"]["app_role"]
          previous_role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_role_history_changed_by_user_id_fkey"
            columns: ["changed_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_role_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_role_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_teams: {
        Row: {
          created_at: string
          event_id: number
          team_id: number
        }
        Insert: {
          created_at?: string
          event_id: number
          team_id: number
        }
        Update: {
          created_at?: string
          event_id?: number
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          district_name: string | null
          end_date: string | null
          event_code: string | null
          event_name: string
          event_type: string | null
          id: number
          is_active: boolean
          season_year: number
          source_updated_at: string | null
          start_date: string | null
          state_prov: string | null
          tba_event_key: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          district_name?: string | null
          end_date?: string | null
          event_code?: string | null
          event_name: string
          event_type?: string | null
          id?: number
          is_active?: boolean
          season_year: number
          source_updated_at?: string | null
          start_date?: string | null
          state_prov?: string | null
          tba_event_key: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          district_name?: string | null
          end_date?: string | null
          event_code?: string | null
          event_name?: string
          event_type?: string | null
          id?: number
          is_active?: boolean
          season_year?: number
          source_updated_at?: string | null
          start_date?: string | null
          state_prov?: string | null
          tba_event_key?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          created_at: string
          form_version_id: number
          id: number
          is_required: boolean
          source_key: string
          source_label: string
          target_field_name: string
          target_value_type: string
        }
        Insert: {
          created_at?: string
          form_version_id: number
          id?: number
          is_required?: boolean
          source_key: string
          source_label: string
          target_field_name: string
          target_value_type: string
        }
        Update: {
          created_at?: string
          form_version_id?: number
          id?: number
          is_required?: boolean
          source_key?: string
          source_label?: string
          target_field_name?: string
          target_value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_version_id_fkey"
            columns: ["form_version_id"]
            isOneToOne: false
            referencedRelation: "form_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses_raw: {
        Row: {
          created_at: string
          form_kind: Database["public"]["Enums"]["form_kind"]
          form_source_id: number
          form_version_id: number | null
          google_response_id: string | null
          google_sheet_row_id: string | null
          id: number
          ingestion_error: string | null
          ingestion_status: Database["public"]["Enums"]["ingestion_status"]
          raw_response_json: Json
          submitted_at: string
          submitted_by_name_raw: string | null
        }
        Insert: {
          created_at?: string
          form_kind: Database["public"]["Enums"]["form_kind"]
          form_source_id: number
          form_version_id?: number | null
          google_response_id?: string | null
          google_sheet_row_id?: string | null
          id?: number
          ingestion_error?: string | null
          ingestion_status?: Database["public"]["Enums"]["ingestion_status"]
          raw_response_json: Json
          submitted_at: string
          submitted_by_name_raw?: string | null
        }
        Update: {
          created_at?: string
          form_kind?: Database["public"]["Enums"]["form_kind"]
          form_source_id?: number
          form_version_id?: number | null
          google_response_id?: string | null
          google_sheet_row_id?: string | null
          id?: number
          ingestion_error?: string | null
          ingestion_status?: Database["public"]["Enums"]["ingestion_status"]
          raw_response_json?: Json
          submitted_at?: string
          submitted_by_name_raw?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_raw_form_source_id_fkey"
            columns: ["form_source_id"]
            isOneToOne: false
            referencedRelation: "form_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_responses_raw_form_version_id_fkey"
            columns: ["form_version_id"]
            isOneToOne: false
            referencedRelation: "form_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_sources: {
        Row: {
          created_at: string
          form_kind: Database["public"]["Enums"]["form_kind"]
          form_name: string
          google_form_id: string | null
          google_sheet_id: string | null
          id: number
          is_active: boolean
        }
        Insert: {
          created_at?: string
          form_kind: Database["public"]["Enums"]["form_kind"]
          form_name: string
          google_form_id?: string | null
          google_sheet_id?: string | null
          id?: number
          is_active?: boolean
        }
        Update: {
          created_at?: string
          form_kind?: Database["public"]["Enums"]["form_kind"]
          form_name?: string
          google_form_id?: string | null
          google_sheet_id?: string | null
          id?: number
          is_active?: boolean
        }
        Relationships: []
      }
      form_versions: {
        Row: {
          created_at: string
          effective_from: string
          form_schema_json: Json
          form_source_id: number
          id: number
          is_active: boolean
          version_name: string
        }
        Insert: {
          created_at?: string
          effective_from?: string
          form_schema_json: Json
          form_source_id: number
          id?: number
          is_active?: boolean
          version_name: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          form_schema_json?: Json
          form_source_id?: number
          id?: number
          is_active?: boolean
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_versions_form_source_id_fkey"
            columns: ["form_source_id"]
            isOneToOne: false
            referencedRelation: "form_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      match_scout_entries: {
        Row: {
          alliance_color: Database["public"]["Enums"]["alliance_color"] | null
          attempted_climb: boolean | null
          auto_failed: boolean | null
          auto_fuel_collected: number | null
          auto_fuel_missed: number | null
          auto_fuel_scored: number | null
          auto_l1_climb: boolean | null
          auto_leaves_starting_zone: boolean | null
          auto_reliability_observed: string | null
          auto_start_position: string | null
          average_cycle_speed: string | null
          climb_result: string | null
          completed_cycles_count: number | null
          created_at: string
          crossed_obstacles: Json | null
          crossing_accuracy: string | null
          defense_effectiveness: string | null
          event_id: number
          fouls: number | null
          id: number
          intake_from_floor: boolean | null
          intake_from_outpost: boolean | null
          match_id: number
          notes: string | null
          overall_performance: string | null
          penalty_risk: string | null
          played_defense: boolean | null
          primary_role_observed: string | null
          raw_response_id: number | null
          robot_issues: Json | null
          scouter_name_raw: string | null
          scouter_user_id: string | null
          shooting_accuracy: string | null
          shooting_locations: Json | null
          shot_during_inactive_hub: string | null
          submitted_at: string
          team_id: number
          team_name_raw: string | null
          teleop_fuel_collected: number | null
          teleop_fuel_missed: number | null
          teleop_fuel_scored: number | null
          teleop_start_position: string | null
          time_left_after_climb_seconds: number | null
          was_blocked_heavily: boolean | null
        }
        Insert: {
          alliance_color?: Database["public"]["Enums"]["alliance_color"] | null
          attempted_climb?: boolean | null
          auto_failed?: boolean | null
          auto_fuel_collected?: number | null
          auto_fuel_missed?: number | null
          auto_fuel_scored?: number | null
          auto_l1_climb?: boolean | null
          auto_leaves_starting_zone?: boolean | null
          auto_reliability_observed?: string | null
          auto_start_position?: string | null
          average_cycle_speed?: string | null
          climb_result?: string | null
          completed_cycles_count?: number | null
          created_at?: string
          crossed_obstacles?: Json | null
          crossing_accuracy?: string | null
          defense_effectiveness?: string | null
          event_id: number
          fouls?: number | null
          id?: number
          intake_from_floor?: boolean | null
          intake_from_outpost?: boolean | null
          match_id: number
          notes?: string | null
          overall_performance?: string | null
          penalty_risk?: string | null
          played_defense?: boolean | null
          primary_role_observed?: string | null
          raw_response_id?: number | null
          robot_issues?: Json | null
          scouter_name_raw?: string | null
          scouter_user_id?: string | null
          shooting_accuracy?: string | null
          shooting_locations?: Json | null
          shot_during_inactive_hub?: string | null
          submitted_at: string
          team_id: number
          team_name_raw?: string | null
          teleop_fuel_collected?: number | null
          teleop_fuel_missed?: number | null
          teleop_fuel_scored?: number | null
          teleop_start_position?: string | null
          time_left_after_climb_seconds?: number | null
          was_blocked_heavily?: boolean | null
        }
        Update: {
          alliance_color?: Database["public"]["Enums"]["alliance_color"] | null
          attempted_climb?: boolean | null
          auto_failed?: boolean | null
          auto_fuel_collected?: number | null
          auto_fuel_missed?: number | null
          auto_fuel_scored?: number | null
          auto_l1_climb?: boolean | null
          auto_leaves_starting_zone?: boolean | null
          auto_reliability_observed?: string | null
          auto_start_position?: string | null
          average_cycle_speed?: string | null
          climb_result?: string | null
          completed_cycles_count?: number | null
          created_at?: string
          crossed_obstacles?: Json | null
          crossing_accuracy?: string | null
          defense_effectiveness?: string | null
          event_id?: number
          fouls?: number | null
          id?: number
          intake_from_floor?: boolean | null
          intake_from_outpost?: boolean | null
          match_id?: number
          notes?: string | null
          overall_performance?: string | null
          penalty_risk?: string | null
          played_defense?: boolean | null
          primary_role_observed?: string | null
          raw_response_id?: number | null
          robot_issues?: Json | null
          scouter_name_raw?: string | null
          scouter_user_id?: string | null
          shooting_accuracy?: string | null
          shooting_locations?: Json | null
          shot_during_inactive_hub?: string | null
          submitted_at?: string
          team_id?: number
          team_name_raw?: string | null
          teleop_fuel_collected?: number | null
          teleop_fuel_missed?: number | null
          teleop_fuel_scored?: number | null
          teleop_start_position?: string | null
          time_left_after_climb_seconds?: number | null
          was_blocked_heavily?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "match_scout_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scout_entries_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scout_entries_raw_response_id_fkey"
            columns: ["raw_response_id"]
            isOneToOne: true
            referencedRelation: "form_responses_raw"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scout_entries_scouter_user_id_fkey"
            columns: ["scouter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scout_entries_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_teams: {
        Row: {
          alliance_color: Database["public"]["Enums"]["alliance_color"]
          match_id: number
          station_number: number
          team_id: number
        }
        Insert: {
          alliance_color: Database["public"]["Enums"]["alliance_color"]
          match_id: number
          station_number: number
          team_id: number
        }
        Update: {
          alliance_color?: Database["public"]["Enums"]["alliance_color"]
          match_id?: number
          station_number?: number
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_teams_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          actual_time: string | null
          blue_score: number | null
          created_at: string
          event_id: number
          id: number
          match_number: number
          match_stage: Database["public"]["Enums"]["match_stage"]
          predicted_time: string | null
          red_score: number | null
          scheduled_time: string | null
          set_number: number
          source_updated_at: string | null
          tba_match_key: string
          tba_raw_payload: Json | null
          tba_score_breakdown: Json | null
          tba_videos: Json | null
          updated_at: string
          winning_alliance: string | null
        }
        Insert: {
          actual_time?: string | null
          blue_score?: number | null
          created_at?: string
          event_id: number
          id?: number
          match_number: number
          match_stage: Database["public"]["Enums"]["match_stage"]
          predicted_time?: string | null
          red_score?: number | null
          scheduled_time?: string | null
          set_number?: number
          source_updated_at?: string | null
          tba_match_key: string
          tba_raw_payload?: Json | null
          tba_score_breakdown?: Json | null
          tba_videos?: Json | null
          updated_at?: string
          winning_alliance?: string | null
        }
        Update: {
          actual_time?: string | null
          blue_score?: number | null
          created_at?: string
          event_id?: number
          id?: number
          match_number?: number
          match_stage?: Database["public"]["Enums"]["match_stage"]
          predicted_time?: string | null
          red_score?: number | null
          scheduled_time?: string | null
          set_number?: number
          source_updated_at?: string | null
          tba_match_key?: string
          tba_raw_payload?: Json | null
          tba_score_breakdown?: Json | null
          tba_videos?: Json | null
          updated_at?: string
          winning_alliance?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          description: string
          permission_key: string
          permission_name: string
        }
        Insert: {
          description: string
          permission_key: string
          permission_name: string
        }
        Update: {
          description?: string
          permission_key?: string
          permission_name?: string
        }
        Relationships: []
      }
      pit_scout_entries: {
        Row: {
          auto_capability_summary: string | null
          auto_start_position: string | null
          average_auto_fuel_count: number | null
          average_climb_time_seconds: number | null
          best_scoring_range: string | null
          can_climb_with_defense: boolean | null
          can_cross_bumps: boolean | null
          can_cross_trench: boolean | null
          can_shoot_while_moving: boolean | null
          climb_capabilities: Json | null
          created_at: string
          defense_capability: string | null
          drive_train: string | null
          event_id: number | null
          has_auto: boolean | null
          id: number
          intake_from_floor: boolean | null
          intake_from_outpost: boolean | null
          intake_speed: string | null
          max_fuel_capacity: number | null
          needs_help_to_climb: boolean | null
          notes: string | null
          preferred_teleop_start_positions: Json | null
          programming_language: string | null
          raw_response_id: number | null
          scouter_name_raw: string | null
          scouter_user_id: string | null
          shooting_accuracy: string | null
          submitted_at: string
          team_id: number
          team_name_raw: string | null
          variable_shooting_speed: boolean | null
        }
        Insert: {
          auto_capability_summary?: string | null
          auto_start_position?: string | null
          average_auto_fuel_count?: number | null
          average_climb_time_seconds?: number | null
          best_scoring_range?: string | null
          can_climb_with_defense?: boolean | null
          can_cross_bumps?: boolean | null
          can_cross_trench?: boolean | null
          can_shoot_while_moving?: boolean | null
          climb_capabilities?: Json | null
          created_at?: string
          defense_capability?: string | null
          drive_train?: string | null
          event_id?: number | null
          has_auto?: boolean | null
          id?: number
          intake_from_floor?: boolean | null
          intake_from_outpost?: boolean | null
          intake_speed?: string | null
          max_fuel_capacity?: number | null
          needs_help_to_climb?: boolean | null
          notes?: string | null
          preferred_teleop_start_positions?: Json | null
          programming_language?: string | null
          raw_response_id?: number | null
          scouter_name_raw?: string | null
          scouter_user_id?: string | null
          shooting_accuracy?: string | null
          submitted_at: string
          team_id: number
          team_name_raw?: string | null
          variable_shooting_speed?: boolean | null
        }
        Update: {
          auto_capability_summary?: string | null
          auto_start_position?: string | null
          average_auto_fuel_count?: number | null
          average_climb_time_seconds?: number | null
          best_scoring_range?: string | null
          can_climb_with_defense?: boolean | null
          can_cross_bumps?: boolean | null
          can_cross_trench?: boolean | null
          can_shoot_while_moving?: boolean | null
          climb_capabilities?: Json | null
          created_at?: string
          defense_capability?: string | null
          drive_train?: string | null
          event_id?: number | null
          has_auto?: boolean | null
          id?: number
          intake_from_floor?: boolean | null
          intake_from_outpost?: boolean | null
          intake_speed?: string | null
          max_fuel_capacity?: number | null
          needs_help_to_climb?: boolean | null
          notes?: string | null
          preferred_teleop_start_positions?: Json | null
          programming_language?: string | null
          raw_response_id?: number | null
          scouter_name_raw?: string | null
          scouter_user_id?: string | null
          shooting_accuracy?: string | null
          submitted_at?: string
          team_id?: number
          team_name_raw?: string | null
          variable_shooting_speed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pit_scout_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pit_scout_entries_raw_response_id_fkey"
            columns: ["raw_response_id"]
            isOneToOne: true
            referencedRelation: "form_responses_raw"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pit_scout_entries_scouter_user_id_fkey"
            columns: ["scouter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pit_scout_entries_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings_snapshots: {
        Row: {
          created_at: string
          disqualification_count: number | null
          event_id: number
          id: number
          losses: number | null
          matches_played: number | null
          rank_position: number
          ranking_sort_values: Json | null
          ranking_value: number | null
          source_captured_at: string
          source_updated_at: string | null
          team_id: number
          ties: number | null
          wins: number | null
        }
        Insert: {
          created_at?: string
          disqualification_count?: number | null
          event_id: number
          id?: number
          losses?: number | null
          matches_played?: number | null
          rank_position: number
          ranking_sort_values?: Json | null
          ranking_value?: number | null
          source_captured_at?: string
          source_updated_at?: string | null
          team_id: number
          ties?: number | null
          wins?: number | null
        }
        Update: {
          created_at?: string
          disqualification_count?: number | null
          event_id?: number
          id?: number
          losses?: number | null
          matches_played?: number | null
          rank_position?: number
          ranking_sort_values?: Json | null
          ranking_value?: number | null
          source_captured_at?: string
          source_updated_at?: string | null
          team_id?: number
          ties?: number | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rankings_snapshots_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_snapshots_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          event_id: number | null
          id: number
          job_payload_json: Json | null
          job_status: Database["public"]["Enums"]["refresh_job_status"]
          job_type: Database["public"]["Enums"]["refresh_job_type"]
          match_id: number | null
          requested_by_user_id: string | null
          started_at: string | null
          team_id: number | null
          trigger_source_record_id: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          event_id?: number | null
          id?: number
          job_payload_json?: Json | null
          job_status?: Database["public"]["Enums"]["refresh_job_status"]
          job_type: Database["public"]["Enums"]["refresh_job_type"]
          match_id?: number | null
          requested_by_user_id?: string | null
          started_at?: string | null
          team_id?: number | null
          trigger_source_record_id?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          event_id?: number | null
          id?: number
          job_payload_json?: Json | null
          job_status?: Database["public"]["Enums"]["refresh_job_status"]
          job_type?: Database["public"]["Enums"]["refresh_job_type"]
          match_id?: number | null
          requested_by_user_id?: string | null
          started_at?: string | null
          team_id?: number | null
          trigger_source_record_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_jobs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refresh_jobs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refresh_jobs_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refresh_jobs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      replacement_requests: {
        Row: {
          created_at: string
          id: number
          request_reason: string | null
          requested_by_user_id: string
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          schedule_assignment_id: number
          status: Database["public"]["Enums"]["replacement_request_status"]
          suggested_replacement_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          request_reason?: string | null
          requested_by_user_id: string
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          schedule_assignment_id: number
          status?: Database["public"]["Enums"]["replacement_request_status"]
          suggested_replacement_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          request_reason?: string | null
          requested_by_user_id?: string
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          schedule_assignment_id?: number
          status?: Database["public"]["Enums"]["replacement_request_status"]
          suggested_replacement_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "replacement_requests_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replacement_requests_reviewed_by_user_id_fkey"
            columns: ["reviewed_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replacement_requests_schedule_assignment_id_fkey"
            columns: ["schedule_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replacement_requests_suggested_replacement_user_id_fkey"
            columns: ["suggested_replacement_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_key: string
          role_key: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          permission_key: string
          role_key: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          permission_key?: string
          role_key?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["permission_key"]
          },
          {
            foreignKeyName: "role_permissions_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_key"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          role_key: Database["public"]["Enums"]["app_role"]
          role_name: string
        }
        Insert: {
          description?: string | null
          role_key: Database["public"]["Enums"]["app_role"]
          role_name: string
        }
        Update: {
          description?: string | null
          role_key?: Database["public"]["Enums"]["app_role"]
          role_name?: string
        }
        Relationships: []
      }
      schedule_assignments: {
        Row: {
          acknowledged_at: string | null
          assigned_team_id: number
          assigned_user_id: string
          assignment_kind: Database["public"]["Enums"]["assignment_kind"]
          assignment_notes: string | null
          assignment_source: Database["public"]["Enums"]["assignment_source"]
          block_index: number
          created_at: string
          event_id: number
          id: number
          is_before_break: boolean
          is_locked_by_admin: boolean
          match_id: number | null
          order_in_block: number
          replaced_by_user_id: string | null
          scheduler_config_id: number | null
          started_at: string | null
          station_label: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_team_id: number
          assigned_user_id: string
          assignment_kind: Database["public"]["Enums"]["assignment_kind"]
          assignment_notes?: string | null
          assignment_source?: Database["public"]["Enums"]["assignment_source"]
          block_index?: number
          created_at?: string
          event_id: number
          id?: number
          is_before_break?: boolean
          is_locked_by_admin?: boolean
          match_id?: number | null
          order_in_block?: number
          replaced_by_user_id?: string | null
          scheduler_config_id?: number | null
          started_at?: string | null
          station_label?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          assigned_team_id?: number
          assigned_user_id?: string
          assignment_kind?: Database["public"]["Enums"]["assignment_kind"]
          assignment_notes?: string | null
          assignment_source?: Database["public"]["Enums"]["assignment_source"]
          block_index?: number
          created_at?: string
          event_id?: number
          id?: number
          is_before_break?: boolean
          is_locked_by_admin?: boolean
          match_id?: number | null
          order_in_block?: number
          replaced_by_user_id?: string | null
          scheduler_config_id?: number | null
          started_at?: string | null
          station_label?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignments_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_replaced_by_user_id_fkey"
            columns: ["replaced_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_scheduler_config_id_fkey"
            columns: ["scheduler_config_id"]
            isOneToOne: false
            referencedRelation: "scheduler_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_audit_log: {
        Row: {
          action_type: string
          actor_user_id: string | null
          after_state_json: Json | null
          before_state_json: Json | null
          created_at: string
          event_id: number
          id: number
          target_assignment_id: number | null
        }
        Insert: {
          action_type: string
          actor_user_id?: string | null
          after_state_json?: Json | null
          before_state_json?: Json | null
          created_at?: string
          event_id: number
          id?: number
          target_assignment_id?: number | null
        }
        Update: {
          action_type?: string
          actor_user_id?: string | null
          after_state_json?: Json | null
          before_state_json?: Json | null
          created_at?: string
          event_id?: number
          id?: number
          target_assignment_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_audit_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_audit_log_target_assignment_id_fkey"
            columns: ["target_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduler_configs: {
        Row: {
          active_match_scout_slots: number
          active_pit_scout_slots: number
          allow_replacements: boolean
          batch_size: number
          created_at: string
          created_by: string | null
          event_id: number
          id: number
          include_playoffs: boolean
          lock_assignments: boolean
          notes: string | null
          same_station_per_block: boolean
          schedule_date: string | null
          schedule_scope: Database["public"]["Enums"]["schedule_scope"]
          segment_name: string | null
          updated_at: string
        }
        Insert: {
          active_match_scout_slots?: number
          active_pit_scout_slots?: number
          allow_replacements?: boolean
          batch_size?: number
          created_at?: string
          created_by?: string | null
          event_id: number
          id?: number
          include_playoffs?: boolean
          lock_assignments?: boolean
          notes?: string | null
          same_station_per_block?: boolean
          schedule_date?: string | null
          schedule_scope: Database["public"]["Enums"]["schedule_scope"]
          segment_name?: string | null
          updated_at?: string
        }
        Update: {
          active_match_scout_slots?: number
          active_pit_scout_slots?: number
          allow_replacements?: boolean
          batch_size?: number
          created_at?: string
          created_by?: string | null
          event_id?: number
          id?: number
          include_playoffs?: boolean
          lock_assignments?: boolean
          notes?: string | null
          same_station_per_block?: boolean
          schedule_date?: string | null
          schedule_scope?: Database["public"]["Enums"]["schedule_scope"]
          segment_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduler_configs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduler_configs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      scouting_confirmation_tasks: {
        Row: {
          assigned_user_id: string | null
          created_at: string
          event_id: number
          field_name: string
          id: number
          match_id: number | null
          observed_value: string | null
          reference_value: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          source_type: string
          status: Database["public"]["Enums"]["confirmation_status"]
          team_id: number
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string
          event_id: number
          field_name: string
          id?: number
          match_id?: number | null
          observed_value?: string | null
          reference_value?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          source_type: string
          status?: Database["public"]["Enums"]["confirmation_status"]
          team_id: number
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string
          event_id?: number
          field_name?: string
          id?: number
          match_id?: number | null
          observed_value?: string | null
          reference_value?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          source_type?: string
          status?: Database["public"]["Enums"]["confirmation_status"]
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "scouting_confirmation_tasks_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scouting_confirmation_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scouting_confirmation_tasks_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scouting_confirmation_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      summary_cache: {
        Row: {
          confidence_label: string | null
          event_id: number
          evidence_source_summary: string | null
          generated_at: string
          id: number
          match_id: number
          summary_json: Json
          summary_kind: Database["public"]["Enums"]["summary_kind"]
          team_id: number
        }
        Insert: {
          confidence_label?: string | null
          event_id: number
          evidence_source_summary?: string | null
          generated_at?: string
          id?: number
          match_id: number
          summary_json: Json
          summary_kind: Database["public"]["Enums"]["summary_kind"]
          team_id: number
        }
        Update: {
          confidence_label?: string | null
          event_id?: number
          evidence_source_summary?: string | null
          generated_at?: string
          id?: number
          match_id?: number
          summary_json?: Json
          summary_kind?: Database["public"]["Enums"]["summary_kind"]
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "summary_cache_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summary_cache_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summary_cache_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_event_metrics: {
        Row: {
          active_hub_scoring_rate: number | null
          auto_average_fuel_scored: number | null
          auto_l1_climb_rate: number | null
          auto_leave_zone_rate: number | null
          average_time_left_after_climb_seconds: number | null
          blocked_rate: number | null
          climb_attempt_rate: number | null
          climb_success_rate: number | null
          consistency_score: number | null
          current_rank: number | null
          defense_rate: number | null
          endgame_conversion_rate: number | null
          event_id: number
          expected_role: string | null
          foul_rate: number | null
          id: number
          inactive_hub_shot_rate: number | null
          matches_played: number
          phase_balance_score: number | null
          reliability_issue_rate: number | null
          team_id: number
          teleop_average_cycles: number | null
          teleop_average_fuel_missed: number | null
          teleop_average_fuel_scored: number | null
          updated_at: string
        }
        Insert: {
          active_hub_scoring_rate?: number | null
          auto_average_fuel_scored?: number | null
          auto_l1_climb_rate?: number | null
          auto_leave_zone_rate?: number | null
          average_time_left_after_climb_seconds?: number | null
          blocked_rate?: number | null
          climb_attempt_rate?: number | null
          climb_success_rate?: number | null
          consistency_score?: number | null
          current_rank?: number | null
          defense_rate?: number | null
          endgame_conversion_rate?: number | null
          event_id: number
          expected_role?: string | null
          foul_rate?: number | null
          id?: number
          inactive_hub_shot_rate?: number | null
          matches_played?: number
          phase_balance_score?: number | null
          reliability_issue_rate?: number | null
          team_id: number
          teleop_average_cycles?: number | null
          teleop_average_fuel_missed?: number | null
          teleop_average_fuel_scored?: number | null
          updated_at?: string
        }
        Update: {
          active_hub_scoring_rate?: number | null
          auto_average_fuel_scored?: number | null
          auto_l1_climb_rate?: number | null
          auto_leave_zone_rate?: number | null
          average_time_left_after_climb_seconds?: number | null
          blocked_rate?: number | null
          climb_attempt_rate?: number | null
          climb_success_rate?: number | null
          consistency_score?: number | null
          current_rank?: number | null
          defense_rate?: number | null
          endgame_conversion_rate?: number | null
          event_id?: number
          expected_role?: string | null
          foul_rate?: number | null
          id?: number
          inactive_hub_shot_rate?: number | null
          matches_played?: number
          phase_balance_score?: number | null
          reliability_issue_rate?: number | null
          team_id?: number
          teleop_average_cycles?: number | null
          teleop_average_fuel_missed?: number | null
          teleop_average_fuel_scored?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_event_metrics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_event_metrics_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_match_metrics: {
        Row: {
          active_hub_efficiency_rate: number | null
          alliance_shift_output_score: number | null
          auto_output_score: number | null
          climbed_successfully: boolean | null
          consistency_score: number | null
          defense_impact_score: number | null
          derived_from_json: Json | null
          endgame_output_score: number | null
          event_id: number
          foul_risk_score: number | null
          fouls_count: number | null
          id: number
          inactive_hub_decision_score: number | null
          match_id: number
          team_id: number
          total_cycles_completed: number | null
          total_fuel_missed: number | null
          total_fuel_scored: number | null
          transition_shift_output_score: number | null
          updated_at: string
        }
        Insert: {
          active_hub_efficiency_rate?: number | null
          alliance_shift_output_score?: number | null
          auto_output_score?: number | null
          climbed_successfully?: boolean | null
          consistency_score?: number | null
          defense_impact_score?: number | null
          derived_from_json?: Json | null
          endgame_output_score?: number | null
          event_id: number
          foul_risk_score?: number | null
          fouls_count?: number | null
          id?: number
          inactive_hub_decision_score?: number | null
          match_id: number
          team_id: number
          total_cycles_completed?: number | null
          total_fuel_missed?: number | null
          total_fuel_scored?: number | null
          transition_shift_output_score?: number | null
          updated_at?: string
        }
        Update: {
          active_hub_efficiency_rate?: number | null
          alliance_shift_output_score?: number | null
          auto_output_score?: number | null
          climbed_successfully?: boolean | null
          consistency_score?: number | null
          defense_impact_score?: number | null
          derived_from_json?: Json | null
          endgame_output_score?: number | null
          event_id?: number
          foul_risk_score?: number | null
          fouls_count?: number | null
          id?: number
          inactive_hub_decision_score?: number | null
          match_id?: number
          team_id?: number
          total_cycles_completed?: number | null
          total_fuel_missed?: number | null
          total_fuel_scored?: number | null
          transition_shift_output_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_match_metrics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_match_metrics_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_match_metrics_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_season_metrics: {
        Row: {
          events_played: number
          id: number
          matches_played: number
          season_auto_average: number | null
          season_consistency_score: number | null
          season_endgame_rate: number | null
          season_foul_rate: number | null
          season_teleop_average: number | null
          season_year: number
          team_id: number
          trend_summary_json: Json | null
          updated_at: string
        }
        Insert: {
          events_played?: number
          id?: number
          matches_played?: number
          season_auto_average?: number | null
          season_consistency_score?: number | null
          season_endgame_rate?: number | null
          season_foul_rate?: number | null
          season_teleop_average?: number | null
          season_year: number
          team_id: number
          trend_summary_json?: Json | null
          updated_at?: string
        }
        Update: {
          events_played?: number
          id?: number
          matches_played?: number
          season_auto_average?: number | null
          season_consistency_score?: number | null
          season_endgame_rate?: number | null
          season_foul_rate?: number | null
          season_teleop_average?: number | null
          season_year?: number
          team_id?: number
          trend_summary_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_season_metrics_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: number
          robot_name: string | null
          rookie_year: number | null
          school_name: string | null
          state_prov: string | null
          team_number: number
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: number
          robot_name?: string | null
          rookie_year?: number | null
          school_name?: string | null
          state_prov?: string | null
          team_number: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: number
          robot_name?: string | null
          rookie_year?: number | null
          school_name?: string | null
          state_prov?: string | null
          team_number?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_permission_overrides: {
        Row: {
          created_at: string
          id: string
          is_allowed: boolean
          override_reason: string | null
          permission_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_allowed: boolean
          override_reason?: string | null
          permission_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_allowed?: boolean
          override_reason?: string | null
          permission_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["permission_key"]
          },
          {
            foreignKeyName: "user_permission_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          role_key: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          role_key: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          role_key?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_key"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alliance_color: "red" | "blue"
      app_role:
        | "admin"
        | "mentor"
        | "strategist"
        | "scouter"
        | "operations"
        | "viewer"
      assignment_kind: "match_scout" | "pit_scout"
      assignment_source: "auto" | "manual"
      assignment_status:
        | "assigned"
        | "acknowledged"
        | "in_progress"
        | "submitted"
        | "missing"
        | "replaced"
        | "excused"
        | "skipped"
      break_type: "meal" | "rest" | "pit_duty" | "meeting" | "manual"
      confirmation_status:
        | "pending"
        | "confirmed"
        | "corrected"
        | "unsure"
        | "under_review"
        | "resolved"
      form_kind: "match" | "pit"
      ingestion_status: "pending" | "parsed" | "failed" | "archived"
      match_stage: "practice" | "qm" | "qf" | "sf" | "f"
      quality_flag_status: "open" | "acknowledged" | "resolved"
      refresh_job_status: "queued" | "running" | "completed" | "failed"
      refresh_job_type:
        | "form_ingest"
        | "tba_sync"
        | "metrics_refresh"
        | "summary_refresh"
        | "quality_check"
      replacement_request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "under_review"
        | "resolved"
      schedule_scope: "event" | "day" | "segment"
      severity_level: "low" | "medium" | "high"
      summary_kind: "pre_match" | "post_match"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      alliance_color: ["red", "blue"],
      app_role: [
        "admin",
        "mentor",
        "strategist",
        "scouter",
        "operations",
        "viewer",
      ],
      assignment_kind: ["match_scout", "pit_scout"],
      assignment_source: ["auto", "manual"],
      assignment_status: [
        "assigned",
        "acknowledged",
        "in_progress",
        "submitted",
        "missing",
        "replaced",
        "excused",
        "skipped",
      ],
      break_type: ["meal", "rest", "pit_duty", "meeting", "manual"],
      confirmation_status: [
        "pending",
        "confirmed",
        "corrected",
        "unsure",
        "under_review",
        "resolved",
      ],
      form_kind: ["match", "pit"],
      ingestion_status: ["pending", "parsed", "failed", "archived"],
      match_stage: ["practice", "qm", "qf", "sf", "f"],
      quality_flag_status: ["open", "acknowledged", "resolved"],
      refresh_job_status: ["queued", "running", "completed", "failed"],
      refresh_job_type: [
        "form_ingest",
        "tba_sync",
        "metrics_refresh",
        "summary_refresh",
        "quality_check",
      ],
      replacement_request_status: [
        "pending",
        "approved",
        "rejected",
        "under_review",
        "resolved",
      ],
      schedule_scope: ["event", "day", "segment"],
      severity_level: ["low", "medium", "high"],
      summary_kind: ["pre_match", "post_match"],
    },
  },
} as const

