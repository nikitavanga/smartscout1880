export class TbaSyncError extends Error {
  public readonly stage: "fetch" | "normalize" | "db"
  public readonly entity: "event" | "teams" | "matches" | "match_teams" | "rankings"
  public readonly eventKey?: string
  public readonly status?: number
  public readonly details?: unknown

  constructor(
    message: string,
    context: {
        stage: "fetch" | "normalize" | "db"
        entity: "event" | "teams" | "matches" | "match_teams" | "rankings"
        eventKey?: string
        status?: number
        details?: unknown
    },
  ) {
    super(message)
    this.name = "TbaSyncError"
    this.stage = context.stage
    this.entity = context.entity
    this.eventKey = context.eventKey
    this.status = context.status
    this.details = context.details
  }
}

export function toErrorResponse(error: unknown) {
    if (error instanceof TbaSyncError) {
        return {
            error: {
                message: error.message,
                stage: error.stage,
                entity: error.entity,
                eventKey: error.eventKey,
                status: error.status,
                details: error.details ?? null,
            },
        }
    }

    if (error instanceof Error) {
        return {
            error: {
                message: error.message,
                stage: "db",
                entity: "event",
                details: null,
            },
        }
    }

    return {
        error: {
            message: "Unknown error",
            stage: "db",
            entity: "event",
            details: null,
        },
    }
}