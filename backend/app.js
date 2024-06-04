const express = require('express')
const app = express()
const cors = require('cors')
const config = require("./utils/config")
const mongoose = require("mongoose")
const blogsRouter = require("./controllers/blogs")
const middleware = require("./utils/middleware")
const { info, error } = require("./utils/logger")

mongoose.set('strictQuery', false)
info('connected to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    info('connected to MongoDB')
  })
  .catch((error) => {
    error("error connecting to MongoDB:", error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app