const express = require("express")
const jsonfile = require("jsonfile")
const mysql = require("mysql")
const randomstring = require("randomstring")
const bodyParser = require('body-parser')
const cors = require('cors')

const config = jsonfile.readFileSync(__dirname + "/config.json")
const db     = jsonfile.readFileSync(__dirname + "/db.json")
const randomConfig = {
  charset: 'alphanumeric'
}

let app = express()
let pool = mysql.createPool(db)

app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.get('/chat-redirect', (req, res) => {
  let token = randomstring.generate(randomConfig)
  pool.query("INSERT INTO token (token, name, id, restaurant_id) VALUES (?, ?, ?, (SELECT list.id FROM list WHERE list.name = ?))", [token, req.query["last name"] + req.query["first name"], req.query["messenger user id"], req.query["restaurant_name"]], (err, result, field) => {
    if (err) {
      console.log(err)
      return res.send("error")
    }
    res.send({
      "messages": [
    	  {
    	    "attachment": {
    	      "type": "template",
    	      "payload": {
    	        "template_type": "button",
    	        "text": "點我訂位",
    	        "buttons": [
    	          {
    	            "type": "web_url",
    	            "url": config.outerHost + "?token=" + token,
    	            "title": "Visit Website"
    	          },
    	        ]
    	      }
    	    }
    	  }
    	] 
    })
  })
})

app.post('/booking', (req, res) => {
  let token = req.body.token
  pool.query("SELECT * FROM token WHERE token.token = ?", [token], (err, result, field) => {
    if (result.length == 0) return res.send({ok: false, message: "Invalid token"})
    res.send(result)
  })
})

app.get('/get-list', (req, res) => {
  pool.query("SELECT * FROM list", (err, result, field) => {
    res.send(result)
  })
})

app.get('/get-restaurant-book-info', (req, res) => {
  pool.query("SELECT * FROM book_info INNER JOIN list ON book_info.id = list.id WHERE list.name = ?", [req.query.restaurant_name], (err, result, field) => {
    res.send(result)
  })
})

app.listen(config.port || 8080, config.host || 'localhost') 

