import axios from 'axios'
import { TeamAnalysis, H2HStats } from '../types'

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'
const MISTRAL_MODEL = 'mistral-small-2503'

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
  lines.push('')
  lines.push('MATCH: ' + homeTeam + ' vs ' + awayTeam)
  lines.push('')
  lines.push('HOME TEAM: ' + homeTeam)
  lines.push('Form: ' + homeAnalysis.stats.form.join(','))
  lines.push('Wins: ' + homeAnalysis.stats.wins)
  lines.push('Draws: ' + homeAnalysis.stats.draws)
  lines.push('Losses: ' + homeAnalysis.stats.losses)
  lines.push('Goals scored: ' + homeAnalysis.stats.goalsScored)
  lines.push('Goals conceded: ' + homeAnalysis.stats.goalsConceded)
  lines.push('Clean sheets: ' + homeAnalysis.stats.cleanSheets)
  lines.push('Home wins: ' + homeAnalysis.stats.homeWins)
  lines.push('')
  lines.push('AWAY TEAM: ' + awayTeam)
  lines.push('Form: ' + awayAnalysis.stats.form.join(','))
  lines.push('Wins: ' + awayAnalysis.stats.wins)
  lines.push('Draws: ' + awayAnalysis.stats.draws)
  lines.push('Losses: ' + awayAnalysis.stats.losses)
  lines.push('Goals scored: ' + awayAnalysis.stats.goalsScored)
  lines.push('Goals conceded: ' + awayAnalysis.stats.goalsConceded)
  lines.push('Clean sheets: ' + awayAnalysis.stats.cleanSheets)
  lines.push('Away wins: ' + awayAnalysis.stats.awayWins)
  lines.push('')
  lines.push('H2H: ' + h2h.totalGames + ' games')
  lines.push('Home wins: ' + h2h.homeWins)
  lines.push('Away wins: ' + h2h.awayWins)
  lines.push('Draws: ' + h2h.draws)
  lines.push('')
  lines.push('SCRAPED DATA: ' + (scrapedData || 'none'))
  lines.push('')
  lines.push('Respond ONLY in valid JSON without markdown:')
  lines.push('{')
  lines.push('"prediction": "Home wins" or "Away wins" or "Draw",')
  lines.push('"homeProbability": number 0-100,')
  lines.push('"awayProbability": number 0-100,')
  lines.push('"drawProbability": number 0-100,')
  lines.push('"confidence": "High" or "Medium" or "Low",')
  lines.push('"reasons": ["reason1","reason2","reason3"],')
  lines.push('"bettingRecommendations": [')
  lines.push('{"market":"1X2","pick":"1","odds":"1.85","confidence":"High","reasoning":"short"},')
  lines.push('{"market":"Over/Under","pick":"Over 2.5","odds":"1.90","confidence":"Medium","reasoning":"short"},')
  lines.push('{"market":"BTTS","pick":"Yes","odds":"1.70","confidence":"Medium","reasoning":"short"}')
  lines.push(']')
  lines.push('}')
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
}    '  "homeProbability": nombre entre 0 et 100,',
    '  "awayProbability": nombre entre 0 et 100,',
    '  "drawProbability": nombre entre 0 et 100,',
    '  "confidence": "Elevee" ou "Moyenne" ou "Faible",',
    '  "reasons": ["raison 1", "raison 2", "raison 3"],',
    '  "bettingRecommendations": [',
    '    {"market": "Resultat 1N2", "pick": "1", "odds": "1.85", "confidence": "Elevee", "reasoning": "explication"},',
    '    {"market": "Total buts", "pick": "Plus de 2.5", "odds": "1.90", "confidence": "Moyenne", "reasoning": "explication"},',
    '    {"market": "Les deux equipes marquent", "pick": "Oui", "odds": "1.70", "confidence": "Moyenne", "reasoning": "explication"}',
    '  ]',
    '}',
    'Les trois probabilites doivent totaliser exactement 100.'
  ].join('\n')
}

export const analyzWithMistral = async (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  scrapedData: string
): Promise<MistralResult> => {
  const prompt = buildPrompt(
    homeTeam,
    awayTeam,
    homeAnalysis,
    awayAnalysis,
    h2h,
    scrapedData
  )

  const response = await axios.post(
    MISTRAL_API,
    {
      model: 'mistral-small-2503',
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
}    '  "homeProbability": nombre entre 0 et 100,',
    '  "awayProbability": nombre entre 0 et 100,',
    '  "drawProbability": nombre entre 0 et 100,',
    '  "confidence": "Elevee" ou "Moyenne" ou "Faible",',
    '  "reasons": ["raison 1", "raison 2", "raison 3"],',
    '  "bettingRecommendations": [',
    '    {"market": "Resultat 1N2", "pick": "1", "odds": "1.85", "confidence": "Elevee", "reasoning": "explication"},',
    '    {"market": "Total buts", "pick": "Plus de 2.5", "odds": "1.90", "confidence": "Moyenne", "reasoning": "explication"},',
    '    {"market": "Les deux equipes marquent", "pick": "Oui", "odds": "1.70", "confidence": "Moyenne", "reasoning": "explication"}',
    '  ]',
    '}',
    'Les trois probabilites doivent totaliser exactement 100.'
  ].join('\n')
}

export const analyzWithMistral = async (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  scrapedData: string
): Promise<MistralResult> => {
  const prompt = buildPrompt(
    homeTeam,
    awayTeam,
    homeAnalysis,
    awayAnalysis,
    h2h,
    scrapedData
  )

  const response = await axios.post(
    MISTRAL_API,
    {
      model: 'mistral-small-2503',
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
    }      "confidence": "Moyenne",
      "reasoning": "explication courte"
    },
    {
      "market": "Les deux équipes marquent",
      "pick": "Oui",
      "odds": "1.70",
      "confidence": "Moyenne",
      "reasoning": "explication courte"
    }
  ]
}

Les trois probabilités doivent totaliser exactement 100.
`

  const response = await axios.post(
    MISTRAL_API,
    {
      model: 'mistral-small-2503',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const content = response.data.choices[0].message.content
  const clean = content.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}    },
    {
      "market": "Total buts",
      "pick": "Plus de 2.5",
      "odds": "1.90",
      "confidence": "Moyenne",
      "reasoning": "explication courte"
    }
  ]
}

Les trois probabilités doivent totaliser exactement 100.
Fournis 3 recommandations de paris différentes avec des marchés variés.
`

  const response = await axios.post(
    MISTRAL_API,
    {
      model: 'mistral-small-2503',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const content = response.data.choices[0].message.content
  const clean = content.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
    }  return JSON.parse(clean)
  }
