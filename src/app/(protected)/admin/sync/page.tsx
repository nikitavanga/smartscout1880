"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSyncPage() {
    const [eventKey, setEventKey] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSync = async () => {
        try {
            setLoading(true)
            setError(null)
            setResult(null)

            const response = await fetch("/api/tba/sync", {
                method: "POST",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify({ eventKey }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(JSON.stringify(data.error ?? { message: "Sync failed" }, null, 2))
            }

            setResult(JSON.stringify(data.result, null, 2))
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
                        <CardTitle>TBA Event Sync</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            value={eventKey}
                            onChange={(e) => setEventKey(e.target.value)}
                            placeholder="Enter event key, e.g. 2026abcde"/>

                        <Button onClick={handleSync} disabled={loading || !eventKey.trim()}>
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
