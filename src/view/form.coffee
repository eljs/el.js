utils = require '../utils'
log = utils.log
riot = utils.shim.riot
_ = require 'underscore'

Q = require 'q'

View = require './view'

# An InputConfig is used to configure what Form generates
class InputConfig
  # name of the property on the model
  name: ''

  # default value of input
  default: ''

  # placeholder of input
  placeholder: ''

  # hints is a space separate list of text descriptors that the predicate should check
  hints: ''

  constructor: (@name, @default='', @placeholder='', @hints = '')->

# An Input contains the data for creating an input
class Input
  # name of the tag for riot to mount for the input
  tag: ''

  # model is the value to pass into the input tag for opt.model
  model: {}

  # validator for validating the input value, takes a model, name on the model, and returns a promise
  validator: ()->

  # obs object for event capture, set by form view
  obs: null

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
  #  a validatorFn of type (string[property of Object]) -> promise or value/throw error,
  #  resolve using the sanitized value or reject a error message
  registerValidator: (predicate, validatorFn)->
    if _.isFunction(validatorFn)
      @validatorLookup.push new ValidatorCondition(predicate, validatorFn)

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

      validators = []

      do (validators)=>
        for lookup in @validatorLookup
          if lookup.predicate inputCfg
            validatorFn = lookup.validatorFn
            do (validatorFn)->
              validators.push (pair)->
                [model, name] = pair
                p = Q(pair).then((pair) -> return validatorFn(pair[0], pair[1])).then (v)->
                  model[name] = v
                  d = Q.defer()
                  d.resolve pair
                  return d.promise

        validators.push (pair)->
          [model, name] = pair
          # on success resolve the value in the model
          d = Q.defer()
          d.resolve model[name]
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
  Result: 'input-result'
  Get: 'input-get'
  Set: 'input-set'
  Change: 'input-change'
  Error: 'input-error'
  ClearError: 'input-clear-error'

#InputView is the base view for form inputs
class InputView extends View
  @Events: InputViewEvents

  # getValue converts the element firing the event to a single value
  getValue: (el)->
    return el.value

  # errorHtml is appended to the normal html for displaying errors
  errorHtml: """
    <div class="error-container" if="{ hasError() }">
      <div class="error-message">{ error }</div>
    </div>
  """

  init: ()->
    @html += @errorHtml

  events:
    "#{InputViewEvents.Set}": (name, value) ->
      if name == @model.name
        @clearError()
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

  change: (event) ->
    value = @getValue(event.target)
    if value != @model.value
      @obs.trigger InputViewEvents.Change, @model.name, value
    @model.value = value

  hasError: ()->
    error = @error
    return error? && error.length? && error.length > 0

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
  if input?
    opts.obs = input.obs
    riot.mount @root, input.tag, opts

FormViewEvents =
  Submit: 'form-submit'
  SubmitFailed: 'form-submit-failed'

#FormView is the base view for a set of form inputs
class FormView extends View
  @Events: FormViewEvents

  # inputConfigs is an array of InputConfig objects
  inputConfigs: null

  # inputs is a map of input names to Input objects
  #  usually generated form inputConfigs
  # ctx.inputs: {}

  events:
    "#{InputViewEvents.Get}": (name)->
      @obs.trigger InputViewEvents.Result, (@_get @model, name)

    "#{InputViewEvents.Change}": (name, newValue)->
      @fullyValidated = false
      [model, lastName] = @_set @model, name, newValue
      input = @inputs[name]

      input.validator(model, lastName).done (value)=>
        @obs.trigger InputViewEvents.Set, name, value
      , (err)=>
        log "Validation error has occured", err.stack
        @obs.trigger InputViewEvents.Error, name, err.message

  # custom submit handler, do not bind to form
  _submit: (event)->

  # submit to use for binding form
  submit: (event)->
    event.preventDefault()

    # do a real submit
    if @fullyValidated
      @_submit(event)
      return

    names = []
    promises = []
    for name, input of @inputs
      names.push name
      promises.push input.validator(@model, name)

    return Q.allSettled(promises).done (results)=>
      rejected = false
      for result, i in results
        if result.state == 'rejected'
          rejected = true
          @obs.trigger InputViewEvents.Error, names[i], result.reason.message

      if rejected
        @obs.trigger FormViewEvents.SubmitFailed, @model
        return

      @fullyValidated = true
      @obs.trigger FormViewEvents.Submit, @model
      @_submit event

  _get: (model, path)->
    names = path.split '.'

    if names.length == 1
      return model[path]

    currentObject = model
    for name in names
      if !currentObject[name]?
        return undefined

      currentObject = currentObject[name]

    return currentObject[lastName]

  _set: (model, path, value)->
    # expand names that are paths
    names = path.split '.'

    if names.length == 1
      model[path] = value
      return [model, path]

    lastName = names.pop()

    currentObject = model
    for name in names
      if currentObject[name]?
        currentObject = currentObject[name]
        continue

      if _.isNumber name
        currentObject[name] = []
      else
        currentObject[name] = {}

      currentObject = currentObject[name]

    currentObject[lastName] = value
    return [currentObject, lastName]

  js: ()->
    @initFormGroup()

  initFormGroup: ()->
    if @inputConfigs?
      if !@inputs?
        @inputs = inputs = helpers.render @inputConfigs
      else
        inputs = @inputs

      for key, input of inputs
        input.obs = @obs

      # controls which submit route we take
      @fullyValidated = false

      # asssumes model is object
      traverse @model, (key, value)->
        if inputs[key]?
          inputs[key].model.value = value

traverse = (obj, fn, key = '')->
  if _.isArray(obj) || _.isObject(obj)
    for k, v of obj
      traverse v, fn, if key == '' then k else (key + '.') + k
  else
    fn key, obj

module.exports =
  helpers: helpers

  FormView: FormView
  InputView: InputView

  Input: Input
  InputConfig: InputConfig
