import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
    params: Promise<{ eventKey: string }>
}

function getRelatedTeamNumber(team: unknown): number | null {
    if (!team) return null

    if (Array.isArray(team)) {
        const first = team[0] as { team_number?: number | null } | undefined
        return first?.team_number ?? null
    }

    const single = team as { team_number?: number | null }
    return single.team_number ?? null
}

export default async function EventDetailPage({ params }: Props) {
    const { eventKey } = await params
    const supabase = await createClient()

    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("tba_event_key", eventKey)
        .single()

    if (eventError || !event) {
        notFound()
    }

    const eventId = event.id

    const { data: rankings } = await supabase
        .from("rankings_snapshots")
        .select(`
            rank_position,
            matches_played,
            wins,
            losses,
            ties,
            team:teams (team_number, robot_name)
        `)
        .eq("event_id", eventId)
        .order("rank_position", { ascending: true })

    const { data: matches } = await supabase
        .from("matches")
        .select(`
            id,
            match_stage,
            match_number,
            red_score,
            blue_score,
            match_teams (
                alliance_color,
                station_number,
                team:teams(team_number)
            )
        `)
        .eq("event_id", eventId)
        .order("match_stage", { ascending: true })
        .order("match_number", { ascending: true })
        .limit(50)

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-6xl space-y-8">
                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-white">{event.event_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm text-slate-400">
                        <div className="font-medium text-slate-300">Season: {event.season_year}</div>
                        <div className="font-medium text-slate-300">
                            Location: {[event.city, event.state_prov, event.country]
                                .filter(Boolean)
                                .join(", ") || "Unknown"}
                        </div>
                        <div className="font-medium text-slate-300">
                            Dates: {event.start_date ?? "?"} → {event.end_date ?? "?"}
                        </div>
                        <div className="text-xs text-slate-500">
                            Key: {event.tba_event_key}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle>Rankings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!rankings || rankings.length === 0 ? (
                            <div className="text-slate-400">
                                Rankings not available yet (event may not have started).
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {rankings.slice(0, 20).map((r, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between border-b border-slate-800 pb-2 text-sm">
                                        <div className="text-slate-200">
                                            #{r.rank_position} — Team {getRelatedTeamNumber(r.team) ?? "—"}
                                        </div>
                                        <div className="font-medium text-slate-200">
                                            {r.wins}-{r.losses}-{r.ties}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-slate-400">Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!matches || matches.length === 0 ? (
                            <div className="text-slate-400">
                                No matches scheduled yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {matches.map((m) => (
                                    <div
                                        key={m.id}
                                        className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-sm"
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-medium text-slate-300">
                                                {m.match_stage.toUpperCase()} #{m.match_number}
                                            </span>
                                            <span className="font-semibold text-slate-400">
                                                {m.red_score ?? "-"} : {m.blue_score ?? "-"}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex justify-between text-xs text-slate-400">
                                            <div className="text-red-400">
                                                🔴 {" "}
                                                {m.match_teams
                                                    ?.filter((t) => t.alliance_color === "red")
                                                    .map((t) => getRelatedTeamNumber(t.team))
                                                    .filter((teamNumber): teamNumber is number => teamNumber !== null)
                                                    .join(", ")
                                                }
                                            </div>
                                            <div className="text-blue-400">
                                                🔵 {" "}
                                                {m.match_teams
                                                    ?.filter((t) => t.alliance_color === "blue")
                                                    .map((t) => getRelatedTeamNumber(t.team))
                                                    .filter((teamNumber): teamNumber is number => teamNumber !== null)
                                                    .join(", ")
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}