export type FrcTournamentLevel =
    | "None"
    | "Practice"
    | "Qualification"
    | "Playoff"

export type FrcEventListing = {
    address: string | null
    website: string | null
    webcasts: unknown[]
    timezone: string | null
    code: string
    divisionCode: string | null
    name: string
    type: string | null
    districtCode: string | null
    venue: string | null
    city: string | null
    stateprov: string | null
    country: string | null
    dateStart: string | null
    dateEnd: string | null
}

export type FrcEventListingsResponse = {
    Events: FrcEventListing[]
    eventCount: number
}

export type FrcTeamListing = {
    teamNumber: number
    nameShort: string | null
    nameFull: string | null
    city: string | null
    stateProv: string | null
    country: string | null
    districtCode: string | null
    schoolName: string | null
    robotName: string | null
    rookieYear: number | null
    website: string | null
    homeCMP?: string | null
}

export type FrcTeamListingsResponse = {
    teams: FrcTeamListing[]
    teamCount?: number
    pageCurrent?: number
    pageTotal?: number
}

export type FrcRankingRow = {
    rank: number
    teamNumber: number
    sortOrder1: number | null
    sortOrder2: number | null
    sortOrder3: number | null
    sortOrder4: number | null
    sortOrder5: number | null
    sortOrder6: number | null
    wins: number
    losses: number
    ties: number
    qualAverage: number | null
    dq: number | null
    matchesPlayed: number | null
}

export type FrcRankingsResponse = {
    Rankings: FrcRankingRow[]
}

export type FrcScheduleTeam = {
    teamNumber: number
    station: string
    surrogate: boolean
}

export type FrcScheduleMatch = {
    field: string | null
    tournamentLevel: FrcTournamentLevel
    description: string | null
    startTime: string | null
    matchNumber: number
    teams: FrcScheduleTeam[]
}

export type FrcScheduleResponse = {
    Schedule: FrcScheduleMatch[]
}

export type FrcMatchResultTeam = {
    teamNumber: number
    station: string
    dq: boolean
}

export type FrcMatchResult = {
    actualStartTime: string | null
    tournamentLevel: FrcTournamentLevel
    postResultTime: string | null
    description: string | null
    matchNumber: number
    scoreRedFinal: number | null
    scoreRedFoul: number | null
    scoreRedAuto: number | null
    scoreBlueFinal: number | null
    scoreBlueFoul: number | null
    scoreBlueAuto: number | null
    teams: FrcMatchResultTeam[]
}

export type FrcMatchResultsResponse = {
    Matches: FrcMatchResult[]
}

export type FrcScoreAlliance = {
    alliance: "Red" | "Blue"
    totalPoints?: number | null
    foulCount?: number | null
    foulPoints?: number | null
    autoPoints?: number | null
    teleopPoints?: number | null
    adjustPoints?: number | null
    [key: string]: unknown
}

export type FrcScoreDetailMatch = {
    matchLevel: FrcTournamentLevel
    matchNumber: number
    alliances: FrcScoreAlliance[]
    [key: string]: unknown
}

export type FrcScoreDetailsResponse = {
    MatchScores: FrcScoreDetailMatch[]
}