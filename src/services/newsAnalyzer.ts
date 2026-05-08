import { NewsItem, NewsAnalysis } from '../types'

const INJURY_KEYWORDS = [
  'blessé', 'blessure', 'indisponible', 'forfait',
  'absent', 'opéré', 'touché', 'out'
]

const SUSPENSION_KEYWORDS = [
  'suspendu', 'suspension', 'carton rouge',
  'expulsé', 'sanction'
]

const POSITIVE_KEYWORDS = [
  'victoire', 'en forme', 'retour', 'performant',
  'invaincu', 'série', 'confiance', 'dominant'
]

const NEGATIVE_KEYWORDS = [
  'défaite', 'crise', 'mauvaise forme', 'difficile',
  'problème', 'tensions', 'méforme'
]

export const analyzeNews = (news: NewsItem[]): NewsAnalysis => {
  const injuredPlayers: string[] = []
  const suspendedPlayers: string[] = []
  let sentimentScore = 0
  let hasInjuries = false
  let hasSuspensions = false
  let hasPositiveForm = false
  let hasNegativeForm = false

  news.forEach(item => {
    const text = `${item.title} ${item.snippet}`.toLowerCase()

    INJURY_KEYWORDS.forEach(keyword => {
      if (text.includes(keyword)) {
        hasInjuries = true
        sentimentScore -= 2
        const words = text.split(' ')
        const idx = words.findIndex(w => w.includes(keyword))
        if (idx > 0) injuredPlayers.push(words[idx - 1])
      }
    })

    SUSPENSION_KEYWORDS.forEach(keyword => {
      if (text.includes(keyword)) {
        hasSuspensions = true
        sentimentScore -= 3
        const words = text.split(' ')
        const idx = words.findIndex(w => w.includes(keyword))
        if (idx > 0) suspendedPlayers.push(words[idx - 1])
      }
    })

    POSITIVE_KEYWORDS.forEach(keyword => {
      if (text.includes(keyword)) {
        hasPositiveForm = true
        sentimentScore += 2
      }
    })

    NEGATIVE_KEYWORDS.forEach(keyword => {
      if (text.includes(keyword)) {
        hasNegativeForm = true
        sentimentScore -= 2
      }
    })
  })

  return {
    hasInjuries,
    hasSuspensions,
    hasPositiveForm,
    hasNegativeForm,
    injuredPlayers: [...new Set(injuredPlayers)],
    suspendedPlayers: [...new Set(suspendedPlayers)],
    sentimentScore
  }
    }
