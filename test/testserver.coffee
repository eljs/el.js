express = require 'express'
app = express()

app.use express.static(__dirname + '/../test/jsons')
console.log __dirname + '/../test/jsons'
module.exports = app
