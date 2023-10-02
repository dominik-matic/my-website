const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public')); 


app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/about', (req, res) => {
  res.render('about.ejs')
})

app.get('/mylinks', (req, res) => {
  res.render('mylinks.ejs')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
