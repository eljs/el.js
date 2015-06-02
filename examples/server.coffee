log = require('../src/utils').log

path = require 'path'
express = require 'express'
app = express()

app.use express.static __dirname + '/'

app.get '/crowdcontrol.js', (req, res)->
  res.sendFile path.resolve(__dirname + '/../crowdcontrol.js')

start = Date.now()

secondsList = []
setInterval ()->
  secondsList.unshift value: parseInt((Date.now() - start) / 1000, 10)
  secondsList.length = 10
, 1000

app.get '/seconds', (req, res)->

  res.send JSON.stringify secondsList

app.listen 12345, ()->
  log.info 'STARTING EXAMPLE SERVER'
