import { createAdminClient } from "@/lib/supabase/admin"
import { TbaSyncError } from "./errors"
import { tbaFetchJson } from "./client"
import {
    buildMatchTeams,
    buildRankingRows,
    normalizeEvent,
    normalizeMatch,
    normalizeTeam,
} from "./normalizers"
import type {
    TbaEvent,
    TbaMatch,
    TbaRankingsResponse,
    TbaTeam,
} from "./types"

type SyncResult = {
    eventKey: string
    eventId: number
    teamsSynced: number
    matchesSynced: number
    rankingsSynced: number
}

export async function syncEventFromTba(
    eventKey: string,
    requestedByUserId?: string,
): Promise<SyncResult> {
    const supabase = createAdminClient()

    let refreshJobId: number | null = null

    try {
        const { data: refreshJob, error: refreshJobError } = await supabase
            .from("refresh_jobs")
            .insert({
                job_type: "tba_sync",
                job_status: "running",
                requested_by_user_id: requestedByUserId ?? null,
                job_payload_json: { eventKey },
            })
            .select("id")
            .single()

        if (refreshJobError) {
            throw new TbaSyncError("Failed to create refresh job", {
                stage: "db",
                entity: "event",
                eventKey,
                details: {
                    message: refreshJobError.message,
                    code: refreshJobError.code,
                    details: refreshJobError.details,
                    hint: refreshJobError.hint,
                },
            })
        }

        refreshJobId = refreshJob.id

        // Event
        const eventResponse = await tbaFetchJson<TbaEvent>(`/event/${eventKey}`, {
            entity: "event",
            eventKey,
        })

        if (!eventResponse.data) {
            throw new TbaSyncError("No event data returned from TBA", {
                stage: "fetch",
                entity: "event",
                eventKey,
            })
        }

        const eventRow = normalizeEvent(eventResponse.data)

        const { data: upsertedEvent, error: eventError } = await supabase
            .from("events")
            .upsert(eventRow, { onConflict: "tba_event_key" })
            .select("id, tba_event_key")
            .single()

        if (eventError || !upsertedEvent) {
            throw new TbaSyncError("Failed to upsert event", {
                stage: "db",
                entity: "event",
                eventKey,
                details: eventError?.message,
            })
        }

        const eventId = upsertedEvent.id

        //  Teams
        const teamsResponse = await tbaFetchJson<TbaTeam[]>(
            `/event/${eventKey}/teams/simple`,
            {
                entity: "teams",
                eventKey,
            },
        )

        const teams = teamsResponse.data ?? []
        const teamRows = teams.map(normalizeTeam)

        if (teamRows.length > 0) {
            const { error: teamsError } = await supabase
                .from("teams")
                .upsert(teamRows, { onConflict: "team_number" })

            if (teamsError) {
                throw new TbaSyncError("Failed to upsert teams", {
                    stage: "db",
                    entity: "teams",
                    eventKey,
                    details: teamsError.message,
                })
            }
        }

        const teamNumbers = teams.map((team) => team.team_number)

        const { data: storedTeams, error: storedTeamsError } = await supabase
            .from("teams")
            .select("id, team_number")
            .in("team_number", teamNumbers.length > 0 ? teamNumbers : [-1])

        if (storedTeamsError || !storedTeams) {
            throw new TbaSyncError("Failed to read stored teams", {
                stage: "db",
                entity: "teams",
                eventKey,
                details: storedTeamsError?.message,
            })
        }

        const teamIdByNumber = new Map<number, number>(
            storedTeams.map((team) => [team.team_number, team.id]),
        )

        const teamIdByTbaKey = new Map<string, number>()
        teams.forEach((team) => {
            const teamId = teamIdByNumber.get(team.team_number)
            if (teamId) {
                teamIdByTbaKey.set(team.key, teamId)
            }
        })

        const eventTeamRows = teams
            .map((team) => {
                const teamId = teamIdByNumber.get(team.team_number)
                if (!teamId) return null

                return {
                    event_id: eventId,
                    team_id: teamId,
                }
            })
            .filter(
                (
                    row,
                ): row is {
                    event_id: number
                    team_id: number
                } => row !== null,
            )

        if (eventTeamRows.length > 0) {
            const { error: eventTeamsError } = await supabase
                .from("event_teams")
                .upsert(eventTeamRows, { onConflict: "event_id,team_id" })

            if (eventTeamsError) {
                throw new TbaSyncError("Failed to upsert event teams", {
                    stage: "db",
                    entity: "teams",
                    eventKey,
                    details: eventTeamsError.message,
                })
            }
        }

        // Matches
        const matchesResponse = await tbaFetchJson<TbaMatch[]>(
            `/event/${eventKey}/matches`,
            {
                entity: "matches",
                eventKey,
            },
        )

        const matches = matchesResponse.data ?? []
        const matchRows = matches.map((match) => normalizeMatch(eventId, match))

        if (matchRows.length > 0) {
        const { error: matchesError } = await supabase
            .from("matches")
            .upsert(matchRows, { onConflict: "tba_match_key" })

        if (matchesError) {
            throw new TbaSyncError("Failed to upsert matches", {
            stage: "db",
            entity: "matches",
            eventKey,
            details: matchesError.message,
            })
        }
        }

        const { data: storedMatches, error: storedMatchesError } = await supabase
            .from("matches")
            .select("id, tba_match_key")
            .eq("event_id", eventId)

        if (storedMatchesError || !storedMatches) {
            throw new TbaSyncError("Failed to read stored matches", {
                stage: "db",
                entity: "matches",
                eventKey,
                details: storedMatchesError?.message,
            })
        }

        const matchIdByKey = new Map<string, number>(
            storedMatches.map((match) => [match.tba_match_key, match.id]),
        )

        const matchIds = storedMatches.map((match) => match.id)

        if (matchIds.length > 0) {
            const { error: deleteMatchTeamsError } = await supabase
                .from("match_teams")
                .delete()
                .in("match_id", matchIds)

            if (deleteMatchTeamsError) {
                throw new TbaSyncError("Failed to clear old match teams", {
                    stage: "db",
                    entity: "match_teams",
                    eventKey,
                    details: deleteMatchTeamsError.message,
                })
            }
        }

        const matchTeamRows = matches.flatMap((match) => {
            const matchId = matchIdByKey.get(match.key)
            if (!matchId) return []
            return buildMatchTeams(matchId, teamIdByTbaKey, match)
        })

        if (matchTeamRows.length > 0) {
            const { error: insertMatchTeamsError } = await supabase
                .from("match_teams")
                .insert(matchTeamRows)

            if (insertMatchTeamsError) {
                throw new TbaSyncError("Failed to insert match teams", {
                    stage: "db",
                    entity: "match_teams",
                    eventKey,
                    details: insertMatchTeamsError.message,
                })
            }
        }

        // Rankings
        const rankingsResponse = await tbaFetchJson<TbaRankingsResponse>(
            `/event/${eventKey}/rankings`,
            {
                entity: "rankings",
                eventKey,
                optionalStatuses: [404],
            },
        )

        const rankingRows = buildRankingRows(
            eventId,
            teamIdByTbaKey,
            rankingsResponse.data ?? {},
        )

        if (rankingRows.length > 0) {
            const { error: rankingsError } = await supabase
                .from("rankings_snapshots")
                .insert(rankingRows)

            if (rankingsError) {
                throw new TbaSyncError("Failed to insert rankings snapshots", {
                    stage: "db",
                    entity: "rankings",
                    eventKey,
                    details: rankingsError.message,
                })
            }
        }

        const result: SyncResult = {
            eventKey,
            eventId,
            teamsSynced: teamRows.length,
            matchesSynced: matchRows.length,
            rankingsSynced: rankingRows.length,
        }

        if (refreshJobId) {
            await supabase
                .from("refresh_jobs")
                .update({
                    job_status: "completed",
                    event_id: eventId,
                    job_payload_json: result,
                    completed_at: new Date().toISOString(),
                })
                .eq("id", refreshJobId)
        }

        return result
    } catch (error) {
        if (refreshJobId) {
            await supabase
                .from("refresh_jobs")
                .update({
                    job_status: "failed",
                    error_message: error instanceof Error ? error.message : "Unknown error",
                    completed_at: new Date().toISOString(),
                })
                .eq("id", refreshJobId)
        }

        throw error
    }
}