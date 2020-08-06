const express = require('express')
const app = express()
const mongoose = require('mongoose')

// Utils
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

// Routers
const productsRouter = require('./controllers/products')


logger.info('connecting to database')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error(`Error connecting to MongoDB. Error: ${error.message}`)
  })

app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/products', productsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports= app