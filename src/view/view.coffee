riot = require 'riot'
_ = require 'underscore'

utils = require '../utils'

# A View is a Riot Tag
class View
  tag: ''
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

    riot.tag @tag, @html, @css, @attrs, (opts)->
      # this gets around weird issues with InputView multiplexing
      # and its interactions with updateOpts in riot
      optsP = Object.getPrototypeOf(opts)
      for k, v of opts
        if optsP[k]? && !v?
          opts[k] = optsP[k]

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
          do (name, handler) =>
            obs.on name, ()=> handler.apply @, arguments

      _.extend @, view.mixins if view.mixins

      @view.js.call @, opts

  init: ()->

module.exports = View
