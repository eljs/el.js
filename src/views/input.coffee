import View from './view'

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
    @html += @errorHtml

  init: ->
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

  chaned: ->

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
