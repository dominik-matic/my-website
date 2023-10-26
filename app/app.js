const express = require('express')
const app = express()
const fs = require('node:fs')
const https = require('node:https')
const http = require('node:http')
const winston = require('winston')
const httpsport = 3443
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

// redirect middleware
app.use((req, res, next) => {
  if(req.protocol === 'http') {
    logger.info(`Redirected ${req.ip} to HTTPS: ${req.method} ${req.url}`)
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
})

// logging middleware
app.use((req, res, next) => {
  logger.info(`Request from IP ${req.ip}, User Agent: ${req.userAgent}, Method: ${req.method}, URL: ${req.url}`);

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

const options =  {
  key: fs.readFileSync('/etc/letsencrypt/private.key.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/domain.cert.pem'),
  //ca: fs.readFileSync('/etc/letsencrypt/intermediate.cert.pem')
}

https.createServer(options, app).listen(httpsport, () => {
  console.log(`Server listening on port ${httpsport}`)
})

http.createServer(app).listen(httpport, () => {
  console.log(`Http server listening on port ${httpport}`)
})