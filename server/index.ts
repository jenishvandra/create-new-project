import express from 'express'
import cors from 'cors'
import { initDatabase } from './database.ts'
import { apiRouter } from './routes.ts'

// Initialize SQLite Database schema & seed data
initDatabase()

export const app = express()

app.use(cors())
app.use(express.json())

// Mount API router at /api
app.use('/api', apiRouter)

// Standalone runner
if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`[Life RPG API Server] Running on http://localhost:${PORT}`)
  })
}
