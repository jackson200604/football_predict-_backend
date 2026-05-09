import axios from 'axios'
import { TeamAnalysis, H2HStats } from '../types'

const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions'

interface MistralResult {
  prediction: string
  homeProbability: number
  awayProbability: number
  drawProbability: number
  confidence: string
  reasons: string[]
  bettingRecommendations: {
    market: string
    pick: string
    odds: string
    confidence: string
    reasoning: string
  }[]
}

const buildPrompt = (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  scrapedData: string
): string => {
  const homeForm = homeAnalysis.stats.form.join(', ')
  const awayForm = awayAnalysis.stats.form.join(', ')
  const homeInjuries = homeAnalysis.newsAnalysis.hasInjuries
    ? homeAnalysis.newsAnalysis.injuredPlayers.join(', ')
    : 'Aucune'
  const awayInjuries = awayAnalysis.newsAnalysis.hasInjuries
    ? awayAnalysis.newsAnalysis.injuredPlayers.join(', ')
    : 'Aucune'
  const homeSuspensions = homeAnalysis.newsAnalysis.hasSuspensions
    ? homeAnalysis.newsAnalysis.suspendedPlayers.join(', ')
    : 'Aucune'
  const awaySuspensions = awayAnalysis.newsAnalysis.hasSuspensions
    ? awayAnalysis.newsAnalysis.suspendedPlayers.join(', ')
    : 'Aucune'
  const homeNews = homeAnalysis.news.slice(0, 2).map(n => n.title).join(' | ')
  const awayNews = awayAnalysis.news.slice(0, 2).map(n => n.title).join(' | ')

  return [
    'Tu es un expert en analyse de football et paris sportifs.',
    'Analyse ces donnees et fais une prediction complete avec recommandations de paris.',
    '',
    'MATCH: ' + homeTeam + ' (domicile) vs ' + awayTeam + ' (exterieur)',
    '',
    '=== STATISTIQUES ' + homeTeam + ' ===',
    '- Forme recente: ' + homeForm,
    '- Victoires: ' + homeAnalysis.stats.wins,
    '- Nuls: ' + homeAnalysis.stats.draws,
    '- Defaites: ' + homeAnalysis.stats.losses,
    '- Buts marques: ' + homeAnalysis.stats.goalsScored,
    '- Buts encaisses: ' + homeAnalysis.stats.goalsConceded,
    '- Clean sheets: ' + homeAnalysis.stats.cleanSheets,
    '- Victoires a domicile: ' + homeAnalysis.stats.homeWins,
    '- Blessures: ' + homeInjuries,
    '- Suspensions: ' + homeSuspensions,
    '',
    '=== STATISTIQUES ' + awayTeam + ' ===',
    '- Forme recente: ' + awayForm,
    '- Victoires: ' + awayAnalysis.stats.wins,
    '- Nuls: ' + awayAnalysis.stats.draws,
    '- Defaites: ' + awayAnalysis.stats.losses,
    '- Buts marques: ' + awayAnalysis.stats.goalsScored,
    '- Buts encaisses: ' + awayAnalysis.stats.goalsConceded,
    '- Clean sheets: ' + awayAnalysis.stats.cleanSheets,
    '- Victoires a l exterieur: ' + awayAnalysis.stats.awayWins,
    '- Blessures: ' + awayInjuries,
    '- Suspensions: ' + awaySuspensions,
    '',
    '=== CONFRONTATIONS DIRECTES H2H ===',
    '- Total matchs: ' + h2h.totalGames,
    '- Victoires ' + homeTeam + ': ' + h2h.homeWins,
    '- Victoires ' + awayTeam + ': ' + h2h.awayWins,
    '- Nuls: ' + h2h.draws,
    '',
    '=== DONNEES SITES SPECIALISES ===',
    scrapedData || 'Non disponibles',
    '',
    '=== ACTUALITES RECENTES ===',
    homeTeam + ': ' + homeNews,
    awayTeam + ': ' + awayNews,
    '',
    'Reponds UNIQUEMENT en JSON valide sans markdown :',
    '{',
    '  "prediction": "Domicile gagne" ou "Exterieur gagne" ou "Match nul probable",',
    '  "homeProbability": nombre entre 0 et 100,',
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
