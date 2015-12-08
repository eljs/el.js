require 'shortcake'

task 'build', 'Build module and bundled crowdcontrol.js', ->
  exec 'node_modules/.bin/bebop -c'
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

task 'major', ['version'], ->
task 'minor', ['version'], ->
task 'patch', ['version'], ->
task 'version', 'change version of project', (opts) ->
  {stdout, stderr} = yield exec.quiet 'git status --porcelain'
  if stderr or stdout
    console.log 'working directory not clean'
    return

  yield invoke 'build-min'

  pkg     = require './package'
  version = pkg.version

  level = (opts.arguments.filter (v) -> v isnt 'version')[0]
  [major, minor, patch] = (parseInt n for n in version.split '.')

  switch level
    when 'major'
      newVersion = "#{major + 1}.0.0"
    when 'minor'
      newVersion = "#{major}.#{minor + 1}.0"
    when 'patch'
      newVersion = "#{major}.#{minor}.#{patch + 1}"
    else
      console.log 'Unable to parse versioning'
      process.exit 1

  console.log "v#{version} -> v#{newVersion}"
  console.log

  data = fs.readFileSync 'README.md', 'utf8'
  data = data.replace (new RegExp version, 'g'), newVersion
  fs.writeFileSync 'README.md', data, 'utf8'

  pkg.version = newVersion
  fs.writeFileSync 'package.json', (JSON.stringify pkg, null, 2), 'utf8'

  yield exec """
  git add .
  git commit -m #{newVersion}
  git tag v#{newVersion}
  """

task 'publish', 'publish project', ->
  exec.parallel '''
  git push
  git push --tags
  npm publish
  '''
