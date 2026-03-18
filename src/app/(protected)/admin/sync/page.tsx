"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SyncProvider = "tba" | "frc"

export default function AdminSyncPage() {
    const [provider, setProvider] = useState<SyncProvider>("tba")
    const [eventKey, setEventKey] = useState("")
    const [seasonYear, setSeasonYear] = useState("")
    const [eventCode, setEventCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const canSubmit = useMemo(() => {
        if (provider === "tba") {
            return eventKey.trim().length > 0
        }

        return seasonYear.trim().length > 0 && eventCode.trim().length > 0
    }, [provider, eventKey, seasonYear, eventCode])

    const handleSync = async () => {
        try {
            setLoading(true)
            setError(null)
            setResult(null)

            const endpoint = provider === "tba" ? "/api/tba/sync" : "/api/frc/sync"

            const body =
                provider === "tba"
                    ? {
                        eventKey: eventKey.trim(),
                        }
                    : {
                        seasonYear: Number(seasonYear.trim()),
                        eventCode: eventCode.trim().toUpperCase(),
                    }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    JSON.stringify(data.error ?? { message: "Sync failed" }, null, 2),
                )
            }

            setResult(JSON.stringify(data.result ?? data, null, 2))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-3xl space-y-6">
                <Card className="border-slate-800 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle>Event Sync</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-300">Provider</label>
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value as SyncProvider)}
                                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                                <option value="tba">The Blue Alliance (TBA)</option>
                                <option value="frc">FIRST API</option>
                            </select>
                        </div>

                        {provider === "tba" ? (
                            <div className="space-y-2">
                                <label className="text-sm text-slate-300">TBA event key</label>
                                <Input
                                    value={eventKey}
                                    onChange={(e) => setEventKey(e.target.value)}
                                    placeholder="Enter event key, e.g. 2025nytr"/>
                                <p className="text-xs text-slate-400">
                                    Example: <span className="font-mono">2025nytr</span>
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300">Season year</label>
                                    <Input
                                        value={seasonYear}
                                        onChange={(e) => setSeasonYear(e.target.value)}
                                        placeholder="2025"
                                        inputMode="numeric"/>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300">FIRST event code</label>
                                    <Input
                                        value={eventCode}
                                        onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                                        placeholder="NYTR"/>
                                </div>
                            </div>
                        )}

                        <Button onClick={handleSync} disabled={loading || !canSubmit}>
                            {loading ? "Syncing..." : "Sync Event"}
                        </Button>

                        {error ? (
                            <pre className="rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
                                {error}
                            </pre>
                        ) : null}

                        {result ? (
                            <pre className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200">
                                {result}
                            </pre>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}