View = require './view'

class Input extends View
  input: null
  errorMessage: ''
  errorHtml: '''
  <div class="error-container" if="{ errorMessage }">
    <div class="error-message">{ errorMessage }</div>
  </div>
  '''

  beforeInit: ()->
    @html += @errorHtml

  init: ()->
    @input.on 'validate', (pRef)=> @validate(pRef)

  getValue: (event)->
    return event.target.value

  change: (event)->
    {ref, name} = @input

    value = @getValue event
    if value == ref name
      return

    @input.ref.set name, value

    @clearError()
    @validate()

  error: (err)->
    @errorMessage = err

  clearError: ()->
    @errorMessage = ''

  # support pass by reference since observable.trigger doesn't return things
  validate: (pRef)->
    p = @input.validate @input.ref, @input.name
      .then (value)=>
        @update()
      .catch (err)=>
        @error(err)
        @update()
        throw err

    if pRef?
      pRef.p = p

    return p

module.exports = Input
