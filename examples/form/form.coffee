View = crowdcontrol.view.View
Source = crowdcontrol.data.Source

helpers = crowdcontrol.view.form.helpers
FormView = crowdcontrol.view.form.FormView
InputView = crowdcontrol.view.form.InputView
InputConfig = crowdcontrol.view.form.InputConfig

crowdcontrol.utils.log.DEBUG = true

api = new crowdcontrol.data.Api 'http://localhost:12345', ''

helpers.defaultTagName = 'basic-input'

# validation
helpers.registerTag ((inputCfg)-> return inputCfg.hints.indexOf('email') >= 0), 'email-input'
helpers.registerValidator ((inputCfg) -> return inputCfg.hints.indexOf('email') >= 0), (model, name)->
  value = model[name]
  throw new Error "Enter a valid email" if !value?

  value = value.trim().toLowerCase()
  re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  if value.match(re)
    return value
  throw new Error "Enter a valid email"

helpers.registerValidator ((inputCfg) -> return inputCfg.hints.indexOf('email') >= 0), (model, name)->
  value = model[name]
  if value.length > 0
    return api.get('email/' + value).then (data)->
      throw new Error "Email already exists"
    , ()->
      return value
  throw new Error "Email cannot be empty"

# views
class BasicInputView extends InputView
  tag: 'basic-input'
  html: """
    <label __for="{ model.name }">{ model.name }</label>
    <input id="{ model.name }" name="{ model.name }" type="text" onchange="{ change }" onblur="{ change }" value="{ model.value }" placeholder="{ model.placeholder }"></input>
  """
new BasicInputView

class EmailInputView extends BasicInputView
  tag: 'email-input'

new EmailInputView

class ExampleFormView extends FormView
  inputConfigs:[
    new InputConfig 'email', '', 'Anything but your@email.com', 'email'
    new InputConfig 'basic', '', 'No Validation On This One'
    new InputConfig 'example.nested.structure.1', '', 'Example Nested Object'
  ]
  model:
    basic: "This is prefilled!"
    example:
      nested:
        structure:
          ["Should not see", "This is also prefilled!"]
  tag: 'example-form'
  html: """
    <form onsubmit="{ submit }">
      <control input="{ inputs.email }"></control>
      <control input="{ inputs.basic }"></control>
      <control input="{ inputs['example.nested.structure.1'] }"></control>
      <button type="submit">Submit</button>
    </form>
  """

  submit: ()->
    console.log @ctx.model
    alert 'Success!'

new ExampleFormView

