utils = require '../utils'
riot = utils.shim.riot
_ = require 'underscore'

Q = require 'q'

View = require './view'

# An InputConfig is used to configure what Form generates
class InputConfig
  # name of the property on the model
  name: ''

  # name of the tag for riot to mount for the input
  tag: ''

  # default value of input
  default: ''

  # placeholder of input
  placeholder: ''

  # hints is a space separate list of text descriptors that the predicate should check
  hints: ''

  constructor: (@name, @tag, @default, @placeholder, @hints)->

# An Input contains the data for creating an input
class Input
  # name of the tag for riot to mount for the input
  tag: ''

  # model is the value to pass into the input tag for opt.model
  model: {}

  # validator for validating the input value, takes a model, name on the model, and returns a promise
  validator: ()->

  constructor: (@tag, @model, @validator)->

class ValidatorCondition
  constructor: (@predicate, @validatorFn)->

class InputCondition
  constructor: (@predicate, @tagName)->

helpers =
  # tagLookup contains a list of predicate tagName pairs
  tagLookup: []

  # validatorLookup contains a list of predicate validatorFn pairs
  validatorLookup: []

  # defaultTagName specifies what tag name is set if no lookup predicate is satisfied
  defaultTagName: 'form-input'

  # errorTag specifies the tag to use for form validation errors
  errorTag: 'form-error'

  # registerValidator takes a predicate of type (InputConfig) -> bool and
  #  a validatorFn of type (string[property of Object]) -> promise,
  #  resolve using the sanitized value or reject a error message
  registerValidator: (predicate, validatorFn)->
    if _.isFunction(validatorFn)
      @tagLookup.push new ValidatorCondition(predicate, validatorFn)

  # registerValidator takes a predicate of type (InputConfig) -> bool and tagName
  registerTag: (predicate, tagName)->
    @tagLookup.push new InputCondition(predicate, tagName)

  # delete an existing lookup
  deleteTag: (tagName)->
    for lookup, i in @tagLookup
      if lookup.tagName == tagName
        @tagLookup[i] = null

  # delete an existing validator
  deleteValidator: (predicate, validatorFn)->
    for lookup, i in @validatorLookup
      if lookup.validatorFn == validatorFn
        @validatorLookup[i] = null

  # render a list of InputCfg objects, returns a map of Inputs indexed by input name
  render: (inputCfgs)->
    inputs = {}
    for inputCfg, i in inputCfgs
      if !inputCfg?
        continue

      validators = [
        (pair)->
          [model, name] = pair
          # on success resolve the value in the model
          d = Q.defer()
          d.resolve model[name]
          return d.promise
      ]

      for lookup in @validatorLookup
        if lookup.predicate inputCfg
          validators.unshift (pair)->
            [model, name] = pair
            validatorFn(model, name).then (v)->
              model[name] = v
              d = Q.defer()
              d.resolve pair
              return d.promise

      validator = (model, name)->
        result = Q([model, name])
        for validatorFn in validators
          result = result.then(validatorFn)
        return result

      found = false
      for lookup in @tagLookup
        if !lookup?
          continue

        if lookup.predicate inputCfg
          tag = lookup.tagName
          found = true
          break

      if !found
        tag = @defaultTagName

      model =
        name: inputCfg.name
        value: inputCfg.default
        placeholder: inputCfg.placeholder

      inputs[inputCfg.name] = new Input tag, model, validator

    return inputs

InputViewEvents =
  Set: 'set'
  Change: 'change'
  Error: 'error'
  ClearError: 'clear-error'

#InputView is the base view for form inputs
class InputView extends View
  @Events: InputViewEvents

  # errorHtml is appended to the normal html for displaying errors
  errorHtml: """
    <div class="error-message" if="{ hasError() }">{ error }</div>
  """

  init: ()->
    @html += @errorHtml

  events:
    "#{InputViewEvents.Set}": (name, value) ->
      if name == @model.name
        @model.value = value
        @update()

    "#{InputViewEvents.Error}": (name, message)->
      if name == @model.name
        @setError message
        @update()

    "#{InputViewEvents.ClearError}": (name)->
      if name == @model.name
        @clearError()
        @update()

  mixins:
    change: (event) ->
      @obs.trigger InputViewEvents.Change, @model.name, event.target

    hasError: ()->
      return @error != null && @error.length > 0

    setError: (message)->
      @error = message

    clearError: ()->
      @setError(null)

  js: (opts)->
    @model = opts.input.model

# The control tag takes an Input object as opts and mounts a custom input tag
#  use this tag in your FormView backed html templates to generate the template specified
#  by form.helpers.render output.
#
#  Passing in the input and the observable which are on the FormView context
#
#   Example: <control input="{ inputs.email }" obs="{ obs }">
#
riot.tag "control", "", (opts)->
  input = opts.input
  obs = opts.obs
  riot.mount @root, input.tag, opts

#FormView is the base view for a set of form inputs
class FormView extends View
  # inputConfigs is an array of InputConfig objects
  inputConfigs: null

  # inputs is a map of input names to Input objects
  #  usually generated form inputConfigs
  inputs: {}

  # getValue converts the element firing the event to a single value
  getValue: (el)->
    return el.value

  init: ()->
    @inputs = helpers.render(@inputConfigs) if @inputConfigs?

  events:
    "#{InputViewEvents.Change}": (name, target)->
      input = @inputs[name]
      oldValue = @model[name]
      @model[name] = @view.getValue(target)
      input.validator(@model, name).done (value)=>
        @obs.trigger InputViewEvents.Set, name, value
      , (err)=>
        @model[name] = oldValue
        @obs.trigger InputViewEvents.Error err

  js: ()->
    @view.initFormGroup.apply @

  initFormGroup: ()->
    @inputs = @view.inputs

module.exports =
  helpers: helpers

  FormView: FormView
  InputView: InputView

  Input: Input
  InputConfig: InputConfig
