riot = require 'riot'

module.exports =
  data: require './data/index.coffee'
  utils: require './utils/index.coffee'
  view: require './view/index.coffee'
  start: ()->
    riot.mount('*')

window.crowdcontrol = module.exports if window?
