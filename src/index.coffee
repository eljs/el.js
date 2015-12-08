module.exports =
  Events: require './events'
  config: require './config'
  utils:  require './utils/index'
  view:   require './view/index'

  start: (opts) ->
    require('riot').mount '*'

window.crowdcontrol = module.exports if window?
