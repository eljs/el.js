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

  # events are the list of events that will be added to the datasource
  events: null

  # unload is a function that is called to clear any policy specific meta data
  unload: ()->

  # load is a function that takes json data and transforms it
  load: (res)->
    data = JSON.parse res.data
    d = Q.defer()
    d.resolve(data)
    return d.promise

  constructor: (@options)->
    _.extend @, @options

  @Once: new Policy()

# Streaming policy creates a datasource for each
class StreamingPolicy extends Policy
  load: (res)->
    data = JSON.parse res.data
    if !_.isArray(data)
      return data


module.exports = Policy
