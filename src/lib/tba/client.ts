import { TbaSyncError } from "./errors"

const TBA_BASE_URL = process.env.TBA_BASE_URL ?? "https://www.thebluealliance.com/api/v3"

const TBA_AUTH_KEY = process.env.TBA_AUTH_KEY

type TbaEntity = "event" | "teams" | "matches" | "match_teams" | "rankings"

type TbaFetchOptions = {
    etag?: string
    optionalStatuses?: number[]
    entity: TbaEntity
    eventKey?: string
}

type TbaFetchResult<T> = {
    data: T | null
    etag: string | null
    notModified: boolean
}

export async function tbaFetchJson<T>(
    path: string,
    options: TbaFetchOptions,
): Promise<TbaFetchResult<T>> {
    if (!TBA_AUTH_KEY) {
        throw new TbaSyncError("Missing TBA_AUTH_KEY", {
            stage: "fetch",
            entity: options.entity,
            eventKey: options.eventKey,
        })
    }

    const headers: HeadersInit = { "X-TBA-Auth-Key": TBA_AUTH_KEY,}

    if (options.etag) {
        headers["If-None-Match"] = options.etag
    }

    let response: Response

    try {
        response = await fetch(`${TBA_BASE_URL}${path}`, {
            method: "GET",
            headers,
            cache: "no-store",
        })
    } catch (error) {
        throw new TbaSyncError("Failed to reach TBA API", {
            stage: "fetch",
            entity: options.entity,
            eventKey: options.eventKey,
            details: error instanceof Error ? error.message : error,
        })
    }

    const responseEtag = response.headers.get("etag")

    if (response.status === 304) {
        return {
            data: null,
            etag: responseEtag,
            notModified: true,
        }
    }

    if (options.optionalStatuses?.includes(response.status)) {
        return {
            data: null,
            etag: responseEtag,
            notModified: false,
        }
    }

    if (!response.ok) {
        let details: string | null = null

        try {
            details = await response.text()
        } catch {
            details = null
        }

        throw new TbaSyncError("TBA request failed", {
            stage: "fetch",
            entity: options.entity,
            eventKey: options.eventKey,
            status: response.status,
            details,
        })
    }

    let data: T

    try {
        data = (await response.json()) as T
    } catch (error) {
        throw new TbaSyncError("Failed to parse TBA response JSON", {
            stage: "fetch",
            entity: options.entity,
            eventKey: options.eventKey,
            status: response.status,
            details: error instanceof Error ? error.message : error,
        })
    }

    return {
        data,
        etag: responseEtag,
        notModified: false,
    }
}