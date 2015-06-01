riot = require 'riot'

Function::property = (prop, desc) ->
  Object.defineProperty @prototype, prop, desc

module.exports =
  observable: (obj)->
    return riot.observable obj
  requestAnimationFrame: require 'raf'
