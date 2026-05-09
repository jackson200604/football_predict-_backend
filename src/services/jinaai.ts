import axios from 'axios'

export const analyzeArticle = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(`https://r.jina.ai/${url}`, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`
      }
    })

    // Nettoyer le contenu brut
    const content = response.data as string
    const clean = content
      .replace(/Title:.*?\n/g, '')
      .replace(/URL Source:.*?\n/g, '')
      .replace(/Markdown Content:/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/#+\s/g, '')
      .trim()
      .slice(0, 150)

    return clean
  } catch {
    return ''
  }
}
