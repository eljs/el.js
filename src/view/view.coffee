_ = require 'underscore'

utils = require '../utils'
riot = utils.shim.riot

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

    proto = Object.getPrototypeOf @
    parentProto = Object.getPrototypeOf proto
    _.extend proto.events, parentProto.events
    _.extend proto.mixins, parentProto.mixins

    view = @

    @init()

    riot.tag @tag, @html, @css, @attrs, (opts)->
      # This gets around weird issues with InputView multiplexing
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

      if view.events?
        for name, handler of view.events
          do (name, handler) =>
            obs.on name, ()=> handler.apply @, arguments

      if view.mixins?
        for name, fn of view.mixins
          # Since riot relies on the user setting up closures
          #  @ is assigned to window when executing functions
          #  on the context during templating.
          #
          #  Therefore mixins need to be fat arrowed.
          #
          do (fn) =>
            @[name] = ()=>
              fn.apply @, arguments

      @view.js.call @, opts

  init: ()->

module.exports = View
