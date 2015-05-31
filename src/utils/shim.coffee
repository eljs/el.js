riot = require 'riot'

module.exports =
  observable: (obj)->
    return riot.observable obj
  requestAnimationFrame: require 'raf'
