#covers api, policy, and source

chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'

chai.use chaiAsPromised
should = chai.should()

_ = require 'underscore'
Q = require 'q'

Api = require '../../src/data/api'
Source = require '../../src/data/source'
utils = require '../../src/utils'
log = utils.log

describe 'Source Loading', ->
  it 'should try loading from data without API', ->
    a = new Api
    source = new Source(name: 'test', data: 'data')

    d = Q.defer()

    source.once Source.Events.LoadData, (data)->
      d.resolve data

    source.once Source.Events.LoadError, ()->
      d.resolve 'fail'

    setTimeout ()->
      d.reject()
    , 100

    d.promise.should.eventually.equal 'data'

  it 'should try loading and API', ->
    d = Q.defer()

    a = new Api 'http://localhost:12345'
    source = new Source(name: 'test', api: a, path: 'data.json')

    source.once Source.Events.LoadData, ()->
      d.resolve 'win'

    source.once Source.Events.LoadError, (resp)->
      log.warn(resp.stack)
      d.resolve 'fail'

    setTimeout ()->
      d.reject()
    , 100

    d.promise.should.eventually.equal 'win'

  it 'should try loading and fail with API and no endpoint', ->
    a = new Api
    source = new Source(name: 'test', api: a, path: 'test')

    d = Q.defer()

    source.once Source.Events.LoadData, ()->
      d.resolve 'win'

    source.once Source.Events.LoadError, ()->
      d.resolve 'fail'

    setTimeout ()->
      d.reject()
    , 100

    d.promise.should.eventually.equal 'fail'

describe 'Source Eventing', ->
  it 'should bind and unbind events', ->
    a = new Api
    source = new Source(name: 'test', api: a)

    val = 0
    source.on 'echo', (v)-> val = v
    source.trigger 'echo', 1
    val.should.equal 1

    source.off 'echo'
    source.trigger 'echo', 2
    val.should.equal 1

  it 'should bind and events and execute once', ->
    a = new Api
    source = new Source(name: 'test', api: a)

    val = 0
    source.once 'echo', (v)-> val = v
    source.trigger 'echo', 1
    val.should.equal 1

    source.trigger 'echo', 2
    val.should.equal 1

  it 'should prefix events with source name', ->
    a = new Api
    source = new Source(name: 'test', api: a)

    mediator = utils.mediator

    val = 0
    mediator.one 'test.echo', (v)-> val = v

    source.trigger 'echo', 1
    val.should.equal 1
