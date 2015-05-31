_ = require 'underscore'
shim = require('../utils').shim

class Source
  ### Basic Info ###

  # name is used to prepend events as well use notation such as 'users' or 'user'
  name: null

  ### Static Data ###

  # data is backing data for non-api loaders if no api is specified.
  data: null

  ### Dynamic Data ###

  # api is object of API type, specifies the api to hit. If this is not present, then fallback to data
  api: null

  # policy refers how the Source loads and saves data
  # policy tells the source how often to reload data and how to batch data for example
  # policy also preprocesses data
  policy: null

  constructor: (@options)->
    _.extend @, @options

source = (options)->
  l = new Loader(options)
  shim.observable l
  return l

module.exports = source
