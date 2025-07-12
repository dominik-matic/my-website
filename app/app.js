const express = require('express')
const app = express()
const fs = require('node:fs')
const https = require('node:https')
const http = require('node:http')
const winston = require('winston')
const httpport = 3080

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `[${info.timestamp}] ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'app.log' })
  ]
});


app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public')); 

// logging middleware
app.use((req, res, next) => {
  logger.info(`Request from IP ${req.ip}, User Agent: ${req.headers['user-agent']}, Method: ${req.method}, URL: ${req.url}`);

  next();
})

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/about', (req, res) => {
  res.render('about.ejs')
})

app.get('/mylinks', (req, res) => {
  res.render('mylinks.ejs')
})

http.createServer(app).listen(httpport, () => {
  console.log(`Http server listening on port ${httpport}`)
})
