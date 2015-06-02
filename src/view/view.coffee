riot = require 'riot'
_ = require 'underscore'

utils = require '../utils'

# A View is a Riot Tag
class View
  name: ''
  html: ''
  css: ''
  attrs: ''
  events: {}
  js: ()->

  constructor: (@options)->
    _.extend @, @options

    self = @

    @init()

    riot.tag @name, @html, @css, @attrs, (opts)->
      @view = self
      console.log("ARG", opts)
      @model = opts.model
      @model = {} if !@model?

      @obs = {}
      utils.shim.observable @obs

      for name, handler of @view.events
        utils.mediator.on name, handler

      @view.js.call @, opts

  init: ()->

module.exports = View
