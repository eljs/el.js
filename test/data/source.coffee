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

describe 'Source Eventing', ->
  it 'should bind and unbind events', ->
    a = new Api
    source = new Source(name: 'test', api: a)

    val = 0
    source._on 'echo', (v)-> val = v
    source._trigger 'echo', 1
    val.should.equal 1

    source._off 'echo'
    source._trigger 'echo', 2
    val.should.equal 1

  it 'should bind and events and execute once', ->
    a = new Api
    source = new Source(name: 'test', api: a)

    val = 0
    source._once 'echo', (v)-> val = v
    source._trigger 'echo', 1
    val.should.equal 1

    source._trigger 'echo', 2
    val.should.equal 1

  it 'should prefix events with source name', ->
    a = new Api
    source = new Source(name: 'test', api: a)

    mediator = utils.mediator

    val = 0
    mediator.one 'test.echo', (v)-> val = v

    source._trigger 'echo', 1
    val.should.equal 1
