import axios from 'axios'
import { Match, H2HStats, TeamStats } from '../types'

const footballAPI = axios.create({
  baseURL: 'https://api.football-data.org/v4',
  headers: {
    'X-Auth-Token': process.env.FOOTBALL_API_KEY
  }
})

export const getUpcomingMatches = async (): Promise<Match[]> => {
  const response = await footballAPI.get('/matches?status=SCHEDULED')
  return response.data.matches
}

export const getTeamMatches = async (teamId: number): Promise<Match[]> => {
  const response = await footballAPI.get(
    `/teams/${teamId}/matches?status=FINISHED&limit=10`
  )
  return response.data.matches
}

export const getH2H = async (
  homeTeamId: number,
  awayTeamId: number
): Promise<H2HStats> => {
  try {
    const response = await footballAPI.get(
      `/teams/${homeTeamId}/matches?status=FINISHED&limit=20`
    )

    const matches: Match[] = response.data.matches.filter(
      (m: Match) =>
        m.homeTeam.id === awayTeamId || m.awayTeam.id === awayTeamId
    )

    let homeWins = 0
    let awayWins = 0
    let draws = 0

    matches.forEach(match => {
      if (match.score.winner === 'HOME_TEAM') {
        match.homeTeam.id === homeTeamId ? homeWins++ : awayWins++
      } else if (match.score.winner === 'AWAY_TEAM') {
        match.awayTeam.id === homeTeamId ? homeWins++ : awayWins++
      } else {
        draws++
      }
    })

    return { homeWins, awayWins, draws, totalGames: matches.length }
  } catch {
    return { homeWins: 0, awayWins: 0, draws: 0, totalGames: 0 }
  }
}

export const extractTeamStats = (
  matches: Match[],
  teamId: number
): TeamStats => {
  let wins = 0
  let draws = 0
  let losses = 0
  let goalsScored = 0
  let goalsConceded = 0
  let homeWins = 0
  let awayWins = 0
  let cleanSheets = 0
  const form: string[] = []

  matches.slice(0, 5).forEach(match => {
    const isHome = match.homeTeam.id === teamId
    const scored = isHome
      ? match.score.fullTime.home ?? 0
      : match.score.fullTime.away ?? 0
    const conceded = isHome
      ? match.score.fullTime.away ?? 0
      : match.score.fullTime.home ?? 0

    goalsScored += scored
    goalsConceded += conceded

    if (conceded === 0) cleanSheets++

    if (match.score.winner === 'DRAW') {
      draws++
      form.push('D')
    } else if (
      (isHome && match.score.winner === 'HOME_TEAM') ||
      (!isHome && match.score.winner === 'AWAY_TEAM')
    ) {
      wins++
      isHome ? homeWins++ : awayWins++
      form.push('W')
    } else {
      losses++
      form.push('L')
    }
  })

  return {
    wins, draws, losses,
    goalsScored, goalsConceded,
    form, homeWins, awayWins, cleanSheets
  }
}
