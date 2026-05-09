import axios from 'axios'
import { TeamAnalysis, H2HStats } from '../types'

const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions'

export const analyzWithMistral = async (
  homeTeam: string,
  awayTeam: string,
  homeAnalysis: TeamAnalysis,
  awayAnalysis: TeamAnalysis,
  h2h: H2HStats,
  scrapedData: string
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
}> => {
  const prompt = `
Tu es un expert en analyse de football et en paris sportifs.
Analyse toutes ces données et fournis une prédiction complète avec recommandations de paris.

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

=== DONNÉES SITES SPÉCIALISÉS ===
${scrapedData || 'Non disponibles'}

=== ACTUALITÉS RÉCENTES ===
${homeTeam}: ${homeAnalysis.news.slice(0, 2).map(n => n.title).join(' | ')}
${awayTeam}: ${awayAnalysis.news.slice(0, 2).map(n => n.title).join(' | ')}

Réponds UNIQUEMENT en JSON valide sans markdown :
{
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
      "market": "Les deux équipes marquent",
      "pick": "Oui",
      "odds": "1.70",
      "confidence": "Moyenne",
      "reasoning": "explication courte"
    },
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
