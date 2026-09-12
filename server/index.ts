import express from 'express'
import cors from 'cors'
import { initDatabase } from './database.ts'
import { apiRouter } from './routes.ts'

// Initialize SQLite Database schema & seed data
initDatabase()

// Create Express application
export const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Mount API router
app.use('/api', apiRouter)

// Start server
const PORT = process.env.PORT || 5000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Life RPG API Server] Running on port ${PORT}`)
})