View = crowdcontrol.view.View
Source = crowdcontrol.data.Source

helpers = crowdcontrol.view.form.helpers
FormView = crowdcontrol.view.form.FormView
InputView = crowdcontrol.view.form.InputView
InputConfig = crowdcontrol.view.form.InputConfig

crowdcontrol.utils.log.DEBUG = true

api = new crowdcontrol.data.Api 'http://localhost:12345'

helpers.registerTag ((inputCfg)-> return inputCfg.hints.indexOf('email') >= 0), 'email-input'
helpers.registerValidator ((inputCfg) -> return inputCfg.hints.indexOf('email') >= 0), (model, name)->
  value = model[name].trim().toLowerCase()
  re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  if value.match(re)
    return value
  throw new Error "Enter a valid email."

class EmailInputView extends InputView
  tag: 'email-input'
  html: """
    <label __for="{ model.name }">{ model.name }</label>
    <input id="{ model.name }" name="{ model.name }" type="text" onchange="{ change }" onblur="{ change }" value ="{ model.value }"></input>
  """

new EmailInputView

class ExampleFormView extends FormView
  inputConfigs:[
    new InputConfig 'email', 'email-input', '', 'your@email.com', 'email'
  ]
  tag: 'example-form'
  html: """
    <form>
      <control input="{ inputs.email }" obs="{ obs }">
    </form>
  """

new ExampleFormView

