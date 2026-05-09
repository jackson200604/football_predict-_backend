import { Router, Request, Response } from 'express'
import { getTeamMatches, getH2H, extractTeamStats } from '../services/footballData'
import { searchTeamNews } from '../services/serpapi'
import { analyzeArticle, scrapeMatchSources } from '../services/jinaai'
import { analyzeNews } from '../services/newsAnalyzer'
import { analyzWithMistral } from '../services/mistral'
import { validateWithGemini } from '../services/gemini'
import { TeamAnalysis } from '../types'

const router = Router()

router.get('/:homeTeamId/:awayTeamId', async (req: Request, res: Response) => {
  try {
    const homeTeamId = Number(req.params.homeTeamId)
    const awayTeamId = Number(req.params.awayTeamId)
    const homeTeam = req.query.homeTeam as string
    const awayTeam = req.query.awayTeam as string

    const [
      homeMatches,
      awayMatches,
      h2h,
      homeNews,
      awayNews,
      scrapedData
    ] = await Promise.all([
      getTeamMatches(homeTeamId),
      getTeamMatches(awayTeamId),
      getH2H(homeTeamId, awayTeamId),
      searchTeamNews(homeTeam),
      searchTeamNews(awayTeam),
      scrapeMatchSources(homeTeam, awayTeam)
    ])

    const [homeArticle, awayArticle] = await Promise.all([
      homeNews[0]?.link ? analyzeArticle(homeNews[0].link) : Promise.resolve(''),
      awayNews[0]?.link ? analyzeArticle(awayNews[0].link) : Promise.resolve('')
    ])

    if (homeArticle) {
      homeNews.unshift({
        title: 'Analyse approfondie',
        link: homeNews[0]?.link || '',
        snippet: homeArticle
      })
    }

    if (awayArticle) {
      awayNews.unshift({
        title: 'Analyse approfondie',
        link: awayNews[0]?.link || '',
        snippet: awayArticle
      })
    }

    const homeStats = extractTeamStats(homeMatches, homeTeamId)
    const awayStats = extractTeamStats(awayMatches, awayTeamId)
    const homeNewsAnalysis = analyzeNews(homeNews)
    const awayNewsAnalysis = analyzeNews(awayNews)

    const homeAnalysis: TeamAnalysis = {
      stats: homeStats,
      newsAnalysis: homeNewsAnalysis,
      news: homeNews
    }

    const awayAnalysis: TeamAnalysis = {
      stats: awayStats,
      newsAnalysis: awayNewsAnalysis,
      news: awayNews
    }

    const mistralResult = await analyzWithMistral(
      homeTeam,
      awayTeam,
      homeAnalysis,
      awayAnalysis,
      h2h,
      scrapedData
    )

    const geminiResult = await validateWithGemini(
      homeTeam,
      awayTeam,
      homeAnalysis,
      awayAnalysis,
      h2h,
      mistralResult
    )

    const finalConfidence = geminiResult.agreement
      ? geminiResult.confidence
      : 'Faible'

    const prediction = {
      ...geminiResult,
      confidence: finalConfidence,
      aiAgreement: geminiResult.agreement,
      mistralPrediction: mistralResult.prediction,
      homeAnalysis,
      awayAnalysis,
      h2h
    }

    res.json({ success: true, prediction })

  } catch (error: any) {
    console.error('Prediction error:', error?.response?.data || error.message)
    res.status(500).json({
      success: false,
      error: error?.response?.data?.error?.message
        || error?.response?.data?.message
        || error?.message
        || 'Erreur inconnue',
      details: {
        service: error?.config?.url || 'unknown',
        status: error?.response?.status || 500
      }
    })
  }
})

export default router
