path = require 'path'
express = require 'express'
simulateLatency = require('express-simulate-latency')

app = express()

smallLag = simulateLatency min: 100, max: 500
bigLag = simulateLatency min: 1000, max: 5000

app.use smallLag
app.use express.static __dirname + '/'

app.get '/crowdcontrol.js', (req, res)->
  res.sendFile path.resolve(__dirname + '/../crowdcontrol.js')

start = Date.now()

secondsList = []
setInterval ()->
  secondsList.unshift value: parseInt((Date.now() - start) / 1000, 10)
  secondsList.length = 10
, 1000

app.get '/seconds', bigLag, (req, res)->
  res.send secondsList

polygonIds = [0,1,2,3,4,5,6]
polygons = [
  {
    id: 0
    value: 'nothing'
  }
  {
    id: 1
    value: 'monogon'
  }
  {
    id: 2
    value: 'digon'
  }
  {
    id: 3
    value: 'triangle'
  }
  {
    id: 4
    value: 'quadrilateral'
  }
  {
    id: 5
    value: 'pentagon'
  }
  {
    id: 6
    value: 'hexagon'
  }
]

app.get '/polygon', (req, res)->
  ids = polygonIds.slice()

  for id, i in ids
    n = Math.floor(Math.random() * (i + 1))
    swap = ids[i]
    ids[i] = ids[n]
    ids[n] = swap
  res.send ids

app.get '/polygon/:id', bigLag, (req, res)->
  res.send polygons[req.params.id]

app.get '/email/your@email.com', bigLag, (req, res)->
  res.send { email: 'your@email.com' }

app.listen 12345, ()->
  console.log 'STARTING EXAMPLE SERVER'
