chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'

chai.use chaiAsPromised
should = chai.should()

_ = require 'underscore'
utils = require '../../src/utils'
promise = utils.shim.promise

Api = require '../../src/data/api'
log = require '../../src/utils/log'

describe 'Api Task Scheduling', ->
  it 'should schedule once after a 100 millis', ->
    d = promise.defer()
    fn = () ->
      d.resolve 'win'

    setTimeout ()->
      d.reject()
    , 200

    a = new Api
    a.scheduleOnce fn, 100
    d.promise.should.eventually.equal 'win'

  it 'should schedule every 100 millis and kill', ->
    d1 = promise.defer()
    d2 = promise.defer()
    d3 = promise.defer()
    n = 0
    fn = () ->
      n++
      switch n
        when 1
          d1.resolve 'win'
        when 2
          d2.resolve 'win'
          t.cancel()
        when 3
          d3.resolve 'fail'

    setTimeout ()->
      d1.reject()
      d2.reject()
      d3.resolve('win')
    , 400

    a = new Api
    t = a.scheduleEvery fn, 100

    d1.promise.should.eventually.equal 'win'
    d2.promise.should.eventually.equal 'win'
    d3.promise.should.eventually.equal 'win'

  it 'should schedule every 100 millis and immediately execute', ->
    d1 = promise.defer()
    d2 = promise.defer()
    n = 0
    fn = (dt) ->
      n++
      switch n
        when 1
          d1.resolve 'win'
        when 2
          d2.resolve 'win'

    setTimeout ()->
      d1.reject()
    , 50

    setTimeout ()->
      d2.reject()
      t.cancel()
    , 200

    a = new Api
    t = a.scheduleEvery fn, 100, true

    d1.promise.should.eventually.equal 'win'
    d2.promise.should.eventually.equal 'win'
