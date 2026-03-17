"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Search, CalendarDays, MapPin, Trophy, Filter } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type EventRow = {
  tba_event_key: string
  event_name: string
  season_year: number
  city: string | null
  state_prov: string | null
  country: string | null
  start_date: string | null
  end_date: string | null
  event_type: string | null
}

type EventsExplorerProps = {
  events: EventRow[]
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "Dates unavailable"
  if (startDate && endDate) return `${startDate} → ${endDate}`
  return startDate ?? endDate ?? "Dates unavailable"
}

function formatLocation(event: EventRow) {
  const parts = [event.city, event.state_prov, event.country].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "Location unavailable"
}

export function EventsExplorer({ events }: EventsExplorerProps) {
  const [search, setSearch] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")

  const years = useMemo(() => {
    return Array.from(new Set(events.map((event) => String(event.season_year)))).sort(
      (a, b) => Number(b) - Number(a),
    )
  }, [events])

  const filteredEvents = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return events.filter((event) => {
      const matchesYear =
        selectedYear === "all" || String(event.season_year) === selectedYear

      const haystack = [
        event.event_name,
        event.tba_event_key,
        event.city,
        event.state_prov,
        event.country,
        event.event_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        searchValue.length === 0 || haystack.includes(searchValue)

      return matchesYear && matchesSearch
    })
  }, [events, search, selectedYear])

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
            TBA-backed Event Explorer
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Synced Events
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Explore any synced event, including events where Team 1880 did not
              compete. These dashboards work even without scouting-form data by using
              TBA as the baseline source.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Synced Events</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{events.length}</CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Filtered Results</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {filteredEvents.length}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Seasons Available</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{years.length}</CardContent>
          </Card>
        </div>

        <Card className="border-slate-800 bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-4 w-4" />
              Search and Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by event name, event key, city, state, country..."
                className="border-slate-700 bg-slate-950 pl-10 text-white placeholder:text-slate-500"
              />
            </div>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="border-slate-700 bg-slate-950 text-white">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {filteredEvents.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900 text-white">
            <CardContent className="py-10 text-center text-slate-400">
              No events matched your search.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <Link key={event.tba_event_key} href={`/events/${event.tba_event_key}`}>
                <Card className="group border-slate-800 bg-slate-900 text-white transition hover:border-blue-500/60 hover:bg-slate-900/90">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl transition group-hover:text-blue-300">
                          {event.event_name}
                        </CardTitle>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
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
                            {formatLocation(event)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-mono text-slate-400">
                        {event.tba_event_key}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="text-slate-400">
                      Type: {event.event_type ?? "Unknown type"}
                    </div>

                    <div className="rounded-lg bg-slate-950 px-3 py-2 text-slate-300 transition group-hover:bg-blue-950/40 group-hover:text-blue-200">
                      Open dashboard →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

