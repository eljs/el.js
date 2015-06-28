try
  console.log 'shim'

  shim = require('../src/utils/shim')
  shim.riot = require 'riot'

  console.log 'log'
  utils = require('../src/utils')
  log = utils.log
  log.DEBUG = true

  console.log 'globals'
  global.XMLHttpRequest = require 'xhr2'

  console.log 'server'
  testserver = require './testserver'
  testserver.listen 12345, ()->
    log.info 'STARTING TEST SERVER'

  console.log 'tests'
  # start tests here
  require './data'

catch e
  console.log 'what', e.stack
