import type { Database } from "@/types/database"
import type {
    TbaEvent,
    TbaMatch,
    TbaRankingsResponse,
    TbaTeam,
} from "./types"

type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

type EventInsert = Database["public"]["Tables"]["events"]["Insert"]
type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"]
type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"]
type MatchTeamInsert = Database["public"]["Tables"]["match_teams"]["Insert"]
type RankingSnapshotInsert = Database["public"]["Tables"]["rankings_snapshots"]["Insert"]

function toIsoFromEpoch(epoch?: number | null): string | null {
    if (!epoch) return null
    return new Date(epoch * 1000).toISOString()
}

function toJson(value: unknown): Json {
    return JSON.parse(JSON.stringify(value)) as Json
}

function mapMatchStage(compLevel: string): "practice" | "qm" | "qf" | "sf" | "f" {
    if (compLevel === "qm") return "qm"
    if (compLevel === "qf") return "qf"
    if (compLevel === "sf") return "sf"
    if (compLevel === "f") return "f"
    return "practice"
}

export function normalizeEvent(event: TbaEvent): EventInsert {
    return {
        tba_event_key: event.key,
        season_year: event.year,
        event_code: event.event_code ?? null,
        event_name: event.name,
        event_type: event.event_type_string ?? null,
        district_name: event.district?.display_name ?? null,
        city: event.city ?? null,
        state_prov: event.state_prov ?? null,
        country: event.country ?? null,
        start_date: event.start_date ?? null,
        end_date: event.end_date ?? null,
        timezone: event.timezone ?? null,
        source_updated_at: new Date().toISOString(),
    }
}

export function normalizeTeam(team: TbaTeam): TeamInsert {
    return {
        team_number: team.team_number,
        robot_name: team.nickname ?? null,
        school_name: team.school_name ?? null,
        city: team.city ?? null,
        state_prov: team.state_prov ?? null,
        country: team.country ?? null,
        rookie_year: team.rookie_year ?? null,
        website: team.website ?? null,
    }
}

export function normalizeMatch(eventId: number, match: TbaMatch): MatchInsert {
    return {
        event_id: eventId,
        tba_match_key: match.key,
        match_stage: mapMatchStage(match.comp_level),
        set_number: match.set_number ?? 1,
        match_number: match.match_number,
        scheduled_time: toIsoFromEpoch(match.time),
        predicted_time: toIsoFromEpoch(match.predicted_time),
        actual_time: toIsoFromEpoch(match.actual_time),
        winning_alliance: match.winning_alliance ?? null,
        red_score: match.alliances.red.score ?? null,
        blue_score: match.alliances.blue.score ?? null,
        tba_score_breakdown: toJson(match.score_breakdown ?? null),
        tba_videos: toJson(match.videos ?? null),
        tba_raw_payload: toJson(match),
        source_updated_at: new Date().toISOString(),
    }
}

export function buildMatchTeams(
    matchId: number,
    teamIdByTbaKey: Map<string, number>,
    match: TbaMatch,
): MatchTeamInsert[] {
    const rows: MatchTeamInsert[] = []

    ;(["red", "blue"] as const).forEach((allianceColor) => {
        match.alliances[allianceColor].team_keys.forEach((teamKey, index) => {
            const teamId = teamIdByTbaKey.get(teamKey)
            if (!teamId) return

            rows.push({
                match_id: matchId,
                team_id: teamId,
                alliance_color: allianceColor,
                station_number: index + 1,
            })
            })
    })

    return rows
}

export function buildRankingRows(
    eventId: number,
    teamIdByTbaKey: Map<string, number>,
    rankingsResponse: TbaRankingsResponse,
): RankingSnapshotInsert[] {
    return (rankingsResponse.rankings ?? [])
        .map((ranking): RankingSnapshotInsert | null => {
            const teamId = teamIdByTbaKey.get(ranking.team_key)
            if (!teamId) return null

            return {
                event_id: eventId,
                team_id: teamId,
                rank_position: ranking.rank,
                disqualification_count: ranking.dq ?? 0,
                ranking_value: ranking.sort_orders?.[0] ?? ranking.rank,
                matches_played: ranking.matches_played ?? 0,
                wins: ranking.record?.wins ?? 0,
                losses: ranking.record?.losses ?? 0,
                ties: ranking.record?.ties ?? 0,
                ranking_sort_values: toJson(ranking.sort_orders ?? null),
                source_captured_at: new Date().toISOString(),
                source_updated_at: new Date().toISOString(),
            }
            })
        .filter((row): row is RankingSnapshotInsert => row !== null)
}
