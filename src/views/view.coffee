import isFunction   from 'es-is/function'
import objectAssign from 'es-object-assign'
import riot         from 'riot/lib/riot'

import {scheduleUpdate} from '../schedule'

setPrototypeOf = (()->
  setProtoOf = (obj, proto)->
    obj.__proto__ = proto

  mixinProperties = (obj, proto)->
    for prop of proto
      obj[prop] = proto[prop] if !obj[prop]?

  return if Object.setPrototypeOf || {__proto__:[]} instanceof Array then setProtoOf else mixinProperties
)()

collapsePrototype = (collapse, proto)->
  if proto == View.prototype
    return

  parentProto = Object.getPrototypeOf proto
  collapsePrototype collapse, parentProto

  if members = Object.getOwnPropertyNames parentProto
    for member in members
      collapse[member] = parentProto[member]

  objectAssign collapse, parentProto

class View
  @register: ->
    new @

  tag:    ''
  html:   ''
  css:    ''
  attrs:  ''
  events: null

  constructor: ->
    newProto = collapsePrototype {}, @

    @beforeInit()

    riot.tag @tag, @html, @css, @attrs, (opts)->
      if newProto?
        for k, v of newProto
          if isFunction(v)
            do (v) =>
              if @[k]?
                oldFn = @[k]
                @[k] = (args...)=>
                  oldFn.apply @, args
                  return v.apply @, args
              else
                @[k] = (args...)=>
                  return v.apply @, args
          else
            @[k] = v

      # Loop up the parents setting parent as the prototype so you have access to vars on it
      # Might be terrible, might be great, who knows?
      self = @
      parent = self.parent ? opts.parent
      proto = Object.getPrototypeOf self
      while parent && parent != proto
        setPrototypeOf self, parent
        self = parent
        parent = self.parent
        proto = Object.getPrototypeOf self

      if opts?
        for k, v of opts
          @[k] = v

      if @events?
        for name, handler of @events
          do (name, handler) =>
            if typeof handler == 'string'
              @on name, (args...)=> @[handler].apply @, args
            else
              @on name, (args...)=> handler.apply @, args

      @init opts

  beforeInit: ->
  init: ->
  scheduleUpdate: ->
    scheduleUpdate @

export default View
