utils = require('../src/utils')
log = utils.log
log.DEBUG = true

mockXhr = require 'xhr2'

utils.shim.riot = require 'riot'

Q = require 'q'
require('q-xhr')(mockXhr, Q)

testserver = require './testserver'
testserver.listen 12345, ()->
  log.info 'STARTING TEST SERVER'

# start tests here
require './data'
