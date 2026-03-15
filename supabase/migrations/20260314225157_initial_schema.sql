begin;

create extension if not exists pgcrypto;

-- ENUMS

create type public.app_role as enum (
    'admin',
    'mentor',
    'strategist',
    'scouter',
    'operations',
    'viewer'
);

create type public.assignment_kind as enum (
    'match_scout',
    'pit_scout'
);

create type public.assignment_status as enum (
    'assigned',
    'acknowledged',
    'in_progress',
    'submitted',
    'missing',
    'replaced',
    'excused',
    'skipped'
);

create type public.confirmation_status as enum (
    'pending',
    'confirmed',
    'corrected',
    'unsure',
    'under_review',
    'resolved'
);

create type public.replacement_request_status as enum (
    'pending',
    'approved',
    'rejected',
    'under_review',
    'resolved'
);

create type public.severity_level as enum (
    'low',
    'medium',
    'high'
);

create type public.quality_flag_status as enum (
    'open',
    'acknowledged',
    'resolved'
);

create type public.form_kind as enum (
    'match',
    'pit'
);

create type public.ingestion_status as enum (
    'pending',
    'parsed',
    'failed',
    'archived'
);

create type public.alliance_color as enum (
    'red',
    'blue'
);

create type public.match_stage as enum (
    'practice',
    'qm',
    'qf',
    'sf',
    'f'
);

create type public.schedule_scope as enum (
    'event',
    'day',
    'segment'
);

create type public.break_type as enum (
    'meal',
    'rest',
    'pit_duty',
    'meeting',
    'manual'
);

create type public.assignment_source as enum (
    'auto',
    'manual'
);

create type public.summary_kind as enum (
    'pre_match',
    'post_match'
);

create type public.refresh_job_type as enum (
    'form_ingest',
    'tba_sync',
    'metrics_refresh',
    'summary_refresh',
    'quality_check'
);

create type public.refresh_job_status as enum (
    'queued',
    'running',
    'completed',
    'failed'
);




-- UPDATED AT TRIGGER

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;





-- USERS / ROLES / PERMISSIONS


create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    full_name text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.roles (
    role_key public.app_role primary key,
    role_name text not null unique,
    description text
);

create table public.permissions (
    permission_key text primary key,
    permission_name text not null unique,
    description text not null
);

create table public.user_roles (
    user_id uuid not null references public.users(id) on delete cascade,
    role_key public.app_role not null references public.roles(role_key) on delete cascade,
    assigned_at timestamptz not null default now(),
    assigned_by uuid references public.users(id),
    primary key (user_id, role_key)
);

create table public.role_permissions (
    role_key public.app_role not null references public.roles(role_key) on delete cascade,
    permission_key text not null references public.permissions(permission_key) on delete cascade,
    primary key (role_key, permission_key)
);

create table public.user_permission_overrides (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    permission_key text not null references public.permissions(permission_key) on delete cascade,
    is_allowed boolean not null,
    override_reason text,
    created_at timestamptz not null default now(),
    unique (user_id, permission_key)
);

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();




-- EVENTS / TEAMS / MATCHES / RANKINGS


