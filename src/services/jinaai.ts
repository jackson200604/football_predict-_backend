import axios from 'axios'

const fetchWithJina = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(`https://r.jina.ai/${url}`, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`
      }
    })
    return response.data
      .replace(/Title:.*?\n/g, '')
      .replace(/URL Source:.*?\n/g, '')
      .replace(/Markdown Content:/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/#+\s/g, '')
      .trim()
      .slice(0, 300)
  } catch {
    return ''
  }
}

export const scrapeMatchSources = async (
  homeTeam: string,
  awayTeam: string
): Promise<string> => {
  const homeEncoded = encodeURIComponent(homeTeam)
  const awayEncoded = encodeURIComponent(awayTeam)

  const urls = [
    `https://www.sofascore.com/search#query=${homeEncoded}`,
    `https://www.transfermarkt.fr/schnellsuche/ergebnis/schnellsuche?query=${homeEncoded}`,
    `https://www.sportytrader.fr/pronostics/football/`,
    `https://www.aiscore.com/search/${homeEncoded}-vs-${awayEncoded}`
  ]

  const results = await Promise.allSettled(
    urls.map(url => fetchWithJina(url))
  )

  return results
    .map(r => r.status === 'fulfilled' ? r.value : '')
    .filter(Boolean)
    .join('\n\n')
}

export const analyzeArticle = async (url: string): Promise<string> => {
  return fetchWithJina(url)
}
