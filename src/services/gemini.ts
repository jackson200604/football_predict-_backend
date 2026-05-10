import axios from 'axios'
import { TeamAnalysis, H2HStats } from '../types'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'

interface BettingRec {
  market: string
  pick: string
  odds: string
  confidence: string
  reasoning: string
}

interface GeminiResult {
  prediction: string
  homeProbability: number
  awayProbability: number
  drawProbability: number
  confidence: string
  reasons: string[]
  bettingRecommendations: BettingRec[]
  agreement: boolean
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

export const validateWithGemini = async (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  mistralPrediction: MistralResult
): Promise<GeminiResult> => {
  const lines: string[] = []
  lines.push('You are a football analysis expert.')
  lines.push('A first AI (Mistral) already analyzed this match.')
  lines.push('Validate or correct its prediction.')
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
  lines.push('Injuries: ' + (homeAnalysis.newsAnalysis.hasInjuries ? homeAnalysis.newsAnalysis.injuredPlayers.join(',') : 'none'))
  lines.push('Suspensions: ' + (homeAnalysis.newsAnalysis.hasSuspensions ? homeAnalysis.newsAnalysis.suspendedPlayers.join(',') : 'none'))
  lines.push('AWAY TEAM: ' + awayTeam)
  lines.push('Form: ' + awayAnalysis.stats.form.join(','))
  lines.push('Wins: ' + awayAnalysis.stats.wins)
  lines.push('Draws: ' + awayAnalysis.stats.draws)
  lines.push('Losses: ' + awayAnalysis.stats.losses)
  lines.push('Goals scored: ' + awayAnalysis.stats.goalsScored)
  lines.push('Goals conceded: ' + awayAnalysis.stats.goalsConceded)
  lines.push('Clean sheets: ' + awayAnalysis.stats.cleanSheets)
  lines.push('Away wins: ' + awayAnalysis.stats.awayWins)
  lines.push('Injuries: ' + (awayAnalysis.newsAnalysis.hasInjuries ? awayAnalysis.newsAnalysis.injuredPlayers.join(',') : 'none'))
  lines.push('Suspensions: ' + (awayAnalysis.newsAnalysis.hasSuspensions ? awayAnalysis.newsAnalysis.suspendedPlayers.join(',') : 'none'))
  lines.push('H2H total: ' + h2h.totalGames)
  lines.push('H2H home wins: ' + h2h.homeWins)
  lines.push('H2H away wins: ' + h2h.awayWins)
  lines.push('H2H draws: ' + h2h.draws)
  lines.push('MISTRAL PREDICTION:')
  lines.push('Prediction: ' + mistralPrediction.prediction)
  lines.push('Home: ' + mistralPrediction.homeProbability + '%')
  lines.push('Draw: ' + mistralPrediction.drawProbability + '%')
  lines.push('Away: ' + mistralPrediction.awayProbability + '%')
  lines.push('Confidence: ' + mistralPrediction.confidence)
  lines.push('Respond ONLY in valid JSON without markdown:')
  lines.push('{"agreement":true,"prediction":"Home wins","homeProbability":50,"awayProbability":30,"drawProbability":20,"confidence":"High","reasons":["r1","r2","r3","r4","r5"],"bettingRecommendations":[{"market":"1X2","pick":"1","odds":"1.85","confidence":"High","reasoning":"short"},{"market":"Over/Under","pick":"Over 2.5","odds":"1.90","confidence":"Medium","reasoning":"short"},{"market":"BTTS","pick":"Yes","odds":"1.70","confidence":"Medium","reasoning":"short"},{"market":"Half Time","pick":"1","odds":"2.10","confidence":"Medium","reasoning":"short"},{"market":"Asian Handicap","pick":"Home -0.5","odds":"2.00","confidence":"Low","reasoning":"short"}]}')
  lines.push('Set agreement to true if you agree with Mistral, false if not.')
  lines.push('The three probabilities must total exactly 100.')
  lines.push('Provide exactly 5 betting recommendations.')

  const prompt = lines.join('\n')

  const response = await axios.post(
    GEMINI_URL + '?key=' + process.env.GEMINI_API_KEY,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000
      }
    }
  )

  const content = response.data.candidates[0].content.parts[0].text
  const clean = content.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
    }      "odds": "1.85",
      "confidence": "Élevée",
      "reasoning": "explication courte"
    },
    {
      "market": "Total buts",
      "pick": "Plus de 2.5",
      "odds": "1.90",
      "confidence": "Moyenne",
      "reasoning": "explication courte"
    },
    {
      "market": "Les deux équipes marquent",
      "pick": "Oui",
      "odds": "1.70",
      "confidence": "Moyenne",
      "reasoning": "explication courte"
    },
    {
      "market": "Mi-temps/Fin de match",
      "pick": "1/1",
      "odds": "2.10",
      "confidence": "Moyenne",
      "reasoning": "explication courte"
    },
    {
      "market": "Handicap asiatique",
      "pick": "${homeTeam} -0.5",
      "odds": "2.00",
      "confidence": "Faible",
      "reasoning": "explication courte"
    }
  ]
}

Les trois probabilités doivent totaliser exactement 100.
Si tu es en accord avec Mistral, mets agreement: true et affine les probabilités.
Si tu es en désaccord, mets agreement: false et donne ta propre analyse.
Fournis exactement 5 recommandations de paris sur des marchés différents.
`

  const response = await axios.post(
    `${GEMINI_API}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000
      }
    }
  )

  const content = response.data.candidates[0].content.parts[0].text
  const clean = content.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
    }
