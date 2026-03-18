import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EventsExplorer } from "@/components/events/events-explorer"

type EventRow = {
    id: number
    tba_event_key: string
    event_code: string | null
    event_name: string
    season_year: number
    city: string | null
    state_prov: string | null
    country: string | null
    start_date: string | null
    end_date: string | null
    event_type: string | null
}

function normalizeText(value: string | null) {
    return (value ?? "").trim().toLowerCase()
}

function buildEventGroupKey(event: EventRow) {
    return [
        event.season_year,
        normalizeText(event.event_name),
        normalizeText(event.city),
        event.start_date ?? "",
    ].join("|")
}

function isTbaNativeKey(key: string) {
    return !key.startsWith("frc_")
}

function choosePreferredEvent(events: EventRow[]) {
    const preferred = events.find((event) => isTbaNativeKey(event.tba_event_key))
    return preferred ?? events[0]
}

export default async function EventsPage() {
    const supabase = await createClient()

    const { data: events, error } = await supabase
        .from("events")
        .select(`
            id,
            tba_event_key,
            event_code,
            event_name,
            season_year,
            city,
            state_prov,
            country,
            start_date,
            end_date,
            event_type
        `)
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

    const grouped = new Map<string, EventRow[]>()

    for (const event of (events ?? []) as EventRow[]) {
        const key = buildEventGroupKey(event)
        const bucket = grouped.get(key) ?? []
        bucket.push(event)
        grouped.set(key, bucket)
    }

    const dedupedEvents = Array.from(grouped.values())
        .map(choosePreferredEvent)
        .sort((a, b) => {
            if (a.season_year !== b.season_year) {
                return b.season_year - a.season_year
            }

            const aDate = a.start_date ?? ""
            const bDate = b.start_date ?? ""

            if (aDate !== bDate) {
                return aDate < bDate ? 1 : -1
            }

            return a.event_name.localeCompare(b.event_name)
        })

    return < EventsExplorer events={dedupedEvents} />
}