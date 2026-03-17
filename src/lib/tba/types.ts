export type TbaEvent = {
    key: string
    year: number
    event_code: string
    name: string
    event_type_string?: string
    district?: { display_name?: string } | null
    city?: string | null
    state_prov?: string | null
    country?: string | null
    start_date?: string | null
    end_date?: string | null
    timezone?: string | null
}

export type TbaTeam = {
    key: string
    team_number: number
    nickname?: string | null
    school_name?: string | null
    city?: string | null
    state_prov?: string | null
    country?: string | null
    rookie_year?: number | null
    website?: string | null
}

export type TbaAlliance = {
    team_keys: string[]
    score?: number | null
}

export type TbaMatch = {
    key: string
    comp_level: "qm" | "qf" | "sf" | "f" | string
    set_number: number
    match_number: number
    actual_time?: number | null
    predicted_time?: number | null
    time?: number | null
    winning_alliance?: string
    alliances: {
        red: TbaAlliance
        blue: TbaAlliance
    }
    score_breakdown?: Record<string, unknown> | null
    videos?: Array<Record<string, unknown>> | null
}

export type TbaRankingsResponse = {
    rankings?: Array<{
        team_key: string
        rank: number
        dq?: number
        matches_played?: number
        record?: {
            wins?: number
            losses?: number
            ties?: number
        }
        sort_orders?: number[]
    }>
}


