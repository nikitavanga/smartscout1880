import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

import {
    fetchFrcEventListings,
    fetchFrcEventMatchResults,
    fetchFrcEventRankings,
    fetchFrcEventSchedule,
    fetchFrcScoreDetails,
    fetchFrcTeamListingsForEvent,
} from "./client"
import {
    buildFrcMatchTeams,
    buildFrcRankingRows,
    normalizeFrcEvent,
    normalizeFrcMatch,
    normalizeFrcTeam,
} from "./normalizers"
import { FrcApiError } from "./errors"
import type {
    FrcMatchResult,
    FrcScheduleMatch,
    FrcScoreDetailMatch,
    FrcTeamListing,
} from "./types"

type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"]
type MatchTeamInsert = Database["public"]["Tables"]["match_teams"]["Insert"]

export async function syncFrcEvent(params: {
    seasonYear: number
    eventCode: string
}) {
    const { seasonYear, eventCode } = params
    const supabase = createAdminClient()

    try {

        // 1) Fetch event listing

        const eventRes = await fetchFrcEventListings(seasonYear, eventCode)

        if (!eventRes.data?.Events?.length) {
            throw new FrcApiError("Event not found", {
                stage: "fetch",
                entity: "events",
                season: seasonYear,
                eventCode,
            })
        }

        const eventData = eventRes.data.Events[0]
        const normalizedEvent = normalizeFrcEvent(seasonYear, eventData)

        const { data: eventRow, error: eventError } = await supabase
            .from("events")
            .upsert(normalizedEvent, { onConflict: "tba_event_key" })
            .select("id")
            .single()

        if (eventError || !eventRow) {
            throw new FrcApiError("Failed to upsert event", {
                stage: "db",
                entity: "events",
                season: seasonYear,
                eventCode,
                details: eventError?.message ?? eventError,
            })
        }

        const eventId = eventRow.id


        // 2) Fetch all teams with pagination

        const allTeams: FrcTeamListing[] = []
        let page = 1

        while (true) {
            const res = await fetchFrcTeamListingsForEvent(seasonYear, eventCode, page)
            const pageTeams = res.data?.teams ?? []

            if (!pageTeams.length) break

            allTeams.push(...pageTeams)

            if (!res.data?.pageTotal || page >= res.data.pageTotal) break
            page += 1
        }

        const teamRows = allTeams.map(normalizeFrcTeam)

        if (teamRows.length > 0) {
            const { error: teamsError } = await supabase
                .from("teams")
                .upsert(teamRows, { onConflict: "team_number" })

            if (teamsError) {
                throw new FrcApiError("Failed to upsert teams", {
                    stage: "db",
                    entity: "teams",
                    season: seasonYear,
                    eventCode,
                    details: teamsError.message,
                })
            }
        }

        const teamNumbers = allTeams.map((team) => team.teamNumber)

        const { data: teamDbRows, error: teamDbError } = await supabase
            .from("teams")
            .select("id, team_number")
            .in("team_number", teamNumbers.length > 0 ? teamNumbers : [-1])

        if (teamDbError) {
            throw new FrcApiError("Failed to fetch team IDs", {
                stage: "db",
                entity: "teams",
                season: seasonYear,
                eventCode,
                details: teamDbError.message,
            })
        }

        const teamIdByNumber = new Map<number, number>()
        for (const team of teamDbRows ?? []) {
            teamIdByNumber.set(team.team_number, team.id)
        }


        // 3) Upsert event_teams

        const eventTeamRows = allTeams
            .map((team) => {
                const teamId = teamIdByNumber.get(team.teamNumber)
                if (!teamId) return null

                return {
                event_id: eventId,
                team_id: teamId,
                }
            })
            .filter(
                (row): row is { event_id: number; team_id: number } => row !== null,
            )

        if (eventTeamRows.length > 0) {
            const { error: eventTeamsError } = await supabase
                .from("event_teams")
                .upsert(eventTeamRows, { onConflict: "event_id,team_id" })

            if (eventTeamsError) {
                throw new FrcApiError("Failed to upsert event teams", {
                    stage: "db",
                    entity: "teams",
                    season: seasonYear,
                    eventCode,
                    details: eventTeamsError.message,
                })
            }
        }


        // 4) Rankings

        const rankingsRes = await fetchFrcEventRankings(seasonYear, eventCode)

        if (rankingsRes.data?.Rankings?.length) {
            const rankingRows = buildFrcRankingRows(
                eventId,
                teamIdByNumber,
                rankingsRes.data.Rankings,
            )

        if (rankingRows.length > 0) {
            const { error: rankingsError } = await supabase
                .from("rankings_snapshots")
                .insert(rankingRows)

            if (rankingsError) {
                throw new FrcApiError("Failed to insert rankings", {
                    stage: "db",
                    entity: "rankings",
                    season: seasonYear,
                    eventCode,
                    details: rankingsError.message,
                })
                }
            }
        }


        // 5) Schedule + Results + Score details

        const levels: Array<"Qualification" | "Playoff"> = [
            "Qualification",
            "Playoff",
        ]

        const allMatches: MatchInsert[] = []
        const scheduleCache: FrcScheduleMatch[] = []

        for (const level of levels) {
            const scheduleRes = await fetchFrcEventSchedule(seasonYear, eventCode, level)
            const resultsRes = await fetchFrcEventMatchResults(seasonYear, eventCode, level)
            const scoresRes = await fetchFrcScoreDetails(seasonYear, eventCode, level)

            const scheduleMatches: FrcScheduleMatch[] = scheduleRes.data?.Schedule ?? []
            const resultMatches: FrcMatchResult[] = resultsRes.data?.Matches ?? []
            const scoreMatches: FrcScoreDetailMatch[] = scoresRes.data?.MatchScores ?? []

            scheduleCache.push(...scheduleMatches)

            for (const scheduleMatch of scheduleMatches) {
                const resultMatch = resultMatches.find(
                    (match) =>
                        match.matchNumber === scheduleMatch.matchNumber &&
                        match.tournamentLevel === scheduleMatch.tournamentLevel,
                )

                const scoreDetail = scoreMatches.find(
                    (score) =>
                        score.matchNumber === scheduleMatch.matchNumber &&
                        score.matchLevel === scheduleMatch.tournamentLevel,
                )

                const matchRow = normalizeFrcMatch({
                    seasonYear,
                    eventCode,
                    eventId,
                    scheduleMatch,
                    resultMatch,
                    scoreDetail,
                })

                allMatches.push(matchRow)
            }
        }


        // 6) Upsert matches

        if (allMatches.length > 0) {
            const { error: matchesError } = await supabase
                .from("matches")
                .upsert(allMatches, { onConflict: "tba_match_key" })

            if (matchesError) {
                throw new FrcApiError("Failed to upsert matches", {
                    stage: "db",
                    entity: "matches",
                    season: seasonYear,
                    eventCode,
                    details: matchesError.message,
                })
            }
        }

        const { data: matchDbRows, error: matchDbError } = await supabase
            .from("matches")
            .select("id, tba_match_key")
            .eq("event_id", eventId)

        if (matchDbError) {
            throw new FrcApiError("Failed to fetch match IDs", {
                stage: "db",
                entity: "matches",
                season: seasonYear,
                eventCode,
                details: matchDbError.message,
            })
        }

        const matchIdByKey = new Map<string, number>()
        for (const match of matchDbRows ?? []) {
            matchIdByKey.set(match.tba_match_key, match.id)
        }


        // 7) Build match_teams rows

        const matchTeams: MatchTeamInsert[] = []

        for (const scheduleMatch of scheduleCache) {
            const key = [
                "frc",
                seasonYear,
                eventCode.toLowerCase(),
                scheduleMatch.tournamentLevel.toLowerCase(),
                scheduleMatch.matchNumber,
            ].join("_")

            const matchId = matchIdByKey.get(key)
            if (!matchId) continue

            const rows = buildFrcMatchTeams(matchId, teamIdByNumber, scheduleMatch)
            matchTeams.push(...rows)
        }

    // clear old match_teams for this event safely
        const matchIdsForEvent = (matchDbRows ?? []).map((match) => match.id)

        if (matchIdsForEvent.length > 0) {
            const { error: deleteMatchTeamsError } = await supabase
                .from("match_teams")
                .delete()
                .in("match_id", matchIdsForEvent)

            if (deleteMatchTeamsError) {
                throw new FrcApiError("Failed to clear old match teams", {
                    stage: "db",
                    entity: "teams",
                    season: seasonYear,
                    eventCode,
                    details: deleteMatchTeamsError.message,
                })
            }
        }

        if (matchTeams.length > 0) {
            const { error: insertMatchTeamsError } = await supabase
                .from("match_teams")
                .insert(matchTeams)

            if (insertMatchTeamsError) {
                throw new FrcApiError("Failed to insert match teams", {
                    stage: "db",
                    entity: "teams",
                    season: seasonYear,
                    eventCode,
                    details: insertMatchTeamsError.message,
                })
            }
        }

        return {
            success: true,
            eventId,
            teams: allTeams.length,
            matches: allMatches.length,
        }
    } catch (error) {
        if (error instanceof FrcApiError) {
            throw error
        }

        throw new FrcApiError("Unexpected sync failure", {
            stage: "db",
            entity: "events",
            season: seasonYear,
            eventCode,
            details: error instanceof Error ? error.message : error,
        })
    }
}