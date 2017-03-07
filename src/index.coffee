import riot  from 'riot'

import Views from './views'

export default CrowdControl =
  Views: Views

  tags: []

  start: (opts) ->
    @tags = riot.mount('*', opts)

  update: ->
    for tag in @tags
      tag.update()
