const express = require("express")
const jsonfile = require("jsonfile")
const mysql = require("mysql")
const randomstring = require("randomstring")

const config = jsonfile.readFileSync(__dirname + "/config.json")
const db     = jsonfile.readFileSync(__dirname + "/db.json")
const randomConfig = {
  charset: 'alphanumeric'
}

let app = express()
let pool = mysql.createPool(db)

app.use(express.static(__dirname + "/public"))

app.get('/chat-redirect', (req, res) => {
  let token = randomstring.generate(randomConfig)
  pool.query("INSERT INTO token (token, name, id) VALUES (?, ?, ?)", [token, req.query["last name"] + req.query["first name"], req.query["messenger user id"]], (err, result, field) => {
    if(err) console.log(err)
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
    	            "url": config.host + ":" + config.port,
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

app.get('/get_list', (req, res) => {
  pool.query("SELECT * FROM list", (err, result, field) => {
    res.send(result)
  })
})

app.get('/get_restaurant_book_info', (req, res) => {
  pool.query("SELECT * FROM book_info INNER JOIN list ON book_info.id = list.id WHERE list.name = ?", [req.query.restaurant_name], (err, result, field) => {
    res.send(result)
  })
})

app.listen(config.port || 8080, config.host || 'localhost') 

