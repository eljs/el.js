import Promise  from 'broken'
import riot     from 'riot/lib/riot'
import {raf}    from 'es-raf'

todos = {}
rafId = -1
p = null
id = 0

window.Promise               ?= Promise
window.requestAnimationFrame ?= raf

scheduleUpdate = (tag)->
  if !p
    p = new Promise
    p.then ()->
      for _, todo of todos
        todo.update()
      p = null
      todos = {}
      rafId = -1

  if todos['*']
    return p

  if !tag
    todos =
      '*': riot
  else if !tag.update?
    throw new Error 'tag has no update routine'
  else
    currentTag = tag

    while currentTag?
      parentTag = currentTag.parent
      if !currentTag._schedulingId
        currentTag._schedulingId = id++
      else if todos[currentTag.schedulingId]?
        return p
      currentTag = parentTag

    todos[tag._schedulingId] = tag

  if rafId == -1
    rafId = requestAnimationFrame ()->
      p.resolve()

  return p


export { scheduleUpdate }
