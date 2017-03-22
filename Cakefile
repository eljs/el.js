require 'shortcake'

use 'cake-bundle'
use 'cake-outdated'
use 'cake-publish'
use 'cake-version'

task 'clean', 'clean project', ->
  exec 'rm -rf dist'

task 'build', 'build project', (cb) ->
  bundle.write
    entry:  'src/index.coffee'
    format: 'es'

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
  invoke 'test',
    bail:     true
    coverage: true

task 'test:coverage', 'Process coverage statistics', ->
  exec '''
    cat ./coverage/lcov.info | coveralls
    cat ./coverage/coverage.json | codecov
    rm -rf coverage/
    '''

task 'example', 'Launch Examples', ->
  exec 'coffee examples/server.coffee'
  exec 'cake watch'

task 'server', 'Run static server for tests', do ->
  server = do require 'connect'

  (cb) ->
    port = process.env.PORT ? 3333

    server.use (require 'serve-static') './test/fixtures'
    server = require('http').createServer(server).listen port, cb

task 'watch', 'watch for changes and recompile project', ->
 build = (filename) ->
    return if (running 'build')
    console.log filename, 'modified'
    invoke 'build'

  watch 'src/*',          build
  watch 'node_modules/*', build

task 'watch:test', 'watch for changes and re-run tests', ->
  test = ->
    return if (running 'build') or (running 'test')
    console.log filename, 'modified'
    invoke 'build', -> invoke 'test'

  watch 'src/*',          test
  watch 'node_modules/*', test
