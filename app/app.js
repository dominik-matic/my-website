const express = require('express')
const app = express()
const fs = require('node:fs')
const https = require('node:https')
const http = require('node:http')
const httpsport = 3443
const httpport = 3080


app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public')); 

app.use((req, res, next) => {
  if(req.protocol === 'http') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
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