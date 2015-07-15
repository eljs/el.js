promise = require 'bluebird/js/main/promise'
xhr = require 'xhr-promise'

Function::property = (prop, desc) ->
  Object.defineProperty @prototype, prop, desc

promise.new = (fn)->
  return new promise fn

module.exports =
  observable: (obj)->
    return @riot.observable obj
  requestAnimationFrame: require 'raf'
  riot: window.riot if window? && window.riot?
  xhr: (data)->
    x = new xhr()
    return x.send.apply x, arguments
  promise: promise

#requires bind polyfill
