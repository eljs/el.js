import riot from 'riot'

export default CrowdControl =
  Views: require './views'

  tags: []

  start: (opts) ->
    @tags = riot.mount('*', opts)

  update: ->
    for tag in @tags
      tag.update()
