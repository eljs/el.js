riot = require 'riot'
_ = require 'underscore'

utils = require '../utils'

# A View is a Riot Tag
class View
  name: ''
  html: ''
  css: ''
  attrs: ''
  events: null
  mixins: null
  js: ()->

  constructor: (@options)->
    _.extend @, @options

    view = @

    @init()

    riot.tag @name, @html, @css, @attrs, (opts)->
      @view = view
      view.ctx = @

      @model = opts.model
      @model = {} if !@model?

      obs = @obs = opts.obs
      if !@obs?
        obs = @obs = {}
        utils.shim.observable obs

      if view.events
        for name, handler of view.events
          obs.on name, ()=> handler.apply @, arguments

      _.extend @, view.mixins if view.mixins

      @view.js.call @, opts

  init: ()->

module.exports = View
