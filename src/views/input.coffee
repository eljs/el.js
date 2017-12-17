import View from './view'
import observable from 'riot-observable'

# Input binds to specific fields in the data tree and automatically
# updates the UI from the data tree on update and updates fields in
# the data tree on user interaction.
class Input extends View
  input: null

  # Is the input validated?
  #
  # Input state is calculated like this:
  # initial: @value = false
  # valid:   @value = true
  # invald:  @value = false && @errorMessage != ''
  valid: false

  # Records the error from any validation middleware if any
  errorMessage: ''

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
        @_change v1, true
        @scheduleUpdate()

  getValue: (event) ->
    return event.target.value

  change: (event) ->
    value = @getValue event

    @_change value

  _change: (value, forced) ->
    {ref, name} = @input

    if !forced && value == ref.get name
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
