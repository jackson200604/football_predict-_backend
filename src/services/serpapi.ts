import axios from 'axios'
import { NewsItem } from '../types'

export const searchTeamNews = async (teamName: string): Promise<NewsItem[]> => {
  const response = await axios.get('https://serpapi.com/search', {
    params: {
      q: `${teamName} football actualités`,
      api_key: process.env.SERP_API_KEY,
      lang: 'fr',
      num: 5
    }
  })

  return response.data.organic_results.map((result: any) => ({
    title: result.title,
    link: result.link,
    snippet: result.snippet
  }))
}
