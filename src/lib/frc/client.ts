import { FrcApiError } from "./errors"

type FrcEntity =
    | "events"
    | "teams"
    | "rankings"
    | "schedule"
    | "matches"
    | "scores"
    | "provider"

type FrcFetchOptions = {
    entity: FrcEntity
    season: number
    eventCode?: string
    query?: Record<string, string | number | boolean | undefined | null>
    optionalStatuses?: number[]
    ifModifiedSince?: string
}

type FrcFetchResult<T> = {
    data: T | null
    status: number
    lastModified: string | null
}

function getRequiredEnv(name: string): string {
    const value = process.env[name]
    if (!value || !value.trim()) {
        throw new FrcApiError(`Missing required env var: ${name}`, {
            stage: "config",
            entity: "provider",
        })
    }
    return value.trim()
}

function buildBasicAuthHeader(username: string, token: string): string {
    const raw = `${username}:${token}`
    return `Basic ${Buffer.from(raw, "utf-8").toString("base64")}`
}

function buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined | null>,
): string {
    const baseUrl = getRequiredEnv("FRC_API_BASE_URL").replace(/\/$/, "")
    const url = new URL(`${baseUrl}${path}`)

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null || value === "") continue
            url.searchParams.set(key, String(value))
        }
    }

    return url.toString()
}

export async function frcFetchJson<T>(
    path: string,
    options: FrcFetchOptions,
): Promise<FrcFetchResult<T>> {
    const username = getRequiredEnv("FRC_API_USERNAME")
    const token = getRequiredEnv("FRC_API_AUTH_TOKEN")

    const url = buildUrl(path, options.query)

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: buildBasicAuthHeader(username, token),
            Accept: "application/json",
            ...(options.ifModifiedSince
                ? { "If-Modified-Since": options.ifModifiedSince }
                : {}),
        },
        cache: "no-store",
    })

    const lastModified = response.headers.get("last-modified")

    if (response.status === 304) {
        return {
            data: null,
            status: 304,
            lastModified,
        }
    }

    const text = await response.text()

    if (!response.ok) {
        const isOptional = options.optionalStatuses?.includes(response.status) ?? false

        if (isOptional) {
            return {
                data: null,
                status: response.status,
                lastModified,
            }
        }

        throw new FrcApiError("FIRST API request failed", {
            stage: "fetch",
            entity: options.entity,
            season: options.season,
            eventCode: options.eventCode,
            status: response.status,
            details: text || null,
        })
    }

    try {
        return {
            data: (JSON.parse(text) as T) ?? null,
            status: response.status,
            lastModified,
        }
    } catch {
        throw new FrcApiError("Failed to parse FIRST API response JSON", {
            stage: "fetch",
            entity: options.entity,
            season: options.season,
            eventCode: options.eventCode,
            status: response.status,
            details: text || null,
        })
    }
}

export async function fetchFrcEventListings(season: number, eventCode?: string) {
    return frcFetchJson<import("./types").FrcEventListingsResponse>(
        `/${season}/events`,
        {
            entity: "events",
            season,
            eventCode,
            query: {
                eventCode,
            },
        },
    )
}

export async function fetchFrcTeamListingsForEvent(
    season: number,
    eventCode: string,
    page?: number,
) {
    return frcFetchJson<import("./types").FrcTeamListingsResponse>(
        `/${season}/teams`,
        {
            entity: "teams",
            season,
            eventCode,
            query: {
                eventCode,
                page,
            },
        },
    )
}

export async function fetchFrcEventRankings(season: number, eventCode: string) {
    return frcFetchJson<import("./types").FrcRankingsResponse>(
        `/${season}/rankings/${eventCode}`,
        {
            entity: "rankings",
            season,
            eventCode,
            optionalStatuses: [404],
        },
    )
}

export async function fetchFrcEventSchedule(
    season: number,
    eventCode: string,
    tournamentLevel: "Qualification" | "Playoff" | "Practice",
) {
    return frcFetchJson<import("./types").FrcScheduleResponse>(
        `/${season}/schedule/${eventCode}`,
        {
            entity: "schedule",
            season,
            eventCode,
            query: {
                tournamentLevel,
            },
            optionalStatuses: [404],
        },
    )
}

export async function fetchFrcEventMatchResults(
    season: number,
    eventCode: string,
    tournamentLevel: "Qualification" | "Playoff" | "Practice",
) {
    return frcFetchJson<import("./types").FrcMatchResultsResponse>(
        `/${season}/matches/${eventCode}`,
        {
            entity: "matches",
            season,
            eventCode,
            query: {
                tournamentLevel,
            },
            optionalStatuses: [404],
        },
    )
}

export async function fetchFrcScoreDetails(
    season: number,
    eventCode: string,
    tournamentLevel: "Qualification" | "Playoff" | "Practice",
) {
    return frcFetchJson<import("./types").FrcScoreDetailsResponse>(
        `/${season}/scores/${eventCode}/${tournamentLevel}`,
        {
            entity: "scores",
            season,
            eventCode,
            optionalStatuses: [404],
        },
    )
}