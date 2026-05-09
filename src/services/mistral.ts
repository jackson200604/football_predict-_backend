import axios from 'axios'
import { TeamAnalysis, H2HStats } from '../types'

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'
const MISTRAL_MODEL = 'mistral-small-2509'

interface BettingRec {
  market: string
  pick: string
  odds: string
  confidence: string
  reasoning: string
}

interface MistralResult {
  prediction: string
  homeProbability: number
  awayProbability: number
  drawProbability: number
  confidence: string
  reasons: string[]
  bettingRecommendations: BettingRec[]
}

export const analyzWithMistral = async (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  scrapedData: string
): Promise<MistralResult> => {
  const lines: string[] = []
  lines.push('You are a football analysis expert.')
  lines.push('Analyze this match and provide predictions with betting recommendations.')
  lines.push('MATCH: ' + homeTeam + ' vs ' + awayTeam)
  lines.push('HOME TEAM: ' + homeTeam)
  lines.push('Form: ' + homeAnalysis.stats.form.join(','))
  lines.push('Wins: ' + homeAnalysis.stats.wins)
  lines.push('Draws: ' + homeAnalysis.stats.draws)
  lines.push('Losses: ' + homeAnalysis.stats.losses)
  lines.push('Goals scored: ' + homeAnalysis.stats.goalsScored)
  lines.push('Goals conceded: ' + homeAnalysis.stats.goalsConceded)
  lines.push('Clean sheets: ' + homeAnalysis.stats.cleanSheets)
  lines.push('Home wins: ' + homeAnalysis.stats.homeWins)
  lines.push('AWAY TEAM: ' + awayTeam)
  lines.push('Form: ' + awayAnalysis.stats.form.join(','))
  lines.push('Wins: ' + awayAnalysis.stats.wins)
  lines.push('Draws: ' + awayAnalysis.stats.draws)
  lines.push('Losses: ' + awayAnalysis.stats.losses)
  lines.push('Goals scored: ' + awayAnalysis.stats.goalsScored)
  lines.push('Goals conceded: ' + awayAnalysis.stats.goalsConceded)
  lines.push('Clean sheets: ' + awayAnalysis.stats.cleanSheets)
  lines.push('Away wins: ' + awayAnalysis.stats.awayWins)
  lines.push('H2H total games: ' + h2h.totalGames)
  lines.push('H2H home wins: ' + h2h.homeWins)
  lines.push('H2H away wins: ' + h2h.awayWins)
  lines.push('H2H draws: ' + h2h.draws)
  lines.push('SCRAPED DATA: ' + (scrapedData || 'none'))
  lines.push('Respond ONLY in valid JSON without markdown:')
  lines.push('{"prediction":"Home wins","homeProbability":50,"awayProbability":30,"drawProbability":20,"confidence":"High","reasons":["r1","r2","r3"],"bettingRecommendations":[{"market":"1X2","pick":"1","odds":"1.85","confidence":"High","reasoning":"short"},{"market":"Over/Under","pick":"Over 2.5","odds":"1.90","confidence":"Medium","reasoning":"short"},{"market":"BTTS","pick":"Yes","odds":"1.70","confidence":"Medium","reasoning":"short"}]}')
  lines.push('The three probabilities must total exactly 100.')

  const prompt = lines.join('\n')

  const response = await axios.post(
    MISTRAL_URL,
    {
      model: MISTRAL_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    },
    {
      headers: {
        'Authorization': 'Bearer ' + process.env.MISTRAL_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  )

  const content = response.data.choices[0].message.content
  const clean = content.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
