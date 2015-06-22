exec = require('executive').interactive

task 'build', 'Build module and bundled crowdcontrol.js', ->
  exec 'node_modules/.bin/bebop --compile-only'
  exec 'node_modules/.bin/coffee -bcm -o lib/ src/'

task 'watch', 'watch for changes and recompile', ->
  exec 'node_modules/.bin/bebop'

task 'build-min', 'Build minified crowdcontrol.min.js', ->
  exec 'node_modules/.bin/requisite src/index.coffee -m -o crowdcontrol.min.js'

task 'example', 'Launch Examples', ->
  exec 'coffee examples/server.coffee'
  exec 'cake watch'

task 'test', 'Run tests', ->
  exec 'node_modules/.bin/coffee -bcm -o .test/ test/'
  exec [
    'cake build'
    'NODE_ENV=test
    node_modules/.bin/mocha
    --compilers coffee:coffee-script/register
    --reporter spec
    --colors
    --timeout 60000
    --require test/_helper.js
    .test'
    ]
