_ = require 'underscore'

utils = require('../utils')
promise = utils.shim.promise
xhr = utils.shim.xhr

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

# map of apis by name
apis = {}

class Api
  scheduledTasks: null

  # url is api base path such as https://api.crowdstart.com
  url: ''

  # token is the api token to set as bearer for auth
  token: ''

  constructor: (@url = '', @token = '')->
    @scheduledTasks = []

    url = @url
    if url[url.length-1] == '/'
      @url = url.substring 0, url.length - 1

  # retrieve a cached api object by name
  @get: (name = '')->
    return apis[name]

  # cache the api object by name so you can retrieve it later
  register: (name = '')->
    apis[name] = @

  # get/post/put/patch/delete send a GET/POST/PUT/PATCH/DELETE request
  #  path is appending to the url to determine the endpoint
  #    ex. path = 'user' creates a request to 'https://api.crowdstart.com/user'
  #
  #  return a promise
  get:    (path)->
    p = path
    if p[0] != '/'
      p = '/' + path
    return xhr
      method: 'GET'
      contentType: "application/json",
      headers:
        Authorization: @token
      url: @url + p

  post:   (path, data)->
    p = path
    if p[0] != '/'
      p = '/' + path
    return xhr
      method: 'POST'
      contentType: "application/json",
      headers:
        Authorization: @token
      url: @url + p
      data: data

  put:    (path, data)->
    p = path
    if p[0] != '/'
      p = '/' + path
    return xhr
      method: 'PUT'
      contentType: "application/json",
      headers:
        Authorization: @token
      url: @url + p
      data: data

  patch:  (path, data)->
    p = path
    if p[0] != '/'
      p = '/' + path
    return xhr
      method: 'PATCH'
      contentType: "application/json",
      headers:
        Authorization: @token
      url: @url + p
      data: data

  delete: (path)->
    p = path
    if p[0] != '/'
      p = '/' + path
    return xhr
      method: 'DELETE'
      contentType: "application/json",
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
