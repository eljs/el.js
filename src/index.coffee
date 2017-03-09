import riot  from 'riot'
import Views from './views'
import {isFunction} from 'es-is'

CrowdControl =
  # deprecated
  Views: Views

  View: Views.Form

  riot: riot

  start: ()->
    riot.mount('*', opts)

for k, v of riot
  if isFunction v
    CrowdControl[k] = ()->
      v.apply riot, arguments

export default CrowdControl
