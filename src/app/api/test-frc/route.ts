import { NextResponse } from "next/server"
import { syncFrcEvent } from "@/lib/frc/service"

export async function GET() {
    try {
        const result = await syncFrcEvent({
            seasonYear: 2025,
            eventCode: "njfla", // pick a real event
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed", details: error },
            { status: 500 },
        )
    }
}
