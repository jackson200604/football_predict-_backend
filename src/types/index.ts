export interface Team {
  id: number
  name: string
}

export interface Competition {
  id: number
  name: string
}

export interface Score {
  winner: string | null
  fullTime: {
    home: number | null
    away: number | null
  }
}

export interface Match {
  id: number
  homeTeam: Team
  awayTeam: Team
  utcDate: string
  competition: Competition
  score: Score
  status: string
}

export interface NewsItem {
  title: string
  link: string
  snippet: string
}

export interface TeamStats {
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  form: string[]
  homeWins: number
  awayWins: number
  cleanSheets: number
}

export interface H2HStats {
  homeWins: number
  awayWins: number
  draws: number
  totalGames: number
}

export interface NewsAnalysis {
  hasInjuries: boolean
  hasSuspensions: boolean
  hasPositiveForm: boolean
  hasNegativeForm: boolean
  injuredPlayers: string[]
  suspendedPlayers: string[]
  sentimentScore: number
}

export interface TeamAnalysis {
  stats: TeamStats
  newsAnalysis: NewsAnalysis
  news: NewsItem[]
}

export interface BettingRecommendation {
  market: string
  pick: string
  odds: string
  confidence: string
  reasoning: string
}

export interface Prediction {
  homeProbability: number
  awayProbability: number
  drawProbability: number
  prediction: string
  confidence: string
  reasons: string[]
  bettingRecommendations: BettingRecommendation[]
  aiAgreement: boolean
  mistralPrediction: string
  homeAnalysis: TeamAnalysis
  awayAnalysis: TeamAnalysis
  h2h: H2HStats
}
