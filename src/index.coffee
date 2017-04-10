import isFunction       from 'es-is/function'
import riot             from 'riot/lib/riot'

import Views            from './views'
import {scheduleUpdate} from './schedule'

El =
  # deprecated
  Views:    Views

  View:     Views.View
  Form:     Views.Form
  Input:    Views.Input

  riot: riot
  scheduleUpdate: ()->
    scheduleUpdate()

for k, v of riot
  do (k, v) ->
    if isFunction v
      El[k] = ->
        v.apply riot, arguments

export default El
