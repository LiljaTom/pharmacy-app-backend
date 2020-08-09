const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('express-async-errors')

// Utils
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

// Routers
const productsRouter = require('./controllers/products')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const ordersRouter = require('./controllers/orders')



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
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/orders', ordersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports= app