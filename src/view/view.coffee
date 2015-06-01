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

  constructor: (@options)->
    _.extend @, @options

    self = @

    for name, handler of @events
      utils.mediator.on name, handler

    riot.tag @name, @html, @css, @attrs, (opts)->
      @view = self
      @model = {}
      @mediator = utils.mediator

      @view.init.call @, opts

  init: ()->
