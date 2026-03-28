export class FrcApiError extends Error {
    public readonly stage: "config" | "fetch" | "db" | "normalize" | "provider"
    public readonly entity:
        | "events"
        | "teams"
        | "rankings"
        | "schedule"
        | "matches"
        | "scores"
        | "provider"
    public readonly season?: number
    public readonly eventCode?: string
    public readonly status?: number
    public readonly details?: unknown

    constructor(
        message: string,
        context: {
            stage: "config" | "fetch" | "db" | "normalize" | "provider"
            entity:
                | "events"
                | "teams"
                | "rankings"
                | "schedule"
                | "matches"
                | "scores"
                | "provider"
            season?: number
            eventCode?: string
            status?: number
            details?: unknown
        },
    ) {
        super(message)
        this.name = "FrcApiError"
        this.stage = context.stage
        this.entity = context.entity
        this.season = context.season
        this.eventCode = context.eventCode
        this.status = context.status
        this.details = context.details
    }
}

export function toFrcErrorResponse(error: unknown) {
    if (error instanceof FrcApiError) {
        return {
            error: {
                message: error.message,
                stage: error.stage,
                entity: error.entity,
                season: error.season ?? null,
                eventCode: error.eventCode ?? null,
                status: error.status ?? null,
                details: error.details ?? null,
            },
        }
    }

    if (error instanceof Error) {
        return {
            error: {
                message: error.message,
                stage: "fetch",
                entity: "provider",
                season: null,
                eventCode: null,
                status: null,
                details: null,
            },
        }
    }

    return {
        error: {
            message: "Unknown FIRST API error",
            stage: "fetch",
            entity: "provider",
            season: null,
            eventCode: null,
            status: null,
            details: null,
        },
    }
}