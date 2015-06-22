_ = require 'underscore'

Q = require 'q'

config = require '../config'

utils = require('../utils')

log = utils.log
requestAnimationFrame = utils.shim.requestAnimationFrame

ScheduledTaskType =
  every: 'every'
  once: 'once'

class ScheduledTask
  constructor: (@type, @fn, @millis)->
    @scheduledTime = _.now() + @millis
    @kill = false

  cancel: ()->
    @kill = true

class Api
  scheduledTasks: null

  # url is api base path such as https://api.crowdstart.com
  # token is the api token to set as bearer for auth
  constructor: (@url, @token)->
    @scheduledTasks = []

    url = @url
    if url[url.length-1] == '/'
      @url = url.substring 0, url.length - 1

    # make this the default api if none is provided
    config.api = @ if !config.api?

  # get/post/put/patch/delete send a GET/POST/PUT/PATCH/DELETE request
  #  path is appending to the url to determine the endpoint
  #    ex. path = 'user' creates a request to 'https://api.crowdstart.com/user'
  #
  #  return a promise
  get:    (path)->
    if path[0] != '/'
      p = '/' + path
    return Q.xhr
      method: 'GET'
      headers:
        Authorization: @token
      url: @url + p

  post:   (path, data)->
    if path[0] != '/'
      p = '/' + path
    return Q.xhr
      method: 'POST'
      headers:
        Authorization: @token
      url: @url + p
      data: data

  put:    (path, data)->
    if path[0] != '/'
      p = '/' + path
    return Q.xhr
      method: 'PUT'
      headers:
        Authorization: @token
      url: @url + p
      data: data

  patch:  (path, data)->
    if path[0] != '/'
      p = '/' + path
    return Q.xhr
      method: 'PATCH'
      headers:
        Authorization: @token
      url: @url + p
      data: data

  delete: (path)->
    if path[0] != '/'
      p = '/' + path
    return Q.xhr
      method: 'DELETE'
      headers:
        Authorization: @token
      url: @url + p

  # scheduleOnce starts (if not started) the event loop and adds a function to
  #  the queue to be executed in some milliseconds
  scheduleOnce: (fn, millis)->
    task = new ScheduledTask ScheduledTaskType.once, fn, millis
    @scheduledTasks.push task

    if @scheduledTasks.length == 1
      @loop()

    return task

  # scheduleEvery starts (if not started) the event loop and adds a function to
  #  the queue to be executed evert some milliseconds, it executes immediately if
  #  now is true
  scheduleEvery: (fn, millis, now = false)->
    task = new ScheduledTask ScheduledTaskType.every, fn, millis
    @scheduledTasks.push task

    if @scheduledTasks.length == 1
      @loop()

    if now
      log 'API: scheduling for immediate execution'
      task = new ScheduledTask ScheduledTaskType.once, fn, 0
      @scheduledTasks.push task

    return task

  # loop starts the main loop
  loop: ()->
    if @scheduledTasks.length > 0
      log 'API: starting loop'
      requestAnimationFrame ()=>
        now = _.now()
        i = 0

        length = @scheduledTasks.length
        # loop over all tasks
        while i < length
          sfn = @scheduledTasks[i]

          # if a task should be executed
          if sfn.scheduledTime <= now
            sfn.fn(now) if ! sfn.kill

            if sfn.kill || sfn.type == ScheduledTaskType.once
              # effectively delete an element form the array
              length--
              # copy task from end of array to current position
              @scheduledTasks[i] = @scheduledTasks[length]
            else if sfn.type == ScheduledTaskType.every
              sfn.scheduledTime += sfn.millis

          else
            # only increment if no task was run because there
            # is a new function at the index if a task was run
            i++

        @scheduledTasks.length = length

        if length > 0
          @loop()

module.exports = Api
