fs   = require 'fs'
path = require 'path'

requisite = 'node_modules/.bin/requisite -g'

files =
  js:
    in:  'src/crowdcontrol.coffee'
    out: 'crowdcontrol.js'
  exampleTableJs:
    in:  'examples/table/table.coffee'
    out: 'examples/table/table.js'


module.exports =
  port: 4242

  cwd: process.cwd()

  exclude: [
    /css/
    /lib/
    /node_modules/
    /vendor/
  ]

  compilers:
    coffee: (src) ->
      if /examples.table/.test src
        return "#{requisite} #{files.exampleTableJs.in} -o #{files.exampleTableJs.out}"

      if /^src/.test src
        return "#{requisite} #{files.js.in} -o #{files.js.out}"

      if /src\/checkout.coffee/.test src
        return "#{requisite} #{files.js.in} -o #{files.js.out}"
