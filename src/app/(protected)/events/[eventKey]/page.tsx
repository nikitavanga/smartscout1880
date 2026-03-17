import { notFound } from "next/navigation"
import Link from "next/link"
import { CalendarDays, MapPin, Trophy, Swords } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type EventPageProps = {
    params: Promise<{ eventKey: string }>
}

type TeamRow = {
    id: number
    team_number: number
    robot_name: string | null
}

type MatchRow = {
    id: number
    tba_match_key: string
    match_stage: string
    set_number: number
    match_number: number
    scheduled_time: string | null
    predicted_time: string | null
    actual_time: string | null
    red_score: number | null
    blue_score: number | null
}

type MatchTeamRow = {
    match_id: number
    team_id: number
    alliance_color: "red" | "blue"
    station_number: number
}

type RankingRow = {
    team_id: number
    rank_position: number
    wins: number | null
    losses: number | null
    ties: number | null
    source_captured_at: string
}

const TEAM_NUMBER = Number(process.env.TEAM_NUMBER ?? "1880")

function formatMatchTime(match: MatchRow) {
    const value = match.actual_time ?? match.predicted_time ?? match.scheduled_time
    if (!value) return "Time unavailable"
    return new Date(value).toLocaleString()
}

function formatDateRange(startDate: string | null, endDate: string | null) {
    if (!startDate && !endDate) return "Dates unavailable"
    if (startDate && endDate) return `${startDate} → ${endDate}`
    return startDate ?? endDate ?? "Dates unavailable"
}

function formatLocation(city: string | null, stateProv: string | null) {
    const parts = [city, stateProv].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : "Location unavailable"
}

function formatMatchLabel(match: MatchRow) {
    const stage = match.match_stage.toUpperCase()
    if (match.match_stage === "qf" || match.match_stage === "sf" || match.match_stage === "f") {
        return `${stage} ${match.set_number}-${match.match_number}`
    }
    return `${stage} ${match.match_number}`
}

