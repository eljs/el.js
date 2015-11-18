extend = require 'extend'
isFunction = require 'is-function'

utils = require '../utils'
riot = utils.shim.riot

# A View is a Riot Tag
class View
  @register: ()->
    new @

  tag: ''
  html: ''
  css: ''
  attrs: ''
  events: null
  mixins: null
  model: null
  js: ()->

  constructor: ()->
    proto = Object.getPrototypeOf @
    parentProto = proto
    temp = {}

    while parentProto != View.prototype
      parentProto = Object.getPrototypeOf parentProto
      proto.events = extend {}, parentProto.events || {}, proto.events
      extend temp, parentProto || {}, proto

    extend proto, temp

    view = @

    @init()

    riot.tag @tag, @html, @css, @attrs, (opts)->
      # This gets around weird issues with InputView multiplexing
      # and its interactions with updateOpts in riot
      optsP = Object.getPrototypeOf(opts)
      for k, v of opts
        if optsP[k]? && !v?
          opts[k] = optsP[k]

      if view?
        for k, v of Object.getPrototypeOf view
          # Since riot relies on the user setting up closures
          #  @ is assigned to window when executing functions
          #  on the context during templating.
          #
          #  Therefore mixins need to be fat arrowed.
          #
          # Mind the reserved keywords
          #  on
          #  off
          #  one
          #  trigger
          #  tags
          #  mount
          #  unmount
          #  view
          #  model
          #  obs
          #  root
          #

          if isFunction(v)
            do (v) =>
              if @[k]?
                oldFn = @[k]
                @[k] = ()=>
                  oldFn.apply @, arguments
                  return v.apply @, arguments
              else
                @[k] = ()=>
                  return v.apply @, arguments
          else
            @[k] = v

      # opts model takes precedence over model on view
      #  it is simpler to override rather than
      @model = opts.model || @model
      @model = {} if !@model?

      obs = @obs = opts.obs
      if !@obs?
        obs = @obs = {}
        utils.shim.observable obs

      if view.events?
        for name, handler of view.events
          do (name, handler) =>
            obs.on name, ()=> handler.apply @, arguments

      @js(opts) if @js

  init: ()->

module.exports = View
