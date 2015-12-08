module.exports =
  config:require './config'
  utils: require './utils/index'
  view:  require './view/index'
  start: (opts) ->
    @utils.shim.riot.mount('*')
  Events: require './events'

window.crowdcontrol = module.exports if window?