create table public.events (
    id bigserial primary key,
    tba_event_key text not null unique,
    season_year int not null,
    event_code text,
    event_name text not null,
    event_type text,
    district_name text,
    city text,
    state_prov text,
    country text,
    start_date date,
    end_date date,
    timezone text,
    is_active boolean not null default false,
    source_updated_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.teams (
    id bigserial primary key,
    team_number int not null unique,
    robot_name text,
    school_name text,
    city text,
    state_prov text,
    country text,
    rookie_year int,
    website text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.event_teams (
    event_id bigint not null references public.events(id) on delete cascade,
    team_id bigint not null references public.teams(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (event_id, team_id)
);

create table public.matches (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    tba_match_key text not null unique,
    match_stage public.match_stage not null,
    set_number int not null default 1,
    match_number int not null,
    scheduled_time timestamptz,
    predicted_time timestamptz,
    actual_time timestamptz,
    winning_alliance text,
    red_score int,
    blue_score int,
    tba_score_breakdown jsonb,
    tba_videos jsonb,
    tba_raw_payload jsonb,
    source_updated_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (event_id, match_stage, set_number, match_number)
);

create table public.match_teams (
    match_id bigint not null references public.matches(id) on delete cascade,
    team_id bigint not null references public.teams(id) on delete cascade,
    alliance_color public.alliance_color not null,
    station_number smallint not null check (station_number between 1 and 3),
    primary key (match_id, team_id),
    unique (match_id, alliance_color, station_number)
);

create table public.rankings_snapshots (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    team_id bigint not null references public.teams(id) on delete cascade,
    rank_position int not null check (rank_position >= 1),
    disqualification_count int check (coalesce(disqualification_count, 0) >= 0),
    ranking_value numeric(8,3),
    matches_played int check (coalesce(matches_played, 0) >= 0),
    wins int check (coalesce(wins, 0) >= 0),
    losses int check (coalesce(losses, 0) >= 0),
    ties int check (coalesce(ties, 0) >= 0),
    ranking_sort_values jsonb,
    source_captured_at timestamptz not null default now(),
    source_updated_at timestamptz,
    created_at timestamptz not null default now()
);

create index idx_event_teams_team_id on public.event_teams(team_id);
create index idx_matches_event_lookup on public.matches(event_id, match_stage, set_number, match_number);
create index idx_match_teams_team_id on public.match_teams(team_id);
create index idx_rankings_event_team_time on public.rankings_snapshots(event_id, team_id, source_captured_at desc);

create trigger trg_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger trg_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger trg_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

-- =========================================================
-- EVENT PARTICIPANTS / ROLE HISTORY / BREAKS / SCHEDULER
-- =========================================================

create table public.event_participants (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    primary_role public.app_role not null,
    is_active_for_event boolean not null default true,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (event_id, user_id)
);

create table public.event_role_history (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    previous_role public.app_role,
    new_role public.app_role not null,
    changed_by_user_id uuid references public.users(id),
    change_reason text,
    changed_at timestamptz not null default now()
);

create table public.break_windows (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    break_date date not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    break_type public.break_type not null default 'manual',
    break_reason text,
    created_at timestamptz not null default now(),
    check (end_time > start_time)
);

create table public.scheduler_configs (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    schedule_scope public.schedule_scope not null,
    schedule_date date,
    segment_name text,
    active_match_scout_slots int not null default 6 check (active_match_scout_slots >= 1 and active_match_scout_slots <= 12),
    active_pit_scout_slots int not null default 0 check (active_pit_scout_slots >= 0 and active_pit_scout_slots <= 12),
    batch_size int not null default 5 check (batch_size >= 1 and batch_size <= 20),
    same_station_per_block boolean not null default false,
    include_playoffs boolean not null default false,
    allow_replacements boolean not null default true,
    lock_assignments boolean not null default false,
    notes text,
    created_by uuid references public.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (
        (schedule_scope = 'event' and schedule_date is null)
        or (schedule_scope = 'day' and schedule_date is not null)
        or (schedule_scope = 'segment' and schedule_date is not null and segment_name is not null)
    )
);

create table public.schedule_assignments (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    scheduler_config_id bigint references public.scheduler_configs(id) on delete set null,
    assignment_kind public.assignment_kind not null,
    assignment_source public.assignment_source not null default 'auto',
    match_id bigint references public.matches(id) on delete cascade,
    assigned_team_id bigint not null references public.teams(id) on delete cascade,
    assigned_user_id uuid not null references public.users(id) on delete cascade,
    station_label text,
    order_in_block int not null default 0,
    block_index int not null default 0,
    is_before_break boolean not null default true,
    status public.assignment_status not null default 'assigned',
    acknowledged_at timestamptz,
    started_at timestamptz,
    submitted_at timestamptz,
    replaced_by_user_id uuid references public.users(id),
    is_locked_by_admin boolean not null default false,
    assignment_notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (
        (assignment_kind = 'match_scout' and match_id is not null)
        or
        (assignment_kind = 'pit_scout' and match_id is null)
    )
);

create table public.replacement_requests (
    id bigserial primary key,
    schedule_assignment_id bigint not null references public.schedule_assignments(id) on delete cascade,
    requested_by_user_id uuid not null references public.users(id) on delete cascade,
    suggested_replacement_user_id uuid references public.users(id),
    request_reason text,
    status public.replacement_request_status not null default 'pending',
    reviewed_by_user_id uuid references public.users(id),
    reviewed_at timestamptz,
    created_at timestamptz not null default now()
);

create table public.schedule_audit_log (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    actor_user_id uuid references public.users(id),
    action_type text not null,
    target_assignment_id bigint references public.schedule_assignments(id) on delete set null,
    before_state_json jsonb,
    after_state_json jsonb,
    created_at timestamptz not null default now()
);

create index idx_event_participants_lookup on public.event_participants(event_id, user_id);
create index idx_event_role_history_lookup on public.event_role_history(event_id, user_id, changed_at desc);
create index idx_break_windows_lookup on public.break_windows(event_id, user_id, break_date);
create index idx_schedule_assignments_event_match on public.schedule_assignments(event_id, match_id);
create index idx_schedule_assignments_user on public.schedule_assignments(assigned_user_id, status);
create index idx_schedule_assignments_team on public.schedule_assignments(assigned_team_id);
create index idx_replacement_requests_assignment on public.replacement_requests(schedule_assignment_id);

create unique index uq_schedule_assignments_match_user_kind
on public.schedule_assignments(match_id, assigned_user_id, assignment_kind)
where match_id is not null;

create unique index uq_schedule_assignments_event_user_kind_block_order
on public.schedule_assignments(event_id, assigned_user_id, assignment_kind, block_index, order_in_block);

create trigger trg_event_participants_updated_at
before update on public.event_participants
for each row execute function public.set_updated_at();

create trigger trg_scheduler_configs_updated_at
before update on public.scheduler_configs
for each row execute function public.set_updated_at();

create trigger trg_schedule_assignments_updated_at
before update on public.schedule_assignments
for each row execute function public.set_updated_at();





-- FORM SOURCES / VERSIONS / FIELD MAPPINGS / RAW RESPONSES


create table public.form_sources (
    id bigserial primary key,
    form_kind public.form_kind not null,
    form_name text not null,
    google_form_id text,
    google_sheet_id text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (form_kind, google_form_id)
);

create table public.form_versions (
    id bigserial primary key,
    form_source_id bigint not null references public.form_sources(id) on delete cascade,
    version_name text not null,
    effective_from timestamptz not null default now(),
    form_schema_json jsonb not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table public.form_fields (
    id bigserial primary key,
    form_version_id bigint not null references public.form_versions(id) on delete cascade,
    source_label text not null,
    source_key text not null,
    target_field_name text not null,
    target_value_type text not null,
    is_required boolean not null default false,
    created_at timestamptz not null default now(),
    unique (form_version_id, source_key)
);

create table public.form_responses_raw (
    id bigserial primary key,
    form_source_id bigint not null references public.form_sources(id) on delete cascade,
    form_version_id bigint references public.form_versions(id) on delete set null,
    form_kind public.form_kind not null,
    google_response_id text,
    google_sheet_row_id text,
    submitted_at timestamptz not null,
    submitted_by_name_raw text,
    raw_response_json jsonb not null,
    ingestion_status public.ingestion_status not null default 'pending',
    ingestion_error text,
    created_at timestamptz not null default now(),
    unique (form_source_id, google_response_id)
);

create index idx_form_responses_raw_status on public.form_responses_raw(form_kind, ingestion_status, submitted_at desc);




-- PIT SCOUTING


create table public.pit_scout_entries (
    id bigserial primary key,
    raw_response_id bigint unique references public.form_responses_raw(id) on delete set null,
    event_id bigint references public.events(id) on delete set null,
    team_id bigint not null references public.teams(id) on delete cascade,
    scouter_user_id uuid references public.users(id) on delete set null,
    scouter_name_raw text,
    team_name_raw text,
    submitted_at timestamptz not null,

    drive_train text,
    programming_language text,

    intake_from_floor boolean,
    intake_from_outpost boolean,
    intake_speed text,
    max_fuel_capacity int,

    variable_shooting_speed boolean,
    best_scoring_range text,
    can_shoot_while_moving boolean,
    shooting_accuracy text,

    has_auto boolean,
    auto_capability_summary text,
    auto_start_position text,
    average_auto_fuel_count int,

    preferred_teleop_start_positions jsonb,
    can_cross_bumps boolean,
    can_cross_trench boolean,
    defense_capability text,

    climb_capabilities jsonb,
    average_climb_time_seconds int,
    can_climb_with_defense boolean,
    needs_help_to_climb boolean,

    notes text,
    created_at timestamptz not null default now(),

    check (
        coalesce(max_fuel_capacity, 0) >= 0
        and coalesce(average_auto_fuel_count, 0) >= 0
        and coalesce(average_climb_time_seconds, 0) >= 0
    )
);

create index idx_pit_scout_entries_lookup on public.pit_scout_entries(team_id, event_id, submitted_at desc);




-- MATCH SCOUTING


create table public.match_scout_entries (
    id bigserial primary key,
    raw_response_id bigint unique references public.form_responses_raw(id) on delete set null,
    event_id bigint not null references public.events(id) on delete cascade,
    match_id bigint not null references public.matches(id) on delete cascade,
    team_id bigint not null references public.teams(id) on delete cascade,
    scouter_user_id uuid references public.users(id) on delete set null,
    scouter_name_raw text,
    team_name_raw text,
    submitted_at timestamptz not null,

    alliance_color public.alliance_color,

    auto_start_position text,
    auto_leaves_starting_zone boolean,
    auto_fuel_collected int default 0,
    auto_fuel_scored int default 0,
    auto_fuel_missed int default 0,
    auto_l1_climb boolean,
    auto_failed boolean,
    auto_reliability_observed text,

    teleop_start_position text,
    intake_from_floor boolean,
    intake_from_outpost boolean,
    completed_cycles_count int default 0,
    average_cycle_speed text,
    teleop_fuel_collected int default 0,
    teleop_fuel_missed int default 0,
    teleop_fuel_scored int default 0,
    shooting_accuracy text,
    shooting_locations jsonb,
    shot_during_inactive_hub text,

    played_defense boolean,
    defense_effectiveness text,
    was_blocked_heavily boolean,
    crossed_obstacles jsonb,
    crossing_accuracy text,

    attempted_climb boolean,
    climb_result text,
    time_left_after_climb_seconds int,

    robot_issues jsonb,
    fouls int default 0,
    primary_role_observed text,
    penalty_risk text,
    overall_performance text,
    notes text,

    created_at timestamptz not null default now(),

    unique (match_id, team_id, scouter_user_id),

    check (
        auto_fuel_collected >= 0
        and auto_fuel_scored >= 0
        and auto_fuel_missed >= 0
        and teleop_fuel_collected >= 0
        and teleop_fuel_scored >= 0
        and teleop_fuel_missed >= 0
        and completed_cycles_count >= 0
        and fouls >= 0
        and coalesce(time_left_after_climb_seconds, 0) >= 0
    )
);

create index idx_match_scout_entries_team_event on public.match_scout_entries(team_id, event_id, submitted_at desc);
create index idx_match_scout_entries_match_team on public.match_scout_entries(match_id, team_id);





-- DATA QUALITY / CONFIRMATION WORKFLOWS


create table public.scouting_confirmation_tasks (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    match_id bigint references public.matches(id) on delete cascade,
    team_id bigint not null references public.teams(id) on delete cascade,
    assigned_user_id uuid references public.users(id) on delete set null,
    source_type text not null,
    field_name text not null,
    observed_value text,
    reference_value text,
    severity public.severity_level not null default 'medium',
    status public.confirmation_status not null default 'pending',
    resolution_notes text,
    created_at timestamptz not null default now(),
    resolved_at timestamptz
);

create table public.data_quality_flags (
    id bigserial primary key,
    event_id bigint references public.events(id) on delete cascade,
    match_id bigint references public.matches(id) on delete cascade,
    team_id bigint references public.teams(id) on delete cascade,
    source_table_name text not null,
    source_row_id bigint,
    flag_type text not null,
    severity public.severity_level not null default 'medium',
    flag_message text not null,
    status public.quality_flag_status not null default 'open',
    created_at timestamptz not null default now(),
    resolved_at timestamptz
);

create index idx_confirmation_tasks_status on public.scouting_confirmation_tasks(status, severity);
create index idx_quality_flags_status on public.data_quality_flags(status, severity);





-- SUMMARY CACHE


create table public.summary_cache (
    id bigserial primary key,
    summary_kind public.summary_kind not null,
    event_id bigint not null references public.events(id) on delete cascade,
    match_id bigint not null references public.matches(id) on delete cascade,
    team_id bigint not null references public.teams(id) on delete cascade,
    generated_at timestamptz not null default now(),
    confidence_label text,
    evidence_source_summary text,
    summary_json jsonb not null,
    unique (summary_kind, event_id, match_id, team_id)
);

create index idx_summary_cache_lookup on public.summary_cache(summary_kind, event_id, team_id);




-- ANALYTICS / DASHBOARD METRICS
-- Phase-aware because REBUILT is phase-sensitive


create table public.team_match_metrics (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    match_id bigint not null references public.matches(id) on delete cascade,
    team_id bigint not null references public.teams(id) on delete cascade,

    auto_output_score numeric(8,2),
    transition_shift_output_score numeric(8,2),
    alliance_shift_output_score numeric(8,2),
    endgame_output_score numeric(8,2),

    active_hub_efficiency_rate numeric(5,2),
    inactive_hub_decision_score numeric(8,2),
    defense_impact_score numeric(8,2),
    foul_risk_score numeric(8,2),
    consistency_score numeric(8,2),

    total_fuel_scored int,
    total_fuel_missed int,
    total_cycles_completed int,
    fouls_count int,
    climbed_successfully boolean,

    derived_from_json jsonb,
    updated_at timestamptz not null default now(),

    unique (match_id, team_id),

    check (
        coalesce(total_fuel_scored, 0) >= 0
        and coalesce(total_fuel_missed, 0) >= 0
        and coalesce(total_cycles_completed, 0) >= 0
        and coalesce(fouls_count, 0) >= 0
    )
);

create table public.team_event_metrics (
    id bigserial primary key,
    event_id bigint not null references public.events(id) on delete cascade,
    team_id bigint not null references public.teams(id) on delete cascade,

    current_rank int,
    matches_played int not null default 0,

    auto_average_fuel_scored numeric(6,2),
    auto_leave_zone_rate numeric(5,2),
    auto_l1_climb_rate numeric(5,2),

    teleop_average_cycles numeric(6,2),
    teleop_average_fuel_scored numeric(6,2),
    teleop_average_fuel_missed numeric(6,2),

    active_hub_scoring_rate numeric(5,2),
    inactive_hub_shot_rate numeric(5,2),
    phase_balance_score numeric(8,2),

    defense_rate numeric(5,2),
    blocked_rate numeric(5,2),

    climb_attempt_rate numeric(5,2),
    climb_success_rate numeric(5,2),
    endgame_conversion_rate numeric(5,2),
    average_time_left_after_climb_seconds numeric(6,2),

    foul_rate numeric(5,2),
    reliability_issue_rate numeric(5,2),

    expected_role text,
    consistency_score numeric(8,2),
    updated_at timestamptz not null default now(),

    unique (event_id, team_id),

    check (
        matches_played >= 0
        and coalesce(current_rank, 0) >= 0
    )
);

create table public.team_season_metrics (
    id bigserial primary key,
    season_year int not null,
    team_id bigint not null references public.teams(id) on delete cascade,

    events_played int not null default 0,
    matches_played int not null default 0,

    season_auto_average numeric(6,2),
    season_teleop_average numeric(6,2),
    season_endgame_rate numeric(5,2),
    season_foul_rate numeric(5,2),
    season_consistency_score numeric(8,2),

    trend_summary_json jsonb,
    updated_at timestamptz not null default now(),

    unique (season_year, team_id),

    check (
        events_played >= 0
        and matches_played >= 0
    )
);

create index idx_team_match_metrics_lookup on public.team_match_metrics(match_id, team_id);
create index idx_team_event_metrics_lookup on public.team_event_metrics(event_id, team_id);
create index idx_team_season_metrics_lookup on public.team_season_metrics(season_year, team_id);




-- REFRESH / RECOMPUTE / SYNC JOBS

create table public.refresh_jobs (
    id bigserial primary key,
    job_type public.refresh_job_type not null,
    job_status public.refresh_job_status not null default 'queued',
    event_id bigint references public.events(id) on delete cascade,
    match_id bigint references public.matches(id) on delete cascade,
    team_id bigint references public.teams(id) on delete cascade,
    trigger_source_record_id bigint,
    requested_by_user_id uuid references public.users(id),
    job_payload_json jsonb,
    error_message text,
    created_at timestamptz not null default now(),
    started_at timestamptz,
    completed_at timestamptz
);

create index idx_refresh_jobs_status on public.refresh_jobs(job_status, job_type, created_at);





-- SEED ROLES


insert into public.roles (role_key, role_name, description)
values
    ('admin', 'Admin', 'Full access to all pilot features'),
    ('mentor', 'Mentor', 'Can see what scouters and strategists see'),
    ('strategist', 'Strategist', 'Strategy and dashboard access'),
    ('scouter', 'Scouter', 'Assignments, forms, and summaries'),
    ('operations', 'Operations', 'Pit crew and technician access'),
    ('viewer', 'Viewer', 'Live stats and dashboards only')
on conflict do nothing;





-- SEED PERMISSIONS


insert into public.permissions (permission_key, permission_name, description)
values
    ('scheduler.read', 'Scheduler Read', 'Read scheduler and assignments'),
    ('scheduler.generate', 'Scheduler Generate', 'Generate assignments'),
    ('scheduler.edit', 'Scheduler Edit', 'Edit assignments and scheduler settings'),
    ('scheduler.override', 'Scheduler Override', 'Override locks and assignment rules'),
    ('scheduler.replacements.review', 'Replacement Review', 'Review and approve replacement requests'),

    ('scouting.read', 'Scouting Read', 'Read scouting pages and entries'),
    ('scouting.submit', 'Scouting Submit', 'Submit scouting entries'),
    ('scouting.edit', 'Scouting Edit', 'Edit scouting entries'),
    ('scouting.status.read', 'Scouting Status Read', 'See scouting completion status'),
    ('scouting.confirmation.resolve', 'Resolve Confirmation Tasks', 'Resolve mismatch confirmation tasks'),

    ('strategy.read', 'Strategy Read', 'Read strategy views'),
    ('strategy.compare', 'Strategy Compare', 'Use team/alliance comparison tools'),
    ('strategy.match_prep', 'Strategy Match Prep', 'Access match prep pages'),

    ('dashboard.live.read', 'Live Dashboard Read', 'Read live stats dashboard'),
    ('dashboard.team.read', 'Team Dashboard Read', 'Read team dashboards'),
    ('dashboard.event.read', 'Event Dashboard Read', 'Read event dashboards'),
    ('dashboard.compare.read', 'Comparison Dashboard Read', 'Read comparison dashboards'),
    ('dashboard.ops.read', 'Operations Dashboard Read', 'Read operations dashboards'),

    ('admin.users.manage', 'Manage Users', 'Manage users and access'),
    ('admin.roles.manage', 'Manage Roles', 'Manage roles and overrides'),
    ('admin.events.manage', 'Manage Events', 'Manage event settings and sync'),
    ('admin.quality.review', 'Review Data Quality', 'Review quality flags and data issues')
on conflict do nothing;




-- ROLE -> PERMISSION MAPPINGS


insert into public.role_permissions (role_key, permission_key)
values
    ('admin', 'scheduler.read'),
    ('admin', 'scheduler.generate'),
    ('admin', 'scheduler.edit'),
    ('admin', 'scheduler.override'),
    ('admin', 'scheduler.replacements.review'),
    ('admin', 'scouting.read'),
    ('admin', 'scouting.submit'),
    ('admin', 'scouting.edit'),
    ('admin', 'scouting.status.read'),
    ('admin', 'scouting.confirmation.resolve'),
    ('admin', 'strategy.read'),
    ('admin', 'strategy.compare'),
    ('admin', 'strategy.match_prep'),
    ('admin', 'dashboard.live.read'),
    ('admin', 'dashboard.team.read'),
    ('admin', 'dashboard.event.read'),
    ('admin', 'dashboard.compare.read'),
    ('admin', 'dashboard.ops.read'),
    ('admin', 'admin.users.manage'),
    ('admin', 'admin.roles.manage'),
    ('admin', 'admin.events.manage'),
    ('admin', 'admin.quality.review'),

    ('mentor', 'scheduler.read'),
    ('mentor', 'scouting.read'),
    ('mentor', 'scouting.status.read'),
    ('mentor', 'strategy.read'),
    ('mentor', 'strategy.compare'),
    ('mentor', 'strategy.match_prep'),
    ('mentor', 'dashboard.live.read'),
    ('mentor', 'dashboard.team.read'),
    ('mentor', 'dashboard.event.read'),
    ('mentor', 'dashboard.compare.read'),
    ('mentor', 'dashboard.ops.read'),

    ('strategist', 'scouting.read'),
    ('strategist', 'strategy.read'),
    ('strategist', 'strategy.compare'),
    ('strategist', 'strategy.match_prep'),
    ('strategist', 'dashboard.live.read'),
    ('strategist', 'dashboard.team.read'),
    ('strategist', 'dashboard.event.read'),
    ('strategist', 'dashboard.compare.read'),

    ('scouter', 'scheduler.read'),
    ('scouter', 'scouting.read'),
    ('scouter', 'scouting.submit'),
    ('scouter', 'scouting.edit'),
    ('scouter', 'scouting.status.read'),
    ('scouter', 'dashboard.live.read'),
    ('scouter', 'dashboard.team.read'),

    ('operations', 'dashboard.live.read'),
    ('operations', 'dashboard.team.read'),
    ('operations', 'dashboard.event.read'),
    ('operations', 'dashboard.ops.read'),
    ('operations', 'scouting.read'),

    ('viewer', 'dashboard.live.read'),
    ('viewer', 'dashboard.team.read'),
    ('viewer', 'dashboard.event.read'),
    ('viewer', 'dashboard.compare.read')
on conflict do nothing;

commit;


