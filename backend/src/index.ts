import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connect } from './config/db'
import { createDb } from './controllers/createDb'
import { UserRouter } from './routes/user'
import { productRouter } from './routes/products'
import { categoryRouter } from './routes/category'

const app = express()
const port = 8080

// Middlewares esenciales
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(cookieParser())

app.use(morgan('dev'))

app.use('/uploads', express.static('uploads'))

// Rutas
app.get('/', (req, res) => res.send('Hello World!'))
app.use('/users', UserRouter)
app.use('/products', productRouter)
app.use('/categories', categoryRouter)

// Conexión a DB y arranque del servidor
const startServer = async () => {
  try {
    await createDb()
    await connect()

    const server = app.listen(port, () => {
      console.log(
        `[${new Date().toISOString()}] Server running on http://localhost:${port}`
      )
    })

    // Detectar reinicios de ts-node-dev
    process.once('SIGUSR2', () => {
      console.log('[ts-node-dev] Server restarting...')
      server.close(() => process.kill(process.pid, 'SIGUSR2'))
    })
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error starting server:`, err)
  }
}

startServer()
