import axios from 'axios'

export const analyzeArticle = async (url: string): Promise<string> => {
  const response = await axios.get(`https://r.jina.ai/${url}`, {
    headers: {
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`
    }
  })
  return response.data
}
