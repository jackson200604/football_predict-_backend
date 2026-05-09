import { TeamStats, H2HStats, NewsAnalysis, Prediction, TeamAnalysis } from '../types'

interface ScoreResult {
  homeScore: number
  awayScore: number
  reasons: string[]
}

const calculateFormScore = (stats: TeamStats): number => {
  let score = 0
  stats.form.forEach((result, index) => {
    const weight = 1 + (4 - index) * 0.2
    if (result === 'W') score += 3 * weight
    else if (result === 'D') score += 1 * weight
  })
  return score
}

const calculateGoalScore = (stats: TeamStats): number => {
  const total = stats.wins + stats.draws + stats.losses || 1
  const avgScored = stats.goalsScored / total
  const avgConceded = stats.goalsConceded / total
  return (avgScored * 2) - avgConceded
}

export const calculatePrediction = (
  homeStats: TeamStats,
  awayStats: TeamStats,
  h2h: H2HStats,
  homeNewsAnalysis: NewsAnalysis,
  awayNewsAnalysis: NewsAnalysis
): ScoreResult => {
  let homeScore = 0
  let awayScore = 0
  const reasons: string[] = []

  // 1. Forme récente (30%)
  const homeForm = calculateFormScore(homeStats)
  const awayForm = calculateFormScore(awayStats)
  homeScore += homeForm * 0.3
  awayScore += awayForm * 0.3

  if (homeForm > awayForm) {
    reasons.push('✅ Domicile en meilleure forme récente')
  } else if (awayForm > homeForm) {
    reasons.push('✅ Extérieur en meilleure forme récente')
  }

  // 2. Buts (25%)
  const homeGoals = calculateGoalScore(homeStats)
  const awayGoals = calculateGoalScore(awayStats)
  homeScore += homeGoals * 0.25
  awayScore += awayGoals * 0.25

  if (homeStats.goalsScored > awayStats.goalsScored) {
    reasons.push(`⚽ Domicile marque plus (${homeStats.goalsScored} buts)`)
  } else {
    reasons.push(`⚽ Extérieur marque plus (${awayStats.goalsScored} buts)`)
  }

  // 3. Avantage domicile (20%)
  homeScore += homeStats.homeWins * 0.2 * 2
  if (homeStats.homeWins >= 3) {
    reasons.push(`🏠 Fort avantage à domicile (${homeStats.homeWins} victoires)`)
  }

  // 4. H2H (15%)
  if (h2h.totalGames > 0) {
    homeScore += (h2h.homeWins / h2h.totalGames) * 0.15 * 10
    awayScore += (h2h.awayWins / h2h.totalGames) * 0.15 * 10

    if (h2h.homeWins > h2h.awayWins) {
      reasons.push(`📊 Domicile domine les H2H (${h2h.homeWins}V/${h2h.awayWins}D)`)
    } else if (h2h.awayWins > h2h.homeWins) {
      reasons.push(`📊 Extérieur domine les H2H (${h2h.awayWins}V/${h2h.homeWins}D)`)
    }
  }

  // 5. Clean sheets (10%)
  homeScore += homeStats.cleanSheets * 0.1 * 1.5
  awayScore += awayStats.cleanSheets * 0.1 * 1.5

  if (homeStats.cleanSheets > awayStats.cleanSheets) {
    reasons.push(`🛡️ Défense domicile plus solide (${homeStats.cleanSheets} clean sheets)`)
  }

  // 6. Actualités (bonus/malus)
  homeScore += homeNewsAnalysis.sentimentScore * 0.5
  awayScore += awayNewsAnalysis.sentimentScore * 0.5

  if (homeNewsAnalysis.hasInjuries) {
    reasons.push(`🚑 Blessures domicile : ${homeNewsAnalysis.injuredPlayers.join(', ')}`)
  }
  if (awayNewsAnalysis.hasInjuries) {
    reasons.push(`🚑 Blessures extérieur : ${awayNewsAnalysis.injuredPlayers.join(', ')}`)
  }
  if (homeNewsAnalysis.hasSuspensions) {
    reasons.push(`🟥 Suspensions domicile : ${homeNewsAnalysis.suspendedPlayers.join(', ')}`)
  }
  if (awayNewsAnalysis.hasSuspensions) {
    reasons.push(`🟥 Suspensions extérieur : ${awayNewsAnalysis.suspendedPlayers.join(', ')}`)
  }

  return { homeScore, awayScore, reasons }
}

export const buildPrediction = (
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats
): Omit<Prediction, 'bettingRecommendations' | 'aiAgreement' | 'mistralPrediction'> => {
  const { homeScore, awayScore, reasons } = calculatePrediction(
    homeAnalysis.stats,
    awayAnalysis.stats,
    h2h,
    homeAnalysis.newsAnalysis,
    awayAnalysis.newsAnalysis
  )

  const total = homeScore + awayScore || 1
  const rawHome = (homeScore / total) * 100
  const rawAway = (awayScore / total) * 100
  const drawFactor = 100 - Math.abs(rawHome - rawAway)
  const drawProbability = Math.round(Math.max(drawFactor * 0.3, 10))

  const remaining = 100 - drawProbability
  const homeProbability = Math.round((rawHome / 100) * remaining)
  const awayProbability = remaining - homeProbability

  let prediction: string
  let confidence: string

  if (homeProbability > awayProbability && homeProbability > drawProbability) {
    prediction = 'Domicile gagne'
    confidence = homeProbability > 50 ? 'Élevée' : 'Moyenne'
  } else if (awayProbability > homeProbability && awayProbability > drawProbability) {
    prediction = 'Extérieur gagne'
    confidence = awayProbability > 50 ? 'Élevée' : 'Moyenne'
  } else {
    prediction = 'Match nul probable'
    confidence = 'Faible'
  }

  return {
    homeProbability,
    awayProbability,
    drawProbability,
    prediction,
    confidence,
    reasons,
    homeAnalysis,
    awayAnalysis,
    h2h
  }
}
