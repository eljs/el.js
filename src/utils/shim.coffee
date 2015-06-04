Q = require 'q'
if XMLHttpRequest?
  require('q-xhr')(XMLHttpRequest, Q)
else
  require('q-xhr')

Function::property = (prop, desc) ->
  Object.defineProperty @prototype, prop, desc

module.exports =
  observable: (obj)->
    return @riot.observable obj
  requestAnimationFrame: require 'raf'
  riot: window.riot if window? || {}
