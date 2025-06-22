import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connect } from './config/db'
import { UserRouter } from './routes/user'
import { productRouter } from './routes/products'
import { categoryRouter } from './routes/category'
import { createDb } from './controllers/createDb'

const app = express()
const port = 8080

createDb()
connect()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('Hello World !')
})

app.use('/users', UserRouter)
app.use('/products', productRouter)
app.use('/categories', categoryRouter)

app.listen(port, () => {
  console.log(`app listening on https:${port}`)
})
