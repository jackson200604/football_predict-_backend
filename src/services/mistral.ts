import axios from 'axios'
import { TeamAnalysis, H2HStats } from '../types'

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'
const MISTRAL_MODEL = 'magistral-small-2509'

interface BettingRec {
  market: string
  pick: string
  odds: string
  confidence: string
  reasoning: string
}

export interface MistralResult {
  prediction: string
  homeProbability: number
  awayProbability: number
  drawProbability: number
  confidence: string
  reasons: string[]
  bettingRecommendations: BettingRec[]
}

const buildPrompt = (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  scrapedData: string
): string => {
  return `
Analyze this football match and return ONLY valid JSON.

MATCH:
${homeTeam} vs ${awayTeam}

HOME TEAM:
Name: ${homeTeam}
Recent form: ${homeAnalysis.stats.form.join(', ')}
Wins: ${homeAnalysis.stats.wins}
Draws: ${homeAnalysis.stats.draws}
Losses: ${homeAnalysis.stats.losses}
Goals scored: ${homeAnalysis.stats.goalsScored}
Goals conceded: ${homeAnalysis.stats.goalsConceded}
Clean sheets: ${homeAnalysis.stats.cleanSheets}
Home wins: ${homeAnalysis.stats.homeWins}

AWAY TEAM:
Name: ${awayTeam}
Recent form: ${awayAnalysis.stats.form.join(', ')}
Wins: ${awayAnalysis.stats.wins}
Draws: ${awayAnalysis.stats.draws}
Losses: ${awayAnalysis.stats.losses}
Goals scored: ${awayAnalysis.stats.goalsScored}
Goals conceded: ${awayAnalysis.stats.goalsConceded}
Clean sheets: ${awayAnalysis.stats.cleanSheets}
Away wins: ${awayAnalysis.stats.awayWins}

HEAD TO HEAD:
Total games: ${h2h.totalGames}
Home wins: ${h2h.homeWins}
Away wins: ${h2h.awayWins}
Draws: ${h2h.draws}

ADDITIONAL DATA:
${scrapedData || 'none'}

RULES:
- Return ONLY raw JSON
- No markdown
- No explanations
- Probabilities must total exactly 100
- Confidence must be: Low, Medium, or High
- Include minimum 3 reasons
- Include minimum 3 betting recommendations

JSON FORMAT:
{
  "prediction": "Home wins",
  "homeProbability": 50,
  "awayProbability": 30,
  "drawProbability": 20,
  "confidence": "High",
  "reasons": [
    "reason 1",
    "reason 2",
    "reason 3"
  ],
  "bettingRecommendations": [
    {
      "market": "1X2",
      "pick": "1",
      "odds": "1.85",
      "confidence": "High",
      "reasoning": "Strong home form"
    },
    {
      "market": "Over/Under",
      "pick": "Over 2.5",
      "odds": "1.90",
      "confidence": "Medium",
      "reasoning": "Both teams score often"
    },
    {
      "market": "BTTS",
      "pick": "Yes",
      "odds": "1.70",
      "confidence": "Medium",
      "reasoning": "Weak defenses"
    }
  ]
}
`.trim()
}

const extractContent = (rawContent: any): string => {
  if (typeof rawContent === 'string') {
    return rawContent
  }

  if (Array.isArray(rawContent)) {
    return rawContent
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item?.text) {
          return item.text
        }

        return ''
      })
      .join('')
  }

  throw new Error('Invalid Mistral response format')
}

export const analyzeWithMistral = async (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  scrapedData: string
): Promise<MistralResult> => {
  try {
    const prompt = buildPrompt(
      homeTeam,
      awayTeam,
      homeAnalysis,
      awayAnalysis,
      h2h,
      scrapedData
    )

    const response = await axios.post(
      MISTRAL_URL,
      {
        model: MISTRAL_MODEL,
        temperature: 0.3,
        max_tokens: 1500,
        response_format: {
          type: 'json_object'
        },
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    const rawContent = response.data?.choices?.[0]?.message?.content

    const content = extractContent(rawContent)

    const parsed: MistralResult = JSON.parse(content)

    const total =
      parsed.homeProbability +
      parsed.awayProbability +
      parsed.drawProbability

    if (total !== 100) {
      throw new Error(
        `Invalid probabilities total: ${total}`
      )
    }

    return parsed
  } catch (error: any) {
    console.error('Mistral analysis error:')

    if (axios.isAxiosError(error)) {
      console.error({
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
    } else {
      console.error(error)
    }

    throw new Error('Failed to analyze match with Mistral AI')
  }
      }
