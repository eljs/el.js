module.exports =
  config: require './config'
  utils:  require './utils/index'
  view:   require './view/index'

  start: (opts) ->
    require('riot').mount '*'

  # Require must be delayed until all events are exposed.
  Events: require './events'

window.crowdcontrol = module.exports if window?
