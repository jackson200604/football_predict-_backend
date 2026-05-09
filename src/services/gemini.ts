import axios from 'axios'
import { TeamAnalysis, H2HStats } from '../types'

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'
export const validateWithGemini = async (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  mistralPrediction: {
    prediction: string
    homeProbability: number
    awayProbability: number
    drawProbability: number
    confidence: string
    reasons: string[]
    bettingRecommendations: any[]
  }
): Promise<{
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
  agreement: boolean
}> => {
  const prompt = `
Tu es un expert en analyse de football et paris sportifs.
Une première IA (Mistral) a déjà analysé ce match. Valide ou corrige sa prédiction.

MATCH: ${homeTeam} (domicile) vs ${awayTeam} (extérieur)

=== STATISTIQUES ${homeTeam} ===
- Forme récente: ${homeAnalysis.stats.form.join(', ')}
- Victoires: ${homeAnalysis.stats.wins}
- Nuls: ${homeAnalysis.stats.draws}
- Défaites: ${homeAnalysis.stats.losses}
- Buts marqués: ${homeAnalysis.stats.goalsScored}
- Buts encaissés: ${homeAnalysis.stats.goalsConceded}
- Clean sheets: ${homeAnalysis.stats.cleanSheets}
- Victoires à domicile: ${homeAnalysis.stats.homeWins}
- Blessures: ${homeAnalysis.newsAnalysis.hasInjuries ? homeAnalysis.newsAnalysis.injuredPlayers.join(', ') : 'Aucune'}
- Suspensions: ${homeAnalysis.newsAnalysis.hasSuspensions ? homeAnalysis.newsAnalysis.suspendedPlayers.join(', ') : 'Aucune'}

=== STATISTIQUES ${awayTeam} ===
- Forme récente: ${awayAnalysis.stats.form.join(', ')}
- Victoires: ${awayAnalysis.stats.wins}
- Nuls: ${awayAnalysis.stats.draws}
- Défaites: ${awayAnalysis.stats.losses}
- Buts marqués: ${awayAnalysis.stats.goalsScored}
- Buts encaissés: ${awayAnalysis.stats.goalsConceded}
- Clean sheets: ${awayAnalysis.stats.cleanSheets}
- Victoires à l'extérieur: ${awayAnalysis.stats.awayWins}
- Blessures: ${awayAnalysis.newsAnalysis.hasInjuries ? awayAnalysis.newsAnalysis.injuredPlayers.join(', ') : 'Aucune'}
- Suspensions: ${awayAnalysis.newsAnalysis.hasSuspensions ? awayAnalysis.newsAnalysis.suspendedPlayers.join(', ') : 'Aucune'}

=== CONFRONTATIONS DIRECTES H2H ===
- Total matchs: ${h2h.totalGames}
- Victoires ${homeTeam}: ${h2h.homeWins}
- Victoires ${awayTeam}: ${h2h.awayWins}
- Nuls: ${h2h.draws}

=== PRÉDICTION DE MISTRAL ===
- Prédiction: ${mistralPrediction.prediction}
- Domicile: ${mistralPrediction.homeProbability}%
- Nul: ${mistralPrediction.drawProbability}%
- Extérieur: ${mistralPrediction.awayProbability}%
- Confiance: ${mistralPrediction.confidence}
- Raisons: ${mistralPrediction.reasons.join(' | ')}

Réponds UNIQUEMENT en JSON valide sans markdown :
{
  "agreement": true ou false,
  "prediction": "Domicile gagne" ou "Extérieur gagne" ou "Match nul probable",
  "homeProbability": nombre entre 0 et 100,
  "awayProbability": nombre entre 0 et 100,
  "drawProbability": nombre entre 0 et 100,
  "confidence": "Élevée" ou "Moyenne" ou "Faible",
  "reasons": ["raison 1", "raison 2", "raison 3", "raison 4", "raison 5"],
  "bettingRecommendations": [
    {
      "market": "Résultat 1N2",
      "pick": "1 (Domicile)",
      "odds": "1.85",
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
