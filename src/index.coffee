_ = require 'underscore'

module.exports =
  data   : require './data/index'
  utils  : require './utils/index'
  view   : require './view/index'
  config : require './config'
  start  : (opts)->
    @utils.shim.riot.mount('*')

window.crowdcontrol = module.exports if window?
