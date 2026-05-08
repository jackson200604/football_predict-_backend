import { Router, Request, Response } from 'express'
import { getUpcomingMatches } from '../services/footballData'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const matches = await getUpcomingMatches()
    res.json({ success: true, matches })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
