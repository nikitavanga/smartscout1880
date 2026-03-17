import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EventsExplorer } from "@/components/events/events-explorer"

export default async function EventsPage() {
    const supabase = await createClient()

    const { data: events, error } = await supabase
        .from("events")
        .select("tba_event_key, event_name, season_year, city, state_prov, country, start_date, end_date, event_type",)
        .order("season_year", { ascending: false })
        .order("start_date", { ascending: false })

    if (error) {
        return (
            <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-6xl">
                    <Card className="border-red-900 bg-red-950/40 text-white">
                        <CardHeader>
                            <CardTitle>Failed to load events</CardTitle>
                        </CardHeader>
                        <CardContent>{error.message}</CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    return <EventsExplorer events={events ?? []} />
}

