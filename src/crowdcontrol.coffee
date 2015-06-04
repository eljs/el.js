module.exports =
  data: require './data/index.coffee'
  utils: require './utils/index.coffee'
  view: require './view/index.coffee'
  start: ()->
    @utils.shim.riot.mount('*')

window.crowdcontrol = module.exports if window?
