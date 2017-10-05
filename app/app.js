const express = require("express")
const jsonfile = require("jsonfile")

const config = jsonfile.readFileSync(__dirname + "/config.json")

let app = express()

app.get('/', (req, res) => {
  res.send('test')
})

app.listen(config.port || 8080, config.host || 'localhost') 

