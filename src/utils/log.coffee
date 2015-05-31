log = ()->
  console.log.apply console.log, arguments if log.DEBUG

log.DEBUG = false

log.debug = log

log.info = ()->
  console.log.apply console.log, arguments

log.warn = ()->
  console.log 'WARN:'
  console.log.apply console.log, arguments

log.error = ()->
  console.log 'ERROR:'
  console.log.apply console.log, arguments

module.exports = log
