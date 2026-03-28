import type { Database } from "@/types/database"
import type {
    FrcEventListing,
    FrcMatchResult,
    FrcRankingRow,
    FrcScheduleMatch,
    FrcTeamListing,
    FrcTournamentLevel,
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

type AllianceColor = Database["public"]["Enums"]["alliance_color"]
type MatchStage = Database["public"]["Enums"]["match_stage"]

function toJson(value: unknown): Json {
    return JSON.parse(JSON.stringify(value)) as Json
}

function toIsoOrNull(value?: string | null): string | null {
    if (!value) return null

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null

    return parsed.toISOString()
}

function mapTournamentLevelToMatchStage(
    level: FrcTournamentLevel,
): MatchStage {
    switch (level) {
        case "Practice":
            return "practice"
        case "Qualification":
            return "qm"
        case "Playoff":
            return "f"
        case "None":
        default:
            return "practice"
    }
}

function parseAllianceStation(
    station: string,
): {
    allianceColor: AllianceColor
    stationNumber: number
} | null {
    const match = station.match(/^(Red|Blue)([1-3])$/i)
    if (!match) return null

    const allianceColor =
        match[1].toLowerCase() === "red" ? "red" : "blue"

    return {
        allianceColor,
        stationNumber: Number(match[2]),
    }
}

/**
 * FIRST event codes are short codes like "NYTR".
 * We store them in the same tba_event_key column used by the current pilot,
 * but prefix them so they never collide with real TBA keys like "2025nytr".
 */

export function buildFrcEventKey(
    seasonYear: number,
    eventCode: string,
): string {
    return `frc_${seasonYear}_${eventCode.trim().toLowerCase()}`
}

/**
 * FIRST does not provide a TBA-style globally unique match key.
 * We generate one deterministically for our own storage.
 */
export function buildFrcMatchKey(params: {
    seasonYear: number
    eventCode: string
    tournamentLevel: FrcTournamentLevel
    matchNumber: number
}): string {
    return [
        "frc",
        params.seasonYear,
        params.eventCode.trim().toLowerCase(),
        params.tournamentLevel.trim().toLowerCase(),
        params.matchNumber,
    ].join("_")
}

export function normalizeFrcEvent(
    seasonYear: number,
    event: FrcEventListing,
): EventInsert {
    return {
        tba_event_key: buildFrcEventKey(seasonYear, event.code),
        season_year: seasonYear,
        event_code: event.code,
        event_name: event.name,
        event_type: event.type ?? null,
        district_name: event.districtCode ?? null,
        city: event.city ?? null,
        state_prov: event.stateprov ?? null,
        country: event.country ?? null,
        start_date: event.dateStart ? event.dateStart.slice(0, 10) : null,
        end_date: event.dateEnd ? event.dateEnd.slice(0, 10) : null,
        timezone: event.timezone ?? null,
        source_updated_at: new Date().toISOString(),
  }
}

export function normalizeFrcTeam(team: FrcTeamListing): TeamInsert {
    return {
        team_number: team.teamNumber,
        robot_name: team.robotName ?? team.nameShort ?? null,
        school_name: team.schoolName ?? team.nameFull ?? null,
        city: team.city ?? null,
        state_prov: team.stateProv ?? null,
        country: team.country ?? null,
        rookie_year: team.rookieYear ?? null,
        website: team.website ?? null,
  }
}

export function normalizeFrcMatch(params: {
    seasonYear: number
    eventCode: string
    eventId: number
    scheduleMatch: FrcScheduleMatch
    resultMatch?: FrcMatchResult | null
    scoreDetail?: unknown
}): MatchInsert {
    const { seasonYear, eventCode, eventId, scheduleMatch, resultMatch, scoreDetail } = params

    const tournamentLevel =
        resultMatch?.tournamentLevel ?? scheduleMatch.tournamentLevel

    const redScore =
        resultMatch?.scoreRedFinal ?? extractAllianceTotal(scoreDetail, "Red")

    const blueScore =
        resultMatch?.scoreBlueFinal ?? extractAllianceTotal(scoreDetail, "Blue")

    const winningAlliance =
        redScore == null || blueScore == null
            ? null
            : redScore > blueScore
                ? "red"
                : blueScore > redScore
                    ? "blue"
                    : null

    return {
        event_id: eventId,
        tba_match_key: buildFrcMatchKey({
            seasonYear,
            eventCode,
            tournamentLevel,
            matchNumber: scheduleMatch.matchNumber,
        }),
        match_stage: mapTournamentLevelToMatchStage(tournamentLevel),
        set_number: deriveSetNumber(scheduleMatch),
        match_number: scheduleMatch.matchNumber,
        scheduled_time: toIsoOrNull(scheduleMatch.startTime),
        predicted_time: null,
        actual_time: toIsoOrNull(resultMatch?.actualStartTime ?? null),
        winning_alliance: winningAlliance,
        red_score: redScore,
        blue_score: blueScore,
        tba_score_breakdown: scoreDetail ? toJson(scoreDetail) : null,
        tba_videos: null,
        tba_raw_payload: toJson({
            source: "frc-api",
            scheduleMatch,
            resultMatch: resultMatch ?? null,
        }),
        source_updated_at: new Date().toISOString(),
    }
}

export function buildFrcMatchTeams(
    matchId: number,
    teamIdByNumber: Map<number, number>,
    scheduleMatch: FrcScheduleMatch,
): MatchTeamInsert[] {
    const rows: MatchTeamInsert[] = []

    for (const team of scheduleMatch.teams) {
        const teamId = teamIdByNumber.get(team.teamNumber)
        if (!teamId) continue

        const parsed = parseAllianceStation(team.station)
        if (!parsed) continue

        rows.push({
            match_id: matchId,
            team_id: teamId,
            alliance_color: parsed.allianceColor,
            station_number: parsed.stationNumber,
        })
    }

    return rows
}

export function buildFrcRankingRows(
    eventId: number,
    teamIdByNumber: Map<number, number>,
    rankings: FrcRankingRow[],
): RankingSnapshotInsert[] {
    return rankings
        .map((ranking): RankingSnapshotInsert | null => {
            const teamId = teamIdByNumber.get(ranking.teamNumber)
            if (!teamId) return null

            return {
                event_id: eventId,
                team_id: teamId,
                rank_position: ranking.rank,
                disqualification_count: ranking.dq ?? 0,
                ranking_value: ranking.qualAverage ?? ranking.sortOrder1 ?? ranking.rank,
                matches_played: ranking.matchesPlayed ?? 0,
                wins: ranking.wins ?? 0,
                losses: ranking.losses ?? 0,
                ties: ranking.ties ?? 0,
                ranking_sort_values: toJson([
                    ranking.sortOrder1,
                    ranking.sortOrder2,
                    ranking.sortOrder3,
                    ranking.sortOrder4,
                    ranking.sortOrder5,
                    ranking.sortOrder6, 
                ]),
                source_captured_at: new Date().toISOString(),
                source_updated_at: new Date().toISOString(),
            }
        })
        .filter((row): row is RankingSnapshotInsert => row !== null)
}

function extractAllianceTotal(
    scoreDetail: unknown,
    alliance: "Red" | "Blue",
): number | null {
    if (
        !scoreDetail ||
        typeof scoreDetail !== "object" ||
        !("alliances" in scoreDetail) ||
        !Array.isArray((scoreDetail as { alliances?: unknown[] }).alliances)
    ) {
        return null
    }

    const alliances = (scoreDetail as {
        alliances: Array<Record<string, unknown>>
    }).alliances

    const allianceRow = alliances.find((item) => item.alliance === alliance)
    if (!allianceRow) return null

    const totalPoints = allianceRow.totalPoints
    return typeof totalPoints === "number" ? totalPoints : null
}

/**
 * For qualification, set_number should stay 1.
 * For playoffs, FIRST's schedule API gives descriptive names but not TBA-style set numbers.
 * We keep set_number = 1 for now because:
 * - it is stable
 * - it avoids fake precision
 * - playoff grouping can still be derived later from description if needed
 */
function deriveSetNumber(_scheduleMatch: FrcScheduleMatch): number {
    void _scheduleMatch
    return 1
}

