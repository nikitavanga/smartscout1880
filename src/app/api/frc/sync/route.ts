import { NextRequest, NextResponse } from "next/server"
import { syncFrcEvent } from "@/lib/frc/service"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { seasonYear, eventCode } = body

        if (!seasonYear || !eventCode) {
            return NextResponse.json(
                { error: "Missing seasonYear or eventCode" },
                { status: 400 },
            )
        }

        const result = await syncFrcEvent({
            seasonYear,
            eventCode,
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("FRC sync failed:", error)

        return NextResponse.json(
            {
                error: "Sync failed",
                details: error instanceof Error ? error.message : error,
            },
            { status: 500 },
        )
    }
}

