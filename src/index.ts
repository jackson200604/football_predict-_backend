import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import matchesRouter from './routes/matches'
import predictionsRouter from './routes/predictions'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/matches', matchesRouter)
app.use('/predictions', predictionsRouter)

app.get('/', (req, res) => {
  res.json({ message: 'Football Predictions API ✅' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`)
})
