_ = require 'underscore'

config = '../config'

utils = require '../utils'
log = utils.log

Policy = require './policy'

Events =
  LoadData: 'LoadData'
  LoadError: 'LoadError'

# A Source serves data either from the backend or from a backing set of data
class Source
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
    policy = @policy || Policy.Once
    if policy.intervalTime == Infinity
      @_task = @api.scheduleOnce (()=>@_load()), 0
    else
      @_task = @api.scheduleEvery ((=>@_load())), policy.intervalTime, true

  _load: ()->
    if @api?
      success = (res) =>
        @_trigger Events.LoadData, data
      fail = (res) =>
        @_trigger Events.LoadError, res

      api.get(@path).then success, fail
    else
      requestAnimationFrame ()=>
        @_trigger Events.LoadData, @data

  _on: (event, fn)->
    @_mediator.on @name + '.' + event, fn

  _once: (event, fn)->
    @_mediator.one @name + '.' + event, fn

  _off: (event)->
    @_mediator.off @name + '.' + event

  _trigger: (event)->
    args = Array.prototype.slice.call arguments
    args.shift()
    args.unshift @name + '.' + event

    @_mediator.trigger.apply @, args

module.exports = Source
