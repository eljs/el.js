import View       from  './view'
import inputify   from  './inputify'

import Promise from 'broken'

# Supported Events:
#   submit - fired when form is submitted

class Form extends View
  # input for validate
  # configs: null

  # output from validate that's used for configuring InputViews
  # inputs: null

  # ref to use for validate
  # data: null

  # default transclude contents
  html:   '<yield/>'

  initInputs: ->
    @inputs = {}

    if @configs?
      @inputs = inputify @data, @configs

  init: ->
    @initInputs()

  submit: (e) ->
    ps = []
    for name, input of @inputs
      pRef = {}
      input.trigger 'validate', pRef
      if pRef.p?
        ps.push pRef.p

    p = Promise.settle(ps).then (results) =>
      for result in results
        if !result.isFulfilled()
          return
      @_submit.apply @, arguments

    if e?
      e.preventDefault()
      e.stopPropagation()

    return p

  _submit: ->
    # do actual submit stuff

export default Form
