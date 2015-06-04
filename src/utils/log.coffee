log = ()->
  console.log.apply console, arguments if log.DEBUG

log.DEBUG = false

log.debug = log

log.info = ()->
  console.log.apply console, arguments

log.warn = ()->
  console.log 'WARN:'
  console.log.apply console, arguments

log.error = ()->
  console.log 'ERROR:'
  console.log.apply console, arguments
  throw new arguments[0]

module.exports = log
