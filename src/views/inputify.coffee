import Promise     from 'broken'
import refer       from 'referential'
import isFunction  from 'es-is/function'
import observable  from 'riot-observable'

isRef = (o) -> o? and isFunction o.ref

# inputify takes a model and a configuration and returns observable values
#   data: an generic dictionary object that you want to generate observable properties from
#   configs: a mapping of model values to a middleware stack eg.
#       field1: middleware
#       where middleware is an array of (value, name, model)-> value
inputify = (data, configs = {}) ->
  ref = data
  if !isRef ref
    ref = refer data
  inputs = {}

  for name, config of configs
    do (name, config)->
      middleware = []

      if config && config.length > 0
        for middlewareFn in config
          do (name, middlewareFn)->
            middleware.push (pair)->
              [ref, name] = pair
              return Promise.resolve pair
                .then (pair)->
                  return middlewareFn.call(pair[0], pair[0].get(pair[1]), pair[1], pair[0])
                .then (v)->
                  ref.set(name, v)
                  return pair

      middleware.push (pair)->
        [ref, name] = pair
        # on success resolve the value in the ref
        return Promise.resolve ref.get name

      validate = (ref, name)->
        p = Promise.resolve [ref, name]
        for middlewareFn in middleware
          p = p.then middlewareFn
        return p

      input =
        name:   name
        ref:    ref

        config: config
        validate: validate

      # make the input an observable so both form and input can observe it
      observable input

      inputs[name] = input

  return inputs

export default inputify
