riot = require 'riot'

CrowdControl =
  Views: require './views'
  start: (opts)->
    riot.mount('*', opts)

if module.exports?
  module.exports = CrowdControl

if window?
  if window.Crowdstart?
    window.Crowdstart.Crowdcontrol = CrowdControl
  else
    window.Crowdstart =
      CrowdControl: CrowdControl

  window.riot = riot
