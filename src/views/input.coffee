import View from './view'
import observable from 'riot-observable'

class Input extends View
  input: null
  valid: false
  errorMessage: ''
  errorHtml: '''
  <div class="error-container" if="{ errorMessage }">
    <div class="error-message">{ errorMessage }</div>
  </div>
  '''

  beforeInit: ->
    # Modify template before initialization
    @html += @errorHtml

  init: ->
    # if no input or lookup, throw error
    if !@input? && !@lookup? && !@bind?
      throw new Error 'No input or bind provided'

    # lookup input in parent input by key if things exist
    if !@input? && @inputs?
      @input = @inputs[(@lookup ? @bind)]

    # manually create using parent data
    if !@input?
      @input =
        name:       (@lookup ? @bind)
        ref:        @data
        validate:   (ref, name)->
          return Promise.resolve [ref, name]

      observable @input

    @input.on 'validate', (pRef) => @validate pRef

    # auto refresh on update of field
    @input.ref.on 'set', (n, v1, v2) =>
      if n == @input.name && v1 != v2
        @scheduleUpdate()

  getValue: (event) ->
    return event.target.value

  change: (event) ->
    {ref, name} = @input

    value = @getValue event
    if value == ref.get name
      return

    @input.ref.set name, value

    @clearError()
    @validate()

  error: (err) ->
    @errorMessage = err?.message ? err

  changed: ->

  clearError: ->
    @errorMessage = ''

  # support pass by reference since observable.trigger doesn't return things
  validate: (pRef) ->
    p = @input.validate @input.ref, @input.name
      .then (value)=>
        @changed(value)
        @valid = true
        @scheduleUpdate()
      .catch (err)=>
        @error(err)
        @valid = false
        @scheduleUpdate()
        throw err

    if pRef?
      pRef.p = p

    return p

export default Input
