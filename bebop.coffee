exec = require 'executive'
fs   = require 'fs'
path = require 'path'

debounce = (fn, wait = 500) ->
  last = (new Date) - wait
  ->
    now = new Date

    # Return if we haven't waited long enough
    return if wait > (now - last)

    fn.apply null, arguments
    last = now

writeFile = (dst, content) ->
  fs.writeFile dst, content, 'utf8', (err) ->
    console.error err if err?

compileCoffee = (src) ->
  return
  return unless /^src|src\/index.coffee$/.test src
  exec 'cake build'

coffeeCompiler = debounce compileCoffee

module.exports =
  port: 4242

  cwd: process.cwd()

  exclude: [
    /lib/
    /node_modules/
    /vendor/
  ]

  compilers:
    coffee: coffeeCompiler
