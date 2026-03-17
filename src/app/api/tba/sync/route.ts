import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncEventFromTba } from "@/lib/tba/service"
import { toErrorResponse } from "@/lib/tba/errors"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                {
                    error: {
                        message: "Unauthorized",
                        stage: "fetch",
                        entity: "event",
                    },
                },
                { status: 401 },
            )
        }

        let body: unknown

        try {
            body = await request.json()
        } catch {
            return NextResponse.json(
                {
                    error: {
                        message: "Invalid JSON request body",
                        stage: "fetch",
                        entity: "event",
                    },
                },
                { status: 400 },
            )
        }

        const eventKey =
            typeof body === "object" && 
            body !== null && 
            "eventKey" in body &&
            typeof body.eventKey === "string"
                ? body.eventKey.trim()
                : ""

        if (!eventKey) {
            return NextResponse.json(
                {
                    error: {
                        message: "Missing eventKey",
                        stage: "fetch",
                        entity: "event",
                    },
                },
                { status: 400 },
            )
        }

        const result = await syncEventFromTba(eventKey)

        return NextResponse.json({ ok: true, result })
    } catch (error) {
        const payload = toErrorResponse(error)
        return NextResponse.json(payload, { status: 500 })
    }
}
