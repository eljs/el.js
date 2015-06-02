_ = require 'underscore'
Q = require 'q'

# A Policy is a decorator
# It defines how often a Source updates and how the data can be interacted with
# For example: a Paging policy lets a source respond to paging events
#              a Streaming policy slowly loads data asynchronously
#
# Policies should not be passed into multiple sources since they may contain state
#
class Policy
  intervalTime: Infinity

  # source associated with policy
  source: null

  # events are the list of events that will be added to the datasource
  events: null

  # unload is a function that is called to clear any policy specific meta data
  unload: ()->

  # load is a function that takes json data and transforms it
  load: (res)->
    d = Q.defer()

    data = res.data

    d.resolve data
    return d.promise

  constructor: (@options)->
    _.extend @, @options

  @Once: new Policy()

# Streaming policy creates a datasource for each
class TabularRestfulStreamingPolicy extends Policy
  load: (res)->
    d = Q.defer()

    data = res.data

    if !_.isArray(data)
      d.resolve data
      return d.promise

    togo = 0
    failed = false
    fail = (res)->
      togo--
      d.reject res.message

    for id, i in data
      if !_.isObject(id)
        togo++

        data[i] = null
        do (id, i)=>
          success = (res)->
            togo--
            data[i] = res.data
            if togo == 0
              d.resolve(data)
            else if !failed
              partialData = []
              for datum in data
                partialData.push(datum) if datum?
              d.notify(partialData)

          @source.api.get(@source.path + '/' + id).then success, fail

    return d.promise

module.exports =
  Policy: Policy
  TabularRestfulStreamingPolicy: TabularRestfulStreamingPolicy