export default async function EventDetailPage({ params }: EventPageProps) {
    const { eventKey } = await params
    const supabase = await createClient()

    const { data: event } = await supabase
        .from("events")
        .select("id, tba_event_key, event_name, season_year, city, state_prov, start_date, end_date, event_type",)
        .eq("tba_event_key", eventKey)
        .single()

    if (!event) {
        notFound()
    }

    const eventId = event.id

    const [{ data: matches }, { data: latestRankingsRaw }, { data: eventTeams }] = await Promise.all([
        supabase
            .from("matches")
            .select(
            "id, tba_match_key, match_stage, set_number, match_number, scheduled_time, predicted_time, actual_time, red_score, blue_score",
            )
            .eq("event_id", eventId)
            .order("match_stage", { ascending: true })
            .order("set_number", { ascending: true })
            .order("match_number", { ascending: true }),

        supabase
            .from("rankings_snapshots")
            .select("team_id, rank_position, wins, losses, ties, source_captured_at")
            .eq("event_id", eventId)
            .order("source_captured_at", { ascending: false }),

        supabase
            .from("event_teams")
            .select("team_id")
            .eq("event_id", eventId),
    ])

    const matchIds = (matches ?? []).map((match) => match.id)
    const eventTeamIds = (eventTeams ?? []).map((row) => row.team_id)

    const [{ data: matchTeams }, { data: teams }] = await Promise.all([
        matchIds.length > 0 
            ? supabase
                .from("match_teams")
                .select("match_id, team_id, alliance_color, station_number")
                .in("match_id", matchIds)
            : Promise.resolve({ data: [] as MatchTeamRow[] }),

        eventTeamIds.length > 0
            ? supabase
                .from("teams")
                .select("id, team_number, robot_name")
                .in("id", eventTeamIds)
            : Promise.resolve({ data: [] as TeamRow[] }),
    ])

    const teamById = new Map<number, TeamRow>()
    ;(teams ?? []).forEach((team) => {
        teamById.set(team.id, team)
    })

    const matchTeamsByMatchId = new Map<number, MatchTeamRow[]>()
    ;(matchTeams ?? []).forEach((row) => {
        const existing = matchTeamsByMatchId.get(row.match_id) ?? []
        existing.push(row)
        matchTeamsByMatchId.set(row.match_id, existing)
    })

    const latestRankingsByTeamId = new Map<number, RankingRow>()
    ;(latestRankingsRaw ?? []).forEach((row) => {
        if (!latestRankingsByTeamId.has(row.team_id)) {
            latestRankingsByTeamId.set(row.team_id, row)
        }
    })

    const rankedTeams = [...latestRankingsByTeamId.entries()].sort(
        (a, b) => a[1].rank_position - b[1].rank_position,
    )

    const team1880 = (teams ?? []).find((team) => team.team_number === TEAM_NUMBER)

    const matchesWith1880 = (matches ?? []).filter((match) => {
        const rows = matchTeamsByMatchId.get(match.id) ?? []
        return rows.some((row) => teamById.get(row.team_id)?.team_number === TEAM_NUMBER)
    })

    const team1880Ranking = team1880
        ? latestRankingsByTeamId.get(team1880.id) ?? null
        : null

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
                    TBA-backed Event Dashboard
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {event.event_name}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="inline-flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                {event.season_year}
                            </span>

                            <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                {formatDateRange(event.start_date, event.end_date)}
                            </span>

                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {formatLocation(event.city, event.state_prov)}
                            </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-500">
                            Event key: <span className="font-mono">{event.tba_event_key}</span>
                            {event.event_type ? ` • ${event.event_type}` : ""}
                        </p>
                    </div>
                </div>

                <Link
                    href="/events"
                    className="inline-flex w-fit items-center rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                    Back to events
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">Teams</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {teams?.length ?? 0}
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">Matches</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {matches?.length ?? 0}
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">1880 Matches</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {matchesWith1880.length}
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">1880 Rank</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {team1880Ranking ? `#${team1880Ranking.rank_position}` : "N/A"}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle>Latest Rankings Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        { rankedTeams.length === 0 ? (
                            <p className="text-sm text-slate-400">
                                No ranking data available yet for this event.
                            </p>
                        ) : (
                            rankedTeams.slice(0, 20).map(([teamId, ranking]) => {
                                const team = teamById.get(teamId)
                                const is1880 = team?.team_number === TEAM_NUMBER

                                return (
                                    <div
                                        key={teamId}
                                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                                            is1880
                                                ? "border-blue-700 bg-blue-950/30"
                                                : "border-slate-800"
                                        }`}>
                                        <span>
                                            #{ranking.rank_position} • Team {team?.team_number ?? "?"}
                                            {team?.robot_name ? ` — ${team.robot_name}` : ""}
                                        </span>

                                        <span className="text-slate-400">
                                            {ranking.wins ?? 0}-{ranking.losses ?? 0}-{ranking.ties ?? 0}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle>1880 Matches at This Event</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {matchesWith1880.length === 0 ? (
                            <p className="text-sm text-slate-400">
                                Team 1880 has no synced matches at this event. This dashboard still works because it is powered by TBA data.
                            </p>
                        ) : (
                            matchesWith1880.map((match) => (
                                <div
                                    key={match.id}
                                    className="rounded-lg border border-slate-800 px-3 py-3 text-sm">
                                    <div className="font-medium">{formatMatchLabel(match as MatchRow)}</div>
                                    <div className="mt-1 text-slate-400">
                                        {formatMatchTime(match as MatchRow)}</div>
                                    <div className="mt-2 text-xs text-slate-500">
                                        Score: {match.red_score ?? "-"} : {match.blue_score ?? "-"}</div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Swords className="h-4 w-4" />
                            All Matches
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(matches ?? []).length === 0 ? (
                            <p className="text-sm text-slate-400">
                                No match data has been synced for this event yet.
                            </p>
                        ) : (
                            (matches ?? []).map((match) => {
                                const rows = (matchTeamsByMatchId.get(match.id) ?? []).sort(
                                    (a, b) => a.station_number - b.station_number,
                                )

                                const redTeams = rows
                                    .filter((row) => row.alliance_color === "red")
                                    .map((row) => {
                                        const team = teamById.get(row.team_id)
                                        return team ? `Team ${team.team_number}` : "?"
                                    })

                                const blueTeams = rows
                                    .filter((row) => row.alliance_color === "blue")
                                    .map((row) => {
                                        const team = teamById.get(row.team_id)
                                        return team ? `Team ${team.team_number}` : "?"
                                    })

                                const contains1880 = rows.some(
                                    (row) => teamById.get(row.team_id)?.team_number === TEAM_NUMBER,)

                                return (
                                    <div
                                        key={match.id}
                                        className={`rounded-xl border p-4 ${
                                        contains1880
                                            ? "border-blue-700 bg-blue-950/10"
                                            : "border-slate-800"
                                        }`}>
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="font-semibold">
                                                    {formatMatchLabel(match as MatchRow)}</div>
                                                <div className="text-sm text-slate-400">
                                                    {formatMatchTime(match as MatchRow)}</div>
                                            </div>

                                            <div className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-300">
                                                {match.red_score ?? "-"} : {match.blue_score ?? "-"}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            <div className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-3 text-sm">
                                                <div className="font-medium text-red-200">Red Alliance</div>
                                                <div className="mt-2 text-slate-200">
                                                    {redTeams.length > 0 ? redTeams.join(", ") : "—"}
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-blue-900 bg-blue-950/30 px-3 py-3 text-sm">
                                                <div className="font-medium text-blue-200">Blue Alliance</div>
                                                <div className="mt-2 text-slate-200">
                                                    {blueTeams.length > 0 ? blueTeams.join(", ") : "—"}
                                                </div>
                                            </div>
                                        </div>

                                        {contains1880 ? (
                                            <div className="mt-3 inline-flex rounded-full border border-blue-700 bg-blue-950/30 px-3 py-1 text-xs text-blue-200">
                                                Team 1880 is in this match
                                            </div>
                                        ) : null}
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle>Why this page matters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-400">
                        <p>• Works for events where 1880 competed</p>
                        <p>• Works for events where 1880 did not compete</p>
                        <p>• Works for historical events</p>
                        <p>• Works even with zero scouting-form data by relying on TBA</p>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}