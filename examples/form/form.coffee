View = crowdcontrol.view.View
Source = crowdcontrol.data.Source

api = new crowdcontrol.data.Api 'http://localhost:12345'

class FormInput extends View
  name: 'example-text-input'
  html: """
    <input id="{ opts.name }" name="{ opts.name }" type="text" onchange="{ change }" onblur="{ change }" value ="{ model[opts.name] }"></input>
  """

  js: ()->
