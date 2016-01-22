r = require('./riot')
riot = r()

CrowdControl =
  Views: require './views'

  tags: []
  start: (opts)->
    @tags = riot.mount('*', opts)
  update: ()->
    for tag in @tags
      tag.update()
  riot: r

if module.exports?
  module.exports = CrowdControl

if window?
  if window.Crowdstart?
    window.Crowdstart.Crowdcontrol = CrowdControl
  else
    window.Crowdstart =
      CrowdControl: CrowdControl
