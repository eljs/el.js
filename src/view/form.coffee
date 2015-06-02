# A Input is used to configure what Form generates
class Input
  # name is the name of the tag to render
  @name: ''

  # a space separate list of tags that the predicate should check
  @tags: ''
  constructor: (@name, @tags)->

class InputCondition
  constructor: (@predicate, @tagName)->

module.exports = Form =
  # lookup contains a list of predicate tagName pairs
  lookup: []

  # defaultTagName specifies what tag name is set if no lookup predicate is satisfied
  defaultTagName: 'form-input'

  # register a new lookup
  register: (predicate, tagName)->
    @lookup.push new InputCondition(predicate, tagName)

  # delete an existing lookup
  delete: (tagName)->
    for lookup, i in @lookup
      if lookup.tagName == tagName
        @lookup[i] = null

  # render a list of Input objects
  render: (inputs)->
    html = ''
    for input in inputs
      if !input?
        continue

      found = false
      for lookup in @lookup
        if !lookup?
          continue

        if lookup.predicate input
          html += """
            <#{lookup.tagName} model="{ model }" name="{ #{input.name} }" obs="{ obs }"/>
          """
          found = true

      if found
        html += """
          <#{ @defaultTagName } model="{ model }" name="{ #{input.name} }" obs="{ obs }"/>
        """

    return html
