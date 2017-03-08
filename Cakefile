require 'shortcake'

use 'cake-version'
use 'cake-publish'

task 'clean', 'clean project', ->
  exec 'rm -rf dist'

task 'build', 'build project', (cb) ->
  handroll = require 'handroll'

  bundle = yield handroll.bundle
    entry:     'src/index.coffee'
    sourceMap: false
  yield bundle.write format: 'web'

  bundle = yield handroll.bundle
    entry:    'src/index.coffee'
    external: true
  yield bundle.write format: 'es'
  yield bundle.write format: 'cjs'

task 'build:min', 'build project', ['build'], ->
  exec 'uglifyjs crowdcontrol.js --compress --mangle --lint=false > crowdcontrol.min.js'

task 'example', 'Launch Examples', ->
  exec 'coffee examples/server.coffee'
  exec 'cake watch'

task 'server', 'Run static server for tests', do ->
  server = do require 'connect'

  (cb) ->
    port = process.env.PORT ? 3333

    server.use (require 'serve-static') './test/fixtures'
    server = require('http').createServer(server).listen port, cb

  task 'test', 'Run tests', ['build', 'static-server'], (opts) ->
    bail     = opts.bail     ? true
    coverage = opts.coverage ? false
    grep     = opts.grep     ? ''
    test     = opts.test     ? 'test/'
    verbose  = opts.verbose  ? ''

    bail    = '--bail' if bail
    grep    = "--grep #{opts.grep}" if grep
    verbose = 'DEBUG=nightmare VERBOSE=true CROWDSTART_DEBUG=1' if verbose

    if coverage
      bin = 'istanbul --print=none cover _mocha --'
    else
      bin = 'mocha'

    {status} = yield exec.interactive "NODE_ENV=test CROWDSTART_KEY='' CROWDSTART_ENDPOINT='' #{verbose}
          #{bin}
          --colors
          --reporter spec
          --timeout 10000000
          --compilers coffee:coffee-script/register
          --require co-mocha
          --require postmortem/register
          #{bail}
          #{grep}
          #{test}"

    server.close()
    process.exit status

task 'test:ci', 'Run tests', (opts) ->
  invoke 'test', bail: true, coverage: true

task 'coverage', 'Process coverage statistics', ->
  exec '''
    cat ./coverage/lcov.info | coveralls
    cat ./coverage/coverage.json | codecov
    rm -rf coverage/
    '''

task 'watch', 'watch for changes and recompile project', ->
  exec 'coffee -bcmw -o lib/ src/'
  exec 'node_modules/.bin/bebop'

task 'watch:test', 'watch for changes and re-run tests', ->
  invoke 'watch'

  require('vigil').watch __dirname, (filename, stats) ->
    if /^src/.test filename
      invoke 'test'

    if /^test/.test filename
      invoke 'test', test: filename

