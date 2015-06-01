_ = require 'underscore'

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

  # load is a function that takes json data and transforms it
  load: null

  constructor: (@options)->
    _.extend @, @options

  @Once: new Policy()
  @Paging: new Policy()
  @Streaming: new Policy()

module.exports = Policy
