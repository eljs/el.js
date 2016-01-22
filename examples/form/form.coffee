refer = require 'referential'
window.riot = require 'riot'

CrowdControl = require '../../src/'

window.Crowdcontrol = CrowdControl

View    = CrowdControl.Views.View
Form    = CrowdControl.Views.Form
Input   = CrowdControl.Views.Input

# validation
isEmail = (value)->
  throw new Error "Enter a valid email" if !value?

  value = value.trim().toLowerCase()
  re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  if value.match(re)
    return value
  throw new Error "Enter a valid email"

doesEmailExist = (value)->
  throw new Error "Email cannot be empty" if value.length == 0

  return new Promise (resolve, reject)->
    $.get('/email/' + value).then (res)->
      reject(Error "Email already exists")
    , ()->
      resolve value

# views
class BasicInput extends Input
  tag: 'basic-input'
  html: """
    <label __for="{ label }">{ label }</label>
    <input id="{ input.name }" name="{ input.name }" type="text" onchange="{ change }" onblur="{ change }" value="{ input.ref(input.name) }" placeholder="{ placeholder }"></input>
  """

  getValue: (event)->
    return $(event.target).val()

BasicInput.register()

class EmailInput extends BasicInput
  tag: 'email-input'

EmailInput.register()

class ExampleForm extends Form
  configs:
    email: [
      isEmail
      doesEmailExist
    ]
    basic: null
    'example.nested.structure.1': null
  tag: 'example-form'
  html: """
    <form onsubmit="{ submit }">
      <email-input label="Email" input="{ inputs.email }"></email-input>
      <basic-input label="Basic Input" input="{ inputs.basic }"></basic-input>
      <basic-input label="Nested Input" input="{ inputs['example.nested.structure.1'] }"></basic-input>
      <button type="submit">Submit</button>
    </form>
  """

  init: ()->
    @data = refer
      basic: "This is prefilled!"
      example:
        nested:
          structure:
            ["Should not see", "This is also prefilled!"]

    super

  _submit: (event)->
    console.log @data()
    alert 'Success!'

ExampleForm.register()

$ ()->
  CrowdControl.start()

