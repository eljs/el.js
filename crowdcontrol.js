(function (global) {
  var process = {
    title: 'browser',
    browser: true,
    env: {},
    argv: [],
    nextTick: function (fn) {
      setTimeout(fn, 0)
    },
    cwd: function () {
      return '/'
    },
    chdir: function () {
    }
  };
  // Require module
  function require(file, callback) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    // Handle async require
    if (typeof callback == 'function') {
      require.load(file, callback);
      return
    }
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
      id: file,
      require: require,
      filename: file,
      exports: {},
      loaded: false,
      parent: null,
      children: []
    };
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0
  };
  // define normal static module
  require.define = function (file, fn) {
    require.modules[file] = fn
  };
  global.require = require;
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/riot/riot.js
  require.define('riot/riot', function (module, exports, __dirname, __filename) {
    /* Riot v2.1.0, @license MIT, (c) 2015 Muut Inc. + contributors */
    ;
    (function (window) {
      // 'use strict' does not allow us to override the events properties https://github.com/muut/riotjs/blob/dev/lib/tag/update.js#L7-L10
      // it leads to the following error on firefox "setting a property that has only a getter"
      //'use strict'
      var riot = {
        version: 'v2.1.0',
        settings: {}
      };
      riot.observable = function (el) {
        el = el || {};
        var callbacks = {}, _id = 0;
        el.on = function (events, fn) {
          if (typeof fn == 'function') {
            fn._id = typeof fn._id == 'undefined' ? _id++ : fn._id;
            events.replace(/\S+/g, function (name, pos) {
              (callbacks[name] = callbacks[name] || []).push(fn);
              fn.typed = pos > 0
            })
          }
          return el
        };
        el.off = function (events, fn) {
          if (events == '*')
            callbacks = {};
          else {
            events.replace(/\S+/g, function (name) {
              if (fn) {
                var arr = callbacks[name];
                for (var i = 0, cb; cb = arr && arr[i]; ++i) {
                  if (cb._id == fn._id) {
                    arr.splice(i, 1);
                    i--
                  }
                }
              } else {
                callbacks[name] = []
              }
            })
          }
          return el
        };
        // only single event supported
        el.one = function (name, fn) {
          function on() {
            el.off(name, on);
            fn.apply(el, arguments)
          }
          return el.on(name, on)
        };
        el.trigger = function (name) {
          var args = [].slice.call(arguments, 1), fns = callbacks[name] || [];
          for (var i = 0, fn; fn = fns[i]; ++i) {
            if (!fn.busy) {
              fn.busy = 1;
              fn.apply(el, fn.typed ? [name].concat(args) : args);
              if (fns[i] !== fn) {
                i--
              }
              fn.busy = 0
            }
          }
          if (callbacks.all && name != 'all') {
            el.trigger.apply(el, [
              'all',
              name
            ].concat(args))
          }
          return el
        };
        return el
      };
      riot.mixin = function () {
        var registeredMixins = {};
        return function (name, mixin) {
          if (!mixin)
            return registeredMixins[name];
          else
            registeredMixins[name] = mixin
        }
      }();
      (function (riot, evt, window) {
        // browsers only
        if (!window)
          return;
        var loc = window.location, fns = riot.observable(), win = window, started = false, current;
        function hash() {
          return loc.href.split('#')[1] || ''
        }
        function parser(path) {
          return path.split('/')
        }
        function emit(path) {
          if (path.type)
            path = hash();
          if (path != current) {
            fns.trigger.apply(null, ['H'].concat(parser(path)));
            current = path
          }
        }
        var r = riot.route = function (arg) {
          // string
          if (arg[0]) {
            loc.hash = arg;
            emit(arg)  // function
          } else {
            fns.on('H', arg)
          }
        };
        r.exec = function (fn) {
          fn.apply(null, parser(hash()))
        };
        r.parser = function (fn) {
          parser = fn
        };
        r.stop = function () {
          if (!started)
            return;
          win.removeEventListener ? win.removeEventListener(evt, emit, false) : win.detachEvent('on' + evt, emit);
          fns.off('*');
          started = false
        };
        r.start = function () {
          if (started)
            return;
          win.addEventListener ? win.addEventListener(evt, emit, false) : win.attachEvent('on' + evt, emit);
          started = true
        };
        // autostart the router
        r.start()
      }(riot, 'hashchange', window));
      /*

//// How it works?


Three ways:

1. Expressions: tmpl('{ value }', data).
   Returns the result of evaluated expression as a raw object.

2. Templates: tmpl('Hi { name } { surname }', data).
   Returns a string with evaluated expressions.

3. Filters: tmpl('{ show: !done, highlight: active }', data).
   Returns a space separated list of trueish keys (mainly
   used for setting html classes), e.g. "show highlight".


// Template examples

tmpl('{ title || "Untitled" }', data)
tmpl('Results are { results ? "ready" : "loading" }', data)
tmpl('Today is { new Date() }', data)
tmpl('{ message.length > 140 && "Message is too long" }', data)
tmpl('This item got { Math.round(rating) } stars', data)
tmpl('<h1>{ title }</h1>{ body }', data)


// Falsy expressions in templates

In templates (as opposed to single expressions) all falsy values
except zero (undefined/null/false) will default to empty string:

tmpl('{ undefined } - { false } - { null } - { 0 }', {})
// will return: " - - - 0"

*/
      var brackets = function (orig, s, b) {
        return function (x) {
          // make sure we use the current setting
          s = riot.settings.brackets || orig;
          if (b != s)
            b = s.split(' ');
          // if regexp given, rewrite it with current brackets (only if differ from default)
          return x && x.test ? s == orig ? x : RegExp(x.source.replace(/\{/g, b[0].replace(/(?=.)/g, '\\')).replace(/\}/g, b[1].replace(/(?=.)/g, '\\')), x.global ? 'g' : '')  // else, get specific bracket
 : b[x]
        }
      }('{ }');
      var tmpl = function () {
        var cache = {}, reVars = /(['"\/]).*?[^\\]\1|\.\w*|\w*:|\b(?:(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|function *\()|([a-z_$]\w*)/gi;
        // [ 1               ][ 2  ][ 3 ][ 4                                                                                  ][ 5       ]
        // find variable names:
        // 1. skip quoted strings and regexps: "a b", 'a b', 'a \'b\'', /a b/
        // 2. skip object properties: .name
        // 3. skip object literals: name:
        // 4. skip javascript keywords
        // 5. match var name
        // build a template (or get it from cache), render with data
        return function (str, data) {
          return str && (cache[str] = cache[str] || tmpl(str))(data)
        };
        // create a template instance
        function tmpl(s, p) {
          // default template string to {}
          s = (s || brackets(0) + brackets(1)).replace(brackets(/\\{/g), '￰').replace(brackets(/\\}/g), '￱');
          // split string to expression and non-expresion parts
          p = split(s, extract(s, brackets(/{/), brackets(/}/)));
          return new Function('d', 'return ' + // is it a single expression or a template? i.e. {x} or <b>{x}</b>
          (!p[0] && !p[2] && !p[3]  // if expression, evaluate it
 ? expr(p[1])  // if template, evaluate all expressions in it
 : '[' + p.map(function (s, i) {
            // is it an expression or a string (every second part is an expression)
            return i % 2  // evaluate the expressions
 ? expr(s, true)  // process string parts of the template:
 : '"' + s  // preserve new lines
.replace(/\n/g, '\\n')  // escape quotes
.replace(/"/g, '\\"') + '"'
          }).join(',') + '].join("")').replace(/\uFFF0/g, brackets(0)).replace(/\uFFF1/g, brackets(1)) + ';')
        }
        // parse { ... } expression
        function expr(s, n) {
          s = s  // convert new lines to spaces
.replace(/\n/g, ' ')  // trim whitespace, brackets, strip comments
.replace(brackets(/^[{ ]+|[ }]+$|\/\*.+?\*\//g), '');
          // is it an object literal? i.e. { key : value }
          return /^\s*[\w- "']+ *:/.test(s)  // if object literal, return trueish keys
                                      // e.g.: { show: isOpen(), done: item.done } -> "show done"
 ? '[' + // extract key:val pairs, ignoring any nested objects
          extract(s, // name part: name:, "name":, 'name':, name :
          /["' ]*[\w- ]+["' ]*:/, // expression part: everything upto a comma followed by a name (see above) or end of line
          /,(?=["' ]*[\w- ]+["' ]*:)|}|$/).map(function (pair) {
            // get key, val parts
            return pair.replace(/^[ "']*(.+?)[ "']*: *(.+?),? *$/, function (_, k, v) {
              // wrap all conditional parts to ignore errors
              return v.replace(/[^&|=!><]+/g, wrap) + '?"' + k + '":"",'
            })
          }).join('') + '].join(" ").trim()'  // if js expression, evaluate as javascript
 : wrap(s, n)
        }
        // execute js w/o breaking on errors or undefined vars
        function wrap(s, nonull) {
          s = s.trim();
          return !s ? '' : '(function(v){try{v='  // prefix vars (name => data.name)
+ (s.replace(reVars, function (s, _, v) {
            return v ? '(d.' + v + '===undefined?' + (typeof window == 'undefined' ? 'global.' : 'window.') + v + ':d.' + v + ')' : s
          })  // break the expression if its empty (resulting in undefined value)
|| 'x') + '}catch(e){' + '}finally{return '  // default to empty string for falsy values except zero
+ (nonull === true ? '!v&&v!==0?"":v' : 'v') + '}}).call(d)'
        }
        // split string by an array of substrings
        function split(str, substrings) {
          var parts = [];
          substrings.map(function (sub, i) {
            // push matched expression and part before it
            i = str.indexOf(sub);
            parts.push(str.slice(0, i), sub);
            str = str.slice(i + sub.length)
          });
          // push the remaining part
          return parts.concat(str)
        }
        // match strings between opening and closing regexp, skipping any inner/nested matches
        function extract(str, open, close) {
          var start, level = 0, matches = [], re = new RegExp('(' + open.source + ')|(' + close.source + ')', 'g');
          str.replace(re, function (_, open, close, pos) {
            // if outer inner bracket, mark position
            if (!level && open)
              start = pos;
            // in(de)crease bracket level
            level += open ? 1 : -1;
            // if outer closing bracket, grab the match
            if (!level && close != null)
              matches.push(str.slice(start, pos + close.length))
          });
          return matches
        }
      }();
      // { key, i in items} -> { key, i, items }
      function loopKeys(expr) {
        var ret = { val: expr }, els = expr.split(/\s+in\s+/);
        if (els[1]) {
          ret.val = brackets(0) + els[1];
          els = els[0].slice(brackets(0).length).trim().split(/,\s*/);
          ret.key = els[0];
          ret.pos = els[1]
        }
        return ret
      }
      function mkitem(expr, key, val) {
        var item = {};
        item[expr.key] = key;
        if (expr.pos)
          item[expr.pos] = val;
        return item
      }
      /* Beware: heavy stuff */
      function _each(dom, parent, expr) {
        remAttr(dom, 'each');
        var template = dom.outerHTML, prev = dom.previousSibling, root = dom.parentNode, rendered = [], tags = [], checksum;
        expr = loopKeys(expr);
        function add(pos, item, tag) {
          rendered.splice(pos, 0, item);
          tags.splice(pos, 0, tag)
        }
        // clean template code
        parent.one('update', function () {
          root.removeChild(dom)
        }).one('premount', function () {
          if (root.stub)
            root = parent.root
        }).on('update', function () {
          var items = tmpl(expr.val, parent);
          if (!items)
            return;
          // object loop. any changes cause full redraw
          if (!Array.isArray(items)) {
            var testsum = JSON.stringify(items);
            if (testsum == checksum)
              return;
            checksum = testsum;
            // clear old items
            each(tags, function (tag) {
              tag.unmount()
            });
            rendered = [];
            tags = [];
            items = Object.keys(items).map(function (key) {
              return mkitem(expr, key, items[key])
            })
          }
          // unmount redundant
          each(rendered, function (item) {
            if (item instanceof Object) {
              // skip existing items
              if (items.indexOf(item) > -1) {
                return
              }
            } else {
              // find all non-objects
              var newItems = arrFindEquals(items, item), oldItems = arrFindEquals(rendered, item);
              // if more or equal amount, no need to remove
              if (newItems.length >= oldItems.length) {
                return
              }
            }
            var pos = rendered.indexOf(item), tag = tags[pos];
            if (tag) {
              tag.unmount();
              rendered.splice(pos, 1);
              tags.splice(pos, 1);
              // to let "each" know that this item is removed
              return false
            }
          });
          // mount new / reorder
          var prevBase = [].indexOf.call(root.childNodes, prev) + 1;
          each(items, function (item, i) {
            // start index search from position based on the current i
            var pos = items.indexOf(item, i), oldPos = rendered.indexOf(item, i);
            // if not found, search backwards from current i position
            pos < 0 && (pos = items.lastIndexOf(item, i));
            oldPos < 0 && (oldPos = rendered.lastIndexOf(item, i));
            if (!(item instanceof Object)) {
              // find all non-objects
              var newItems = arrFindEquals(items, item), oldItems = arrFindEquals(rendered, item);
              // if more, should mount one new
              if (newItems.length > oldItems.length) {
                oldPos = -1
              }
            }
            // mount new
            var nodes = root.childNodes;
            if (oldPos < 0) {
              if (!checksum && expr.key)
                var _item = mkitem(expr, item, pos);
              var tag = new Tag({ tmpl: template }, {
                before: nodes[prevBase + pos],
                parent: parent,
                root: root,
                item: _item || item
              });
              tag.mount();
              add(pos, item, tag);
              return true
            }
            // change pos value
            if (expr.pos && tags[oldPos][expr.pos] != pos) {
              tags[oldPos].one('update', function (item) {
                item[expr.pos] = pos
              });
              tags[oldPos].update()
            }
            // reorder
            if (pos != oldPos) {
              root.insertBefore(nodes[prevBase + oldPos], nodes[prevBase + (pos > oldPos ? pos + 1 : pos)]);
              return add(pos, rendered.splice(oldPos, 1)[0], tags.splice(oldPos, 1)[0])
            }
          });
          rendered = items.slice()
        }).one('updated', function () {
          walk(root, function (dom) {
            each(dom.attributes, function (attr) {
              if (/^(name|id)$/.test(attr.name))
                parent[attr.value] = dom
            })
          })
        })
      }
      function parseNamedElements(root, parent, childTags) {
        walk(root, function (dom) {
          if (dom.nodeType == 1) {
            dom.isLoop = 0;
            if (dom.parentNode && dom.parentNode.isLoop)
              dom.isLoop = 1;
            if (dom.getAttribute('each'))
              dom.isLoop = 1;
            // custom child tag
            var child = getTag(dom);
            if (child && !dom.isLoop) {
              var tag = new Tag(child, {
                  root: dom,
                  parent: parent
                }, dom.innerHTML), namedTag = dom.getAttribute('name'), tagName = namedTag && namedTag.indexOf(brackets(0)) < 0 ? namedTag : child.name, ptag = parent, cachedTag;
              while (!getTag(ptag.root)) {
                if (!ptag.parent)
                  break;
                ptag = ptag.parent
              }
              // fix for the parent attribute in the looped elements
              tag.parent = ptag;
              cachedTag = ptag.tags[tagName];
              // if there are multiple children tags having the same name
              if (cachedTag) {
                // if the parent tags property is not yet an array
                // create it adding the first cached tag
                if (!Array.isArray(cachedTag))
                  ptag.tags[tagName] = [cachedTag];
                // add the new nested tag to the array
                ptag.tags[tagName].push(tag)
              } else {
                ptag.tags[tagName] = tag
              }
              // empty the child node once we got its template
              // to avoid that its children get compiled multiple times
              dom.innerHTML = '';
              childTags.push(tag)
            }
            if (!dom.isLoop)
              each(dom.attributes, function (attr) {
                if (/^(name|id)$/.test(attr.name))
                  parent[attr.value] = dom
              })
          }
        })
      }
      function parseExpressions(root, tag, expressions) {
        function addExpr(dom, val, extra) {
          if (val.indexOf(brackets(0)) >= 0) {
            var expr = {
              dom: dom,
              expr: val
            };
            expressions.push(extend(expr, extra))
          }
        }
        walk(root, function (dom) {
          var type = dom.nodeType;
          // text node
          if (type == 3 && dom.parentNode.tagName != 'STYLE')
            addExpr(dom, dom.nodeValue);
          if (type != 1)
            return;
          /* element */
          // loop
          var attr = dom.getAttribute('each');
          if (attr) {
            _each(dom, tag, attr);
            return false
          }
          // attribute expressions
          each(dom.attributes, function (attr) {
            var name = attr.name, bool = name.split('__')[1];
            addExpr(dom, attr.value, {
              attr: bool || name,
              bool: bool
            });
            if (bool) {
              remAttr(dom, name);
              return false
            }
          });
          // skip custom tags
          if (getTag(dom))
            return false
        })
      }
      function Tag(impl, conf, innerHTML) {
        var self = riot.observable(this), opts = inherit(conf.opts) || {}, dom = mkdom(impl.tmpl), parent = conf.parent, expressions = [], childTags = [], root = conf.root, item = conf.item, fn = impl.fn, tagName = root.tagName.toLowerCase(), attr = {}, loopDom, TAG_ATTRIBUTES = /([\w\-]+)\s?=\s?['"]([^'"]+)["']/gim;
        if (fn && root._tag) {
          root._tag.unmount(true)
        }
        if (impl.attrs) {
          var attrs = impl.attrs.match(TAG_ATTRIBUTES);
          each(attrs, function (a) {
            var kv = a.split(/\s?=\s?/);
            root.setAttribute(kv[0], kv[1].replace(/['"]/g, ''))
          })
        }
        // keep a reference to the tag just created
        // so we will be able to mount this tag multiple times
        root._tag = this;
        // create a unique id to this tag
        // it could be handy to use it also to improve the virtual dom rendering speed
        this._id = fastAbs(~~(new Date().getTime() * Math.random()));
        extend(this, {
          parent: parent,
          root: root,
          opts: opts,
          tags: {}
        }, item);
        // grab attributes
        each(root.attributes, function (el) {
          attr[el.name] = el.value
        });
        if (dom.innerHTML && !/select/.test(tagName) && !/tbody/.test(tagName) && !/tr/.test(tagName))
          // replace all the yield tags with the tag inner html
          dom.innerHTML = replaceYield(dom.innerHTML, innerHTML);
        // options
        function updateOpts() {
          each(Object.keys(attr), function (name) {
            opts[name] = tmpl(attr[name], parent || self)
          })
        }
        this.update = function (data, init) {
          extend(self, data, item);
          updateOpts();
          self.trigger('update', item);
          update(expressions, self, item);
          self.trigger('updated')
        };
        this.mixin = function () {
          each(arguments, function (mix) {
            mix = 'string' == typeof mix ? riot.mixin(mix) : mix;
            each(Object.keys(mix), function (key) {
              // bind methods to self
              if ('init' != key)
                self[key] = 'function' == typeof mix[key] ? mix[key].bind(self) : mix[key]
            });
            // init method will be called automatically
            if (mix.init)
              mix.init.bind(self)()
          })
        };
        this.mount = function () {
          updateOpts();
          // initialiation
          fn && fn.call(self, opts);
          toggle(true);
          // parse layout after init. fn may calculate args for nested custom tags
          parseExpressions(dom, self, expressions);
          if (!self.parent)
            self.update();
          // internal use only, fixes #403
          self.trigger('premount');
          if (fn) {
            while (dom.firstChild)
              root.appendChild(dom.firstChild)
          } else {
            loopDom = dom.firstChild;
            root.insertBefore(loopDom, conf.before || null)  // null needed for IE8
          }
          if (root.stub)
            self.root = root = parent.root;
          // if it's not a child tag we can trigger its mount event
          if (!self.parent)
            self.trigger('mount')  // otherwise we need to wait that the parent event gets triggered
;
          else
            self.parent.one('mount', function () {
              self.trigger('mount')
            })
        };
        this.unmount = function (keepRootTag) {
          var el = fn ? root : loopDom, p = el.parentNode;
          if (p) {
            if (parent) {
              // remove this tag from the parent tags object
              // if there are multiple nested tags with same name..
              // remove this element form the array
              if (Array.isArray(parent.tags[tagName])) {
                each(parent.tags[tagName], function (tag, i) {
                  if (tag._id == self._id)
                    parent.tags[tagName].splice(i, 1)
                })
              } else
                // otherwise just delete the tag instance
                parent.tags[tagName] = undefined
            } else {
              while (el.firstChild)
                el.removeChild(el.firstChild)
            }
            if (!keepRootTag)
              p.removeChild(el)
          }
          self.trigger('unmount');
          toggle();
          self.off('*');
          // somehow ie8 does not like `delete root._tag`
          root._tag = null
        };
        function toggle(isMount) {
          // mount/unmount children
          each(childTags, function (child) {
            child[isMount ? 'mount' : 'unmount']()
          });
          // listen/unlisten parent (events flow one way from parent to children)
          if (parent) {
            var evt = isMount ? 'on' : 'off';
            parent[evt]('update', self.update)[evt]('unmount', self.unmount)
          }
        }
        // named elements available for fn
        parseNamedElements(dom, this, childTags)
      }
      function setEventHandler(name, handler, dom, tag, item) {
        dom[name] = function (e) {
          // cross browser event fix
          e = e || window.event;
          e.which = e.which || e.charCode || e.keyCode;
          e.target = e.target || e.srcElement;
          e.currentTarget = dom;
          e.item = item;
          // prevent default behaviour (by default)
          if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
            e.preventDefault && e.preventDefault();
            e.returnValue = false
          }
          if (!e.preventUpdate) {
            var el = item ? tag.parent : tag;
            el.update()
          }
        }
      }
      // used by if- attribute
      function insertTo(root, node, before) {
        if (root) {
          root.insertBefore(before, node);
          root.removeChild(node)
        }
      }
      // item = currently looped item
      function update(expressions, tag, item) {
        each(expressions, function (expr, i) {
          var dom = expr.dom, attrName = expr.attr, value = tmpl(expr.expr, tag), parent = expr.dom.parentNode;
          if (value == null)
            value = '';
          // leave out riot- prefixes from strings inside textarea
          if (parent && parent.tagName == 'TEXTAREA')
            value = value.replace(/riot-/g, '');
          // no change
          if (expr.value === value)
            return;
          expr.value = value;
          // text node
          if (!attrName)
            return dom.nodeValue = value.toString();
          // remove original attribute
          remAttr(dom, attrName);
          // event handler
          if (typeof value == 'function') {
            setEventHandler(attrName, value, dom, tag, item)  // if- conditional
          } else if (attrName == 'if') {
            var stub = expr.stub;
            // add to DOM
            if (value) {
              stub && insertTo(stub.parentNode, stub, dom)  // remove from DOM
            } else {
              stub = expr.stub = stub || document.createTextNode('');
              insertTo(dom.parentNode, dom, stub)
            }  // show / hide
          } else if (/^(show|hide)$/.test(attrName)) {
            if (attrName == 'hide')
              value = !value;
            dom.style.display = value ? '' : 'none'  // field value
          } else if (attrName == 'value') {
            dom.value = value  // <img src="{ expr }">
          } else if (attrName.slice(0, 5) == 'riot-') {
            attrName = attrName.slice(5);
            value ? dom.setAttribute(attrName, value) : remAttr(dom, attrName)
          } else {
            if (expr.bool) {
              dom[attrName] = value;
              if (!value)
                return;
              value = attrName
            }
            if (typeof value != 'object')
              dom.setAttribute(attrName, value)
          }
        })
      }
      function each(els, fn) {
        for (var i = 0, len = (els || []).length, el; i < len; i++) {
          el = els[i];
          // return false -> remove current item during loop
          if (el != null && fn(el, i) === false)
            i--
        }
        return els
      }
      function remAttr(dom, name) {
        dom.removeAttribute(name)
      }
      function fastAbs(nr) {
        return (nr ^ nr >> 31) - (nr >> 31)
      }
      // max 2 from objects allowed
      function extend(obj, from, from2) {
        from && each(Object.keys(from), function (key) {
          obj[key] = from[key]
        });
        return from2 ? extend(obj, from2) : obj
      }
      function checkIE() {
        if (window) {
          var ua = navigator.userAgent;
          var msie = ua.indexOf('MSIE ');
          if (msie > 0) {
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
          } else {
            return 0
          }
        }
      }
      function optionInnerHTML(el, html) {
        var opt = document.createElement('option'), valRegx = /value=[\"'](.+?)[\"']/, selRegx = /selected=[\"'](.+?)[\"']/, valuesMatch = html.match(valRegx), selectedMatch = html.match(selRegx);
        opt.innerHTML = html;
        if (valuesMatch) {
          opt.value = valuesMatch[1]
        }
        if (selectedMatch) {
          opt.setAttribute('riot-selected', selectedMatch[1])
        }
        el.appendChild(opt)
      }
      function tbodyInnerHTML(el, html, tagName) {
        var div = document.createElement('div');
        div.innerHTML = '<table>' + html + '</table>';
        if (/td|th/.test(tagName)) {
          el.appendChild(div.firstChild.firstChild.firstChild.firstChild)
        } else {
          el.appendChild(div.firstChild.firstChild.firstChild)
        }
      }
      function mkdom(template) {
        var tagName = template.trim().slice(1, 3).toLowerCase(), rootTag = /td|th/.test(tagName) ? 'tr' : tagName == 'tr' ? 'tbody' : 'div', el = mkEl(rootTag);
        el.stub = true;
        if (tagName === 'op' && ieVersion && ieVersion < 10) {
          optionInnerHTML(el, template)
        } else if ((rootTag === 'tbody' || rootTag === 'tr') && ieVersion && ieVersion < 10) {
          tbodyInnerHTML(el, template, tagName)
        } else
          el.innerHTML = template;
        return el
      }
      function walk(dom, fn) {
        if (dom) {
          if (fn(dom) === false)
            walk(dom.nextSibling, fn);
          else {
            dom = dom.firstChild;
            while (dom) {
              walk(dom, fn);
              dom = dom.nextSibling
            }
          }
        }
      }
      function mkEl(name) {
        return document.createElement(name)
      }
      function replaceYield(tmpl, innerHTML) {
        return tmpl.replace(/<(yield)\/?>(<\/\1>)?/gim, innerHTML || '')
      }
      function $$(selector, ctx) {
        ctx = ctx || document;
        return ctx.querySelectorAll(selector)
      }
      function arrDiff(arr1, arr2) {
        return arr1.filter(function (el) {
          return arr2.indexOf(el) < 0
        })
      }
      function arrFindEquals(arr, el) {
        return arr.filter(function (_el) {
          return _el === el
        })
      }
      function inherit(parent) {
        function Child() {
        }
        Child.prototype = parent;
        return new Child
      }
      /**
 *
 * Hacks needed for the old internet explorer versions [lower than IE10]
 *
 */
      var ieVersion = checkIE();
      function checkIE() {
        if (window) {
          var ua = navigator.userAgent;
          var msie = ua.indexOf('MSIE ');
          if (msie > 0) {
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
          } else {
            return 0
          }
        }
      }
      function tbodyInnerHTML(el, html, tagName) {
        var div = mkEl('div'), loops = /td|th/.test(tagName) ? 3 : 2, child;
        div.innerHTML = '<table>' + html + '</table>';
        child = div.firstChild;
        while (loops--) {
          child = child.firstChild
        }
        el.appendChild(child)
      }
      function optionInnerHTML(el, html) {
        var opt = mkEl('option'), valRegx = /value=[\"'](.+?)[\"']/, selRegx = /selected=[\"'](.+?)[\"']/, valuesMatch = html.match(valRegx), selectedMatch = html.match(selRegx);
        opt.innerHTML = html;
        if (valuesMatch) {
          opt.value = valuesMatch[1]
        }
        if (selectedMatch) {
          opt.setAttribute('riot-selected', selectedMatch[1])
        }
        el.appendChild(opt)
      }
      /*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/
      var virtualDom = [], tagImpl = {}, styleNode;
      function getTag(dom) {
        return tagImpl[dom.getAttribute('riot-tag') || dom.tagName.toLowerCase()]
      }
      function injectStyle(css) {
        styleNode = styleNode || mkEl('style');
        if (!document.head)
          return;
        if (styleNode.styleSheet)
          styleNode.styleSheet.cssText += css;
        else
          styleNode.innerHTML += css;
        if (!styleNode._rendered)
          if (styleNode.styleSheet)
            document.body.appendChild(styleNode);
          else
            document.head.appendChild(styleNode);
        styleNode._rendered = true
      }
      function mountTo(root, tagName, opts) {
        var tag = tagImpl[tagName], innerHTML = root.innerHTML;
        // clear the inner html
        root.innerHTML = '';
        if (tag && root)
          tag = new Tag(tag, {
            root: root,
            opts: opts
          }, innerHTML);
        if (tag && tag.mount) {
          tag.mount();
          virtualDom.push(tag);
          return tag.on('unmount', function () {
            virtualDom.splice(virtualDom.indexOf(tag), 1)
          })
        }
      }
      riot.tag = function (name, html, css, attrs, fn) {
        if (typeof attrs == 'function') {
          fn = attrs;
          if (/^[\w\-]+\s?=/.test(css)) {
            attrs = css;
            css = ''
          } else
            attrs = ''
        }
        if (typeof css == 'function')
          fn = css;
        else if (css)
          injectStyle(css);
        tagImpl[name] = {
          name: name,
          tmpl: html,
          attrs: attrs,
          fn: fn
        };
        return name
      };
      riot.mount = function (selector, tagName, opts) {
        var el, selctAllTags = function () {
            var keys = Object.keys(tagImpl);
            var list = keys.join(', ');
            each(keys, function (t) {
              list += ', *[riot-tag="' + t.trim() + '"]'
            });
            return list
          }, allTags, tags = [];
        if (typeof tagName == 'object') {
          opts = tagName;
          tagName = 0
        }
        // crawl the DOM to find the tag
        if (typeof selector == 'string') {
          if (selector == '*') {
            // select all the tags registered
            // and also the tags found with the riot-tag attribute set
            selector = allTags = selctAllTags()
          } else {
            selector.split(',').map(function (t) {
              selector += ', *[riot-tag="' + t.trim() + '"]'
            })
          }
          // or just the ones named like the selector
          el = $$(selector)
        }  // probably you have passed already a tag or a NodeList
        else
          el = selector;
        // select all the registered and mount them inside their root elements
        if (tagName == '*') {
          // get all custom tags
          tagName = allTags || selctAllTags();
          // if the root el it's just a single tag
          if (el.tagName) {
            el = $$(tagName, el)
          } else {
            var nodeList = [];
            // select all the children for all the different root elements
            each(el, function (tag) {
              nodeList = $$(tagName, tag)
            });
            el = nodeList
          }
          // get rid of the tagName
          tagName = 0
        }
        function push(root) {
          if (tagName && !root.getAttribute('riot-tag'))
            root.setAttribute('riot-tag', tagName);
          var name = tagName || root.getAttribute('riot-tag') || root.tagName.toLowerCase(), tag = mountTo(root, name, opts);
          if (tag)
            tags.push(tag)
        }
        // DOM node
        if (el.tagName)
          push(selector)  // selector or NodeList
;
        else
          each(el, push);
        return tags
      };
      // update everything
      riot.update = function () {
        return each(virtualDom, function (tag) {
          tag.update()
        })
      };
      // @deprecated
      riot.mountTo = riot.mount;
      // share methods for other riot parts, e.g. compiler
      riot.util = {
        brackets: brackets,
        tmpl: tmpl
      };
      // support CommonJS, AMD & browser
      if (typeof exports === 'object')
        module.exports = riot;
      else if (typeof define === 'function' && define.amd)
        define(function () {
          return riot
        });
      else
        window.riot = riot
    }(typeof window != 'undefined' ? window : undefined))
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/index.coffee
  require.define('./data', function (module, exports, __dirname, __filename) {
    module.exports = {
      Api: require('./data/api'),
      Source: require('./data/source'),
      Policy: require('./data/policy')
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/api.coffee
  require.define('./data/api', function (module, exports, __dirname, __filename) {
    var Api, Q, ScheduledTask, ScheduledTaskType, _, config, log, requestAnimationFrame, utils;
    _ = require('underscore/underscore');
    Q = require('q/q');
    config = require('./config');
    utils = require('./utils');
    log = utils.log;
    requestAnimationFrame = utils.shim.requestAnimationFrame;
    ScheduledTaskType = {
      every: 'every',
      once: 'once'
    };
    ScheduledTask = function () {
      function ScheduledTask(type, fn1, millis1) {
        this.type = type;
        this.fn = fn1;
        this.millis = millis1;
        this.scheduledTime = _.now() + this.millis;
        this.kill = false
      }
      ScheduledTask.prototype.cancel = function () {
        return this.kill = true
      };
      return ScheduledTask
    }();
    Api = function () {
      Api.prototype.scheduledTasks = null;
      function Api(url, token) {
        this.url = url;
        this.token = token;
        this.scheduledTasks = [];
        if (config.api == null) {
          config.api = this
        }
      }
      Api.prototype.get = function (path) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr.get(this.url + p)
      };
      Api.prototype.post = function (path, data) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr.post(this.url + p, data)
      };
      Api.prototype.put = function (path, data) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr.put(this.url + p, data)
      };
      Api.prototype.patch = function (path, data) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr.patch(this.url + p, data)
      };
      Api.prototype['delete'] = function (path) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr['delete'](this.url + p)
      };
      Api.prototype.scheduleOnce = function (fn, millis) {
        var task;
        task = new ScheduledTask(ScheduledTaskType.once, fn, millis);
        this.scheduledTasks.push(task);
        if (this.scheduledTasks.length === 1) {
          this.loop()
        }
        return task
      };
      Api.prototype.scheduleEvery = function (fn, millis, now) {
        var task;
        if (now == null) {
          now = false
        }
        task = new ScheduledTask(ScheduledTaskType.every, fn, millis);
        this.scheduledTasks.push(task);
        if (this.scheduledTasks.length === 1) {
          this.loop()
        }
        if (now) {
          log('API: scheduling for immediate execution');
          task = new ScheduledTask(ScheduledTaskType.once, fn, 0);
          this.scheduledTasks.push(task)
        }
        return task
      };
      Api.prototype.loop = function () {
        if (this.scheduledTasks.length > 0) {
          log('API: starting loop');
          return requestAnimationFrame(function (_this) {
            return function () {
              var i, length, now, sfn;
              now = _.now();
              i = 0;
              length = _this.scheduledTasks.length;
              while (i < length) {
                sfn = _this.scheduledTasks[i];
                if (sfn.scheduledTime <= now) {
                  if (!sfn.kill) {
                    sfn.fn(now)
                  }
                  if (sfn.kill || sfn.type === ScheduledTaskType.once) {
                    length--;
                    _this.scheduledTasks[i] = _this.scheduledTasks[length]
                  } else if (sfn.type === ScheduledTaskType.every) {
                    sfn.scheduledTime += sfn.millis
                  }
                } else {
                  i++
                }
              }
              _this.scheduledTasks.length = length;
              if (length > 0) {
                return _this.loop()
              }
            }
          }(this))
        }
      };
      return Api
    }();
    module.exports = Api
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/underscore/underscore.js
  require.define('underscore/underscore', function (module, exports, __dirname, __filename) {
    //     Underscore.js 1.8.3
    //     http://underscorejs.org
    //     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
    //     Underscore may be freely distributed under the MIT license.
    (function () {
      // Baseline setup
      // --------------
      // Establish the root object, `window` in the browser, or `exports` on the server.
      var root = this;
      // Save the previous value of the `_` variable.
      var previousUnderscore = root._;
      // Save bytes in the minified (but not gzipped) version:
      var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
      // Create quick reference variables for speed access to core prototypes.
      var push = ArrayProto.push, slice = ArrayProto.slice, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
      // All **ECMAScript 5** native function implementations that we hope to use
      // are declared here.
      var nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind, nativeCreate = Object.create;
      // Naked function reference for surrogate-prototype-swapping.
      var Ctor = function () {
      };
      // Create a safe reference to the Underscore object for use below.
      var _ = function (obj) {
        if (obj instanceof _)
          return obj;
        if (!(this instanceof _))
          return new _(obj);
        this._wrapped = obj
      };
      // Export the Underscore object for **Node.js**, with
      // backwards-compatibility for the old `require()` API. If we're in
      // the browser, add `_` as a global object.
      if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
          exports = module.exports = _
        }
        exports._ = _
      } else {
        root._ = _
      }
      // Current version.
      _.VERSION = '1.8.3';
      // Internal function that returns an efficient (for current engines) version
      // of the passed-in callback, to be repeatedly applied in other Underscore
      // functions.
      var optimizeCb = function (func, context, argCount) {
        if (context === void 0)
          return func;
        switch (argCount == null ? 3 : argCount) {
        case 1:
          return function (value) {
            return func.call(context, value)
          };
        case 2:
          return function (value, other) {
            return func.call(context, value, other)
          };
        case 3:
          return function (value, index, collection) {
            return func.call(context, value, index, collection)
          };
        case 4:
          return function (accumulator, value, index, collection) {
            return func.call(context, accumulator, value, index, collection)
          }
        }
        return function () {
          return func.apply(context, arguments)
        }
      };
      // A mostly-internal function to generate callbacks that can be applied
      // to each element in a collection, returning the desired result — either
      // identity, an arbitrary callback, a property matcher, or a property accessor.
      var cb = function (value, context, argCount) {
        if (value == null)
          return _.identity;
        if (_.isFunction(value))
          return optimizeCb(value, context, argCount);
        if (_.isObject(value))
          return _.matcher(value);
        return _.property(value)
      };
      _.iteratee = function (value, context) {
        return cb(value, context, Infinity)
      };
      // An internal function for creating assigner functions.
      var createAssigner = function (keysFunc, undefinedOnly) {
        return function (obj) {
          var length = arguments.length;
          if (length < 2 || obj == null)
            return obj;
          for (var index = 1; index < length; index++) {
            var source = arguments[index], keys = keysFunc(source), l = keys.length;
            for (var i = 0; i < l; i++) {
              var key = keys[i];
              if (!undefinedOnly || obj[key] === void 0)
                obj[key] = source[key]
            }
          }
          return obj
        }
      };
      // An internal function for creating a new object that inherits from another.
      var baseCreate = function (prototype) {
        if (!_.isObject(prototype))
          return {};
        if (nativeCreate)
          return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor;
        Ctor.prototype = null;
        return result
      };
      var property = function (key) {
        return function (obj) {
          return obj == null ? void 0 : obj[key]
        }
      };
      // Helper for collection methods to determine whether a collection
      // should be iterated as an array or as an object
      // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
      // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
      var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
      var getLength = property('length');
      var isArrayLike = function (collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
      };
      // Collection Functions
      // --------------------
      // The cornerstone, an `each` implementation, aka `forEach`.
      // Handles raw objects in addition to array-likes. Treats all
      // sparse array-likes as if they were dense.
      _.each = _.forEach = function (obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLike(obj)) {
          for (i = 0, length = obj.length; i < length; i++) {
            iteratee(obj[i], i, obj)
          }
        } else {
          var keys = _.keys(obj);
          for (i = 0, length = keys.length; i < length; i++) {
            iteratee(obj[keys[i]], keys[i], obj)
          }
        }
        return obj
      };
      // Return the results of applying the iteratee to each element.
      _.map = _.collect = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, results = Array(length);
        for (var index = 0; index < length; index++) {
          var currentKey = keys ? keys[index] : index;
          results[index] = iteratee(obj[currentKey], currentKey, obj)
        }
        return results
      };
      // Create a reducing function iterating left or right.
      function createReduce(dir) {
        // Optimized iterator function as using arguments.length
        // in the main function will deoptimize the, see #1991.
        function iterator(obj, iteratee, memo, keys, index, length) {
          for (; index >= 0 && index < length; index += dir) {
            var currentKey = keys ? keys[index] : index;
            memo = iteratee(memo, obj[currentKey], currentKey, obj)
          }
          return memo
        }
        return function (obj, iteratee, memo, context) {
          iteratee = optimizeCb(iteratee, context, 4);
          var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = dir > 0 ? 0 : length - 1;
          // Determine the initial value if none is provided.
          if (arguments.length < 3) {
            memo = obj[keys ? keys[index] : index];
            index += dir
          }
          return iterator(obj, iteratee, memo, keys, index, length)
        }
      }
      // **Reduce** builds up a single result from a list of values, aka `inject`,
      // or `foldl`.
      _.reduce = _.foldl = _.inject = createReduce(1);
      // The right-associative version of reduce, also known as `foldr`.
      _.reduceRight = _.foldr = createReduce(-1);
      // Return the first value which passes a truth test. Aliased as `detect`.
      _.find = _.detect = function (obj, predicate, context) {
        var key;
        if (isArrayLike(obj)) {
          key = _.findIndex(obj, predicate, context)
        } else {
          key = _.findKey(obj, predicate, context)
        }
        if (key !== void 0 && key !== -1)
          return obj[key]
      };
      // Return all the elements that pass a truth test.
      // Aliased as `select`.
      _.filter = _.select = function (obj, predicate, context) {
        var results = [];
        predicate = cb(predicate, context);
        _.each(obj, function (value, index, list) {
          if (predicate(value, index, list))
            results.push(value)
        });
        return results
      };
      // Return all the elements for which a truth test fails.
      _.reject = function (obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context)
      };
      // Determine whether all of the elements match a truth test.
      // Aliased as `all`.
      _.every = _.all = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
          var currentKey = keys ? keys[index] : index;
          if (!predicate(obj[currentKey], currentKey, obj))
            return false
        }
        return true
      };
      // Determine if at least one element in the object matches a truth test.
      // Aliased as `any`.
      _.some = _.any = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
          var currentKey = keys ? keys[index] : index;
          if (predicate(obj[currentKey], currentKey, obj))
            return true
        }
        return false
      };
      // Determine if the array or object contains a given item (using `===`).
      // Aliased as `includes` and `include`.
      _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
        if (!isArrayLike(obj))
          obj = _.values(obj);
        if (typeof fromIndex != 'number' || guard)
          fromIndex = 0;
        return _.indexOf(obj, item, fromIndex) >= 0
      };
      // Invoke a method (with arguments) on every item in a collection.
      _.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function (value) {
          var func = isFunc ? method : value[method];
          return func == null ? func : func.apply(value, args)
        })
      };
      // Convenience version of a common use case of `map`: fetching a property.
      _.pluck = function (obj, key) {
        return _.map(obj, _.property(key))
      };
      // Convenience version of a common use case of `filter`: selecting only objects
      // containing specific `key:value` pairs.
      _.where = function (obj, attrs) {
        return _.filter(obj, _.matcher(attrs))
      };
      // Convenience version of a common use case of `find`: getting the first object
      // containing specific `key:value` pairs.
      _.findWhere = function (obj, attrs) {
        return _.find(obj, _.matcher(attrs))
      };
      // Return the maximum element (or element-based computation).
      _.max = function (obj, iteratee, context) {
        var result = -Infinity, lastComputed = -Infinity, value, computed;
        if (iteratee == null && obj != null) {
          obj = isArrayLike(obj) ? obj : _.values(obj);
          for (var i = 0, length = obj.length; i < length; i++) {
            value = obj[i];
            if (value > result) {
              result = value
            }
          }
        } else {
          iteratee = cb(iteratee, context);
          _.each(obj, function (value, index, list) {
            computed = iteratee(value, index, list);
            if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
              result = value;
              lastComputed = computed
            }
          })
        }
        return result
      };
      // Return the minimum element (or element-based computation).
      _.min = function (obj, iteratee, context) {
        var result = Infinity, lastComputed = Infinity, value, computed;
        if (iteratee == null && obj != null) {
          obj = isArrayLike(obj) ? obj : _.values(obj);
          for (var i = 0, length = obj.length; i < length; i++) {
            value = obj[i];
            if (value < result) {
              result = value
            }
          }
        } else {
          iteratee = cb(iteratee, context);
          _.each(obj, function (value, index, list) {
            computed = iteratee(value, index, list);
            if (computed < lastComputed || computed === Infinity && result === Infinity) {
              result = value;
              lastComputed = computed
            }
          })
        }
        return result
      };
      // Shuffle a collection, using the modern version of the
      // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
      _.shuffle = function (obj) {
        var set = isArrayLike(obj) ? obj : _.values(obj);
        var length = set.length;
        var shuffled = Array(length);
        for (var index = 0, rand; index < length; index++) {
          rand = _.random(0, index);
          if (rand !== index)
            shuffled[index] = shuffled[rand];
          shuffled[rand] = set[index]
        }
        return shuffled
      };
      // Sample **n** random values from a collection.
      // If **n** is not specified, returns a single random element.
      // The internal `guard` argument allows it to work with `map`.
      _.sample = function (obj, n, guard) {
        if (n == null || guard) {
          if (!isArrayLike(obj))
            obj = _.values(obj);
          return obj[_.random(obj.length - 1)]
        }
        return _.shuffle(obj).slice(0, Math.max(0, n))
      };
      // Sort the object's values by a criterion produced by an iteratee.
      _.sortBy = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        return _.pluck(_.map(obj, function (value, index, list) {
          return {
            value: value,
            index: index,
            criteria: iteratee(value, index, list)
          }
        }).sort(function (left, right) {
          var a = left.criteria;
          var b = right.criteria;
          if (a !== b) {
            if (a > b || a === void 0)
              return 1;
            if (a < b || b === void 0)
              return -1
          }
          return left.index - right.index
        }), 'value')
      };
      // An internal function used for aggregate "group by" operations.
      var group = function (behavior) {
        return function (obj, iteratee, context) {
          var result = {};
          iteratee = cb(iteratee, context);
          _.each(obj, function (value, index) {
            var key = iteratee(value, index, obj);
            behavior(result, value, key)
          });
          return result
        }
      };
      // Groups the object's values by a criterion. Pass either a string attribute
      // to group by, or a function that returns the criterion.
      _.groupBy = group(function (result, value, key) {
        if (_.has(result, key))
          result[key].push(value);
        else
          result[key] = [value]
      });
      // Indexes the object's values by a criterion, similar to `groupBy`, but for
      // when you know that your index values will be unique.
      _.indexBy = group(function (result, value, key) {
        result[key] = value
      });
      // Counts instances of an object that group by a certain criterion. Pass
      // either a string attribute to count by, or a function that returns the
      // criterion.
      _.countBy = group(function (result, value, key) {
        if (_.has(result, key))
          result[key]++;
        else
          result[key] = 1
      });
      // Safely create a real, live array from anything iterable.
      _.toArray = function (obj) {
        if (!obj)
          return [];
        if (_.isArray(obj))
          return slice.call(obj);
        if (isArrayLike(obj))
          return _.map(obj, _.identity);
        return _.values(obj)
      };
      // Return the number of elements in an object.
      _.size = function (obj) {
        if (obj == null)
          return 0;
        return isArrayLike(obj) ? obj.length : _.keys(obj).length
      };
      // Split a collection into two arrays: one whose elements all satisfy the given
      // predicate, and one whose elements all do not satisfy the predicate.
      _.partition = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var pass = [], fail = [];
        _.each(obj, function (value, key, obj) {
          (predicate(value, key, obj) ? pass : fail).push(value)
        });
        return [
          pass,
          fail
        ]
      };
      // Array Functions
      // ---------------
      // Get the first element of an array. Passing **n** will return the first N
      // values in the array. Aliased as `head` and `take`. The **guard** check
      // allows it to work with `_.map`.
      _.first = _.head = _.take = function (array, n, guard) {
        if (array == null)
          return void 0;
        if (n == null || guard)
          return array[0];
        return _.initial(array, array.length - n)
      };
      // Returns everything but the last entry of the array. Especially useful on
      // the arguments object. Passing **n** will return all the values in
      // the array, excluding the last N.
      _.initial = function (array, n, guard) {
        return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)))
      };
      // Get the last element of an array. Passing **n** will return the last N
      // values in the array.
      _.last = function (array, n, guard) {
        if (array == null)
          return void 0;
        if (n == null || guard)
          return array[array.length - 1];
        return _.rest(array, Math.max(0, array.length - n))
      };
      // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
      // Especially useful on the arguments object. Passing an **n** will return
      // the rest N values in the array.
      _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n)
      };
      // Trim out all falsy values from an array.
      _.compact = function (array) {
        return _.filter(array, _.identity)
      };
      // Internal implementation of a recursive `flatten` function.
      var flatten = function (input, shallow, strict, startIndex) {
        var output = [], idx = 0;
        for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
          var value = input[i];
          if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
            //flatten current level of array or arguments object
            if (!shallow)
              value = flatten(value, shallow, strict);
            var j = 0, len = value.length;
            output.length += len;
            while (j < len) {
              output[idx++] = value[j++]
            }
          } else if (!strict) {
            output[idx++] = value
          }
        }
        return output
      };
      // Flatten out an array, either recursively (by default), or just one level.
      _.flatten = function (array, shallow) {
        return flatten(array, shallow, false)
      };
      // Return a version of the array that does not contain the specified value(s).
      _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1))
      };
      // Produce a duplicate-free version of the array. If the array has already
      // been sorted, you have the option of using a faster algorithm.
      // Aliased as `unique`.
      _.uniq = _.unique = function (array, isSorted, iteratee, context) {
        if (!_.isBoolean(isSorted)) {
          context = iteratee;
          iteratee = isSorted;
          isSorted = false
        }
        if (iteratee != null)
          iteratee = cb(iteratee, context);
        var result = [];
        var seen = [];
        for (var i = 0, length = getLength(array); i < length; i++) {
          var value = array[i], computed = iteratee ? iteratee(value, i, array) : value;
          if (isSorted) {
            if (!i || seen !== computed)
              result.push(value);
            seen = computed
          } else if (iteratee) {
            if (!_.contains(seen, computed)) {
              seen.push(computed);
              result.push(value)
            }
          } else if (!_.contains(result, value)) {
            result.push(value)
          }
        }
        return result
      };
      // Produce an array that contains the union: each distinct element from all of
      // the passed-in arrays.
      _.union = function () {
        return _.uniq(flatten(arguments, true, true))
      };
      // Produce an array that contains every item shared between all the
      // passed-in arrays.
      _.intersection = function (array) {
        var result = [];
        var argsLength = arguments.length;
        for (var i = 0, length = getLength(array); i < length; i++) {
          var item = array[i];
          if (_.contains(result, item))
            continue;
          for (var j = 1; j < argsLength; j++) {
            if (!_.contains(arguments[j], item))
              break
          }
          if (j === argsLength)
            result.push(item)
        }
        return result
      };
      // Take the difference between one array and a number of other arrays.
      // Only the elements present in just the first array will remain.
      _.difference = function (array) {
        var rest = flatten(arguments, true, true, 1);
        return _.filter(array, function (value) {
          return !_.contains(rest, value)
        })
      };
      // Zip together multiple lists into a single array -- elements that share
      // an index go together.
      _.zip = function () {
        return _.unzip(arguments)
      };
      // Complement of _.zip. Unzip accepts an array of arrays and groups
      // each array's elements on shared indices
      _.unzip = function (array) {
        var length = array && _.max(array, getLength).length || 0;
        var result = Array(length);
        for (var index = 0; index < length; index++) {
          result[index] = _.pluck(array, index)
        }
        return result
      };
      // Converts lists into objects. Pass either a single array of `[key, value]`
      // pairs, or two parallel arrays of the same length -- one of keys, and one of
      // the corresponding values.
      _.object = function (list, values) {
        var result = {};
        for (var i = 0, length = getLength(list); i < length; i++) {
          if (values) {
            result[list[i]] = values[i]
          } else {
            result[list[i][0]] = list[i][1]
          }
        }
        return result
      };
      // Generator function to create the findIndex and findLastIndex functions
      function createPredicateIndexFinder(dir) {
        return function (array, predicate, context) {
          predicate = cb(predicate, context);
          var length = getLength(array);
          var index = dir > 0 ? 0 : length - 1;
          for (; index >= 0 && index < length; index += dir) {
            if (predicate(array[index], index, array))
              return index
          }
          return -1
        }
      }
      // Returns the first index on an array-like that passes a predicate test
      _.findIndex = createPredicateIndexFinder(1);
      _.findLastIndex = createPredicateIndexFinder(-1);
      // Use a comparator function to figure out the smallest index at which
      // an object should be inserted so as to maintain order. Uses binary search.
      _.sortedIndex = function (array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);
        var value = iteratee(obj);
        var low = 0, high = getLength(array);
        while (low < high) {
          var mid = Math.floor((low + high) / 2);
          if (iteratee(array[mid]) < value)
            low = mid + 1;
          else
            high = mid
        }
        return low
      };
      // Generator function to create the indexOf and lastIndexOf functions
      function createIndexFinder(dir, predicateFind, sortedIndex) {
        return function (array, item, idx) {
          var i = 0, length = getLength(array);
          if (typeof idx == 'number') {
            if (dir > 0) {
              i = idx >= 0 ? idx : Math.max(idx + length, i)
            } else {
              length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1
            }
          } else if (sortedIndex && idx && length) {
            idx = sortedIndex(array, item);
            return array[idx] === item ? idx : -1
          }
          if (item !== item) {
            idx = predicateFind(slice.call(array, i, length), _.isNaN);
            return idx >= 0 ? idx + i : -1
          }
          for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
            if (array[idx] === item)
              return idx
          }
          return -1
        }
      }
      // Return the position of the first occurrence of an item in an array,
      // or -1 if the item is not included in the array.
      // If the array is large and already in sort order, pass `true`
      // for **isSorted** to use binary search.
      _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
      _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
      // Generate an integer Array containing an arithmetic progression. A port of
      // the native Python `range()` function. See
      // [the Python documentation](http://docs.python.org/library/functions.html#range).
      _.range = function (start, stop, step) {
        if (stop == null) {
          stop = start || 0;
          start = 0
        }
        step = step || 1;
        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);
        for (var idx = 0; idx < length; idx++, start += step) {
          range[idx] = start
        }
        return range
      };
      // Function (ahem) Functions
      // ------------------
      // Determines whether to execute a function as a constructor
      // or a normal function with the provided arguments
      var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
        if (!(callingContext instanceof boundFunc))
          return sourceFunc.apply(context, args);
        var self = baseCreate(sourceFunc.prototype);
        var result = sourceFunc.apply(self, args);
        if (_.isObject(result))
          return result;
        return self
      };
      // Create a function bound to a given object (assigning `this`, and arguments,
      // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
      // available.
      _.bind = function (func, context) {
        if (nativeBind && func.bind === nativeBind)
          return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func))
          throw new TypeError('Bind must be called on a function');
        var args = slice.call(arguments, 2);
        var bound = function () {
          return executeBound(func, bound, context, this, args.concat(slice.call(arguments)))
        };
        return bound
      };
      // Partially apply a function by creating a version that has had some of its
      // arguments pre-filled, without changing its dynamic `this` context. _ acts
      // as a placeholder, allowing any combination of arguments to be pre-filled.
      _.partial = function (func) {
        var boundArgs = slice.call(arguments, 1);
        var bound = function () {
          var position = 0, length = boundArgs.length;
          var args = Array(length);
          for (var i = 0; i < length; i++) {
            args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i]
          }
          while (position < arguments.length)
            args.push(arguments[position++]);
          return executeBound(func, bound, this, this, args)
        };
        return bound
      };
      // Bind a number of an object's methods to that object. Remaining arguments
      // are the method names to be bound. Useful for ensuring that all callbacks
      // defined on an object belong to it.
      _.bindAll = function (obj) {
        var i, length = arguments.length, key;
        if (length <= 1)
          throw new Error('bindAll must be passed function names');
        for (i = 1; i < length; i++) {
          key = arguments[i];
          obj[key] = _.bind(obj[key], obj)
        }
        return obj
      };
      // Memoize an expensive function by storing its results.
      _.memoize = function (func, hasher) {
        var memoize = function (key) {
          var cache = memoize.cache;
          var address = '' + (hasher ? hasher.apply(this, arguments) : key);
          if (!_.has(cache, address))
            cache[address] = func.apply(this, arguments);
          return cache[address]
        };
        memoize.cache = {};
        return memoize
      };
      // Delays a function for the given number of milliseconds, and then calls
      // it with the arguments supplied.
      _.delay = function (func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function () {
          return func.apply(null, args)
        }, wait)
      };
      // Defers a function, scheduling it to run after the current call stack has
      // cleared.
      _.defer = _.partial(_.delay, _, 1);
      // Returns a function, that, when invoked, will only be triggered at most once
      // during a given window of time. Normally, the throttled function will run
      // as much as it can, without ever going more than once per `wait` duration;
      // but if you'd like to disable the execution on the leading edge, pass
      // `{leading: false}`. To disable execution on the trailing edge, ditto.
      _.throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options)
          options = {};
        var later = function () {
          previous = options.leading === false ? 0 : _.now();
          timeout = null;
          result = func.apply(context, args);
          if (!timeout)
            context = args = null
        };
        return function () {
          var now = _.now();
          if (!previous && options.leading === false)
            previous = now;
          var remaining = wait - (now - previous);
          context = this;
          args = arguments;
          if (remaining <= 0 || remaining > wait) {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout)
              context = args = null
          } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
          }
          return result
        }
      };
      // Returns a function, that, as long as it continues to be invoked, will not
      // be triggered. The function will be called after it stops being called for
      // N milliseconds. If `immediate` is passed, trigger the function on the
      // leading edge, instead of the trailing.
      _.debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        var later = function () {
          var last = _.now() - timestamp;
          if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last)
          } else {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
              if (!timeout)
                context = args = null
            }
          }
        };
        return function () {
          context = this;
          args = arguments;
          timestamp = _.now();
          var callNow = immediate && !timeout;
          if (!timeout)
            timeout = setTimeout(later, wait);
          if (callNow) {
            result = func.apply(context, args);
            context = args = null
          }
          return result
        }
      };
      // Returns the first function passed as an argument to the second,
      // allowing you to adjust arguments, run code before and after, and
      // conditionally execute the original function.
      _.wrap = function (func, wrapper) {
        return _.partial(wrapper, func)
      };
      // Returns a negated version of the passed-in predicate.
      _.negate = function (predicate) {
        return function () {
          return !predicate.apply(this, arguments)
        }
      };
      // Returns a function that is the composition of a list of functions, each
      // consuming the return value of the function that follows.
      _.compose = function () {
        var args = arguments;
        var start = args.length - 1;
        return function () {
          var i = start;
          var result = args[start].apply(this, arguments);
          while (i--)
            result = args[i].call(this, result);
          return result
        }
      };
      // Returns a function that will only be executed on and after the Nth call.
      _.after = function (times, func) {
        return function () {
          if (--times < 1) {
            return func.apply(this, arguments)
          }
        }
      };
      // Returns a function that will only be executed up to (but not including) the Nth call.
      _.before = function (times, func) {
        var memo;
        return function () {
          if (--times > 0) {
            memo = func.apply(this, arguments)
          }
          if (times <= 1)
            func = null;
          return memo
        }
      };
      // Returns a function that will be executed at most one time, no matter how
      // often you call it. Useful for lazy initialization.
      _.once = _.partial(_.before, 2);
      // Object Functions
      // ----------------
      // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
      var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
      var nonEnumerableProps = [
        'valueOf',
        'isPrototypeOf',
        'toString',
        'propertyIsEnumerable',
        'hasOwnProperty',
        'toLocaleString'
      ];
      function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;
        // Constructor is a special case.
        var prop = 'constructor';
        if (_.has(obj, prop) && !_.contains(keys, prop))
          keys.push(prop);
        while (nonEnumIdx--) {
          prop = nonEnumerableProps[nonEnumIdx];
          if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
            keys.push(prop)
          }
        }
      }
      // Retrieve the names of an object's own properties.
      // Delegates to **ECMAScript 5**'s native `Object.keys`
      _.keys = function (obj) {
        if (!_.isObject(obj))
          return [];
        if (nativeKeys)
          return nativeKeys(obj);
        var keys = [];
        for (var key in obj)
          if (_.has(obj, key))
            keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug)
          collectNonEnumProps(obj, keys);
        return keys
      };
      // Retrieve all the property names of an object.
      _.allKeys = function (obj) {
        if (!_.isObject(obj))
          return [];
        var keys = [];
        for (var key in obj)
          keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug)
          collectNonEnumProps(obj, keys);
        return keys
      };
      // Retrieve the values of an object's properties.
      _.values = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
          values[i] = obj[keys[i]]
        }
        return values
      };
      // Returns the results of applying the iteratee to each element of the object
      // In contrast to _.map it returns an object
      _.mapObject = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = _.keys(obj), length = keys.length, results = {}, currentKey;
        for (var index = 0; index < length; index++) {
          currentKey = keys[index];
          results[currentKey] = iteratee(obj[currentKey], currentKey, obj)
        }
        return results
      };
      // Convert an object into a list of `[key, value]` pairs.
      _.pairs = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
          pairs[i] = [
            keys[i],
            obj[keys[i]]
          ]
        }
        return pairs
      };
      // Invert the keys and values of an object. The values must be serializable.
      _.invert = function (obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
          result[obj[keys[i]]] = keys[i]
        }
        return result
      };
      // Return a sorted list of the function names available on the object.
      // Aliased as `methods`
      _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
          if (_.isFunction(obj[key]))
            names.push(key)
        }
        return names.sort()
      };
      // Extend a given object with all the properties in passed-in object(s).
      _.extend = createAssigner(_.allKeys);
      // Assigns a given object with all the own properties in the passed-in object(s)
      // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
      _.extendOwn = _.assign = createAssigner(_.keys);
      // Returns the first key on an object that passes a predicate test
      _.findKey = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = _.keys(obj), key;
        for (var i = 0, length = keys.length; i < length; i++) {
          key = keys[i];
          if (predicate(obj[key], key, obj))
            return key
        }
      };
      // Return a copy of the object only containing the whitelisted properties.
      _.pick = function (object, oiteratee, context) {
        var result = {}, obj = object, iteratee, keys;
        if (obj == null)
          return result;
        if (_.isFunction(oiteratee)) {
          keys = _.allKeys(obj);
          iteratee = optimizeCb(oiteratee, context)
        } else {
          keys = flatten(arguments, false, false, 1);
          iteratee = function (value, key, obj) {
            return key in obj
          };
          obj = Object(obj)
        }
        for (var i = 0, length = keys.length; i < length; i++) {
          var key = keys[i];
          var value = obj[key];
          if (iteratee(value, key, obj))
            result[key] = value
        }
        return result
      };
      // Return a copy of the object without the blacklisted properties.
      _.omit = function (obj, iteratee, context) {
        if (_.isFunction(iteratee)) {
          iteratee = _.negate(iteratee)
        } else {
          var keys = _.map(flatten(arguments, false, false, 1), String);
          iteratee = function (value, key) {
            return !_.contains(keys, key)
          }
        }
        return _.pick(obj, iteratee, context)
      };
      // Fill in a given object with default properties.
      _.defaults = createAssigner(_.allKeys, true);
      // Creates an object that inherits from the given prototype object.
      // If additional properties are provided then they will be added to the
      // created object.
      _.create = function (prototype, props) {
        var result = baseCreate(prototype);
        if (props)
          _.extendOwn(result, props);
        return result
      };
      // Create a (shallow-cloned) duplicate of an object.
      _.clone = function (obj) {
        if (!_.isObject(obj))
          return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
      };
      // Invokes interceptor with the obj, and then returns obj.
      // The primary purpose of this method is to "tap into" a method chain, in
      // order to perform operations on intermediate results within the chain.
      _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj
      };
      // Returns whether an object has a given set of `key:value` pairs.
      _.isMatch = function (object, attrs) {
        var keys = _.keys(attrs), length = keys.length;
        if (object == null)
          return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
          var key = keys[i];
          if (attrs[key] !== obj[key] || !(key in obj))
            return false
        }
        return true
      };
      // Internal recursive comparison function for `isEqual`.
      var eq = function (a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b)
          return a !== 0 || 1 / a === 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null)
          return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _)
          a = a._wrapped;
        if (b instanceof _)
          b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b))
          return false;
        switch (className) {
        // Strings, numbers, regular expressions, dates, and booleans are compared by value.
        case '[object RegExp]':
        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
        case '[object String]':
          // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
          // equivalent to `new String("5")`.
          return '' + a === '' + b;
        case '[object Number]':
          // `NaN`s are equivalent, but non-reflexive.
          // Object(NaN) is equivalent to NaN
          if (+a !== +a)
            return +b !== +b;
          // An `egal` comparison is performed for other numeric values.
          return +a === 0 ? 1 / +a === 1 / b : +a === +b;
        case '[object Date]':
        case '[object Boolean]':
          // Coerce dates and booleans to numeric primitive values. Dates are compared by their
          // millisecond representations. Note that invalid dates with millisecond representations
          // of `NaN` are not equivalent.
          return +a === +b
        }
        var areArrays = className === '[object Array]';
        if (!areArrays) {
          if (typeof a != 'object' || typeof b != 'object')
            return false;
          // Objects with different constructors are not equivalent, but `Object`s or `Array`s
          // from different frames are.
          var aCtor = a.constructor, bCtor = b.constructor;
          if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
            return false
          }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
          // Linear search. Performance is inversely proportional to the number of
          // unique nested structures.
          if (aStack[length] === a)
            return bStack[length] === b
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        // Recursively compare objects and arrays.
        if (areArrays) {
          // Compare array lengths to determine if a deep comparison is necessary.
          length = a.length;
          if (length !== b.length)
            return false;
          // Deep compare the contents, ignoring non-numeric properties.
          while (length--) {
            if (!eq(a[length], b[length], aStack, bStack))
              return false
          }
        } else {
          // Deep compare objects.
          var keys = _.keys(a), key;
          length = keys.length;
          // Ensure that both objects contain the same number of properties before comparing deep equality.
          if (_.keys(b).length !== length)
            return false;
          while (length--) {
            // Deep compare each member
            key = keys[length];
            if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack)))
              return false
          }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true
      };
      // Perform a deep comparison to check if two objects are equal.
      _.isEqual = function (a, b) {
        return eq(a, b)
      };
      // Is a given array, string, or object empty?
      // An "empty" object has no enumerable own-properties.
      _.isEmpty = function (obj) {
        if (obj == null)
          return true;
        if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)))
          return obj.length === 0;
        return _.keys(obj).length === 0
      };
      // Is a given value a DOM element?
      _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1)
      };
      // Is a given value an array?
      // Delegates to ECMA5's native Array.isArray
      _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) === '[object Array]'
      };
      // Is a given variable an object?
      _.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj
      };
      // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
      _.each([
        'Arguments',
        'Function',
        'String',
        'Number',
        'Date',
        'RegExp',
        'Error'
      ], function (name) {
        _['is' + name] = function (obj) {
          return toString.call(obj) === '[object ' + name + ']'
        }
      });
      // Define a fallback version of the method in browsers (ahem, IE < 9), where
      // there isn't any inspectable "Arguments" type.
      if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
          return _.has(obj, 'callee')
        }
      }
      // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
      // IE 11 (#1621), and in Safari 8 (#1929).
      if (typeof /./ != 'function' && typeof Int8Array != 'object') {
        _.isFunction = function (obj) {
          return typeof obj == 'function' || false
        }
      }
      // Is a given object a finite number?
      _.isFinite = function (obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj))
      };
      // Is the given value `NaN`? (NaN is the only number which does not equal itself).
      _.isNaN = function (obj) {
        return _.isNumber(obj) && obj !== +obj
      };
      // Is a given value a boolean?
      _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]'
      };
      // Is a given value equal to null?
      _.isNull = function (obj) {
        return obj === null
      };
      // Is a given variable undefined?
      _.isUndefined = function (obj) {
        return obj === void 0
      };
      // Shortcut function for checking if an object has a given property directly
      // on itself (in other words, not on a prototype).
      _.has = function (obj, key) {
        return obj != null && hasOwnProperty.call(obj, key)
      };
      // Utility Functions
      // -----------------
      // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
      // previous owner. Returns a reference to the Underscore object.
      _.noConflict = function () {
        root._ = previousUnderscore;
        return this
      };
      // Keep the identity function around for default iteratees.
      _.identity = function (value) {
        return value
      };
      // Predicate-generating functions. Often useful outside of Underscore.
      _.constant = function (value) {
        return function () {
          return value
        }
      };
      _.noop = function () {
      };
      _.property = property;
      // Generates a function for a given object that returns a given property.
      _.propertyOf = function (obj) {
        return obj == null ? function () {
        } : function (key) {
          return obj[key]
        }
      };
      // Returns a predicate for checking whether an object has a given set of
      // `key:value` pairs.
      _.matcher = _.matches = function (attrs) {
        attrs = _.extendOwn({}, attrs);
        return function (obj) {
          return _.isMatch(obj, attrs)
        }
      };
      // Run a function **n** times.
      _.times = function (n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++)
          accum[i] = iteratee(i);
        return accum
      };
      // Return a random integer between min and max (inclusive).
      _.random = function (min, max) {
        if (max == null) {
          max = min;
          min = 0
        }
        return min + Math.floor(Math.random() * (max - min + 1))
      };
      // A (possibly faster) way to get the current timestamp as an integer.
      _.now = Date.now || function () {
        return new Date().getTime()
      };
      // List of HTML entities for escaping.
      var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
      };
      var unescapeMap = _.invert(escapeMap);
      // Functions for escaping and unescaping strings to/from HTML interpolation.
      var createEscaper = function (map) {
        var escaper = function (match) {
          return map[match]
        };
        // Regexes for identifying a key that needs to be escaped
        var source = '(?:' + _.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function (string) {
          string = string == null ? '' : '' + string;
          return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string
        }
      };
      _.escape = createEscaper(escapeMap);
      _.unescape = createEscaper(unescapeMap);
      // If the value of the named `property` is a function then invoke it with the
      // `object` as context; otherwise, return it.
      _.result = function (object, property, fallback) {
        var value = object == null ? void 0 : object[property];
        if (value === void 0) {
          value = fallback
        }
        return _.isFunction(value) ? value.call(object) : value
      };
      // Generate a unique integer id (unique within the entire client session).
      // Useful for temporary DOM ids.
      var idCounter = 0;
      _.uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id
      };
      // By default, Underscore uses ERB-style template delimiters, change the
      // following template settings to use alternative delimiters.
      _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
      };
      // When customizing `templateSettings`, if you don't want to define an
      // interpolation, evaluation or escaping regex, we need one that is
      // guaranteed not to match.
      var noMatch = /(.)^/;
      // Certain characters need to be escaped so that they can be put into a
      // string literal.
      var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
      };
      var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
      var escapeChar = function (match) {
        return '\\' + escapes[match]
      };
      // JavaScript micro-templating, similar to John Resig's implementation.
      // Underscore templating handles arbitrary delimiters, preserves whitespace,
      // and correctly escapes quotes within interpolated code.
      // NB: `oldSettings` only exists for backwards compatibility.
      _.template = function (text, settings, oldSettings) {
        if (!settings && oldSettings)
          settings = oldSettings;
        settings = _.defaults({}, settings, _.templateSettings);
        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([
          (settings.escape || noMatch).source,
          (settings.interpolate || noMatch).source,
          (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');
        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
          source += text.slice(index, offset).replace(escaper, escapeChar);
          index = offset + match.length;
          if (escape) {
            source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'"
          } else if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'"
          } else if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='"
          }
          // Adobe VMs need the match returned to produce the correct offest.
          return match
        });
        source += "';\n";
        // If a variable is not specified, place data values in local scope.
        if (!settings.variable)
          source = 'with(obj||{}){\n' + source + '}\n';
        source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
        try {
          var render = new Function(settings.variable || 'obj', '_', source)
        } catch (e) {
          e.source = source;
          throw e
        }
        var template = function (data) {
          return render.call(this, data, _)
        };
        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';
        return template
      };
      // Add a "chain" function. Start chaining a wrapped Underscore object.
      _.chain = function (obj) {
        var instance = _(obj);
        instance._chain = true;
        return instance
      };
      // OOP
      // ---------------
      // If Underscore is called as a function, it returns a wrapped object that
      // can be used OO-style. This wrapper holds altered versions of all the
      // underscore functions. Wrapped objects may be chained.
      // Helper function to continue chaining intermediate results.
      var result = function (instance, obj) {
        return instance._chain ? _(obj).chain() : obj
      };
      // Add your own custom functions to the Underscore object.
      _.mixin = function (obj) {
        _.each(_.functions(obj), function (name) {
          var func = _[name] = obj[name];
          _.prototype[name] = function () {
            var args = [this._wrapped];
            push.apply(args, arguments);
            return result(this, func.apply(_, args))
          }
        })
      };
      // Add all of the Underscore functions to the wrapper object.
      _.mixin(_);
      // Add all mutator Array functions to the wrapper.
      _.each([
        'pop',
        'push',
        'reverse',
        'shift',
        'sort',
        'splice',
        'unshift'
      ], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
          var obj = this._wrapped;
          method.apply(obj, arguments);
          if ((name === 'shift' || name === 'splice') && obj.length === 0)
            delete obj[0];
          return result(this, obj)
        }
      });
      // Add all accessor Array functions to the wrapper.
      _.each([
        'concat',
        'join',
        'slice'
      ], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
          return result(this, method.apply(this._wrapped, arguments))
        }
      });
      // Extracts the result from a wrapped and chained object.
      _.prototype.value = function () {
        return this._wrapped
      };
      // Provide unwrapping proxy for some methods used in engine operations
      // such as arithmetic and JSON stringification.
      _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
      _.prototype.toString = function () {
        return '' + this._wrapped
      };
      // AMD registration happens at the end for compatibility with AMD loaders
      // that may not enforce next-turn semantics on modules. Even though general
      // practice for AMD registration is to be anonymous, underscore registers
      // as a named module because, like jQuery, it is a base library that is
      // popular enough to be bundled in a third party lib, but not be part of
      // an AMD load request. Those cases could generate an error when an
      // anonymous define() is called outside of a loader request.
      if (typeof define === 'function' && define.amd) {
        define('underscore', [], function () {
          return _
        })
      }
    }.call(this))
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/q/q.js
  require.define('q/q', function (module, exports, __dirname, __filename) {
    // vim:ts=4:sts=4:sw=4:
    /*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
    (function (definition) {
      'use strict';
      // This file will function properly as a <script> tag, or a module
      // using CommonJS and NodeJS or RequireJS module formats.  In
      // Common/Node/RequireJS, the module exports the Q API and when
      // executed as a simple <script>, it creates a Q global instead.
      // Montage Require
      if (typeof bootstrap === 'function') {
        bootstrap('promise', definition)  // CommonJS
      } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = definition()  // RequireJS
      } else if (typeof define === 'function' && define.amd) {
        define(definition)  // SES (Secure EcmaScript)
      } else if (typeof ses !== 'undefined') {
        if (!ses.ok()) {
          return
        } else {
          ses.makeQ = definition
        }  // <script>
      } else if (typeof window !== 'undefined' || typeof self !== 'undefined') {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== 'undefined' ? window : self;
        // Get the `window` object, save the previous Q global
        // and initialize Q as a global.
        var previousQ = global.Q;
        global.Q = definition();
        // Add a noConflict function so Q can be removed from the
        // global namespace.
        global.Q.noConflict = function () {
          global.Q = previousQ;
          return this
        }
      } else {
        throw new Error('This environment was not anticipated by Q. Please file a bug.')
      }
    }(function () {
      'use strict';
      var hasStacks = false;
      try {
        throw new Error
      } catch (e) {
        hasStacks = !!e.stack
      }
      // All code after this point will be filtered from stack traces reported
      // by Q.
      var qStartingLine = captureLine();
      var qFileName;
      // shims
      // used for fallback in "allResolved"
      var noop = function () {
      };
      // Use the fastest possible means to execute a task in a future turn
      // of the event loop.
      var nextTick = function () {
        // linked list of tasks (single, with head node)
        var head = {
          task: void 0,
          next: null
        };
        var tail = head;
        var flushing = false;
        var requestTick = void 0;
        var isNodeJS = false;
        // queue for late tasks, used by unhandled rejection tracking
        var laterQueue = [];
        function flush() {
          /* jshint loopfunc: true */
          var task, domain;
          while (head.next) {
            head = head.next;
            task = head.task;
            head.task = void 0;
            domain = head.domain;
            if (domain) {
              head.domain = void 0;
              domain.enter()
            }
            runSingle(task, domain)
          }
          while (laterQueue.length) {
            task = laterQueue.pop();
            runSingle(task)
          }
          flushing = false
        }
        // runs a single function in the async queue
        function runSingle(task, domain) {
          try {
            task()
          } catch (e) {
            if (isNodeJS) {
              // In node, uncaught exceptions are considered fatal errors.
              // Re-throw them synchronously to interrupt flushing!
              // Ensure continuation if the uncaught exception is suppressed
              // listening "uncaughtException" events (as domains does).
              // Continue in next event to avoid tick recursion.
              if (domain) {
                domain.exit()
              }
              setTimeout(flush, 0);
              if (domain) {
                domain.enter()
              }
              throw e
            } else {
              // In browsers, uncaught exceptions are not fatal.
              // Re-throw them asynchronously to avoid slow-downs.
              setTimeout(function () {
                throw e
              }, 0)
            }
          }
          if (domain) {
            domain.exit()
          }
        }
        nextTick = function (task) {
          tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
          };
          if (!flushing) {
            flushing = true;
            requestTick()
          }
        };
        if (typeof process === 'object' && process.toString() === '[object process]' && process.nextTick) {
          // Ensure Q is in a real Node environment, with a `process.nextTick`.
          // To see through fake Node environments:
          // * Mocha test runner - exposes a `process` global without a `nextTick`
          // * Browserify - exposes a `process.nexTick` function that uses
          //   `setTimeout`. In this case `setImmediate` is preferred because
          //    it is faster. Browserify's `process.toString()` yields
          //   "[object Object]", while in a real Node environment
          //   `process.nextTick()` yields "[object process]".
          isNodeJS = true;
          requestTick = function () {
            process.nextTick(flush)
          }
        } else if (typeof setImmediate === 'function') {
          // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
          if (typeof window !== 'undefined') {
            requestTick = setImmediate.bind(window, flush)
          } else {
            requestTick = function () {
              setImmediate(flush)
            }
          }
        } else if (typeof MessageChannel !== 'undefined') {
          // modern browsers
          // http://www.nonblocking.io/2011/06/windownexttick.html
          var channel = new MessageChannel;
          // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
          // working message ports the first time a page loads.
          channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush()
          };
          var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0)
          };
          requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick()
          }
        } else {
          // old browsers
          requestTick = function () {
            setTimeout(flush, 0)
          }
        }
        // runs a task after all other tasks have been run
        // this is useful for unhandled rejection tracking that needs to happen
        // after all `then`d tasks have been run.
        nextTick.runAfter = function (task) {
          laterQueue.push(task);
          if (!flushing) {
            flushing = true;
            requestTick()
          }
        };
        return nextTick
      }();
      // Attempt to make generics safe in the face of downstream
      // modifications.
      // There is no situation where this is necessary.
      // If you need a security guarantee, these primordials need to be
      // deeply frozen anyway, and if you don’t need a security guarantee,
      // this is just plain paranoid.
      // However, this **might** have the nice side-effect of reducing the size of
      // the minified code by reducing x.call() to merely x()
      // See Mark Miller’s explanation of what this does.
      // http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
      var call = Function.call;
      function uncurryThis(f) {
        return function () {
          return call.apply(f, arguments)
        }
      }
      // This is equivalent, but slower:
      // uncurryThis = Function_bind.bind(Function_bind.call);
      // http://jsperf.com/uncurrythis
      var array_slice = uncurryThis(Array.prototype.slice);
      var array_reduce = uncurryThis(Array.prototype.reduce || function (callback, basis) {
        var index = 0, length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
          // seek to the first value in the array, accounting
          // for the possibility that is is a sparse array
          do {
            if (index in this) {
              basis = this[index++];
              break
            }
            if (++index >= length) {
              throw new TypeError
            }
          } while (1)
        }
        // reduce
        for (; index < length; index++) {
          // account for the possibility that the array is sparse
          if (index in this) {
            basis = callback(basis, this[index], index)
          }
        }
        return basis
      });
      var array_indexOf = uncurryThis(Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
          if (this[i] === value) {
            return i
          }
        }
        return -1
      });
      var array_map = uncurryThis(Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
          collect.push(callback.call(thisp, value, index, self))
        }, void 0);
        return collect
      });
      var object_create = Object.create || function (prototype) {
        function Type() {
        }
        Type.prototype = prototype;
        return new Type
      };
      var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
      var object_keys = Object.keys || function (object) {
        var keys = [];
        for (var key in object) {
          if (object_hasOwnProperty(object, key)) {
            keys.push(key)
          }
        }
        return keys
      };
      var object_toString = uncurryThis(Object.prototype.toString);
      function isObject(value) {
        return value === Object(value)
      }
      // generator related shims
      // FIXME: Remove this function once ES6 generators are in SpiderMonkey.
      function isStopIteration(exception) {
        return object_toString(exception) === '[object StopIteration]' || exception instanceof QReturnValue
      }
      // FIXME: Remove this helper and Q.return once ES6 generators are in
      // SpiderMonkey.
      var QReturnValue;
      if (typeof ReturnValue !== 'undefined') {
        QReturnValue = ReturnValue
      } else {
        QReturnValue = function (value) {
          this.value = value
        }
      }
      // long stack traces
      var STACK_JUMP_SEPARATOR = 'From previous event:';
      function makeStackTraceLong(error, promise) {
        // If possible, transform the error stack trace by removing Node and Q
        // cruft, then concatenating with the stack trace of `promise`. See #57.
        if (hasStacks && promise.stack && typeof error === 'object' && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1) {
          var stacks = [];
          for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
              stacks.unshift(p.stack)
            }
          }
          stacks.unshift(error.stack);
          var concatedStacks = stacks.join('\n' + STACK_JUMP_SEPARATOR + '\n');
          error.stack = filterStackString(concatedStacks)
        }
      }
      function filterStackString(stackString) {
        var lines = stackString.split('\n');
        var desiredLines = [];
        for (var i = 0; i < lines.length; ++i) {
          var line = lines[i];
          if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line)
          }
        }
        return desiredLines.join('\n')
      }
      function isNodeFrame(stackLine) {
        return stackLine.indexOf('(module.js:') !== -1 || stackLine.indexOf('(node.js:') !== -1
      }
      function getFileNameAndLineNumber(stackLine) {
        // Named functions: "at functionName (filename:lineNumber:columnNumber)"
        // In IE10 function name can have spaces ("Anonymous function") O_o
        var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
        if (attempt1) {
          return [
            attempt1[1],
            Number(attempt1[2])
          ]
        }
        // Anonymous functions: "at filename:lineNumber:columnNumber"
        var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
        if (attempt2) {
          return [
            attempt2[1],
            Number(attempt2[2])
          ]
        }
        // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
        var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
        if (attempt3) {
          return [
            attempt3[1],
            Number(attempt3[2])
          ]
        }
      }
      function isInternalFrame(stackLine) {
        var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
        if (!fileNameAndLineNumber) {
          return false
        }
        var fileName = fileNameAndLineNumber[0];
        var lineNumber = fileNameAndLineNumber[1];
        return fileName === qFileName && lineNumber >= qStartingLine && lineNumber <= qEndingLine
      }
      // discover own file name and line number range for filtering stack
      // traces
      function captureLine() {
        if (!hasStacks) {
          return
        }
        try {
          throw new Error
        } catch (e) {
          var lines = e.stack.split('\n');
          var firstLine = lines[0].indexOf('@') > 0 ? lines[1] : lines[2];
          var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
          if (!fileNameAndLineNumber) {
            return
          }
          qFileName = fileNameAndLineNumber[0];
          return fileNameAndLineNumber[1]
        }
      }
      function deprecate(callback, name, alternative) {
        return function () {
          if (typeof console !== 'undefined' && typeof console.warn === 'function') {
            console.warn(name + ' is deprecated, use ' + alternative + ' instead.', new Error('').stack)
          }
          return callback.apply(callback, arguments)
        }
      }
      // end of shims
      // beginning of real work
      /**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
      function Q(value) {
        // If the object is already a Promise, return it directly.  This enables
        // the resolve function to both be used to created references from objects,
        // but to tolerably coerce non-promises to promises.
        if (value instanceof Promise) {
          return value
        }
        // assimilate thenables
        if (isPromiseAlike(value)) {
          return coerce(value)
        } else {
          return fulfill(value)
        }
      }
      Q.resolve = Q;
      /**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
      Q.nextTick = nextTick;
      /**
 * Controls whether or not long stack traces will be on
 */
      Q.longStackSupport = false;
      // enable long stacks if Q_DEBUG is set
      if (typeof process === 'object' && process && process.env && process.env.Q_DEBUG) {
        Q.longStackSupport = true
      }
      /**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
      Q.defer = defer;
      function defer() {
        // if "messages" is an "Array", that indicates that the promise has not yet
        // been resolved.  If it is "undefined", it has been resolved.  Each
        // element of the messages array is itself an array of complete arguments to
        // forward to the resolved promise.  We coerce the resolution value to a
        // promise using the `resolve` function because it handles both fully
        // non-thenable values and other thenables gracefully.
        var messages = [], progressListeners = [], resolvedPromise;
        var deferred = object_create(defer.prototype);
        var promise = object_create(Promise.prototype);
        promise.promiseDispatch = function (resolve, op, operands) {
          var args = array_slice(arguments);
          if (messages) {
            messages.push(args);
            if (op === 'when' && operands[1]) {
              // progress operand
              progressListeners.push(operands[1])
            }
          } else {
            Q.nextTick(function () {
              resolvedPromise.promiseDispatch.apply(resolvedPromise, args)
            })
          }
        };
        // XXX deprecated
        promise.valueOf = function () {
          if (messages) {
            return promise
          }
          var nearerValue = nearer(resolvedPromise);
          if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue  // shorten chain
          }
          return nearerValue
        };
        promise.inspect = function () {
          if (!resolvedPromise) {
            return { state: 'pending' }
          }
          return resolvedPromise.inspect()
        };
        if (Q.longStackSupport && hasStacks) {
          try {
            throw new Error
          } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf('\n') + 1)
          }
        }
        // NOTE: we do the checks for `resolvedPromise` in each method, instead of
        // consolidating them into `become`, since otherwise we'd create new
        // promises with the lines `become(whatever(value))`. See e.g. GH-252.
        function become(newPromise) {
          resolvedPromise = newPromise;
          promise.source = newPromise;
          array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
              newPromise.promiseDispatch.apply(newPromise, message)
            })
          }, void 0);
          messages = void 0;
          progressListeners = void 0
        }
        deferred.promise = promise;
        deferred.resolve = function (value) {
          if (resolvedPromise) {
            return
          }
          become(Q(value))
        };
        deferred.fulfill = function (value) {
          if (resolvedPromise) {
            return
          }
          become(fulfill(value))
        };
        deferred.reject = function (reason) {
          if (resolvedPromise) {
            return
          }
          become(reject(reason))
        };
        deferred.notify = function (progress) {
          if (resolvedPromise) {
            return
          }
          array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
              progressListener(progress)
            })
          }, void 0)
        };
        return deferred
      }
      /**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
      defer.prototype.makeNodeResolver = function () {
        var self = this;
        return function (error, value) {
          if (error) {
            self.reject(error)
          } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1))
          } else {
            self.resolve(value)
          }
        }
      };
      /**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
      Q.Promise = promise;
      // ES6
      Q.promise = promise;
      function promise(resolver) {
        if (typeof resolver !== 'function') {
          throw new TypeError('resolver must be a function.')
        }
        var deferred = defer();
        try {
          resolver(deferred.resolve, deferred.reject, deferred.notify)
        } catch (reason) {
          deferred.reject(reason)
        }
        return deferred.promise
      }
      promise.race = race;
      // ES6
      promise.all = all;
      // ES6
      promise.reject = reject;
      // ES6
      promise.resolve = Q;
      // ES6
      // XXX experimental.  This method is a way to denote that a local value is
      // serializable and should be immediately dispatched to a remote upon request,
      // instead of passing a reference.
      Q.passByCopy = function (object) {
        //freeze(object);
        //passByCopies.set(object, true);
        return object
      };
      Promise.prototype.passByCopy = function () {
        //freeze(object);
        //passByCopies.set(object, true);
        return this
      };
      /**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
      Q.join = function (x, y) {
        return Q(x).join(y)
      };
      Promise.prototype.join = function (that) {
        return Q([
          this,
          that
        ]).spread(function (x, y) {
          if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x
          } else {
            throw new Error("Can't join: not the same: " + x + ' ' + y)
          }
        })
      };
      /**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
      Q.race = race;
      function race(answerPs) {
        return promise(function (resolve, reject) {
          // Switch to this once we can assume at least ES5
          // answerPs.forEach(function (answerP) {
          //     Q(answerP).then(resolve, reject);
          // });
          // Use this in the meantime
          for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject)
          }
        })
      }
      Promise.prototype.race = function () {
        return this.then(Q.race)
      };
      /**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
      Q.makePromise = Promise;
      function Promise(descriptor, fallback, inspect) {
        if (fallback === void 0) {
          fallback = function (op) {
            return reject(new Error('Promise does not support operation: ' + op))
          }
        }
        if (inspect === void 0) {
          inspect = function () {
            return { state: 'unknown' }
          }
        }
        var promise = object_create(Promise.prototype);
        promise.promiseDispatch = function (resolve, op, args) {
          var result;
          try {
            if (descriptor[op]) {
              result = descriptor[op].apply(promise, args)
            } else {
              result = fallback.call(promise, op, args)
            }
          } catch (exception) {
            result = reject(exception)
          }
          if (resolve) {
            resolve(result)
          }
        };
        promise.inspect = inspect;
        // XXX deprecated `valueOf` and `exception` support
        if (inspect) {
          var inspected = inspect();
          if (inspected.state === 'rejected') {
            promise.exception = inspected.reason
          }
          promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === 'pending' || inspected.state === 'rejected') {
              return promise
            }
            return inspected.value
          }
        }
        return promise
      }
      Promise.prototype.toString = function () {
        return '[object Promise]'
      };
      Promise.prototype.then = function (fulfilled, rejected, progressed) {
        var self = this;
        var deferred = defer();
        var done = false;
        // ensure the untrusted promise makes at most a
        // single call to one of the callbacks
        function _fulfilled(value) {
          try {
            return typeof fulfilled === 'function' ? fulfilled(value) : value
          } catch (exception) {
            return reject(exception)
          }
        }
        function _rejected(exception) {
          if (typeof rejected === 'function') {
            makeStackTraceLong(exception, self);
            try {
              return rejected(exception)
            } catch (newException) {
              return reject(newException)
            }
          }
          return reject(exception)
        }
        function _progressed(value) {
          return typeof progressed === 'function' ? progressed(value) : value
        }
        Q.nextTick(function () {
          self.promiseDispatch(function (value) {
            if (done) {
              return
            }
            done = true;
            deferred.resolve(_fulfilled(value))
          }, 'when', [function (exception) {
              if (done) {
                return
              }
              done = true;
              deferred.resolve(_rejected(exception))
            }])
        });
        // Progress propagator need to be attached in the current tick.
        self.promiseDispatch(void 0, 'when', [
          void 0,
          function (value) {
            var newValue;
            var threw = false;
            try {
              newValue = _progressed(value)
            } catch (e) {
              threw = true;
              if (Q.onerror) {
                Q.onerror(e)
              } else {
                throw e
              }
            }
            if (!threw) {
              deferred.notify(newValue)
            }
          }
        ]);
        return deferred.promise
      };
      Q.tap = function (promise, callback) {
        return Q(promise).tap(callback)
      };
      /**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
      Promise.prototype.tap = function (callback) {
        callback = Q(callback);
        return this.then(function (value) {
          return callback.fcall(value).thenResolve(value)
        })
      };
      /**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
      Q.when = when;
      function when(value, fulfilled, rejected, progressed) {
        return Q(value).then(fulfilled, rejected, progressed)
      }
      Promise.prototype.thenResolve = function (value) {
        return this.then(function () {
          return value
        })
      };
      Q.thenResolve = function (promise, value) {
        return Q(promise).thenResolve(value)
      };
      Promise.prototype.thenReject = function (reason) {
        return this.then(function () {
          throw reason
        })
      };
      Q.thenReject = function (promise, reason) {
        return Q(promise).thenReject(reason)
      };
      /**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */
      // XXX should we re-do this?
      Q.nearer = nearer;
      function nearer(value) {
        if (isPromise(value)) {
          var inspected = value.inspect();
          if (inspected.state === 'fulfilled') {
            return inspected.value
          }
        }
        return value
      }
      /**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
      Q.isPromise = isPromise;
      function isPromise(object) {
        return object instanceof Promise
      }
      Q.isPromiseAlike = isPromiseAlike;
      function isPromiseAlike(object) {
        return isObject(object) && typeof object.then === 'function'
      }
      /**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
      Q.isPending = isPending;
      function isPending(object) {
        return isPromise(object) && object.inspect().state === 'pending'
      }
      Promise.prototype.isPending = function () {
        return this.inspect().state === 'pending'
      };
      /**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
      Q.isFulfilled = isFulfilled;
      function isFulfilled(object) {
        return !isPromise(object) || object.inspect().state === 'fulfilled'
      }
      Promise.prototype.isFulfilled = function () {
        return this.inspect().state === 'fulfilled'
      };
      /**
 * @returns whether the given object is a rejected promise.
 */
      Q.isRejected = isRejected;
      function isRejected(object) {
        return isPromise(object) && object.inspect().state === 'rejected'
      }
      Promise.prototype.isRejected = function () {
        return this.inspect().state === 'rejected'
      };
      //// BEGIN UNHANDLED REJECTION TRACKING
      // This promise library consumes exceptions thrown in handlers so they can be
      // handled by a subsequent promise.  The exceptions get added to this array when
      // they are created, and removed when they are handled.  Note that in ES6 or
      // shimmed environments, this would naturally be a `Set`.
      var unhandledReasons = [];
      var unhandledRejections = [];
      var reportedUnhandledRejections = [];
      var trackUnhandledRejections = true;
      function resetUnhandledRejections() {
        unhandledReasons.length = 0;
        unhandledRejections.length = 0;
        if (!trackUnhandledRejections) {
          trackUnhandledRejections = true
        }
      }
      function trackRejection(promise, reason) {
        if (!trackUnhandledRejections) {
          return
        }
        if (typeof process === 'object' && typeof process.emit === 'function') {
          Q.nextTick.runAfter(function () {
            if (array_indexOf(unhandledRejections, promise) !== -1) {
              process.emit('unhandledRejection', reason, promise);
              reportedUnhandledRejections.push(promise)
            }
          })
        }
        unhandledRejections.push(promise);
        if (reason && typeof reason.stack !== 'undefined') {
          unhandledReasons.push(reason.stack)
        } else {
          unhandledReasons.push('(no stack) ' + reason)
        }
      }
      function untrackRejection(promise) {
        if (!trackUnhandledRejections) {
          return
        }
        var at = array_indexOf(unhandledRejections, promise);
        if (at !== -1) {
          if (typeof process === 'object' && typeof process.emit === 'function') {
            Q.nextTick.runAfter(function () {
              var atReport = array_indexOf(reportedUnhandledRejections, promise);
              if (atReport !== -1) {
                process.emit('rejectionHandled', unhandledReasons[at], promise);
                reportedUnhandledRejections.splice(atReport, 1)
              }
            })
          }
          unhandledRejections.splice(at, 1);
          unhandledReasons.splice(at, 1)
        }
      }
      Q.resetUnhandledRejections = resetUnhandledRejections;
      Q.getUnhandledReasons = function () {
        // Make a copy so that consumers can't interfere with our internal state.
        return unhandledReasons.slice()
      };
      Q.stopUnhandledRejectionTracking = function () {
        resetUnhandledRejections();
        trackUnhandledRejections = false
      };
      resetUnhandledRejections();
      //// END UNHANDLED REJECTION TRACKING
      /**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
      Q.reject = reject;
      function reject(reason) {
        var rejection = Promise({
          'when': function (rejected) {
            // note that the error has been handled
            if (rejected) {
              untrackRejection(this)
            }
            return rejected ? rejected(reason) : this
          }
        }, function fallback() {
          return this
        }, function inspect() {
          return {
            state: 'rejected',
            reason: reason
          }
        });
        // Note that the reason has not been handled.
        trackRejection(rejection, reason);
        return rejection
      }
      /**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
      Q.fulfill = fulfill;
      function fulfill(value) {
        return Promise({
          'when': function () {
            return value
          },
          'get': function (name) {
            return value[name]
          },
          'set': function (name, rhs) {
            value[name] = rhs
          },
          'delete': function (name) {
            delete value[name]
          },
          'post': function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
              return value.apply(void 0, args)
            } else {
              return value[name].apply(value, args)
            }
          },
          'apply': function (thisp, args) {
            return value.apply(thisp, args)
          },
          'keys': function () {
            return object_keys(value)
          }
        }, void 0, function inspect() {
          return {
            state: 'fulfilled',
            value: value
          }
        })
      }
      /**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
      function coerce(promise) {
        var deferred = defer();
        Q.nextTick(function () {
          try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify)
          } catch (exception) {
            deferred.reject(exception)
          }
        });
        return deferred.promise
      }
      /**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
      Q.master = master;
      function master(object) {
        return Promise({
          'isDef': function () {
          }
        }, function fallback(op, args) {
          return dispatch(object, op, args)
        }, function () {
          return Q(object).inspect()
        })
      }
      /**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
      Q.spread = spread;
      function spread(value, fulfilled, rejected) {
        return Q(value).spread(fulfilled, rejected)
      }
      Promise.prototype.spread = function (fulfilled, rejected) {
        return this.all().then(function (array) {
          return fulfilled.apply(void 0, array)
        }, rejected)
      };
      /**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
      Q.async = async;
      function async(makeGenerator) {
        return function () {
          // when verb is "send", arg is a value
          // when verb is "throw", arg is an exception
          function continuer(verb, arg) {
            var result;
            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.
            if (typeof StopIteration === 'undefined') {
              // ES6 Generators
              try {
                result = generator[verb](arg)
              } catch (exception) {
                return reject(exception)
              }
              if (result.done) {
                return Q(result.value)
              } else {
                return when(result.value, callback, errback)
              }
            } else {
              // SpiderMonkey Generators
              // FIXME: Remove this case when SM does ES6 generators.
              try {
                result = generator[verb](arg)
              } catch (exception) {
                if (isStopIteration(exception)) {
                  return Q(exception.value)
                } else {
                  return reject(exception)
                }
              }
              return when(result, callback, errback)
            }
          }
          var generator = makeGenerator.apply(this, arguments);
          var callback = continuer.bind(continuer, 'next');
          var errback = continuer.bind(continuer, 'throw');
          return callback()
        }
      }
      /**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
      Q.spawn = spawn;
      function spawn(makeGenerator) {
        Q.done(Q.async(makeGenerator)())
      }
      // FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
      /**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
      Q['return'] = _return;
      function _return(value) {
        throw new QReturnValue(value)
      }
      /**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
      Q.promised = promised;
      function promised(callback) {
        return function () {
          return spread([
            this,
            all(arguments)
          ], function (self, args) {
            return callback.apply(self, args)
          })
        }
      }
      /**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
      Q.dispatch = dispatch;
      function dispatch(object, op, args) {
        return Q(object).dispatch(op, args)
      }
      Promise.prototype.dispatch = function (op, args) {
        var self = this;
        var deferred = defer();
        Q.nextTick(function () {
          self.promiseDispatch(deferred.resolve, op, args)
        });
        return deferred.promise
      };
      /**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
      Q.get = function (object, key) {
        return Q(object).dispatch('get', [key])
      };
      Promise.prototype.get = function (key) {
        return this.dispatch('get', [key])
      };
      /**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
      Q.set = function (object, key, value) {
        return Q(object).dispatch('set', [
          key,
          value
        ])
      };
      Promise.prototype.set = function (key, value) {
        return this.dispatch('set', [
          key,
          value
        ])
      };
      /**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
      Q.del = // XXX legacy
      Q['delete'] = function (object, key) {
        return Q(object).dispatch('delete', [key])
      };
      Promise.prototype.del = // XXX legacy
      Promise.prototype['delete'] = function (key) {
        return this.dispatch('delete', [key])
      };
      /**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
      // bound locally because it is used by other methods
      Q.mapply = // XXX As proposed by "Redsandro"
      Q.post = function (object, name, args) {
        return Q(object).dispatch('post', [
          name,
          args
        ])
      };
      Promise.prototype.mapply = // XXX As proposed by "Redsandro"
      Promise.prototype.post = function (name, args) {
        return this.dispatch('post', [
          name,
          args
        ])
      };
      /**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
      Q.send = // XXX Mark Miller's proposed parlance
      Q.mcall = // XXX As proposed by "Redsandro"
      Q.invoke = function (object, name) {
        return Q(object).dispatch('post', [
          name,
          array_slice(arguments, 2)
        ])
      };
      Promise.prototype.send = // XXX Mark Miller's proposed parlance
      Promise.prototype.mcall = // XXX As proposed by "Redsandro"
      Promise.prototype.invoke = function (name) {
        return this.dispatch('post', [
          name,
          array_slice(arguments, 1)
        ])
      };
      /**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
      Q.fapply = function (object, args) {
        return Q(object).dispatch('apply', [
          void 0,
          args
        ])
      };
      Promise.prototype.fapply = function (args) {
        return this.dispatch('apply', [
          void 0,
          args
        ])
      };
      /**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
      Q['try'] = Q.fcall = function (object) {
        return Q(object).dispatch('apply', [
          void 0,
          array_slice(arguments, 1)
        ])
      };
      Promise.prototype.fcall = function () {
        return this.dispatch('apply', [
          void 0,
          array_slice(arguments)
        ])
      };
      /**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
      Q.fbind = function (object) {
        var promise = Q(object);
        var args = array_slice(arguments, 1);
        return function fbound() {
          return promise.dispatch('apply', [
            this,
            args.concat(array_slice(arguments))
          ])
        }
      };
      Promise.prototype.fbind = function () {
        var promise = this;
        var args = array_slice(arguments);
        return function fbound() {
          return promise.dispatch('apply', [
            this,
            args.concat(array_slice(arguments))
          ])
        }
      };
      /**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
      Q.keys = function (object) {
        return Q(object).dispatch('keys', [])
      };
      Promise.prototype.keys = function () {
        return this.dispatch('keys', [])
      };
      /**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
      // By Mark Miller
      // http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
      Q.all = all;
      function all(promises) {
        return when(promises, function (promises) {
          var pendingCount = 0;
          var deferred = defer();
          array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (isPromise(promise) && (snapshot = promise.inspect()).state === 'fulfilled') {
              promises[index] = snapshot.value
            } else {
              ++pendingCount;
              when(promise, function (value) {
                promises[index] = value;
                if (--pendingCount === 0) {
                  deferred.resolve(promises)
                }
              }, deferred.reject, function (progress) {
                deferred.notify({
                  index: index,
                  value: progress
                })
              })
            }
          }, void 0);
          if (pendingCount === 0) {
            deferred.resolve(promises)
          }
          return deferred.promise
        })
      }
      Promise.prototype.all = function () {
        return all(this)
      };
      /**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
      Q.any = any;
      function any(promises) {
        if (promises.length === 0) {
          return Q.resolve()
        }
        var deferred = Q.defer();
        var pendingCount = 0;
        array_reduce(promises, function (prev, current, index) {
          var promise = promises[index];
          pendingCount++;
          when(promise, onFulfilled, onRejected, onProgress);
          function onFulfilled(result) {
            deferred.resolve(result)
          }
          function onRejected() {
            pendingCount--;
            if (pendingCount === 0) {
              deferred.reject(new Error("Can't get fulfillment value from any promise, all " + 'promises were rejected.'))
            }
          }
          function onProgress(progress) {
            deferred.notify({
              index: index,
              value: progress
            })
          }
        }, undefined);
        return deferred.promise
      }
      Promise.prototype.any = function () {
        return any(this)
      };
      /**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
      Q.allResolved = deprecate(allResolved, 'allResolved', 'allSettled');
      function allResolved(promises) {
        return when(promises, function (promises) {
          promises = array_map(promises, Q);
          return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop)
          })), function () {
            return promises
          })
        })
      }
      Promise.prototype.allResolved = function () {
        return allResolved(this)
      };
      /**
 * @see Promise#allSettled
 */
      Q.allSettled = allSettled;
      function allSettled(promises) {
        return Q(promises).allSettled()
      }
      /**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
      Promise.prototype.allSettled = function () {
        return this.then(function (promises) {
          return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
              return promise.inspect()
            }
            return promise.then(regardless, regardless)
          }))
        })
      };
      /**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
      Q.fail = // XXX legacy
      Q['catch'] = function (object, rejected) {
        return Q(object).then(void 0, rejected)
      };
      Promise.prototype.fail = // XXX legacy
      Promise.prototype['catch'] = function (rejected) {
        return this.then(void 0, rejected)
      };
      /**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
      Q.progress = progress;
      function progress(object, progressed) {
        return Q(object).then(void 0, void 0, progressed)
      }
      Promise.prototype.progress = function (progressed) {
        return this.then(void 0, void 0, progressed)
      };
      /**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
      Q.fin = // XXX legacy
      Q['finally'] = function (object, callback) {
        return Q(object)['finally'](callback)
      };
      Promise.prototype.fin = // XXX legacy
      Promise.prototype['finally'] = function (callback) {
        callback = Q(callback);
        return this.then(function (value) {
          return callback.fcall().then(function () {
            return value
          })
        }, function (reason) {
          // TODO attempt to recycle the rejection with "this".
          return callback.fcall().then(function () {
            throw reason
          })
        })
      };
      /**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
      Q.done = function (object, fulfilled, rejected, progress) {
        return Q(object).done(fulfilled, rejected, progress)
      };
      Promise.prototype.done = function (fulfilled, rejected, progress) {
        var onUnhandledError = function (error) {
          // forward to a future turn so that ``when``
          // does not catch it and turn it into a rejection.
          Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
              Q.onerror(error)
            } else {
              throw error
            }
          })
        };
        // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
        var promise = fulfilled || rejected || progress ? this.then(fulfilled, rejected, progress) : this;
        if (typeof process === 'object' && process && process.domain) {
          onUnhandledError = process.domain.bind(onUnhandledError)
        }
        promise.then(void 0, onUnhandledError)
      };
      /**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
      Q.timeout = function (object, ms, error) {
        return Q(object).timeout(ms, error)
      };
      Promise.prototype.timeout = function (ms, error) {
        var deferred = defer();
        var timeoutId = setTimeout(function () {
          if (!error || 'string' === typeof error) {
            error = new Error(error || 'Timed out after ' + ms + ' ms');
            error.code = 'ETIMEDOUT'
          }
          deferred.reject(error)
        }, ms);
        this.then(function (value) {
          clearTimeout(timeoutId);
          deferred.resolve(value)
        }, function (exception) {
          clearTimeout(timeoutId);
          deferred.reject(exception)
        }, deferred.notify);
        return deferred.promise
      };
      /**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
      Q.delay = function (object, timeout) {
        if (timeout === void 0) {
          timeout = object;
          object = void 0
        }
        return Q(object).delay(timeout)
      };
      Promise.prototype.delay = function (timeout) {
        return this.then(function (value) {
          var deferred = defer();
          setTimeout(function () {
            deferred.resolve(value)
          }, timeout);
          return deferred.promise
        })
      };
      /**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
      Q.nfapply = function (callback, args) {
        return Q(callback).nfapply(args)
      };
      Promise.prototype.nfapply = function (args) {
        var deferred = defer();
        var nodeArgs = array_slice(args);
        nodeArgs.push(deferred.makeNodeResolver());
        this.fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise
      };
      /**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
      Q.nfcall = function (callback) {
        var args = array_slice(arguments, 1);
        return Q(callback).nfapply(args)
      };
      Promise.prototype.nfcall = function () {
        var nodeArgs = array_slice(arguments);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        this.fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise
      };
      /**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
      Q.nfbind = Q.denodeify = function (callback) {
        var baseArgs = array_slice(arguments, 1);
        return function () {
          var nodeArgs = baseArgs.concat(array_slice(arguments));
          var deferred = defer();
          nodeArgs.push(deferred.makeNodeResolver());
          Q(callback).fapply(nodeArgs).fail(deferred.reject);
          return deferred.promise
        }
      };
      Promise.prototype.nfbind = Promise.prototype.denodeify = function () {
        var args = array_slice(arguments);
        args.unshift(this);
        return Q.denodeify.apply(void 0, args)
      };
      Q.nbind = function (callback, thisp) {
        var baseArgs = array_slice(arguments, 2);
        return function () {
          var nodeArgs = baseArgs.concat(array_slice(arguments));
          var deferred = defer();
          nodeArgs.push(deferred.makeNodeResolver());
          function bound() {
            return callback.apply(thisp, arguments)
          }
          Q(bound).fapply(nodeArgs).fail(deferred.reject);
          return deferred.promise
        }
      };
      Promise.prototype.nbind = function () {
        var args = array_slice(arguments, 0);
        args.unshift(this);
        return Q.nbind.apply(void 0, args)
      };
      /**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
      Q.nmapply = // XXX As proposed by "Redsandro"
      Q.npost = function (object, name, args) {
        return Q(object).npost(name, args)
      };
      Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
      Promise.prototype.npost = function (name, args) {
        var nodeArgs = array_slice(args || []);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        this.dispatch('post', [
          name,
          nodeArgs
        ]).fail(deferred.reject);
        return deferred.promise
      };
      /**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
      Q.nsend = // XXX Based on Mark Miller's proposed "send"
      Q.nmcall = // XXX Based on "Redsandro's" proposal
      Q.ninvoke = function (object, name) {
        var nodeArgs = array_slice(arguments, 2);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(object).dispatch('post', [
          name,
          nodeArgs
        ]).fail(deferred.reject);
        return deferred.promise
      };
      Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
      Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
      Promise.prototype.ninvoke = function (name) {
        var nodeArgs = array_slice(arguments, 1);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        this.dispatch('post', [
          name,
          nodeArgs
        ]).fail(deferred.reject);
        return deferred.promise
      };
      /**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
      Q.nodeify = nodeify;
      function nodeify(object, nodeback) {
        return Q(object).nodeify(nodeback)
      }
      Promise.prototype.nodeify = function (nodeback) {
        if (nodeback) {
          this.then(function (value) {
            Q.nextTick(function () {
              nodeback(null, value)
            })
          }, function (error) {
            Q.nextTick(function () {
              nodeback(error)
            })
          })
        } else {
          return this
        }
      };
      Q.noConflict = function () {
        throw new Error('Q.noConflict only works when Q is used as a global')
      };
      // All code before this point will be filtered from stack traces.
      var qEndingLine = captureLine();
      return Q
    }))
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/config.coffee
  require.define('./config', function (module, exports, __dirname, __filename) {
    module.exports = {}
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/utils/index.coffee
  require.define('./utils', function (module, exports, __dirname, __filename) {
    module.exports = {
      shim: require('./utils/shim'),
      log: require('./utils/log'),
      mediator: require('./utils/mediator')
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/utils/shim.coffee
  require.define('./utils/shim', function (module, exports, __dirname, __filename) {
    var Q, riot;
    riot = require('riot/riot');
    Q = require('q/q');
    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest !== null) {
      require('q-xhr/q-xhr')(XMLHttpRequest, Q)
    } else {
      require('q-xhr/q-xhr')
    }
    Function.prototype.property = function (prop, desc) {
      return Object.defineProperty(this.prototype, prop, desc)
    };
    module.exports = {
      observable: function (obj) {
        return riot.observable(obj)
      },
      requestAnimationFrame: require('raf')
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/q-xhr/q-xhr.js
  require.define('q-xhr/q-xhr', function (module, exports, __dirname, __filename) {
    // Currently requires polyfills for
    // Array#forEach
    // Object.keys
    // String#trim
    (function (factory) {
      if (typeof define === 'function' && define.amd) {
        define(['q'], function (Q) {
          return factory(XMLHttpRequest, Q)
        })
      } else if (typeof exports === 'object' && typeof module === 'object') {
        // CommonJS, mainly for testing
        module.exports = factory
      } else {
        if (typeof Q !== 'undefined') {
          factory(XMLHttpRequest, Q)
        }
      }
    }(function (XHR, Q) {
      // shallow extend with varargs
      function extend(dst) {
        Array.prototype.forEach.call(arguments, function (obj) {
          if (obj && obj !== dst) {
            Object.keys(obj).forEach(function (key) {
              dst[key] = obj[key]
            })
          }
        });
        return dst
      }
      function lowercase(str) {
        return (str || '').toLowerCase()
      }
      function parseHeaders(headers) {
        var parsed = {}, key, val, i;
        if (!headers)
          return parsed;
        headers.split('\n').forEach(function (line) {
          i = line.indexOf(':');
          key = lowercase(line.substr(0, i).trim());
          val = line.substr(i + 1).trim();
          if (key) {
            if (parsed[key]) {
              parsed[key] += ', ' + val
            } else {
              parsed[key] = val
            }
          }
        });
        return parsed
      }
      function headersGetter(headers) {
        var headersObj = typeof headers === 'object' ? headers : undefined;
        return function (name) {
          if (!headersObj)
            headersObj = parseHeaders(headers);
          if (name) {
            return headersObj[lowercase(name)]
          }
          return headersObj
        }
      }
      function transformData(data, headers, fns) {
        if (typeof fns === 'function') {
          return fns(data, headers)
        }
        fns.forEach(function (fn) {
          data = fn(data, headers)
        });
        return data
      }
      function isSuccess(status) {
        return 200 <= status && status < 300
      }
      function forEach(obj, iterator, context) {
        var keys = Object.keys(obj);
        keys.forEach(function (key) {
          iterator.call(context, obj[key], key)
        });
        return keys
      }
      function forEachSorted(obj, iterator, context) {
        var keys = Object.keys(obj).sort();
        keys.forEach(function (key) {
          iterator.call(context, obj[key], key)
        });
        return keys
      }
      function buildUrl(url, params) {
        if (!params)
          return url;
        var parts = [];
        forEachSorted(params, function (value, key) {
          if (value == null)
            return;
          if (!Array.isArray(value))
            value = [value];
          value.forEach(function (v) {
            if (typeof v === 'object') {
              v = JSON.stringify(v)
            }
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v))
          })
        });
        return url + (url.indexOf('?') == -1 ? '?' : '&') + parts.join('&')
      }
      Q.xhr = function (requestConfig) {
        var defaults = Q.xhr.defaults, config = {
            transformRequest: defaults.transformRequest,
            transformResponse: defaults.transformResponse
          }, mergeHeaders = function (config) {
            var defHeaders = defaults.headers, reqHeaders = extend({}, config.headers), defHeaderName, lowercaseDefHeaderName, reqHeaderName, execHeaders = function (headers) {
                forEach(headers, function (headerFn, header) {
                  if (typeof headerFn === 'function') {
                    var headerContent = headerFn();
                    if (headerContent != null) {
                      headers[header] = headerContent
                    } else {
                      delete headers[header]
                    }
                  }
                })
              };
            defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);
            // execute if header value is function
            execHeaders(defHeaders);
            execHeaders(reqHeaders);
            // using for-in instead of forEach to avoid unecessary iteration after header has been found
            defaultHeadersIteration:
              for (defHeaderName in defHeaders) {
                lowercaseDefHeaderName = lowercase(defHeaderName);
                for (reqHeaderName in reqHeaders) {
                  if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                    continue defaultHeadersIteration
                  }
                }
                reqHeaders[defHeaderName] = defHeaders[defHeaderName]
              }
            return reqHeaders
          }, headers = mergeHeaders(requestConfig);
        extend(config, requestConfig);
        config.headers = headers;
        config.method = (config.method || 'GET').toUpperCase();
        var serverRequest = function (config) {
            headers = config.headers;
            var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);
            // strip content-type if data is undefined TODO does it really matter?
            if (config.data == null) {
              forEach(headers, function (value, header) {
                if (lowercase(header) === 'content-type') {
                  delete headers[header]
                }
              })
            }
            if (config.withCredentials == null && defaults.withCredentials != null) {
              config.withCredentials = defaults.withCredentials
            }
            // send request
            return sendReq(config, reqData, headers).then(transformResponse, transformResponse)
          }, transformResponse = function (response) {
            response.data = transformData(response.data, response.headers, config.transformResponse);
            return isSuccess(response.status) ? response : Q.reject(response)
          }, promise = Q.when(config);
        // build a promise chain with request interceptors first, then the request, and response interceptors
        Q.xhr.interceptors.filter(function (interceptor) {
          return !!interceptor.request || !!interceptor.requestError
        }).map(function (interceptor) {
          return {
            success: interceptor.request,
            failure: interceptor.requestError
          }
        }).concat({ success: serverRequest }).concat(Q.xhr.interceptors.filter(function (interceptor) {
          return !!interceptor.response || !!interceptor.responseError
        }).map(function (interceptor) {
          return {
            success: interceptor.response,
            failure: interceptor.responseError
          }
        })).forEach(function (then) {
          promise = promise.then(then.success, then.failure)
        });
        return promise
      };
      var contentTypeJson = { 'Content-Type': 'application/json;charset=utf-8' };
      Q.xhr.defaults = {
        transformResponse: [function (data, headers) {
            if (typeof data === 'string' && data.length && (headers('content-type') || '').indexOf('json') >= 0) {
              data = JSON.parse(data)
            }
            return data
          }],
        transformRequest: [function (data) {
            return !!data && typeof data === 'object' && data.toString() !== '[object File]' ? JSON.stringify(data) : data
          }],
        headers: {
          common: { 'Accept': 'application/json, text/plain, */*' },
          post: contentTypeJson,
          put: contentTypeJson,
          patch: contentTypeJson
        }
      };
      Q.xhr.interceptors = [];
      Q.xhr.pendingRequests = [];
      function sendReq(config, reqData, reqHeaders) {
        var deferred = Q.defer(), promise = deferred.promise, url = buildUrl(config.url, config.params), xhr = new XHR, aborted = -1, status, timeoutId;
        Q.xhr.pendingRequests.push(config);
        xhr.open(config.method, url, true);
        forEach(config.headers, function (value, key) {
          if (value) {
            xhr.setRequestHeader(key, value)
          }
        });
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            var response, responseHeaders;
            if (status !== aborted) {
              responseHeaders = xhr.getAllResponseHeaders();
              // responseText is the old-school way of retrieving response (supported by IE8 & 9)
              // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
              response = xhr.responseType ? xhr.response : xhr.responseText
            }
            // cancel timeout and subsequent timeout promise resolution
            timeoutId && clearTimeout(timeoutId);
            status = status || xhr.status;
            xhr = null;
            // normalize status, including accounting for IE bug (http://bugs.jquery.com/ticket/1450)
            status = Math.max(status == 1223 ? 204 : status, 0);
            var idx = Q.xhr.pendingRequests.indexOf(config);
            if (idx !== -1)
              Q.xhr.pendingRequests.splice(idx, 1);
            (isSuccess(status) ? deferred.resolve : deferred.reject)({
              data: response,
              status: status,
              headers: headersGetter(responseHeaders),
              config: config
            })
          }
        };
        xhr.onprogress = function (progress) {
          deferred.notify(progress)
        };
        if (config.withCredentials) {
          xhr.withCredentials = true
        }
        if (config.responseType) {
          xhr.responseType = config.responseType
        }
        xhr.send(reqData || null);
        if (config.timeout > 0) {
          timeoutId = setTimeout(function () {
            status = aborted;
            xhr && xhr.abort()
          }, config.timeout)
        }
        return promise
      }
      [
        'get',
        'delete',
        'head'
      ].forEach(function (name) {
        Q.xhr[name] = function (url, config) {
          return Q.xhr(extend(config || {}, {
            method: name,
            url: url
          }))
        }
      });
      [
        'post',
        'put',
        'patch'
      ].forEach(function (name) {
        Q.xhr[name] = function (url, data, config) {
          return Q.xhr(extend(config || {}, {
            method: name,
            url: url,
            data: data
          }))
        }
      });
      return Q
    }))
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/raf/index.js
  require.define('raf', function (module, exports, __dirname, __filename) {
    var now = require('raf/node_modules/performance-now/lib/performance-now'), global = typeof window === 'undefined' ? {} : window, vendors = [
        'moz',
        'webkit'
      ], suffix = 'AnimationFrame', raf = global['request' + suffix], caf = global['cancel' + suffix] || global['cancelRequest' + suffix];
    for (var i = 0; i < vendors.length && !raf; i++) {
      raf = global[vendors[i] + 'Request' + suffix];
      caf = global[vendors[i] + 'Cancel' + suffix] || global[vendors[i] + 'CancelRequest' + suffix]
    }
    // Some versions of FF have rAF but not cAF
    if (!raf || !caf) {
      var last = 0, id = 0, queue = [], frameDuration = 1000 / 60;
      raf = function (callback) {
        if (queue.length === 0) {
          var _now = now(), next = Math.max(0, frameDuration - (_now - last));
          last = next + _now;
          setTimeout(function () {
            var cp = queue.slice(0);
            // Clear queue here to prevent
            // callbacks from appending listeners
            // to the current frame's queue
            queue.length = 0;
            for (var i = 0; i < cp.length; i++) {
              if (!cp[i].cancelled) {
                try {
                  cp[i].callback(last)
                } catch (e) {
                  setTimeout(function () {
                    throw e
                  }, 0)
                }
              }
            }
          }, Math.round(next))
        }
        queue.push({
          handle: ++id,
          callback: callback,
          cancelled: false
        });
        return id
      };
      caf = function (handle) {
        for (var i = 0; i < queue.length; i++) {
          if (queue[i].handle === handle) {
            queue[i].cancelled = true
          }
        }
      }
    }
    module.exports = function (fn) {
      // Wrap in a new function to prevent
      // `cancel` potentially being assigned
      // to the native rAF function
      return raf.call(global, fn)
    };
    module.exports.cancel = function () {
      caf.apply(global, arguments)
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/raf/node_modules/performance-now/lib/performance-now.js
  require.define('raf/node_modules/performance-now/lib/performance-now', function (module, exports, __dirname, __filename) {
    // Generated by CoffeeScript 1.6.3
    (function () {
      var getNanoSeconds, hrtime, loadTime;
      if (typeof performance !== 'undefined' && performance !== null && performance.now) {
        module.exports = function () {
          return performance.now()
        }
      } else if (typeof process !== 'undefined' && process !== null && process.hrtime) {
        module.exports = function () {
          return (getNanoSeconds() - loadTime) / 1000000
        };
        hrtime = process.hrtime;
        getNanoSeconds = function () {
          var hr;
          hr = hrtime();
          return hr[0] * 1000000000 + hr[1]
        };
        loadTime = getNanoSeconds()
      } else if (Date.now) {
        module.exports = function () {
          return Date.now() - loadTime
        };
        loadTime = Date.now()
      } else {
        module.exports = function () {
          return new Date().getTime() - loadTime
        };
        loadTime = new Date().getTime()
      }
    }.call(this))  /*
//@ sourceMappingURL=performance-now.map
*/
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/utils/log.coffee
  require.define('./utils/log', function (module, exports, __dirname, __filename) {
    var log;
    log = function () {
      if (log.DEBUG) {
        return console.log.apply(console.log, arguments)
      }
    };
    log.DEBUG = false;
    log.debug = log;
    log.info = function () {
      return console.log.apply(console.log, arguments)
    };
    log.warn = function () {
      console.log('WARN:');
      return console.log.apply(console.log, arguments)
    };
    log.error = function () {
      console.log('ERROR:');
      console.log.apply(console.log, arguments);
      throw new arguments[0]
    };
    module.exports = log
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/utils/mediator.coffee
  require.define('./utils/mediator', function (module, exports, __dirname, __filename) {
    var mediator, riot;
    riot = require('riot/riot');
    mediator = {};
    riot.observable(mediator);
    module.exports = mediator
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/source.coffee
  require.define('./data/source', function (module, exports, __dirname, __filename) {
    var Events, Policy, Q, Source, _, config, log, requestAnimationFrame, utils;
    _ = require('underscore/underscore');
    Q = require('q/q');
    config = '../config';
    utils = require('./utils');
    requestAnimationFrame = utils.shim.requestAnimationFrame;
    log = utils.log;
    Policy = require('./data/policy');
    Events = {
      Loading: 'Loading',
      LoadData: 'LoadData',
      LoadError: 'LoadError'
    };
    Source = function () {
      Source.Events = Events;
      /* Basic Info */
      Source.prototype.name = '';
      /* Static Data */
      Source.prototype.data = null;
      /* Dynamic Data */
      Source.prototype.api = null;
      Source.prototype.path = '';
      Source.prototype._policy = null;
      Source.property('policy', {
        get: function () {
          return this._policy
        },
        set: function (value) {
          this.stop();
          this._policy = value;
          return this.start()
        }
      });
      Source.prototype._task = null;
      Source.prototype._mediator = utils.mediator;
      function Source(options) {
        this.options = options;
        if (this.options.policy) {
          this.options._policy = this.options.policy;
          this.options.policy = void 0
        }
        _.extend(this, this.options);
        if (this.api == null) {
          this.api = config.api
        }
        this.start()
      }
      Source.prototype.start = function () {
        var policy;
        if (this.api != null) {
          policy = this.policy || Policy.Once;
          if (policy.intervalTime === Infinity) {
            return this._task = this.api.scheduleOnce(function (_this) {
              return function () {
                return _this._load()
              }
            }(this), 0)
          } else {
            return this._task = this.api.scheduleEvery(function (_this) {
              return function () {
                return _this._load()
              }
            }(this), policy.intervalTime, true)
          }
        } else {
          return requestAnimationFrame(function (_this) {
            return function () {
              return _this._load()
            }
          }(this))
        }
      };
      Source.prototype.stop = function () {
        if (this._task != null) {
          this._task.cancel()
        }
        return this._task = null
      };
      Source.prototype._load = function () {
        var d, fail, success;
        this.policy.unload();
        if (this.api != null) {
          this.trigger(Events.Loading);
          success = function (_this) {
            return function (res) {
              return _this.policy.load(res).then(function (data) {
                _this.trigger(Events.LoadData, data);
                return _this.data = data
              }, fail)
            }
          }(this);
          fail = function (_this) {
            return function (res) {
              return _this.trigger(Events.LoadError, res)
            }
          }(this);
          return this.api.get(this.path).then(success, fail)
        } else {
          d = Q.defer();
          requestAnimationFrame(function (_this) {
            return function () {
              _this.trigger(Events.LoadData, _this.data);
              return d.resolve(_this.data)
            }
          }(this));
          return d.promise
        }
      };
      Source.prototype.eventName = function (event) {
        return this.name + '.' + event.trim().replace(' ', ' ' + this.name + '.')
      };
      Source.prototype.on = function (event, fn) {
        return this._mediator.on(this.eventName(event), fn)
      };
      Source.prototype.once = function (event, fn) {
        return this._mediator.one(this.eventName(event), fn)
      };
      Source.prototype.off = function (event, fn) {
        return this._mediator.off(this.eventName(event), fn)
      };
      Source.prototype.trigger = function (event) {
        var args;
        args = Array.prototype.slice.call(arguments);
        args.shift();
        args.unshift(this.eventName(event));
        return this._mediator.trigger.apply(this, args)
      };
      return Source
    }();
    module.exports = Source
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/policy.coffee
  require.define('./data/policy', function (module, exports, __dirname, __filename) {
    var Policy, Q, StreamingPolicy, _, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    _ = require('underscore/underscore');
    Q = require('q/q');
    Policy = function () {
      Policy.prototype.intervalTime = Infinity;
      Policy.prototype.events = null;
      Policy.prototype.unload = function () {
      };
      Policy.prototype.load = function (res) {
        var d, data;
        data = JSON.parse(res.data);
        d = Q.defer();
        d.resolve(data);
        return d.promise
      };
      function Policy(options) {
        this.options = options;
        _.extend(this, this.options)
      }
      Policy.Once = new Policy;
      return Policy
    }();
    StreamingPolicy = function (superClass) {
      extend(StreamingPolicy, superClass);
      function StreamingPolicy() {
        return StreamingPolicy.__super__.constructor.apply(this, arguments)
      }
      StreamingPolicy.prototype.load = function (res) {
        var data;
        data = JSON.parse(res.data);
        if (!_.isArray(data)) {
          return data
        }
      };
      return StreamingPolicy
    }(Policy);
    module.exports = Policy
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/view/index.coffee
  require.define('./view', function (module, exports, __dirname, __filename) {
    module.exports = {
      Form: require('./view/form'),
      View: require('./view/view')
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/view/form.coffee
  require.define('./view/form', function (module, exports, __dirname, __filename) {
    var Form, Input, InputCondition;
    Input = function () {
      Input.name = '';
      Input.tags = '';
      function Input(name, tags) {
        this.name = name;
        this.tags = tags
      }
      return Input
    }();
    InputCondition = function () {
      function InputCondition(predicate1, tagName1) {
        this.predicate = predicate1;
        this.tagName = tagName1
      }
      return InputCondition
    }();
    module.exports = Form = {
      lookup: [],
      defaultTagName: 'form-input',
      register: function (predicate, tagName) {
        return this.lookup.push(new InputCondition(predicate, tagName))
      },
      'delete': function (tagName) {
        var i, j, len, lookup, ref, results;
        ref = this.lookup;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          lookup = ref[i];
          if (lookup.tagName === tagName) {
            results.push(this.lookup[i] = null)
          } else {
            results.push(void 0)
          }
        }
        return results
      },
      render: function (inputs) {
        var found, html, input, j, k, len, len1, lookup, ref;
        html = '';
        for (j = 0, len = inputs.length; j < len; j++) {
          input = inputs[j];
          if (input == null) {
            continue
          }
          found = false;
          ref = this.lookup;
          for (k = 0, len1 = ref.length; k < len1; k++) {
            lookup = ref[k];
            if (lookup == null) {
              continue
            }
            if (lookup.predicate(input)) {
              html += '<' + lookup.tagName + ' model="{ model }" name="{ ' + input.name + ' }" obs="{ obs }"/>';
              found = true
            }
          }
          if (found) {
            html += '<' + this.defaultTagName + ' model="{ model }" name="{ ' + input.name + ' }" obs="{ obs }"/>'
          }
        }
        return html
      }
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/view/view.coffee
  require.define('./view/view', function (module, exports, __dirname, __filename) {
    var View, _, riot, utils;
    riot = require('riot/riot');
    _ = require('underscore/underscore');
    utils = require('./utils');
    View = function () {
      View.prototype.name = '';
      View.prototype.html = '';
      View.prototype.css = '';
      View.prototype.attrs = '';
      View.prototype.events = {};
      View.prototype.js = function () {
      };
      function View(options) {
        var self;
        this.options = options;
        _.extend(this, this.options);
        self = this;
        this.init();
        riot.tag(this.name, this.html, this.css, this.attrs, function (opts) {
          var handler, name, ref;
          this.view = self;
          console.log('ARG', opts);
          this.model = opts.model;
          if (this.model == null) {
            this.model = {}
          }
          this.obs = {};
          utils.shim.observable(this.obs);
          ref = this.view.events;
          for (name in ref) {
            handler = ref[name];
            utils.mediator.on(name, handler)
          }
          return this.view.js.call(this, opts)
        })
      }
      View.prototype.init = function () {
      };
      return View
    }();
    module.exports = View
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/crowdcontrol.coffee
  require.define('./crowdcontrol', function (module, exports, __dirname, __filename) {
    var riot;
    riot = require('riot/riot');
    module.exports = {
      data: require('./data'),
      utils: require('./utils'),
      view: require('./view'),
      start: function () {
        return riot.mount('*')
      }
    };
    if (typeof window !== 'undefined' && window !== null) {
      window.crowdcontrol = module.exports
    }
  });
  require('./crowdcontrol')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yaW90L3Jpb3QuanMiLCJkYXRhL2luZGV4LmNvZmZlZSIsImRhdGEvYXBpLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiLCJub2RlX21vZHVsZXMvcS9xLmpzIiwiY29uZmlnLmNvZmZlZSIsInV0aWxzL2luZGV4LmNvZmZlZSIsInV0aWxzL3NoaW0uY29mZmVlIiwibm9kZV9tb2R1bGVzL3EteGhyL3EteGhyLmpzIiwibm9kZV9tb2R1bGVzL3JhZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yYWYvbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwidXRpbHMvbG9nLmNvZmZlZSIsInV0aWxzL21lZGlhdG9yLmNvZmZlZSIsImRhdGEvc291cmNlLmNvZmZlZSIsImRhdGEvcG9saWN5LmNvZmZlZSIsInZpZXcvaW5kZXguY29mZmVlIiwidmlldy9mb3JtLmNvZmZlZSIsInZpZXcvdmlldy5jb2ZmZWUiLCJjcm93ZGNvbnRyb2wuY29mZmVlIl0sIm5hbWVzIjpbIndpbmRvdyIsInJpb3QiLCJ2ZXJzaW9uIiwic2V0dGluZ3MiLCJvYnNlcnZhYmxlIiwiZWwiLCJjYWxsYmFja3MiLCJfaWQiLCJvbiIsImV2ZW50cyIsImZuIiwicmVwbGFjZSIsIm5hbWUiLCJwb3MiLCJwdXNoIiwidHlwZWQiLCJvZmYiLCJhcnIiLCJpIiwiY2IiLCJzcGxpY2UiLCJvbmUiLCJhcHBseSIsImFyZ3VtZW50cyIsInRyaWdnZXIiLCJhcmdzIiwic2xpY2UiLCJjYWxsIiwiZm5zIiwiYnVzeSIsImNvbmNhdCIsImFsbCIsIm1peGluIiwicmVnaXN0ZXJlZE1peGlucyIsImV2dCIsImxvYyIsImxvY2F0aW9uIiwid2luIiwic3RhcnRlZCIsImN1cnJlbnQiLCJoYXNoIiwiaHJlZiIsInNwbGl0IiwicGFyc2VyIiwicGF0aCIsImVtaXQiLCJ0eXBlIiwiciIsInJvdXRlIiwiYXJnIiwiZXhlYyIsInN0b3AiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJzdGFydCIsImFkZEV2ZW50TGlzdGVuZXIiLCJhdHRhY2hFdmVudCIsImJyYWNrZXRzIiwib3JpZyIsInMiLCJiIiwieCIsInRlc3QiLCJSZWdFeHAiLCJzb3VyY2UiLCJnbG9iYWwiLCJ0bXBsIiwiY2FjaGUiLCJyZVZhcnMiLCJzdHIiLCJkYXRhIiwicCIsImV4dHJhY3QiLCJGdW5jdGlvbiIsImV4cHIiLCJtYXAiLCJqb2luIiwibiIsInBhaXIiLCJfIiwiayIsInYiLCJ3cmFwIiwibm9udWxsIiwidHJpbSIsInN1YnN0cmluZ3MiLCJwYXJ0cyIsInN1YiIsImluZGV4T2YiLCJsZW5ndGgiLCJvcGVuIiwiY2xvc2UiLCJsZXZlbCIsIm1hdGNoZXMiLCJyZSIsImxvb3BLZXlzIiwicmV0IiwidmFsIiwiZWxzIiwia2V5IiwibWtpdGVtIiwiaXRlbSIsIl9lYWNoIiwiZG9tIiwicGFyZW50IiwicmVtQXR0ciIsInRlbXBsYXRlIiwib3V0ZXJIVE1MIiwicHJldiIsInByZXZpb3VzU2libGluZyIsInJvb3QiLCJwYXJlbnROb2RlIiwicmVuZGVyZWQiLCJ0YWdzIiwiY2hlY2tzdW0iLCJhZGQiLCJ0YWciLCJyZW1vdmVDaGlsZCIsInN0dWIiLCJpdGVtcyIsIkFycmF5IiwiaXNBcnJheSIsInRlc3RzdW0iLCJKU09OIiwic3RyaW5naWZ5IiwiZWFjaCIsInVubW91bnQiLCJPYmplY3QiLCJrZXlzIiwibmV3SXRlbXMiLCJhcnJGaW5kRXF1YWxzIiwib2xkSXRlbXMiLCJwcmV2QmFzZSIsImNoaWxkTm9kZXMiLCJvbGRQb3MiLCJsYXN0SW5kZXhPZiIsIm5vZGVzIiwiX2l0ZW0iLCJUYWciLCJiZWZvcmUiLCJtb3VudCIsInVwZGF0ZSIsImluc2VydEJlZm9yZSIsIndhbGsiLCJhdHRyaWJ1dGVzIiwiYXR0ciIsInZhbHVlIiwicGFyc2VOYW1lZEVsZW1lbnRzIiwiY2hpbGRUYWdzIiwibm9kZVR5cGUiLCJpc0xvb3AiLCJnZXRBdHRyaWJ1dGUiLCJjaGlsZCIsImdldFRhZyIsImlubmVySFRNTCIsIm5hbWVkVGFnIiwidGFnTmFtZSIsInB0YWciLCJjYWNoZWRUYWciLCJwYXJzZUV4cHJlc3Npb25zIiwiZXhwcmVzc2lvbnMiLCJhZGRFeHByIiwiZXh0cmEiLCJleHRlbmQiLCJub2RlVmFsdWUiLCJib29sIiwiaW1wbCIsImNvbmYiLCJzZWxmIiwib3B0cyIsImluaGVyaXQiLCJta2RvbSIsInRvTG93ZXJDYXNlIiwibG9vcERvbSIsIlRBR19BVFRSSUJVVEVTIiwiX3RhZyIsImF0dHJzIiwibWF0Y2giLCJhIiwia3YiLCJzZXRBdHRyaWJ1dGUiLCJmYXN0QWJzIiwiRGF0ZSIsImdldFRpbWUiLCJNYXRoIiwicmFuZG9tIiwicmVwbGFjZVlpZWxkIiwidXBkYXRlT3B0cyIsImluaXQiLCJtaXgiLCJiaW5kIiwidG9nZ2xlIiwiZmlyc3RDaGlsZCIsImFwcGVuZENoaWxkIiwia2VlcFJvb3RUYWciLCJ1bmRlZmluZWQiLCJpc01vdW50Iiwic2V0RXZlbnRIYW5kbGVyIiwiaGFuZGxlciIsImUiLCJldmVudCIsIndoaWNoIiwiY2hhckNvZGUiLCJrZXlDb2RlIiwidGFyZ2V0Iiwic3JjRWxlbWVudCIsImN1cnJlbnRUYXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsInJldHVyblZhbHVlIiwicHJldmVudFVwZGF0ZSIsImluc2VydFRvIiwibm9kZSIsImF0dHJOYW1lIiwidG9TdHJpbmciLCJkb2N1bWVudCIsImNyZWF0ZVRleHROb2RlIiwic3R5bGUiLCJkaXNwbGF5IiwibGVuIiwicmVtb3ZlQXR0cmlidXRlIiwibnIiLCJvYmoiLCJmcm9tIiwiZnJvbTIiLCJjaGVja0lFIiwidWEiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJtc2llIiwicGFyc2VJbnQiLCJzdWJzdHJpbmciLCJvcHRpb25Jbm5lckhUTUwiLCJodG1sIiwib3B0IiwiY3JlYXRlRWxlbWVudCIsInZhbFJlZ3giLCJzZWxSZWd4IiwidmFsdWVzTWF0Y2giLCJzZWxlY3RlZE1hdGNoIiwidGJvZHlJbm5lckhUTUwiLCJkaXYiLCJyb290VGFnIiwibWtFbCIsImllVmVyc2lvbiIsIm5leHRTaWJsaW5nIiwiJCQiLCJzZWxlY3RvciIsImN0eCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJhcnJEaWZmIiwiYXJyMSIsImFycjIiLCJmaWx0ZXIiLCJfZWwiLCJDaGlsZCIsInByb3RvdHlwZSIsImxvb3BzIiwidmlydHVhbERvbSIsInRhZ0ltcGwiLCJzdHlsZU5vZGUiLCJpbmplY3RTdHlsZSIsImNzcyIsImhlYWQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsIl9yZW5kZXJlZCIsImJvZHkiLCJtb3VudFRvIiwic2VsY3RBbGxUYWdzIiwibGlzdCIsInQiLCJhbGxUYWdzIiwibm9kZUxpc3QiLCJ1dGlsIiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsIkFwaSIsInJlcXVpcmUiLCJTb3VyY2UiLCJQb2xpY3kiLCJRIiwiU2NoZWR1bGVkVGFzayIsIlNjaGVkdWxlZFRhc2tUeXBlIiwiY29uZmlnIiwibG9nIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidXRpbHMiLCJzaGltIiwiZXZlcnkiLCJvbmNlIiwiZm4xIiwibWlsbGlzMSIsIm1pbGxpcyIsInNjaGVkdWxlZFRpbWUiLCJub3ciLCJraWxsIiwiY2FuY2VsIiwic2NoZWR1bGVkVGFza3MiLCJ1cmwiLCJ0b2tlbiIsImFwaSIsImdldCIsInhociIsInBvc3QiLCJwdXQiLCJwYXRjaCIsInNjaGVkdWxlT25jZSIsInRhc2siLCJsb29wIiwic2NoZWR1bGVFdmVyeSIsIl90aGlzIiwic2ZuIiwicHJldmlvdXNVbmRlcnNjb3JlIiwiQXJyYXlQcm90byIsIk9ialByb3RvIiwiRnVuY1Byb3RvIiwiaGFzT3duUHJvcGVydHkiLCJuYXRpdmVJc0FycmF5IiwibmF0aXZlS2V5cyIsIm5hdGl2ZUJpbmQiLCJuYXRpdmVDcmVhdGUiLCJjcmVhdGUiLCJDdG9yIiwiX3dyYXBwZWQiLCJWRVJTSU9OIiwib3B0aW1pemVDYiIsImZ1bmMiLCJjb250ZXh0IiwiYXJnQ291bnQiLCJvdGhlciIsImluZGV4IiwiY29sbGVjdGlvbiIsImFjY3VtdWxhdG9yIiwiaWRlbnRpdHkiLCJpc0Z1bmN0aW9uIiwiaXNPYmplY3QiLCJtYXRjaGVyIiwicHJvcGVydHkiLCJpdGVyYXRlZSIsIkluZmluaXR5IiwiY3JlYXRlQXNzaWduZXIiLCJrZXlzRnVuYyIsInVuZGVmaW5lZE9ubHkiLCJsIiwiYmFzZUNyZWF0ZSIsInJlc3VsdCIsIk1BWF9BUlJBWV9JTkRFWCIsInBvdyIsImdldExlbmd0aCIsImlzQXJyYXlMaWtlIiwiZm9yRWFjaCIsImNvbGxlY3QiLCJyZXN1bHRzIiwiY3VycmVudEtleSIsImNyZWF0ZVJlZHVjZSIsImRpciIsIml0ZXJhdG9yIiwibWVtbyIsInJlZHVjZSIsImZvbGRsIiwiaW5qZWN0IiwicmVkdWNlUmlnaHQiLCJmb2xkciIsImZpbmQiLCJkZXRlY3QiLCJwcmVkaWNhdGUiLCJmaW5kSW5kZXgiLCJmaW5kS2V5Iiwic2VsZWN0IiwicmVqZWN0IiwibmVnYXRlIiwic29tZSIsImFueSIsImNvbnRhaW5zIiwiaW5jbHVkZXMiLCJpbmNsdWRlIiwiZnJvbUluZGV4IiwiZ3VhcmQiLCJ2YWx1ZXMiLCJpbnZva2UiLCJtZXRob2QiLCJpc0Z1bmMiLCJwbHVjayIsIndoZXJlIiwiZmluZFdoZXJlIiwibWF4IiwibGFzdENvbXB1dGVkIiwiY29tcHV0ZWQiLCJtaW4iLCJzaHVmZmxlIiwic2V0Iiwic2h1ZmZsZWQiLCJyYW5kIiwic2FtcGxlIiwic29ydEJ5IiwiY3JpdGVyaWEiLCJzb3J0IiwibGVmdCIsInJpZ2h0IiwiZ3JvdXAiLCJiZWhhdmlvciIsImdyb3VwQnkiLCJoYXMiLCJpbmRleEJ5IiwiY291bnRCeSIsInRvQXJyYXkiLCJzaXplIiwicGFydGl0aW9uIiwicGFzcyIsImZhaWwiLCJmaXJzdCIsInRha2UiLCJhcnJheSIsImluaXRpYWwiLCJsYXN0IiwicmVzdCIsInRhaWwiLCJkcm9wIiwiY29tcGFjdCIsImZsYXR0ZW4iLCJpbnB1dCIsInNoYWxsb3ciLCJzdHJpY3QiLCJzdGFydEluZGV4Iiwib3V0cHV0IiwiaWR4IiwiaXNBcmd1bWVudHMiLCJqIiwid2l0aG91dCIsImRpZmZlcmVuY2UiLCJ1bmlxIiwidW5pcXVlIiwiaXNTb3J0ZWQiLCJpc0Jvb2xlYW4iLCJzZWVuIiwidW5pb24iLCJpbnRlcnNlY3Rpb24iLCJhcmdzTGVuZ3RoIiwiemlwIiwidW56aXAiLCJvYmplY3QiLCJjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlciIsImZpbmRMYXN0SW5kZXgiLCJzb3J0ZWRJbmRleCIsImxvdyIsImhpZ2giLCJtaWQiLCJmbG9vciIsImNyZWF0ZUluZGV4RmluZGVyIiwicHJlZGljYXRlRmluZCIsImlzTmFOIiwicmFuZ2UiLCJzdGVwIiwiY2VpbCIsImV4ZWN1dGVCb3VuZCIsInNvdXJjZUZ1bmMiLCJib3VuZEZ1bmMiLCJjYWxsaW5nQ29udGV4dCIsIlR5cGVFcnJvciIsImJvdW5kIiwicGFydGlhbCIsImJvdW5kQXJncyIsInBvc2l0aW9uIiwiYmluZEFsbCIsIkVycm9yIiwibWVtb2l6ZSIsImhhc2hlciIsImFkZHJlc3MiLCJkZWxheSIsIndhaXQiLCJzZXRUaW1lb3V0IiwiZGVmZXIiLCJ0aHJvdHRsZSIsIm9wdGlvbnMiLCJ0aW1lb3V0IiwicHJldmlvdXMiLCJsYXRlciIsImxlYWRpbmciLCJyZW1haW5pbmciLCJjbGVhclRpbWVvdXQiLCJ0cmFpbGluZyIsImRlYm91bmNlIiwiaW1tZWRpYXRlIiwidGltZXN0YW1wIiwiY2FsbE5vdyIsIndyYXBwZXIiLCJjb21wb3NlIiwiYWZ0ZXIiLCJ0aW1lcyIsImhhc0VudW1CdWciLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsIm5vbkVudW1lcmFibGVQcm9wcyIsImNvbGxlY3ROb25FbnVtUHJvcHMiLCJub25FbnVtSWR4IiwiY29uc3RydWN0b3IiLCJwcm90byIsInByb3AiLCJhbGxLZXlzIiwibWFwT2JqZWN0IiwicGFpcnMiLCJpbnZlcnQiLCJmdW5jdGlvbnMiLCJtZXRob2RzIiwibmFtZXMiLCJleHRlbmRPd24iLCJhc3NpZ24iLCJwaWNrIiwib2l0ZXJhdGVlIiwib21pdCIsIlN0cmluZyIsImRlZmF1bHRzIiwicHJvcHMiLCJjbG9uZSIsInRhcCIsImludGVyY2VwdG9yIiwiaXNNYXRjaCIsImVxIiwiYVN0YWNrIiwiYlN0YWNrIiwiY2xhc3NOYW1lIiwiYXJlQXJyYXlzIiwiYUN0b3IiLCJiQ3RvciIsInBvcCIsImlzRXF1YWwiLCJpc0VtcHR5IiwiaXNTdHJpbmciLCJpc0VsZW1lbnQiLCJJbnQ4QXJyYXkiLCJpc0Zpbml0ZSIsInBhcnNlRmxvYXQiLCJpc051bWJlciIsImlzTnVsbCIsImlzVW5kZWZpbmVkIiwibm9Db25mbGljdCIsImNvbnN0YW50Iiwibm9vcCIsInByb3BlcnR5T2YiLCJhY2N1bSIsImVzY2FwZU1hcCIsInVuZXNjYXBlTWFwIiwiY3JlYXRlRXNjYXBlciIsImVzY2FwZXIiLCJ0ZXN0UmVnZXhwIiwicmVwbGFjZVJlZ2V4cCIsInN0cmluZyIsImVzY2FwZSIsInVuZXNjYXBlIiwiZmFsbGJhY2siLCJpZENvdW50ZXIiLCJ1bmlxdWVJZCIsInByZWZpeCIsImlkIiwidGVtcGxhdGVTZXR0aW5ncyIsImV2YWx1YXRlIiwiaW50ZXJwb2xhdGUiLCJub01hdGNoIiwiZXNjYXBlcyIsImVzY2FwZUNoYXIiLCJ0ZXh0Iiwib2xkU2V0dGluZ3MiLCJvZmZzZXQiLCJ2YXJpYWJsZSIsInJlbmRlciIsImFyZ3VtZW50IiwiY2hhaW4iLCJpbnN0YW5jZSIsIl9jaGFpbiIsInZhbHVlT2YiLCJ0b0pTT04iLCJkZWZpbml0aW9uIiwiYm9vdHN0cmFwIiwic2VzIiwib2siLCJtYWtlUSIsInByZXZpb3VzUSIsImhhc1N0YWNrcyIsInN0YWNrIiwicVN0YXJ0aW5nTGluZSIsImNhcHR1cmVMaW5lIiwicUZpbGVOYW1lIiwibmV4dFRpY2siLCJuZXh0IiwiZmx1c2hpbmciLCJyZXF1ZXN0VGljayIsImlzTm9kZUpTIiwibGF0ZXJRdWV1ZSIsImZsdXNoIiwiZG9tYWluIiwiZW50ZXIiLCJydW5TaW5nbGUiLCJleGl0IiwicHJvY2VzcyIsInNldEltbWVkaWF0ZSIsIk1lc3NhZ2VDaGFubmVsIiwiY2hhbm5lbCIsInBvcnQxIiwib25tZXNzYWdlIiwicmVxdWVzdFBvcnRUaWNrIiwicG9ydDIiLCJwb3N0TWVzc2FnZSIsInJ1bkFmdGVyIiwidW5jdXJyeVRoaXMiLCJmIiwiYXJyYXlfc2xpY2UiLCJhcnJheV9yZWR1Y2UiLCJjYWxsYmFjayIsImJhc2lzIiwiYXJyYXlfaW5kZXhPZiIsImFycmF5X21hcCIsInRoaXNwIiwib2JqZWN0X2NyZWF0ZSIsIlR5cGUiLCJvYmplY3RfaGFzT3duUHJvcGVydHkiLCJvYmplY3Rfa2V5cyIsIm9iamVjdF90b1N0cmluZyIsImlzU3RvcEl0ZXJhdGlvbiIsImV4Y2VwdGlvbiIsIlFSZXR1cm5WYWx1ZSIsIlJldHVyblZhbHVlIiwiU1RBQ0tfSlVNUF9TRVBBUkFUT1IiLCJtYWtlU3RhY2tUcmFjZUxvbmciLCJlcnJvciIsInByb21pc2UiLCJzdGFja3MiLCJ1bnNoaWZ0IiwiY29uY2F0ZWRTdGFja3MiLCJmaWx0ZXJTdGFja1N0cmluZyIsInN0YWNrU3RyaW5nIiwibGluZXMiLCJkZXNpcmVkTGluZXMiLCJsaW5lIiwiaXNJbnRlcm5hbEZyYW1lIiwiaXNOb2RlRnJhbWUiLCJzdGFja0xpbmUiLCJnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIiLCJhdHRlbXB0MSIsIk51bWJlciIsImF0dGVtcHQyIiwiYXR0ZW1wdDMiLCJmaWxlTmFtZUFuZExpbmVOdW1iZXIiLCJmaWxlTmFtZSIsImxpbmVOdW1iZXIiLCJxRW5kaW5nTGluZSIsImZpcnN0TGluZSIsImRlcHJlY2F0ZSIsImFsdGVybmF0aXZlIiwiY29uc29sZSIsIndhcm4iLCJQcm9taXNlIiwiaXNQcm9taXNlQWxpa2UiLCJjb2VyY2UiLCJmdWxmaWxsIiwicmVzb2x2ZSIsImxvbmdTdGFja1N1cHBvcnQiLCJlbnYiLCJRX0RFQlVHIiwibWVzc2FnZXMiLCJwcm9ncmVzc0xpc3RlbmVycyIsInJlc29sdmVkUHJvbWlzZSIsImRlZmVycmVkIiwicHJvbWlzZURpc3BhdGNoIiwib3AiLCJvcGVyYW5kcyIsIm5lYXJlclZhbHVlIiwibmVhcmVyIiwiaXNQcm9taXNlIiwiaW5zcGVjdCIsInN0YXRlIiwiYmVjb21lIiwibmV3UHJvbWlzZSIsIm1lc3NhZ2UiLCJyZWFzb24iLCJub3RpZnkiLCJwcm9ncmVzcyIsInByb2dyZXNzTGlzdGVuZXIiLCJtYWtlTm9kZVJlc29sdmVyIiwicmVzb2x2ZXIiLCJyYWNlIiwicGFzc0J5Q29weSIsInkiLCJ0aGF0Iiwic3ByZWFkIiwiYW5zd2VyUHMiLCJ0aGVuIiwibWFrZVByb21pc2UiLCJkZXNjcmlwdG9yIiwiaW5zcGVjdGVkIiwiZnVsZmlsbGVkIiwicmVqZWN0ZWQiLCJwcm9ncmVzc2VkIiwiZG9uZSIsIl9mdWxmaWxsZWQiLCJfcmVqZWN0ZWQiLCJuZXdFeGNlcHRpb24iLCJfcHJvZ3Jlc3NlZCIsIm5ld1ZhbHVlIiwidGhyZXciLCJvbmVycm9yIiwiZmNhbGwiLCJ0aGVuUmVzb2x2ZSIsIndoZW4iLCJ0aGVuUmVqZWN0IiwiaXNQZW5kaW5nIiwiaXNGdWxmaWxsZWQiLCJpc1JlamVjdGVkIiwidW5oYW5kbGVkUmVhc29ucyIsInVuaGFuZGxlZFJlamVjdGlvbnMiLCJyZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMiLCJ0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMiLCJyZXNldFVuaGFuZGxlZFJlamVjdGlvbnMiLCJ0cmFja1JlamVjdGlvbiIsInVudHJhY2tSZWplY3Rpb24iLCJhdCIsImF0UmVwb3J0IiwiZ2V0VW5oYW5kbGVkUmVhc29ucyIsInN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyIsInJlamVjdGlvbiIsInJocyIsIm1hc3RlciIsImRpc3BhdGNoIiwiYXN5bmMiLCJtYWtlR2VuZXJhdG9yIiwiY29udGludWVyIiwidmVyYiIsIlN0b3BJdGVyYXRpb24iLCJnZW5lcmF0b3IiLCJlcnJiYWNrIiwic3Bhd24iLCJfcmV0dXJuIiwicHJvbWlzZWQiLCJkZWwiLCJtYXBwbHkiLCJzZW5kIiwibWNhbGwiLCJmYXBwbHkiLCJmYmluZCIsImZib3VuZCIsInByb21pc2VzIiwicGVuZGluZ0NvdW50Iiwic25hcHNob3QiLCJvbkZ1bGZpbGxlZCIsIm9uUmVqZWN0ZWQiLCJvblByb2dyZXNzIiwiYWxsUmVzb2x2ZWQiLCJhbGxTZXR0bGVkIiwicmVnYXJkbGVzcyIsImZpbiIsIm9uVW5oYW5kbGVkRXJyb3IiLCJtcyIsInRpbWVvdXRJZCIsImNvZGUiLCJuZmFwcGx5Iiwibm9kZUFyZ3MiLCJuZmNhbGwiLCJuZmJpbmQiLCJkZW5vZGVpZnkiLCJiYXNlQXJncyIsIm5iaW5kIiwibm1hcHBseSIsIm5wb3N0IiwibnNlbmQiLCJubWNhbGwiLCJuaW52b2tlIiwibm9kZWlmeSIsIm5vZGViYWNrIiwibWVkaWF0b3IiLCJYTUxIdHRwUmVxdWVzdCIsImRlc2MiLCJkZWZpbmVQcm9wZXJ0eSIsImZhY3RvcnkiLCJYSFIiLCJkc3QiLCJsb3dlcmNhc2UiLCJwYXJzZUhlYWRlcnMiLCJoZWFkZXJzIiwicGFyc2VkIiwic3Vic3RyIiwiaGVhZGVyc0dldHRlciIsImhlYWRlcnNPYmoiLCJ0cmFuc2Zvcm1EYXRhIiwiaXNTdWNjZXNzIiwic3RhdHVzIiwiZm9yRWFjaFNvcnRlZCIsImJ1aWxkVXJsIiwicGFyYW1zIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicmVxdWVzdENvbmZpZyIsInRyYW5zZm9ybVJlcXVlc3QiLCJ0cmFuc2Zvcm1SZXNwb25zZSIsIm1lcmdlSGVhZGVycyIsImRlZkhlYWRlcnMiLCJyZXFIZWFkZXJzIiwiZGVmSGVhZGVyTmFtZSIsImxvd2VyY2FzZURlZkhlYWRlck5hbWUiLCJyZXFIZWFkZXJOYW1lIiwiZXhlY0hlYWRlcnMiLCJoZWFkZXJGbiIsImhlYWRlciIsImhlYWRlckNvbnRlbnQiLCJjb21tb24iLCJ0b1VwcGVyQ2FzZSIsInNlcnZlclJlcXVlc3QiLCJyZXFEYXRhIiwid2l0aENyZWRlbnRpYWxzIiwic2VuZFJlcSIsInJlc3BvbnNlIiwiaW50ZXJjZXB0b3JzIiwicmVxdWVzdCIsInJlcXVlc3RFcnJvciIsInN1Y2Nlc3MiLCJmYWlsdXJlIiwicmVzcG9uc2VFcnJvciIsImNvbnRlbnRUeXBlSnNvbiIsInBhcnNlIiwicGVuZGluZ1JlcXVlc3RzIiwiYWJvcnRlZCIsInNldFJlcXVlc3RIZWFkZXIiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwicmVzcG9uc2VIZWFkZXJzIiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwicmVzcG9uc2VUeXBlIiwicmVzcG9uc2VUZXh0Iiwib25wcm9ncmVzcyIsImFib3J0IiwidmVuZG9ycyIsInN1ZmZpeCIsInJhZiIsImNhZiIsInF1ZXVlIiwiZnJhbWVEdXJhdGlvbiIsIl9ub3ciLCJjcCIsImNhbmNlbGxlZCIsInJvdW5kIiwiaGFuZGxlIiwiZ2V0TmFub1NlY29uZHMiLCJocnRpbWUiLCJsb2FkVGltZSIsInBlcmZvcm1hbmNlIiwiaHIiLCJERUJVRyIsImRlYnVnIiwiaW5mbyIsIkV2ZW50cyIsIkxvYWRpbmciLCJMb2FkRGF0YSIsIkxvYWRFcnJvciIsIl9wb2xpY3kiLCJfdGFzayIsIl9tZWRpYXRvciIsInBvbGljeSIsIk9uY2UiLCJpbnRlcnZhbFRpbWUiLCJfbG9hZCIsImQiLCJ1bmxvYWQiLCJyZXMiLCJsb2FkIiwiZXZlbnROYW1lIiwic2hpZnQiLCJTdHJlYW1pbmdQb2xpY3kiLCJoYXNQcm9wIiwiY3RvciIsIl9fc3VwZXJfXyIsInN1cGVyQ2xhc3MiLCJGb3JtIiwiVmlldyIsIklucHV0IiwiSW5wdXRDb25kaXRpb24iLCJwcmVkaWNhdGUxIiwidGFnTmFtZTEiLCJsb29rdXAiLCJkZWZhdWx0VGFnTmFtZSIsInJlZ2lzdGVyIiwicmVmIiwiaW5wdXRzIiwiZm91bmQiLCJsZW4xIiwianMiLCJ2aWV3IiwibW9kZWwiLCJvYnMiLCJjcm93ZGNvbnRyb2wiXSwibWFwcGluZ3MiOiI7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