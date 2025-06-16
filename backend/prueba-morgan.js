const express = require('express')
const morgan = require('morgan')

const app = express()
const port = 3000

app.use(
  morgan('dev', {
    stream: {
      write: (msg) => {
        console.log('[Morgan Custom]', msg)
      },
    },
  })
)

app.get('/', (req, res) => {
  res.send('Hola mundo!')
})

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`)
})
