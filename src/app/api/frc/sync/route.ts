import { NextRequest, NextResponse } from "next/server"
import { syncFrcEvent } from "@/lib/frc/service"
import { FrcApiError, toFrcErrorResponse } from "@/lib/frc/errors"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const seasonYear = Number(body.seasonYear)
        const eventCode = String(body.eventCode ?? "").trim().toUpperCase()

        if (!Number.isInteger(seasonYear) || seasonYear < 2015 || !eventCode) {
            return NextResponse.json(
                {
                    error: {
                        message: "Invalid seasonYear or eventCode",
                        stage: "config",
                        entity: "events",
                        season: Number.isFinite(seasonYear) ? seasonYear : null,
                        eventCode: eventCode || null,
                        status: 400,
                        details: null,
                    },
                },
                { status: 400 },
            )
        }

        const result = await syncFrcEvent({
            seasonYear,
            eventCode,
        })

        return NextResponse.json({ result })
    } catch (error) {
        console.error("FRC sync failed:", error)

        const payload = toFrcErrorResponse(error)
        const status =
            error instanceof FrcApiError && error.status
                ? error.status
                : 500

        return NextResponse.json(payload, { status })
    }
}