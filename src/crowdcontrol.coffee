module.exports =
  data: require './data/index'
  utils: require './utils/index'
  view: require './view/index'
  start: ()->
    @utils.shim.riot.mount('*')

window.crowdcontrol = module.exports if window?
