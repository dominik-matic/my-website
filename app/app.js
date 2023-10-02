const express = require('express')
const app = express()
const fs = require('fs')
const https = require('https')
const port = 3000

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public')); 

app.use((req, res, next) => {
  if(req.protocol === 'http') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
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

https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/private.key.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/domain.cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/intermediate.cert.pem')
}).listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
