_ = require 'underscore'
Q = require 'q'

config = '../config'

utils = require '../utils'
requestAnimationFrame = utils.shim.requestAnimationFrame
log = utils.log

Policy = require './policy'

Events =
  LoadData: 'LoadData'
  LoadError: 'LoadError'

# A Source serves data either from the backend or from a backing set of data
class Source
  @Events: Events

  ### Basic Info ###

  # name is used to prepend events
  name: null

  ### Static Data ###

  # data is backing data for non-api loaders if no api is specified.  It may also be used to cache data from the server
  data: null

  ### Dynamic Data ###

  # api is object of API type, specifies the api to hit. If this is not present, then fallback to data
  api: null

  # path is the api endpoint to hit such as 'user' for https://api.crowdstart.com/user
  path: ''

  # policy refers how the Source loads and saves data
  # policy tells the source how often to reload data and how to batch data for example
  # policy also preprocesses data
  _policy: null

  # policy getter and setter
  @property 'policy',
    get: ->
      return @_policy
    set: (value) ->
      @_task.cancel() if @_task
      @_policy = value
      @initTask()

  # task is the result of calling api's task scheduling
  _task: null

  # global event pump, mediator is needed to avoid very confusing pub/sub chains
  _mediator: utils.mediator

  constructor: (@options)->
    if @options.policy
      @options._policy = @options.policy
      @options.policy = undefined

    _.extend @, @options

    @api = config.api if !@api?

    @initTask()

  initTask: ()->
    if @api?
      policy = @policy || Policy.Once
      if policy.intervalTime == Infinity
        @_task = @api.scheduleOnce (()=>@_load()), 0
      else
        @_task = @api.scheduleEvery (()=>@_load()), policy.intervalTime, true
    else
      requestAnimationFrame ()=>
        @_load()

  _load: ()->
    if @api?
      success = (res) =>
        @trigger Events.LoadData, res
      fail = (res) =>
        @trigger Events.LoadError, res

      return @api.get(@path).then success, fail
    else
      d = Q.defer()
      requestAnimationFrame ()=>
        @trigger Events.LoadData, @data
        d.resolve @data
      return d.promise

  eventName: (event)->
    return @name + '.' + event.trim().replace(' ', ' ' + @name + '.')

  on: (event, fn)->
    @_mediator.on @eventName(event), fn

  once: (event, fn)->
    @_mediator.one @eventName(event), fn

  off: (event, fn)->
    @_mediator.off @eventName(event), fn

  trigger: (event)->
    args = Array.prototype.slice.call arguments
    args.shift()
    args.unshift @eventName(event)

    @_mediator.trigger.apply @, args

module.exports = Source
