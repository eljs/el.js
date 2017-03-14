fs   = require 'fs'
path = require 'path'

requisite = 'node_modules/.bin/requisite -g'

files =
  js:
    in:  'src/index.coffee'
    out: 'el.js'
  exampleFormJs:
    in:  'examples/form/form.coffee'
    out: 'examples/form/form.js'
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
      if /examples.form/.test src
        return "#{requisite} #{files.exampleFormJs.in} -o #{files.exampleFormJs.out}"

      if /examples.table/.test src
        return "#{requisite} #{files.exampleTableJs.in} -o #{files.exampleTableJs.out}"

      if /^src/.test src
        return "#{requisite} #{files.js.in} -o #{files.js.out}"

      if /src\/index.coffee/.test src
        return "#{requisite} #{files.js.in} -o #{files.js.out}"
