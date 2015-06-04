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
    var policy;
    policy = require('./data/policy');
    module.exports = {
      Api: require('./data/api'),
      Source: require('./data/source'),
      Policy: policy.Policy,
      TabularRestfulStreamingPolicy: policy.TabularRestfulStreamingPolicy
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/policy.coffee
  require.define('./data/policy', function (module, exports, __dirname, __filename) {
    var Policy, Q, TabularRestfulStreamingPolicy, _, extend = function (child, parent) {
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
      Policy.prototype.source = null;
      Policy.prototype.events = null;
      Policy.prototype.unload = function () {
      };
      Policy.prototype.load = function (res) {
        var d, data;
        d = Q.defer();
        data = res.data;
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
    TabularRestfulStreamingPolicy = function (superClass) {
      extend(TabularRestfulStreamingPolicy, superClass);
      function TabularRestfulStreamingPolicy() {
        return TabularRestfulStreamingPolicy.__super__.constructor.apply(this, arguments)
      }
      TabularRestfulStreamingPolicy.prototype.load = function (res) {
        var d, data, fail, failed, i, id, j, len, togo;
        d = Q.defer();
        data = res.data;
        if (!_.isArray(data)) {
          d.resolve(data);
          return d.promise
        }
        togo = 0;
        failed = false;
        fail = function (res) {
          togo--;
          return d.reject(res.message)
        };
        for (i = j = 0, len = data.length; j < len; i = ++j) {
          id = data[i];
          if (!_.isObject(id)) {
            togo++;
            data[i] = null;
            (function (_this) {
              return function (id, i) {
                var success;
                success = function (res) {
                  var datum, k, len1, partialData;
                  togo--;
                  data[i] = res.data;
                  if (togo === 0) {
                    return d.resolve(data)
                  } else if (!failed) {
                    partialData = [];
                    for (k = 0, len1 = data.length; k < len1; k++) {
                      datum = data[k];
                      if (datum != null) {
                        partialData.push(datum)
                      }
                    }
                    return d.notify(partialData)
                  }
                };
                return _this.source.api.get(_this.source.path + '/' + id).then(success, fail)
              }
            }(this)(id, i))
          }
        }
        return d.promise
      };
      return TabularRestfulStreamingPolicy
    }(Policy);
    module.exports = {
      Policy: Policy,
      TabularRestfulStreamingPolicy: TabularRestfulStreamingPolicy
    }
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
    Policy = require('./data/policy').Policy;
    Events = {
      Loading: 'Loading',
      LoadData: 'LoadData',
      LoadError: 'LoadError',
      LoadDataPartial: 'LoadDataPartial'
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
          log('Set Policy', this.policy);
          if (this._policy != null) {
            this._policy.source = null
          }
          this.stop();
          this._policy = value || Policy.Once;
          if (this._policy != null) {
            this._policy.source = this
          }
          return this.start()
        }
      });
      Source.prototype._task = null;
      Source.prototype._mediator = utils.mediator;
      function Source(options) {
        var policy;
        this.options = options;
        policy = this.options.policy || Policy.Once;
        delete this.options.policy;
        _.extend(this, this.options);
        if (this.api == null) {
          this.api = config.api
        }
        this.policy = policy
      }
      Source.prototype.start = function () {
        var policy;
        if (this.api != null) {
          policy = this.policy;
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
        var d, error, fail, load, progress, success;
        this.policy.unload();
        if (this.api != null) {
          this.trigger(Events.Loading);
          success = function (_this) {
            return function (data) {
              _this.trigger(Events.LoadData, data);
              return _this.data = data
            }
          }(this);
          error = function (_this) {
            return function (err) {
              return _this.trigger(Events.LoadError, err)
            }
          }(this);
          progress = function (_this) {
            return function (data) {
              _this.trigger(Events.LoadDataPartial, data);
              return _this.data = data
            }
          }(this);
          load = function (_this) {
            return function (res) {
              return _this.policy.load(res).done(success, error, progress)
            }
          }(this);
          fail = function (_this) {
            return function (res) {
              return _this.trigger(Events.LoadError, res.message)
            }
          }(this);
          return this.api.get(this.path).then(load, fail)
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
  // source: /Users/dtai/work/verus/crowdcontrol/src/view/index.coffee
  require.define('./view', function (module, exports, __dirname, __filename) {
    module.exports = {
      form: require('./view/form'),
      View: require('./view/view')
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/view/form.coffee
  require.define('./view/form', function (module, exports, __dirname, __filename) {
    var FormView, Input, InputCondition, InputConfig, InputView, InputViewEvents, Q, ValidatorCondition, View, _, helpers, riot, extend = function (child, parent) {
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
    riot = require('riot/riot');
    _ = require('underscore/underscore');
    Q = require('q/q');
    View = require('./view/view');
    InputConfig = function () {
      InputConfig.prototype.tag = '';
      InputConfig.prototype['default'] = '';
      InputConfig.prototype.placeholder = '';
      InputConfig.prototype.hints = '';
      function InputConfig(tag1, _default, placeholder, hints) {
        this.tag = tag1;
        this['default'] = _default;
        this.placeholder = placeholder;
        this.hints = hints
      }
      return InputConfig
    }();
    Input = function () {
      Input.prototype.tag = '';
      Input.prototype.model = {};
      Input.prototype.validator = function () {
      };
      function Input(tag1, model1, validator1) {
        this.tag = tag1;
        this.model = model1;
        this.validator = validator1
      }
      return Input
    }();
    ValidatorCondition = function () {
      function ValidatorCondition(predicate1, validatorFn1) {
        this.predicate = predicate1;
        this.validatorFn = validatorFn1
      }
      return ValidatorCondition
    }();
    InputCondition = function () {
      function InputCondition(predicate1, tagName1) {
        this.predicate = predicate1;
        this.tagName = tagName1
      }
      return InputCondition
    }();
    helpers = {
      tagLookup: [],
      validatorLookup: [],
      defaultTagName: 'form-input',
      errorTag: 'form-error',
      registerValidator: function (predicate, validatorFn) {
        if (_.isFunction(validatorFn)) {
          return this.tagLookup.push(new ValidatorCondition(predicate, validatorFn))
        }
      },
      registerTag: function (predicate, tagName) {
        return this.tagLookup.push(new InputCondition(predicate, tagName))
      },
      deleteTag: function (tagName) {
        var i, j, len, lookup, ref, results;
        ref = this.tagLookup;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          lookup = ref[i];
          if (lookup.tagName === tagName) {
            results.push(this.tagLookup[i] = null)
          } else {
            results.push(void 0)
          }
        }
        return results
      },
      deleteValidator: function (predicate, validatorFn) {
        var i, j, len, lookup, ref, results;
        ref = this.validatorLookup;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          lookup = ref[i];
          if (lookup.validatorFn === validatorFn) {
            results.push(this.validatorLookup[i] = null)
          } else {
            results.push(void 0)
          }
        }
        return results
      },
      render: function (inputCfgs) {
        var found, i, inputCfg, inputs, j, k, l, len, len1, len2, lookup, model, ref, ref1, tag, validator, validators;
        inputs = {};
        for (i = j = 0, len = inputCfgs.length; j < len; i = ++j) {
          inputCfg = inputCfgs[i];
          if (inputCfg == null) {
            continue
          }
          validators = [function (pair) {
              var model, name;
              model = pair[0], name = pair[1];
              d.resolve(model[name]);
              return d.promise
            }];
          ref = this.validatorLookup;
          for (k = 0, len1 = ref.length; k < len1; k++) {
            lookup = ref[k];
            if (lookup.predicate(inputCfg)) {
              validators.unshift(function (pair) {
                var model, name;
                model = pair[0], name = pair[1];
                return validatorFn(model, name).then(function (v) {
                  var d;
                  model[name] = v;
                  d = Q.defer();
                  d.resolve(pair);
                  return d
                })
              })
            }
          }
          validator = function (model, name) {
            var l, len2, result, validatorFn;
            result = Q([
              model,
              name
            ]);
            for (l = 0, len2 = validators.length; l < len2; l++) {
              validatorFn = validators[l];
              result = result.then(validatorFn)
            }
            return result
          };
          found = false;
          ref1 = this.tagLookup;
          for (l = 0, len2 = ref1.length; l < len2; l++) {
            lookup = ref1[l];
            if (lookup == null) {
              continue
            }
            if (lookup.predicate(inputCfg)) {
              tag = lookup.tagName;
              found = true;
              break
            }
          }
          if (found) {
            tag = this.defaultTagName
          }
          model = {
            name: inputCfg.name,
            value: inputCfg['default'],
            placeholder: inputCfg.placeholder
          };
          inputs[inputCfg.name] = new RenderedInput(tag, model, validator)
        }
        return inputs
      }
    };
    InputViewEvents = {
      Set: 'set',
      Change: 'change',
      Error: 'error',
      ClearError: 'clear-error'
    };
    InputView = function (superClass) {
      var obj;
      extend(InputView, superClass);
      function InputView() {
        return InputView.__super__.constructor.apply(this, arguments)
      }
      InputView.Events = InputViewEvents;
      InputView.prototype.errorHtml = '<div class="error-message" if="{ hasError() }">{ error }</div>';
      InputView.prototype.init = function () {
        return this.html += this.errorHtml
      };
      InputView.prototype.events = (obj = {}, obj['' + InputViewEvents.Set] = function (name, value) {
        if (name === this.model.name) {
          return model.value = value
        }
      }, obj['' + InputViewEvents.Error] = function (name, message) {
        if (name === this.model.name) {
          return this.setError(message)
        }
      }, obj['' + InputViewEvents.ClearError] = function (name) {
        if (name === this.model.name) {
          return this.clearError()
        }
      }, obj);
      InputView.prototype.mixins = {
        change: function (event) {
          return InputView.obs.trigger(InputViewEvents.Change, InputView.model.name, event.target)
        },
        hasError: function () {
          return this.error !== null && this.error.length > 0
        },
        setError: function (message) {
          return this.error = message
        },
        clearError: function () {
          return this.setError(null)
        }
      };
      InputView.prototype.js = function () {
      };
      return InputView
    }(View);
    riot.tag('crowdcontrol-input', '', function (opts) {
      var input, obs;
      input = opts.input;
      return obs = opts.obs
    });
    FormView = function (superClass) {
      extend(FormView, superClass);
      function FormView() {
        return FormView.__super__.constructor.apply(this, arguments)
      }
      FormView.prototype.inputConfigs = null;
      FormView.prototype.inputs = {};
      FormView.prototype.getValue = function (el) {
        return el.value
      };
      FormView.prototype.init = function () {
        if (this.inputConfigs != null) {
          return this.inputs = helper.render(this.inputConfigs)
        }
      };
      FormView.prototype.events = function () {
        var obj;
        return obj = {}, obj['' + InputViewEvents.Change] = function (name, target) {
          var input;
          input = this.inputs[name];
          return input.validator().done(function (_this) {
            return function () {
              return _this.obs.trigger(InputViewEvents.Set(name, _this.model[name]))
            }
          }(this), function (_this) {
            return function (err) {
              return _this.obs.trigger(InputViewEvents.Error(err))
            }
          }(this))
        }, obj
      };
      FormView.prototype.js = function () {
        return this.view.initFormGroup.apply(this)
      };
      FormView.prototype.initFormGroup = function () {
        return this.inputs = this.view.inputs
      };
      return FormView
    }(View);
    module.exports = {
      helpers: helpers,
      FormView: FormView,
      InputView: InputView,
      InputConfig: InputConfig
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
      View.prototype.events = null;
      View.prototype.mixins = null;
      View.prototype.js = function () {
      };
      function View(options) {
        var view;
        this.options = options;
        _.extend(this, this.options);
        view = this;
        this.init();
        riot.tag(this.name, this.html, this.css, this.attrs, function (opts) {
          var handler, name, obs, ref;
          this.view = view;
          view.ctx = this;
          this.model = opts.model;
          if (this.model == null) {
            this.model = {}
          }
          obs = this.obs = opts.obs;
          if (this.obs == null) {
            obs = this.obs = {};
            utils.shim.observable(obs)
          }
          if (view.events) {
            ref = view.events;
            for (name in ref) {
              handler = ref[name];
              obs.on(name, function (_this) {
                return function () {
                  return handler.apply(_this, arguments)
                }
              }(this))
            }
          }
          if (view.mixins) {
            _.extend(this, view.mixins)
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yaW90L3Jpb3QuanMiLCJkYXRhL2luZGV4LmNvZmZlZSIsImRhdGEvcG9saWN5LmNvZmZlZSIsIm5vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiLCJub2RlX21vZHVsZXMvcS9xLmpzIiwiZGF0YS9hcGkuY29mZmVlIiwiY29uZmlnLmNvZmZlZSIsInV0aWxzL2luZGV4LmNvZmZlZSIsInV0aWxzL3NoaW0uY29mZmVlIiwibm9kZV9tb2R1bGVzL3EteGhyL3EteGhyLmpzIiwibm9kZV9tb2R1bGVzL3JhZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yYWYvbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwidXRpbHMvbG9nLmNvZmZlZSIsInV0aWxzL21lZGlhdG9yLmNvZmZlZSIsImRhdGEvc291cmNlLmNvZmZlZSIsInZpZXcvaW5kZXguY29mZmVlIiwidmlldy9mb3JtLmNvZmZlZSIsInZpZXcvdmlldy5jb2ZmZWUiLCJjcm93ZGNvbnRyb2wuY29mZmVlIl0sIm5hbWVzIjpbIndpbmRvdyIsInJpb3QiLCJ2ZXJzaW9uIiwic2V0dGluZ3MiLCJvYnNlcnZhYmxlIiwiZWwiLCJjYWxsYmFja3MiLCJfaWQiLCJvbiIsImV2ZW50cyIsImZuIiwicmVwbGFjZSIsIm5hbWUiLCJwb3MiLCJwdXNoIiwidHlwZWQiLCJvZmYiLCJhcnIiLCJpIiwiY2IiLCJzcGxpY2UiLCJvbmUiLCJhcHBseSIsImFyZ3VtZW50cyIsInRyaWdnZXIiLCJhcmdzIiwic2xpY2UiLCJjYWxsIiwiZm5zIiwiYnVzeSIsImNvbmNhdCIsImFsbCIsIm1peGluIiwicmVnaXN0ZXJlZE1peGlucyIsImV2dCIsImxvYyIsImxvY2F0aW9uIiwid2luIiwic3RhcnRlZCIsImN1cnJlbnQiLCJoYXNoIiwiaHJlZiIsInNwbGl0IiwicGFyc2VyIiwicGF0aCIsImVtaXQiLCJ0eXBlIiwiciIsInJvdXRlIiwiYXJnIiwiZXhlYyIsInN0b3AiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJzdGFydCIsImFkZEV2ZW50TGlzdGVuZXIiLCJhdHRhY2hFdmVudCIsImJyYWNrZXRzIiwib3JpZyIsInMiLCJiIiwieCIsInRlc3QiLCJSZWdFeHAiLCJzb3VyY2UiLCJnbG9iYWwiLCJ0bXBsIiwiY2FjaGUiLCJyZVZhcnMiLCJzdHIiLCJkYXRhIiwicCIsImV4dHJhY3QiLCJGdW5jdGlvbiIsImV4cHIiLCJtYXAiLCJqb2luIiwibiIsInBhaXIiLCJfIiwiayIsInYiLCJ3cmFwIiwibm9udWxsIiwidHJpbSIsInN1YnN0cmluZ3MiLCJwYXJ0cyIsInN1YiIsImluZGV4T2YiLCJsZW5ndGgiLCJvcGVuIiwiY2xvc2UiLCJsZXZlbCIsIm1hdGNoZXMiLCJyZSIsImxvb3BLZXlzIiwicmV0IiwidmFsIiwiZWxzIiwia2V5IiwibWtpdGVtIiwiaXRlbSIsIl9lYWNoIiwiZG9tIiwicGFyZW50IiwicmVtQXR0ciIsInRlbXBsYXRlIiwib3V0ZXJIVE1MIiwicHJldiIsInByZXZpb3VzU2libGluZyIsInJvb3QiLCJwYXJlbnROb2RlIiwicmVuZGVyZWQiLCJ0YWdzIiwiY2hlY2tzdW0iLCJhZGQiLCJ0YWciLCJyZW1vdmVDaGlsZCIsInN0dWIiLCJpdGVtcyIsIkFycmF5IiwiaXNBcnJheSIsInRlc3RzdW0iLCJKU09OIiwic3RyaW5naWZ5IiwiZWFjaCIsInVubW91bnQiLCJPYmplY3QiLCJrZXlzIiwibmV3SXRlbXMiLCJhcnJGaW5kRXF1YWxzIiwib2xkSXRlbXMiLCJwcmV2QmFzZSIsImNoaWxkTm9kZXMiLCJvbGRQb3MiLCJsYXN0SW5kZXhPZiIsIm5vZGVzIiwiX2l0ZW0iLCJUYWciLCJiZWZvcmUiLCJtb3VudCIsInVwZGF0ZSIsImluc2VydEJlZm9yZSIsIndhbGsiLCJhdHRyaWJ1dGVzIiwiYXR0ciIsInZhbHVlIiwicGFyc2VOYW1lZEVsZW1lbnRzIiwiY2hpbGRUYWdzIiwibm9kZVR5cGUiLCJpc0xvb3AiLCJnZXRBdHRyaWJ1dGUiLCJjaGlsZCIsImdldFRhZyIsImlubmVySFRNTCIsIm5hbWVkVGFnIiwidGFnTmFtZSIsInB0YWciLCJjYWNoZWRUYWciLCJwYXJzZUV4cHJlc3Npb25zIiwiZXhwcmVzc2lvbnMiLCJhZGRFeHByIiwiZXh0cmEiLCJleHRlbmQiLCJub2RlVmFsdWUiLCJib29sIiwiaW1wbCIsImNvbmYiLCJzZWxmIiwib3B0cyIsImluaGVyaXQiLCJta2RvbSIsInRvTG93ZXJDYXNlIiwibG9vcERvbSIsIlRBR19BVFRSSUJVVEVTIiwiX3RhZyIsImF0dHJzIiwibWF0Y2giLCJhIiwia3YiLCJzZXRBdHRyaWJ1dGUiLCJmYXN0QWJzIiwiRGF0ZSIsImdldFRpbWUiLCJNYXRoIiwicmFuZG9tIiwicmVwbGFjZVlpZWxkIiwidXBkYXRlT3B0cyIsImluaXQiLCJtaXgiLCJiaW5kIiwidG9nZ2xlIiwiZmlyc3RDaGlsZCIsImFwcGVuZENoaWxkIiwia2VlcFJvb3RUYWciLCJ1bmRlZmluZWQiLCJpc01vdW50Iiwic2V0RXZlbnRIYW5kbGVyIiwiaGFuZGxlciIsImUiLCJldmVudCIsIndoaWNoIiwiY2hhckNvZGUiLCJrZXlDb2RlIiwidGFyZ2V0Iiwic3JjRWxlbWVudCIsImN1cnJlbnRUYXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsInJldHVyblZhbHVlIiwicHJldmVudFVwZGF0ZSIsImluc2VydFRvIiwibm9kZSIsImF0dHJOYW1lIiwidG9TdHJpbmciLCJkb2N1bWVudCIsImNyZWF0ZVRleHROb2RlIiwic3R5bGUiLCJkaXNwbGF5IiwibGVuIiwicmVtb3ZlQXR0cmlidXRlIiwibnIiLCJvYmoiLCJmcm9tIiwiZnJvbTIiLCJjaGVja0lFIiwidWEiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJtc2llIiwicGFyc2VJbnQiLCJzdWJzdHJpbmciLCJvcHRpb25Jbm5lckhUTUwiLCJodG1sIiwib3B0IiwiY3JlYXRlRWxlbWVudCIsInZhbFJlZ3giLCJzZWxSZWd4IiwidmFsdWVzTWF0Y2giLCJzZWxlY3RlZE1hdGNoIiwidGJvZHlJbm5lckhUTUwiLCJkaXYiLCJyb290VGFnIiwibWtFbCIsImllVmVyc2lvbiIsIm5leHRTaWJsaW5nIiwiJCQiLCJzZWxlY3RvciIsImN0eCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJhcnJEaWZmIiwiYXJyMSIsImFycjIiLCJmaWx0ZXIiLCJfZWwiLCJDaGlsZCIsInByb3RvdHlwZSIsImxvb3BzIiwidmlydHVhbERvbSIsInRhZ0ltcGwiLCJzdHlsZU5vZGUiLCJpbmplY3RTdHlsZSIsImNzcyIsImhlYWQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsIl9yZW5kZXJlZCIsImJvZHkiLCJtb3VudFRvIiwic2VsY3RBbGxUYWdzIiwibGlzdCIsInQiLCJhbGxUYWdzIiwibm9kZUxpc3QiLCJ1dGlsIiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsInBvbGljeSIsInJlcXVpcmUiLCJBcGkiLCJTb3VyY2UiLCJQb2xpY3kiLCJUYWJ1bGFyUmVzdGZ1bFN0cmVhbWluZ1BvbGljeSIsIlEiLCJoYXNQcm9wIiwiY3RvciIsImNvbnN0cnVjdG9yIiwiX19zdXBlcl9fIiwiaGFzT3duUHJvcGVydHkiLCJpbnRlcnZhbFRpbWUiLCJJbmZpbml0eSIsInVubG9hZCIsImxvYWQiLCJyZXMiLCJkIiwiZGVmZXIiLCJyZXNvbHZlIiwicHJvbWlzZSIsIm9wdGlvbnMiLCJPbmNlIiwic3VwZXJDbGFzcyIsImZhaWwiLCJmYWlsZWQiLCJpZCIsImoiLCJ0b2dvIiwicmVqZWN0IiwibWVzc2FnZSIsImlzT2JqZWN0IiwiX3RoaXMiLCJzdWNjZXNzIiwiZGF0dW0iLCJsZW4xIiwicGFydGlhbERhdGEiLCJub3RpZnkiLCJhcGkiLCJnZXQiLCJ0aGVuIiwicHJldmlvdXNVbmRlcnNjb3JlIiwiQXJyYXlQcm90byIsIk9ialByb3RvIiwiRnVuY1Byb3RvIiwibmF0aXZlSXNBcnJheSIsIm5hdGl2ZUtleXMiLCJuYXRpdmVCaW5kIiwibmF0aXZlQ3JlYXRlIiwiY3JlYXRlIiwiQ3RvciIsIl93cmFwcGVkIiwiVkVSU0lPTiIsIm9wdGltaXplQ2IiLCJmdW5jIiwiY29udGV4dCIsImFyZ0NvdW50Iiwib3RoZXIiLCJpbmRleCIsImNvbGxlY3Rpb24iLCJhY2N1bXVsYXRvciIsImlkZW50aXR5IiwiaXNGdW5jdGlvbiIsIm1hdGNoZXIiLCJwcm9wZXJ0eSIsIml0ZXJhdGVlIiwiY3JlYXRlQXNzaWduZXIiLCJrZXlzRnVuYyIsInVuZGVmaW5lZE9ubHkiLCJsIiwiYmFzZUNyZWF0ZSIsInJlc3VsdCIsIk1BWF9BUlJBWV9JTkRFWCIsInBvdyIsImdldExlbmd0aCIsImlzQXJyYXlMaWtlIiwiZm9yRWFjaCIsImNvbGxlY3QiLCJyZXN1bHRzIiwiY3VycmVudEtleSIsImNyZWF0ZVJlZHVjZSIsImRpciIsIml0ZXJhdG9yIiwibWVtbyIsInJlZHVjZSIsImZvbGRsIiwiaW5qZWN0IiwicmVkdWNlUmlnaHQiLCJmb2xkciIsImZpbmQiLCJkZXRlY3QiLCJwcmVkaWNhdGUiLCJmaW5kSW5kZXgiLCJmaW5kS2V5Iiwic2VsZWN0IiwibmVnYXRlIiwiZXZlcnkiLCJzb21lIiwiYW55IiwiY29udGFpbnMiLCJpbmNsdWRlcyIsImluY2x1ZGUiLCJmcm9tSW5kZXgiLCJndWFyZCIsInZhbHVlcyIsImludm9rZSIsIm1ldGhvZCIsImlzRnVuYyIsInBsdWNrIiwid2hlcmUiLCJmaW5kV2hlcmUiLCJtYXgiLCJsYXN0Q29tcHV0ZWQiLCJjb21wdXRlZCIsIm1pbiIsInNodWZmbGUiLCJzZXQiLCJzaHVmZmxlZCIsInJhbmQiLCJzYW1wbGUiLCJzb3J0QnkiLCJjcml0ZXJpYSIsInNvcnQiLCJsZWZ0IiwicmlnaHQiLCJncm91cCIsImJlaGF2aW9yIiwiZ3JvdXBCeSIsImhhcyIsImluZGV4QnkiLCJjb3VudEJ5IiwidG9BcnJheSIsInNpemUiLCJwYXJ0aXRpb24iLCJwYXNzIiwiZmlyc3QiLCJ0YWtlIiwiYXJyYXkiLCJpbml0aWFsIiwibGFzdCIsInJlc3QiLCJ0YWlsIiwiZHJvcCIsImNvbXBhY3QiLCJmbGF0dGVuIiwiaW5wdXQiLCJzaGFsbG93Iiwic3RyaWN0Iiwic3RhcnRJbmRleCIsIm91dHB1dCIsImlkeCIsImlzQXJndW1lbnRzIiwid2l0aG91dCIsImRpZmZlcmVuY2UiLCJ1bmlxIiwidW5pcXVlIiwiaXNTb3J0ZWQiLCJpc0Jvb2xlYW4iLCJzZWVuIiwidW5pb24iLCJpbnRlcnNlY3Rpb24iLCJhcmdzTGVuZ3RoIiwiemlwIiwidW56aXAiLCJvYmplY3QiLCJjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlciIsImZpbmRMYXN0SW5kZXgiLCJzb3J0ZWRJbmRleCIsImxvdyIsImhpZ2giLCJtaWQiLCJmbG9vciIsImNyZWF0ZUluZGV4RmluZGVyIiwicHJlZGljYXRlRmluZCIsImlzTmFOIiwicmFuZ2UiLCJzdGVwIiwiY2VpbCIsImV4ZWN1dGVCb3VuZCIsInNvdXJjZUZ1bmMiLCJib3VuZEZ1bmMiLCJjYWxsaW5nQ29udGV4dCIsIlR5cGVFcnJvciIsImJvdW5kIiwicGFydGlhbCIsImJvdW5kQXJncyIsInBvc2l0aW9uIiwiYmluZEFsbCIsIkVycm9yIiwibWVtb2l6ZSIsImhhc2hlciIsImFkZHJlc3MiLCJkZWxheSIsIndhaXQiLCJzZXRUaW1lb3V0IiwidGhyb3R0bGUiLCJ0aW1lb3V0IiwicHJldmlvdXMiLCJsYXRlciIsImxlYWRpbmciLCJub3ciLCJyZW1haW5pbmciLCJjbGVhclRpbWVvdXQiLCJ0cmFpbGluZyIsImRlYm91bmNlIiwiaW1tZWRpYXRlIiwidGltZXN0YW1wIiwiY2FsbE5vdyIsIndyYXBwZXIiLCJjb21wb3NlIiwiYWZ0ZXIiLCJ0aW1lcyIsIm9uY2UiLCJoYXNFbnVtQnVnIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJub25FbnVtZXJhYmxlUHJvcHMiLCJjb2xsZWN0Tm9uRW51bVByb3BzIiwibm9uRW51bUlkeCIsInByb3RvIiwicHJvcCIsImFsbEtleXMiLCJtYXBPYmplY3QiLCJwYWlycyIsImludmVydCIsImZ1bmN0aW9ucyIsIm1ldGhvZHMiLCJuYW1lcyIsImV4dGVuZE93biIsImFzc2lnbiIsInBpY2siLCJvaXRlcmF0ZWUiLCJvbWl0IiwiU3RyaW5nIiwiZGVmYXVsdHMiLCJwcm9wcyIsImNsb25lIiwidGFwIiwiaW50ZXJjZXB0b3IiLCJpc01hdGNoIiwiZXEiLCJhU3RhY2siLCJiU3RhY2siLCJjbGFzc05hbWUiLCJhcmVBcnJheXMiLCJhQ3RvciIsImJDdG9yIiwicG9wIiwiaXNFcXVhbCIsImlzRW1wdHkiLCJpc1N0cmluZyIsImlzRWxlbWVudCIsIkludDhBcnJheSIsImlzRmluaXRlIiwicGFyc2VGbG9hdCIsImlzTnVtYmVyIiwiaXNOdWxsIiwiaXNVbmRlZmluZWQiLCJub0NvbmZsaWN0IiwiY29uc3RhbnQiLCJub29wIiwicHJvcGVydHlPZiIsImFjY3VtIiwiZXNjYXBlTWFwIiwidW5lc2NhcGVNYXAiLCJjcmVhdGVFc2NhcGVyIiwiZXNjYXBlciIsInRlc3RSZWdleHAiLCJyZXBsYWNlUmVnZXhwIiwic3RyaW5nIiwiZXNjYXBlIiwidW5lc2NhcGUiLCJmYWxsYmFjayIsImlkQ291bnRlciIsInVuaXF1ZUlkIiwicHJlZml4IiwidGVtcGxhdGVTZXR0aW5ncyIsImV2YWx1YXRlIiwiaW50ZXJwb2xhdGUiLCJub01hdGNoIiwiZXNjYXBlcyIsImVzY2FwZUNoYXIiLCJ0ZXh0Iiwib2xkU2V0dGluZ3MiLCJvZmZzZXQiLCJ2YXJpYWJsZSIsInJlbmRlciIsImFyZ3VtZW50IiwiY2hhaW4iLCJpbnN0YW5jZSIsIl9jaGFpbiIsInZhbHVlT2YiLCJ0b0pTT04iLCJkZWZpbml0aW9uIiwiYm9vdHN0cmFwIiwic2VzIiwib2siLCJtYWtlUSIsInByZXZpb3VzUSIsImhhc1N0YWNrcyIsInN0YWNrIiwicVN0YXJ0aW5nTGluZSIsImNhcHR1cmVMaW5lIiwicUZpbGVOYW1lIiwibmV4dFRpY2siLCJ0YXNrIiwibmV4dCIsImZsdXNoaW5nIiwicmVxdWVzdFRpY2siLCJpc05vZGVKUyIsImxhdGVyUXVldWUiLCJmbHVzaCIsImRvbWFpbiIsImVudGVyIiwicnVuU2luZ2xlIiwiZXhpdCIsInByb2Nlc3MiLCJzZXRJbW1lZGlhdGUiLCJNZXNzYWdlQ2hhbm5lbCIsImNoYW5uZWwiLCJwb3J0MSIsIm9ubWVzc2FnZSIsInJlcXVlc3RQb3J0VGljayIsInBvcnQyIiwicG9zdE1lc3NhZ2UiLCJydW5BZnRlciIsInVuY3VycnlUaGlzIiwiZiIsImFycmF5X3NsaWNlIiwiYXJyYXlfcmVkdWNlIiwiY2FsbGJhY2siLCJiYXNpcyIsImFycmF5X2luZGV4T2YiLCJhcnJheV9tYXAiLCJ0aGlzcCIsIm9iamVjdF9jcmVhdGUiLCJUeXBlIiwib2JqZWN0X2hhc093blByb3BlcnR5Iiwib2JqZWN0X2tleXMiLCJvYmplY3RfdG9TdHJpbmciLCJpc1N0b3BJdGVyYXRpb24iLCJleGNlcHRpb24iLCJRUmV0dXJuVmFsdWUiLCJSZXR1cm5WYWx1ZSIsIlNUQUNLX0pVTVBfU0VQQVJBVE9SIiwibWFrZVN0YWNrVHJhY2VMb25nIiwiZXJyb3IiLCJzdGFja3MiLCJ1bnNoaWZ0IiwiY29uY2F0ZWRTdGFja3MiLCJmaWx0ZXJTdGFja1N0cmluZyIsInN0YWNrU3RyaW5nIiwibGluZXMiLCJkZXNpcmVkTGluZXMiLCJsaW5lIiwiaXNJbnRlcm5hbEZyYW1lIiwiaXNOb2RlRnJhbWUiLCJzdGFja0xpbmUiLCJnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIiLCJhdHRlbXB0MSIsIk51bWJlciIsImF0dGVtcHQyIiwiYXR0ZW1wdDMiLCJmaWxlTmFtZUFuZExpbmVOdW1iZXIiLCJmaWxlTmFtZSIsImxpbmVOdW1iZXIiLCJxRW5kaW5nTGluZSIsImZpcnN0TGluZSIsImRlcHJlY2F0ZSIsImFsdGVybmF0aXZlIiwiY29uc29sZSIsIndhcm4iLCJQcm9taXNlIiwiaXNQcm9taXNlQWxpa2UiLCJjb2VyY2UiLCJmdWxmaWxsIiwibG9uZ1N0YWNrU3VwcG9ydCIsImVudiIsIlFfREVCVUciLCJtZXNzYWdlcyIsInByb2dyZXNzTGlzdGVuZXJzIiwicmVzb2x2ZWRQcm9taXNlIiwiZGVmZXJyZWQiLCJwcm9taXNlRGlzcGF0Y2giLCJvcCIsIm9wZXJhbmRzIiwibmVhcmVyVmFsdWUiLCJuZWFyZXIiLCJpc1Byb21pc2UiLCJpbnNwZWN0Iiwic3RhdGUiLCJiZWNvbWUiLCJuZXdQcm9taXNlIiwicmVhc29uIiwicHJvZ3Jlc3MiLCJwcm9ncmVzc0xpc3RlbmVyIiwibWFrZU5vZGVSZXNvbHZlciIsInJlc29sdmVyIiwicmFjZSIsInBhc3NCeUNvcHkiLCJ5IiwidGhhdCIsInNwcmVhZCIsImFuc3dlclBzIiwibWFrZVByb21pc2UiLCJkZXNjcmlwdG9yIiwiaW5zcGVjdGVkIiwiZnVsZmlsbGVkIiwicmVqZWN0ZWQiLCJwcm9ncmVzc2VkIiwiZG9uZSIsIl9mdWxmaWxsZWQiLCJfcmVqZWN0ZWQiLCJuZXdFeGNlcHRpb24iLCJfcHJvZ3Jlc3NlZCIsIm5ld1ZhbHVlIiwidGhyZXciLCJvbmVycm9yIiwiZmNhbGwiLCJ0aGVuUmVzb2x2ZSIsIndoZW4iLCJ0aGVuUmVqZWN0IiwiaXNQZW5kaW5nIiwiaXNGdWxmaWxsZWQiLCJpc1JlamVjdGVkIiwidW5oYW5kbGVkUmVhc29ucyIsInVuaGFuZGxlZFJlamVjdGlvbnMiLCJyZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMiLCJ0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMiLCJyZXNldFVuaGFuZGxlZFJlamVjdGlvbnMiLCJ0cmFja1JlamVjdGlvbiIsInVudHJhY2tSZWplY3Rpb24iLCJhdCIsImF0UmVwb3J0IiwiZ2V0VW5oYW5kbGVkUmVhc29ucyIsInN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyIsInJlamVjdGlvbiIsInJocyIsIm1hc3RlciIsImRpc3BhdGNoIiwiYXN5bmMiLCJtYWtlR2VuZXJhdG9yIiwiY29udGludWVyIiwidmVyYiIsIlN0b3BJdGVyYXRpb24iLCJnZW5lcmF0b3IiLCJlcnJiYWNrIiwic3Bhd24iLCJfcmV0dXJuIiwicHJvbWlzZWQiLCJkZWwiLCJtYXBwbHkiLCJwb3N0Iiwic2VuZCIsIm1jYWxsIiwiZmFwcGx5IiwiZmJpbmQiLCJmYm91bmQiLCJwcm9taXNlcyIsInBlbmRpbmdDb3VudCIsInNuYXBzaG90Iiwib25GdWxmaWxsZWQiLCJvblJlamVjdGVkIiwib25Qcm9ncmVzcyIsImFsbFJlc29sdmVkIiwiYWxsU2V0dGxlZCIsInJlZ2FyZGxlc3MiLCJmaW4iLCJvblVuaGFuZGxlZEVycm9yIiwibXMiLCJ0aW1lb3V0SWQiLCJjb2RlIiwibmZhcHBseSIsIm5vZGVBcmdzIiwibmZjYWxsIiwibmZiaW5kIiwiZGVub2RlaWZ5IiwiYmFzZUFyZ3MiLCJuYmluZCIsIm5tYXBwbHkiLCJucG9zdCIsIm5zZW5kIiwibm1jYWxsIiwibmludm9rZSIsIm5vZGVpZnkiLCJub2RlYmFjayIsIlNjaGVkdWxlZFRhc2siLCJTY2hlZHVsZWRUYXNrVHlwZSIsImNvbmZpZyIsImxvZyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInV0aWxzIiwic2hpbSIsImZuMSIsIm1pbGxpczEiLCJtaWxsaXMiLCJzY2hlZHVsZWRUaW1lIiwia2lsbCIsImNhbmNlbCIsInNjaGVkdWxlZFRhc2tzIiwidXJsIiwidG9rZW4iLCJ4aHIiLCJwdXQiLCJwYXRjaCIsInNjaGVkdWxlT25jZSIsImxvb3AiLCJzY2hlZHVsZUV2ZXJ5Iiwic2ZuIiwibWVkaWF0b3IiLCJYTUxIdHRwUmVxdWVzdCIsImRlc2MiLCJkZWZpbmVQcm9wZXJ0eSIsImZhY3RvcnkiLCJYSFIiLCJkc3QiLCJsb3dlcmNhc2UiLCJwYXJzZUhlYWRlcnMiLCJoZWFkZXJzIiwicGFyc2VkIiwic3Vic3RyIiwiaGVhZGVyc0dldHRlciIsImhlYWRlcnNPYmoiLCJ0cmFuc2Zvcm1EYXRhIiwiaXNTdWNjZXNzIiwic3RhdHVzIiwiZm9yRWFjaFNvcnRlZCIsImJ1aWxkVXJsIiwicGFyYW1zIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicmVxdWVzdENvbmZpZyIsInRyYW5zZm9ybVJlcXVlc3QiLCJ0cmFuc2Zvcm1SZXNwb25zZSIsIm1lcmdlSGVhZGVycyIsImRlZkhlYWRlcnMiLCJyZXFIZWFkZXJzIiwiZGVmSGVhZGVyTmFtZSIsImxvd2VyY2FzZURlZkhlYWRlck5hbWUiLCJyZXFIZWFkZXJOYW1lIiwiZXhlY0hlYWRlcnMiLCJoZWFkZXJGbiIsImhlYWRlciIsImhlYWRlckNvbnRlbnQiLCJjb21tb24iLCJ0b1VwcGVyQ2FzZSIsInNlcnZlclJlcXVlc3QiLCJyZXFEYXRhIiwid2l0aENyZWRlbnRpYWxzIiwic2VuZFJlcSIsInJlc3BvbnNlIiwiaW50ZXJjZXB0b3JzIiwicmVxdWVzdCIsInJlcXVlc3RFcnJvciIsImZhaWx1cmUiLCJyZXNwb25zZUVycm9yIiwiY29udGVudFR5cGVKc29uIiwicGFyc2UiLCJwZW5kaW5nUmVxdWVzdHMiLCJhYm9ydGVkIiwic2V0UmVxdWVzdEhlYWRlciIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJyZXNwb25zZUhlYWRlcnMiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJvbnByb2dyZXNzIiwiYWJvcnQiLCJ2ZW5kb3JzIiwic3VmZml4IiwicmFmIiwiY2FmIiwicXVldWUiLCJmcmFtZUR1cmF0aW9uIiwiX25vdyIsImNwIiwiY2FuY2VsbGVkIiwicm91bmQiLCJoYW5kbGUiLCJnZXROYW5vU2Vjb25kcyIsImhydGltZSIsImxvYWRUaW1lIiwicGVyZm9ybWFuY2UiLCJociIsIkRFQlVHIiwiZGVidWciLCJpbmZvIiwiRXZlbnRzIiwiTG9hZGluZyIsIkxvYWREYXRhIiwiTG9hZEVycm9yIiwiTG9hZERhdGFQYXJ0aWFsIiwiX3BvbGljeSIsIl90YXNrIiwiX21lZGlhdG9yIiwiX2xvYWQiLCJlcnIiLCJldmVudE5hbWUiLCJzaGlmdCIsImZvcm0iLCJWaWV3IiwiRm9ybVZpZXciLCJJbnB1dCIsIklucHV0Q29uZGl0aW9uIiwiSW5wdXRDb25maWciLCJJbnB1dFZpZXciLCJJbnB1dFZpZXdFdmVudHMiLCJWYWxpZGF0b3JDb25kaXRpb24iLCJoZWxwZXJzIiwicGxhY2Vob2xkZXIiLCJoaW50cyIsInRhZzEiLCJfZGVmYXVsdCIsIm1vZGVsIiwidmFsaWRhdG9yIiwibW9kZWwxIiwidmFsaWRhdG9yMSIsInByZWRpY2F0ZTEiLCJ2YWxpZGF0b3JGbjEiLCJ2YWxpZGF0b3JGbiIsInRhZ05hbWUxIiwidGFnTG9va3VwIiwidmFsaWRhdG9yTG9va3VwIiwiZGVmYXVsdFRhZ05hbWUiLCJlcnJvclRhZyIsInJlZ2lzdGVyVmFsaWRhdG9yIiwicmVnaXN0ZXJUYWciLCJkZWxldGVUYWciLCJsb29rdXAiLCJyZWYiLCJkZWxldGVWYWxpZGF0b3IiLCJpbnB1dENmZ3MiLCJmb3VuZCIsImlucHV0Q2ZnIiwiaW5wdXRzIiwibGVuMiIsInJlZjEiLCJ2YWxpZGF0b3JzIiwiUmVuZGVyZWRJbnB1dCIsIlNldCIsIkNoYW5nZSIsIkNsZWFyRXJyb3IiLCJlcnJvckh0bWwiLCJzZXRFcnJvciIsImNsZWFyRXJyb3IiLCJtaXhpbnMiLCJjaGFuZ2UiLCJvYnMiLCJoYXNFcnJvciIsImpzIiwiaW5wdXRDb25maWdzIiwiZ2V0VmFsdWUiLCJoZWxwZXIiLCJ2aWV3IiwiaW5pdEZvcm1Hcm91cCIsImNyb3dkY29udHJvbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUE7QUFBQSxLO0lBQUMsQ0FBQyxVQUFTQSxNQUFULEVBQWlCO0FBQUEsTUFNakI7QUFBQTtBQUFBO0FBQUEsVUFBSUMsSUFBQSxHQUFPO0FBQUEsUUFBRUMsT0FBQSxFQUFTLFFBQVg7QUFBQSxRQUFxQkMsUUFBQSxFQUFVLEVBQS9CO0FBQUEsT0FBWCxDQU5pQjtBQUFBLE1BU25CRixJQUFBLENBQUtHLFVBQUwsR0FBa0IsVUFBU0MsRUFBVCxFQUFhO0FBQUEsUUFFN0JBLEVBQUEsR0FBS0EsRUFBQSxJQUFNLEVBQVgsQ0FGNkI7QUFBQSxRQUk3QixJQUFJQyxTQUFBLEdBQVksRUFBaEIsRUFDSUMsR0FBQSxHQUFNLENBRFYsQ0FKNkI7QUFBQSxRQU83QkYsRUFBQSxDQUFHRyxFQUFILEdBQVEsVUFBU0MsTUFBVCxFQUFpQkMsRUFBakIsRUFBcUI7QUFBQSxVQUMzQixJQUFJLE9BQU9BLEVBQVAsSUFBYSxVQUFqQixFQUE2QjtBQUFBLFlBQzNCQSxFQUFBLENBQUdILEdBQUgsR0FBUyxPQUFPRyxFQUFBLENBQUdILEdBQVYsSUFBaUIsV0FBakIsR0FBK0JBLEdBQUEsRUFBL0IsR0FBdUNHLEVBQUEsQ0FBR0gsR0FBbkQsQ0FEMkI7QUFBQSxZQUczQkUsTUFBQSxDQUFPRSxPQUFQLENBQWUsTUFBZixFQUF1QixVQUFTQyxJQUFULEVBQWVDLEdBQWYsRUFBb0I7QUFBQSxjQUN4QyxDQUFBUCxTQUFBLENBQVVNLElBQVYsSUFBa0JOLFNBQUEsQ0FBVU0sSUFBVixLQUFtQixFQUFyQyxDQUFELENBQTBDRSxJQUExQyxDQUErQ0osRUFBL0MsRUFEeUM7QUFBQSxjQUV6Q0EsRUFBQSxDQUFHSyxLQUFILEdBQVdGLEdBQUEsR0FBTSxDQUZ3QjtBQUFBLGFBQTNDLENBSDJCO0FBQUEsV0FERjtBQUFBLFVBUzNCLE9BQU9SLEVBVG9CO0FBQUEsU0FBN0IsQ0FQNkI7QUFBQSxRQW1CN0JBLEVBQUEsQ0FBR1csR0FBSCxHQUFTLFVBQVNQLE1BQVQsRUFBaUJDLEVBQWpCLEVBQXFCO0FBQUEsVUFDNUIsSUFBSUQsTUFBQSxJQUFVLEdBQWQ7QUFBQSxZQUFtQkgsU0FBQSxHQUFZLEVBQVosQ0FBbkI7QUFBQSxlQUNLO0FBQUEsWUFDSEcsTUFBQSxDQUFPRSxPQUFQLENBQWUsTUFBZixFQUF1QixVQUFTQyxJQUFULEVBQWU7QUFBQSxjQUNwQyxJQUFJRixFQUFKLEVBQVE7QUFBQSxnQkFDTixJQUFJTyxHQUFBLEdBQU1YLFNBQUEsQ0FBVU0sSUFBVixDQUFWLENBRE07QUFBQSxnQkFFTixLQUFLLElBQUlNLENBQUEsR0FBSSxDQUFSLEVBQVdDLEVBQVgsQ0FBTCxDQUFxQkEsRUFBQSxHQUFLRixHQUFBLElBQU9BLEdBQUEsQ0FBSUMsQ0FBSixDQUFqQyxFQUEwQyxFQUFFQSxDQUE1QyxFQUErQztBQUFBLGtCQUM3QyxJQUFJQyxFQUFBLENBQUdaLEdBQUgsSUFBVUcsRUFBQSxDQUFHSCxHQUFqQixFQUFzQjtBQUFBLG9CQUFFVSxHQUFBLENBQUlHLE1BQUosQ0FBV0YsQ0FBWCxFQUFjLENBQWQsRUFBRjtBQUFBLG9CQUFvQkEsQ0FBQSxFQUFwQjtBQUFBLG1CQUR1QjtBQUFBLGlCQUZ6QztBQUFBLGVBQVIsTUFLTztBQUFBLGdCQUNMWixTQUFBLENBQVVNLElBQVYsSUFBa0IsRUFEYjtBQUFBLGVBTjZCO0FBQUEsYUFBdEMsQ0FERztBQUFBLFdBRnVCO0FBQUEsVUFjNUIsT0FBT1AsRUFkcUI7QUFBQSxTQUE5QixDQW5CNkI7QUFBQSxRQXFDN0I7QUFBQSxRQUFBQSxFQUFBLENBQUdnQixHQUFILEdBQVMsVUFBU1QsSUFBVCxFQUFlRixFQUFmLEVBQW1CO0FBQUEsVUFDMUIsU0FBU0YsRUFBVCxHQUFjO0FBQUEsWUFDWkgsRUFBQSxDQUFHVyxHQUFILENBQU9KLElBQVAsRUFBYUosRUFBYixFQURZO0FBQUEsWUFFWkUsRUFBQSxDQUFHWSxLQUFILENBQVNqQixFQUFULEVBQWFrQixTQUFiLENBRlk7QUFBQSxXQURZO0FBQUEsVUFLMUIsT0FBT2xCLEVBQUEsQ0FBR0csRUFBSCxDQUFNSSxJQUFOLEVBQVlKLEVBQVosQ0FMbUI7QUFBQSxTQUE1QixDQXJDNkI7QUFBQSxRQTZDN0JILEVBQUEsQ0FBR21CLE9BQUgsR0FBYSxVQUFTWixJQUFULEVBQWU7QUFBQSxVQUMxQixJQUFJYSxJQUFBLEdBQU8sR0FBR0MsS0FBSCxDQUFTQyxJQUFULENBQWNKLFNBQWQsRUFBeUIsQ0FBekIsQ0FBWCxFQUNJSyxHQUFBLEdBQU10QixTQUFBLENBQVVNLElBQVYsS0FBbUIsRUFEN0IsQ0FEMEI7QUFBQSxVQUkxQixLQUFLLElBQUlNLENBQUEsR0FBSSxDQUFSLEVBQVdSLEVBQVgsQ0FBTCxDQUFxQkEsRUFBQSxHQUFLa0IsR0FBQSxDQUFJVixDQUFKLENBQTFCLEVBQW1DLEVBQUVBLENBQXJDLEVBQXdDO0FBQUEsWUFDdEMsSUFBSSxDQUFDUixFQUFBLENBQUdtQixJQUFSLEVBQWM7QUFBQSxjQUNabkIsRUFBQSxDQUFHbUIsSUFBSCxHQUFVLENBQVYsQ0FEWTtBQUFBLGNBRVpuQixFQUFBLENBQUdZLEtBQUgsQ0FBU2pCLEVBQVQsRUFBYUssRUFBQSxDQUFHSyxLQUFILEdBQVcsQ0FBQ0gsSUFBRCxFQUFPa0IsTUFBUCxDQUFjTCxJQUFkLENBQVgsR0FBaUNBLElBQTlDLEVBRlk7QUFBQSxjQUdaLElBQUlHLEdBQUEsQ0FBSVYsQ0FBSixNQUFXUixFQUFmLEVBQW1CO0FBQUEsZ0JBQUVRLENBQUEsRUFBRjtBQUFBLGVBSFA7QUFBQSxjQUlaUixFQUFBLENBQUdtQixJQUFILEdBQVUsQ0FKRTtBQUFBLGFBRHdCO0FBQUEsV0FKZDtBQUFBLFVBYTFCLElBQUl2QixTQUFBLENBQVV5QixHQUFWLElBQWlCbkIsSUFBQSxJQUFRLEtBQTdCLEVBQW9DO0FBQUEsWUFDbENQLEVBQUEsQ0FBR21CLE9BQUgsQ0FBV0YsS0FBWCxDQUFpQmpCLEVBQWpCLEVBQXFCO0FBQUEsY0FBQyxLQUFEO0FBQUEsY0FBUU8sSUFBUjtBQUFBLGNBQWNrQixNQUFkLENBQXFCTCxJQUFyQixDQUFyQixDQURrQztBQUFBLFdBYlY7QUFBQSxVQWlCMUIsT0FBT3BCLEVBakJtQjtBQUFBLFNBQTVCLENBN0M2QjtBQUFBLFFBaUU3QixPQUFPQSxFQWpFc0I7QUFBQSxPQUEvQixDQVRtQjtBQUFBLE1BNkVuQkosSUFBQSxDQUFLK0IsS0FBTCxHQUFjLFlBQVc7QUFBQSxRQUN2QixJQUFJQyxnQkFBQSxHQUFtQixFQUF2QixDQUR1QjtBQUFBLFFBRXZCLE9BQU8sVUFBU3JCLElBQVQsRUFBZW9CLEtBQWYsRUFBc0I7QUFBQSxVQUMzQixJQUFJLENBQUNBLEtBQUw7QUFBQSxZQUFZLE9BQU9DLGdCQUFBLENBQWlCckIsSUFBakIsQ0FBUCxDQUFaO0FBQUE7QUFBQSxZQUNPcUIsZ0JBQUEsQ0FBaUJyQixJQUFqQixJQUF5Qm9CLEtBRkw7QUFBQSxTQUZOO0FBQUEsT0FBWixFQUFiLENBN0VtQjtBQUFBLE1BcUZsQixDQUFDLFVBQVMvQixJQUFULEVBQWVpQyxHQUFmLEVBQW9CbEMsTUFBcEIsRUFBNEI7QUFBQSxRQUc1QjtBQUFBLFlBQUksQ0FBQ0EsTUFBTDtBQUFBLFVBQWEsT0FIZTtBQUFBLFFBSzVCLElBQUltQyxHQUFBLEdBQU1uQyxNQUFBLENBQU9vQyxRQUFqQixFQUNJUixHQUFBLEdBQU0zQixJQUFBLENBQUtHLFVBQUwsRUFEVixFQUVJaUMsR0FBQSxHQUFNckMsTUFGVixFQUdJc0MsT0FBQSxHQUFVLEtBSGQsRUFJSUMsT0FKSixDQUw0QjtBQUFBLFFBVzVCLFNBQVNDLElBQVQsR0FBZ0I7QUFBQSxVQUNkLE9BQU9MLEdBQUEsQ0FBSU0sSUFBSixDQUFTQyxLQUFULENBQWUsR0FBZixFQUFvQixDQUFwQixLQUEwQixFQURuQjtBQUFBLFNBWFk7QUFBQSxRQWU1QixTQUFTQyxNQUFULENBQWdCQyxJQUFoQixFQUFzQjtBQUFBLFVBQ3BCLE9BQU9BLElBQUEsQ0FBS0YsS0FBTCxDQUFXLEdBQVgsQ0FEYTtBQUFBLFNBZk07QUFBQSxRQW1CNUIsU0FBU0csSUFBVCxDQUFjRCxJQUFkLEVBQW9CO0FBQUEsVUFDbEIsSUFBSUEsSUFBQSxDQUFLRSxJQUFUO0FBQUEsWUFBZUYsSUFBQSxHQUFPSixJQUFBLEVBQVAsQ0FERztBQUFBLFVBR2xCLElBQUlJLElBQUEsSUFBUUwsT0FBWixFQUFxQjtBQUFBLFlBQ25CWCxHQUFBLENBQUlKLE9BQUosQ0FBWUYsS0FBWixDQUFrQixJQUFsQixFQUF3QixDQUFDLEdBQUQsRUFBTVEsTUFBTixDQUFhYSxNQUFBLENBQU9DLElBQVAsQ0FBYixDQUF4QixFQURtQjtBQUFBLFlBRW5CTCxPQUFBLEdBQVVLLElBRlM7QUFBQSxXQUhIO0FBQUEsU0FuQlE7QUFBQSxRQTRCNUIsSUFBSUcsQ0FBQSxHQUFJOUMsSUFBQSxDQUFLK0MsS0FBTCxHQUFhLFVBQVNDLEdBQVQsRUFBYztBQUFBLFVBRWpDO0FBQUEsY0FBSUEsR0FBQSxDQUFJLENBQUosQ0FBSixFQUFZO0FBQUEsWUFDVmQsR0FBQSxDQUFJSyxJQUFKLEdBQVdTLEdBQVgsQ0FEVTtBQUFBLFlBRVZKLElBQUEsQ0FBS0ksR0FBTDtBQUZVLFdBQVosTUFLTztBQUFBLFlBQ0xyQixHQUFBLENBQUlwQixFQUFKLENBQU8sR0FBUCxFQUFZeUMsR0FBWixDQURLO0FBQUEsV0FQMEI7QUFBQSxTQUFuQyxDQTVCNEI7QUFBQSxRQXdDNUJGLENBQUEsQ0FBRUcsSUFBRixHQUFTLFVBQVN4QyxFQUFULEVBQWE7QUFBQSxVQUNwQkEsRUFBQSxDQUFHWSxLQUFILENBQVMsSUFBVCxFQUFlcUIsTUFBQSxDQUFPSCxJQUFBLEVBQVAsQ0FBZixDQURvQjtBQUFBLFNBQXRCLENBeEM0QjtBQUFBLFFBNEM1Qk8sQ0FBQSxDQUFFSixNQUFGLEdBQVcsVUFBU2pDLEVBQVQsRUFBYTtBQUFBLFVBQ3RCaUMsTUFBQSxHQUFTakMsRUFEYTtBQUFBLFNBQXhCLENBNUM0QjtBQUFBLFFBZ0Q1QnFDLENBQUEsQ0FBRUksSUFBRixHQUFTLFlBQVk7QUFBQSxVQUNuQixJQUFJLENBQUNiLE9BQUw7QUFBQSxZQUFjLE9BREs7QUFBQSxVQUVuQkQsR0FBQSxDQUFJZSxtQkFBSixHQUEwQmYsR0FBQSxDQUFJZSxtQkFBSixDQUF3QmxCLEdBQXhCLEVBQTZCVyxJQUE3QixFQUFtQyxLQUFuQyxDQUExQixHQUFzRVIsR0FBQSxDQUFJZ0IsV0FBSixDQUFnQixPQUFPbkIsR0FBdkIsRUFBNEJXLElBQTVCLENBQXRFLENBRm1CO0FBQUEsVUFHbkJqQixHQUFBLENBQUlaLEdBQUosQ0FBUSxHQUFSLEVBSG1CO0FBQUEsVUFJbkJzQixPQUFBLEdBQVUsS0FKUztBQUFBLFNBQXJCLENBaEQ0QjtBQUFBLFFBdUQ1QlMsQ0FBQSxDQUFFTyxLQUFGLEdBQVUsWUFBWTtBQUFBLFVBQ3BCLElBQUloQixPQUFKO0FBQUEsWUFBYSxPQURPO0FBQUEsVUFFcEJELEdBQUEsQ0FBSWtCLGdCQUFKLEdBQXVCbEIsR0FBQSxDQUFJa0IsZ0JBQUosQ0FBcUJyQixHQUFyQixFQUEwQlcsSUFBMUIsRUFBZ0MsS0FBaEMsQ0FBdkIsR0FBZ0VSLEdBQUEsQ0FBSW1CLFdBQUosQ0FBZ0IsT0FBT3RCLEdBQXZCLEVBQTRCVyxJQUE1QixDQUFoRSxDQUZvQjtBQUFBLFVBR3BCUCxPQUFBLEdBQVUsSUFIVTtBQUFBLFNBQXRCLENBdkQ0QjtBQUFBLFFBOEQ1QjtBQUFBLFFBQUFTLENBQUEsQ0FBRU8sS0FBRixFQTlENEI7QUFBQSxPQUE3QixDQWdFRXJELElBaEVGLEVBZ0VRLFlBaEVSLEVBZ0VzQkQsTUFoRXRCLEdBckZrQjtBQUFBLE1BNkxuQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBQUl5RCxRQUFBLEdBQVksVUFBU0MsSUFBVCxFQUFlQyxDQUFmLEVBQWtCQyxDQUFsQixFQUFxQjtBQUFBLFFBQ25DLE9BQU8sVUFBU0MsQ0FBVCxFQUFZO0FBQUEsVUFHakI7QUFBQSxVQUFBRixDQUFBLEdBQUkxRCxJQUFBLENBQUtFLFFBQUwsQ0FBY3NELFFBQWQsSUFBMEJDLElBQTlCLENBSGlCO0FBQUEsVUFJakIsSUFBSUUsQ0FBQSxJQUFLRCxDQUFUO0FBQUEsWUFBWUMsQ0FBQSxHQUFJRCxDQUFBLENBQUVqQixLQUFGLENBQVEsR0FBUixDQUFKLENBSks7QUFBQSxVQU9qQjtBQUFBLGlCQUFPbUIsQ0FBQSxJQUFLQSxDQUFBLENBQUVDLElBQVAsR0FDSEgsQ0FBQSxJQUFLRCxJQUFMLEdBQ0VHLENBREYsR0FDTUUsTUFBQSxDQUFPRixDQUFBLENBQUVHLE1BQUYsQ0FDRXJELE9BREYsQ0FDVSxLQURWLEVBQ2lCaUQsQ0FBQSxDQUFFLENBQUYsRUFBS2pELE9BQUwsQ0FBYSxRQUFiLEVBQXVCLElBQXZCLENBRGpCLEVBRUVBLE9BRkYsQ0FFVSxLQUZWLEVBRWlCaUQsQ0FBQSxDQUFFLENBQUYsRUFBS2pELE9BQUwsQ0FBYSxRQUFiLEVBQXVCLElBQXZCLENBRmpCLENBQVAsRUFHTWtELENBQUEsQ0FBRUksTUFBRixHQUFXLEdBQVgsR0FBaUIsRUFIdkI7QUFGSCxHQVFITCxDQUFBLENBQUVDLENBQUYsQ0FmYTtBQUFBLFNBRGdCO0FBQUEsT0FBdEIsQ0FtQlosS0FuQlksQ0FBZixDQTdMbUI7QUFBQSxNQW1ObkIsSUFBSUssSUFBQSxHQUFRLFlBQVc7QUFBQSxRQUVyQixJQUFJQyxLQUFBLEdBQVEsRUFBWixFQUNJQyxNQUFBLEdBQVMsb0lBRGIsQ0FGcUI7QUFBQSxRQWFyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBTyxVQUFTQyxHQUFULEVBQWNDLElBQWQsRUFBb0I7QUFBQSxVQUN6QixPQUFPRCxHQUFBLElBQVEsQ0FBQUYsS0FBQSxDQUFNRSxHQUFOLElBQWFGLEtBQUEsQ0FBTUUsR0FBTixLQUFjSCxJQUFBLENBQUtHLEdBQUwsQ0FBM0IsQ0FBRCxDQUF1Q0MsSUFBdkMsQ0FEVztBQUFBLFNBQTNCLENBYnFCO0FBQUEsUUFvQnJCO0FBQUEsaUJBQVNKLElBQVQsQ0FBY1AsQ0FBZCxFQUFpQlksQ0FBakIsRUFBb0I7QUFBQSxVQUdsQjtBQUFBLFVBQUFaLENBQUEsR0FBSyxDQUFBQSxDQUFBLElBQU1GLFFBQUEsQ0FBUyxDQUFULElBQWNBLFFBQUEsQ0FBUyxDQUFULENBQXBCLENBQUQsQ0FHRDlDLE9BSEMsQ0FHTzhDLFFBQUEsQ0FBUyxNQUFULENBSFAsRUFHeUIsR0FIekIsRUFJRDlDLE9BSkMsQ0FJTzhDLFFBQUEsQ0FBUyxNQUFULENBSlAsRUFJeUIsR0FKekIsQ0FBSixDQUhrQjtBQUFBLFVBVWxCO0FBQUEsVUFBQWMsQ0FBQSxHQUFJN0IsS0FBQSxDQUFNaUIsQ0FBTixFQUFTYSxPQUFBLENBQVFiLENBQVIsRUFBV0YsUUFBQSxDQUFTLEdBQVQsQ0FBWCxFQUEwQkEsUUFBQSxDQUFTLEdBQVQsQ0FBMUIsQ0FBVCxDQUFKLENBVmtCO0FBQUEsVUFZbEIsT0FBTyxJQUFJZ0IsUUFBSixDQUFhLEdBQWIsRUFBa0IsWUFHdkI7QUFBQSxZQUFDRixDQUFBLENBQUUsQ0FBRixDQUFELElBQVMsQ0FBQ0EsQ0FBQSxDQUFFLENBQUYsQ0FBVixJQUFrQixDQUFDQSxDQUFBLENBQUUsQ0FBRjtBQUFuQixHQUdJRyxJQUFBLENBQUtILENBQUEsQ0FBRSxDQUFGLENBQUw7QUFISixHQU1JLE1BQU1BLENBQUEsQ0FBRUksR0FBRixDQUFNLFVBQVNoQixDQUFULEVBQVl6QyxDQUFaLEVBQWU7QUFBQSxZQUczQjtBQUFBLG1CQUFPQSxDQUFBLEdBQUk7QUFBSixHQUdEd0QsSUFBQSxDQUFLZixDQUFMLEVBQVEsSUFBUjtBQUhDLEdBTUQsTUFBTUE7QUFBQSxDQUdIaEQsT0FIRyxDQUdLLEtBSEwsRUFHWSxLQUhaO0FBQUEsQ0FNSEEsT0FORyxDQU1LLElBTkwsRUFNVyxLQU5YLENBQU4sR0FRRSxHQWpCbUI7QUFBQSxXQUFyQixFQW1CTGlFLElBbkJLLENBbUJBLEdBbkJBLENBQU4sR0FtQmEsWUF6QmpCLENBSG1DLENBZ0NsQ2pFLE9BaENrQyxDQWdDMUIsU0FoQzBCLEVBZ0NmOEMsUUFBQSxDQUFTLENBQVQsQ0FoQ2UsRUFpQ2xDOUMsT0FqQ2tDLENBaUMxQixTQWpDMEIsRUFpQ2Y4QyxRQUFBLENBQVMsQ0FBVCxDQWpDZSxDQUFaLEdBbUN2QixHQW5DSyxDQVpXO0FBQUEsU0FwQkM7QUFBQSxRQTBFckI7QUFBQSxpQkFBU2lCLElBQVQsQ0FBY2YsQ0FBZCxFQUFpQmtCLENBQWpCLEVBQW9CO0FBQUEsVUFDbEJsQixDQUFBLEdBQUlBO0FBQUEsQ0FHRGhELE9BSEMsQ0FHTyxLQUhQLEVBR2MsR0FIZDtBQUFBLENBTURBLE9BTkMsQ0FNTzhDLFFBQUEsQ0FBUyw0QkFBVCxDQU5QLEVBTStDLEVBTi9DLENBQUosQ0FEa0I7QUFBQSxVQVVsQjtBQUFBLGlCQUFPLG1CQUFtQkssSUFBbkIsQ0FBd0JILENBQXhCO0FBQUE7QUFBQSxHQUlILE1BR0U7QUFBQSxVQUFBYSxPQUFBLENBQVFiLENBQVIsRUFHSTtBQUFBLGdDQUhKLEVBTUk7QUFBQSx5Q0FOSixFQU9NZ0IsR0FQTixDQU9VLFVBQVNHLElBQVQsRUFBZTtBQUFBLFlBR25CO0FBQUEsbUJBQU9BLElBQUEsQ0FBS25FLE9BQUwsQ0FBYSxpQ0FBYixFQUFnRCxVQUFTb0UsQ0FBVCxFQUFZQyxDQUFaLEVBQWVDLENBQWYsRUFBa0I7QUFBQSxjQUd2RTtBQUFBLHFCQUFPQSxDQUFBLENBQUV0RSxPQUFGLENBQVUsYUFBVixFQUF5QnVFLElBQXpCLElBQWlDLElBQWpDLEdBQXdDRixDQUF4QyxHQUE0QyxPQUhvQjtBQUFBLGFBQWxFLENBSFk7QUFBQSxXQVB6QixFQWlCT0osSUFqQlAsQ0FpQlksRUFqQlosQ0FIRixHQXNCRTtBQTFCQyxHQTZCSE0sSUFBQSxDQUFLdkIsQ0FBTCxFQUFRa0IsQ0FBUixDQXZDYztBQUFBLFNBMUVDO0FBQUEsUUF3SHJCO0FBQUEsaUJBQVNLLElBQVQsQ0FBY3ZCLENBQWQsRUFBaUJ3QixNQUFqQixFQUF5QjtBQUFBLFVBQ3ZCeEIsQ0FBQSxHQUFJQSxDQUFBLENBQUV5QixJQUFGLEVBQUosQ0FEdUI7QUFBQSxVQUV2QixPQUFPLENBQUN6QixDQUFELEdBQUssRUFBTCxHQUFVO0FBQUEsRUFHVixDQUFBQSxDQUFBLENBQUVoRCxPQUFGLENBQVV5RCxNQUFWLEVBQWtCLFVBQVNULENBQVQsRUFBWW9CLENBQVosRUFBZUUsQ0FBZixFQUFrQjtBQUFBLFlBQUUsT0FBT0EsQ0FBQSxHQUFJLFFBQU1BLENBQU4sR0FBUSxlQUFSLEdBQXlCLFFBQU9qRixNQUFQLElBQWlCLFdBQWpCLEdBQStCLFNBQS9CLEdBQTJDLFNBQTNDLENBQXpCLEdBQStFaUYsQ0FBL0UsR0FBaUYsS0FBakYsR0FBdUZBLENBQXZGLEdBQXlGLEdBQTdGLEdBQW1HdEIsQ0FBNUc7QUFBQSxXQUFwQztBQUFBLEdBR0UsR0FIRixDQUhVLEdBT2IsWUFQYSxHQVFiO0FBUmEsRUFXVixDQUFBd0IsTUFBQSxLQUFXLElBQVgsR0FBa0IsZ0JBQWxCLEdBQXFDLEdBQXJDLENBWFUsR0FhYixhQWZtQjtBQUFBLFNBeEhKO0FBQUEsUUE2SXJCO0FBQUEsaUJBQVN6QyxLQUFULENBQWUyQixHQUFmLEVBQW9CZ0IsVUFBcEIsRUFBZ0M7QUFBQSxVQUM5QixJQUFJQyxLQUFBLEdBQVEsRUFBWixDQUQ4QjtBQUFBLFVBRTlCRCxVQUFBLENBQVdWLEdBQVgsQ0FBZSxVQUFTWSxHQUFULEVBQWNyRSxDQUFkLEVBQWlCO0FBQUEsWUFHOUI7QUFBQSxZQUFBQSxDQUFBLEdBQUltRCxHQUFBLENBQUltQixPQUFKLENBQVlELEdBQVosQ0FBSixDQUg4QjtBQUFBLFlBSTlCRCxLQUFBLENBQU14RSxJQUFOLENBQVd1RCxHQUFBLENBQUkzQyxLQUFKLENBQVUsQ0FBVixFQUFhUixDQUFiLENBQVgsRUFBNEJxRSxHQUE1QixFQUo4QjtBQUFBLFlBSzlCbEIsR0FBQSxHQUFNQSxHQUFBLENBQUkzQyxLQUFKLENBQVVSLENBQUEsR0FBSXFFLEdBQUEsQ0FBSUUsTUFBbEIsQ0FMd0I7QUFBQSxXQUFoQyxFQUY4QjtBQUFBLFVBVzlCO0FBQUEsaUJBQU9ILEtBQUEsQ0FBTXhELE1BQU4sQ0FBYXVDLEdBQWIsQ0FYdUI7QUFBQSxTQTdJWDtBQUFBLFFBOEpyQjtBQUFBLGlCQUFTRyxPQUFULENBQWlCSCxHQUFqQixFQUFzQnFCLElBQXRCLEVBQTRCQyxLQUE1QixFQUFtQztBQUFBLFVBRWpDLElBQUlyQyxLQUFKLEVBQ0lzQyxLQUFBLEdBQVEsQ0FEWixFQUVJQyxPQUFBLEdBQVUsRUFGZCxFQUdJQyxFQUFBLEdBQUssSUFBSS9CLE1BQUosQ0FBVyxNQUFJMkIsSUFBQSxDQUFLMUIsTUFBVCxHQUFnQixLQUFoQixHQUFzQjJCLEtBQUEsQ0FBTTNCLE1BQTVCLEdBQW1DLEdBQTlDLEVBQW1ELEdBQW5ELENBSFQsQ0FGaUM7QUFBQSxVQU9qQ0ssR0FBQSxDQUFJMUQsT0FBSixDQUFZbUYsRUFBWixFQUFnQixVQUFTZixDQUFULEVBQVlXLElBQVosRUFBa0JDLEtBQWxCLEVBQXlCOUUsR0FBekIsRUFBOEI7QUFBQSxZQUc1QztBQUFBLGdCQUFHLENBQUMrRSxLQUFELElBQVVGLElBQWI7QUFBQSxjQUFtQnBDLEtBQUEsR0FBUXpDLEdBQVIsQ0FIeUI7QUFBQSxZQU01QztBQUFBLFlBQUErRSxLQUFBLElBQVNGLElBQUEsR0FBTyxDQUFQLEdBQVcsQ0FBQyxDQUFyQixDQU40QztBQUFBLFlBUzVDO0FBQUEsZ0JBQUcsQ0FBQ0UsS0FBRCxJQUFVRCxLQUFBLElBQVMsSUFBdEI7QUFBQSxjQUE0QkUsT0FBQSxDQUFRL0UsSUFBUixDQUFhdUQsR0FBQSxDQUFJM0MsS0FBSixDQUFVNEIsS0FBVixFQUFpQnpDLEdBQUEsR0FBSThFLEtBQUEsQ0FBTUYsTUFBM0IsQ0FBYixDQVRnQjtBQUFBLFdBQTlDLEVBUGlDO0FBQUEsVUFvQmpDLE9BQU9JLE9BcEIwQjtBQUFBLFNBOUpkO0FBQUEsT0FBWixFQUFYLENBbk5tQjtBQUFBLE1BMlluQjtBQUFBLGVBQVNFLFFBQVQsQ0FBa0JyQixJQUFsQixFQUF3QjtBQUFBLFFBQ3RCLElBQUlzQixHQUFBLEdBQU0sRUFBRUMsR0FBQSxFQUFLdkIsSUFBUCxFQUFWLEVBQ0l3QixHQUFBLEdBQU14QixJQUFBLENBQUtoQyxLQUFMLENBQVcsVUFBWCxDQURWLENBRHNCO0FBQUEsUUFJdEIsSUFBSXdELEdBQUEsQ0FBSSxDQUFKLENBQUosRUFBWTtBQUFBLFVBQ1ZGLEdBQUEsQ0FBSUMsR0FBSixHQUFVeEMsUUFBQSxDQUFTLENBQVQsSUFBY3lDLEdBQUEsQ0FBSSxDQUFKLENBQXhCLENBRFU7QUFBQSxVQUVWQSxHQUFBLEdBQU1BLEdBQUEsQ0FBSSxDQUFKLEVBQU94RSxLQUFQLENBQWErQixRQUFBLENBQVMsQ0FBVCxFQUFZZ0MsTUFBekIsRUFBaUNMLElBQWpDLEdBQXdDMUMsS0FBeEMsQ0FBOEMsTUFBOUMsQ0FBTixDQUZVO0FBQUEsVUFHVnNELEdBQUEsQ0FBSUcsR0FBSixHQUFVRCxHQUFBLENBQUksQ0FBSixDQUFWLENBSFU7QUFBQSxVQUlWRixHQUFBLENBQUluRixHQUFKLEdBQVVxRixHQUFBLENBQUksQ0FBSixDQUpBO0FBQUEsU0FKVTtBQUFBLFFBV3RCLE9BQU9GLEdBWGU7QUFBQSxPQTNZTDtBQUFBLE1BeVpuQixTQUFTSSxNQUFULENBQWdCMUIsSUFBaEIsRUFBc0J5QixHQUF0QixFQUEyQkYsR0FBM0IsRUFBZ0M7QUFBQSxRQUM5QixJQUFJSSxJQUFBLEdBQU8sRUFBWCxDQUQ4QjtBQUFBLFFBRTlCQSxJQUFBLENBQUszQixJQUFBLENBQUt5QixHQUFWLElBQWlCQSxHQUFqQixDQUY4QjtBQUFBLFFBRzlCLElBQUl6QixJQUFBLENBQUs3RCxHQUFUO0FBQUEsVUFBY3dGLElBQUEsQ0FBSzNCLElBQUEsQ0FBSzdELEdBQVYsSUFBaUJvRixHQUFqQixDQUhnQjtBQUFBLFFBSTlCLE9BQU9JLElBSnVCO0FBQUEsT0F6WmI7QUFBQSxNQWthbkI7QUFBQSxlQUFTQyxLQUFULENBQWVDLEdBQWYsRUFBb0JDLE1BQXBCLEVBQTRCOUIsSUFBNUIsRUFBa0M7QUFBQSxRQUVoQytCLE9BQUEsQ0FBUUYsR0FBUixFQUFhLE1BQWIsRUFGZ0M7QUFBQSxRQUloQyxJQUFJRyxRQUFBLEdBQVdILEdBQUEsQ0FBSUksU0FBbkIsRUFDSUMsSUFBQSxHQUFPTCxHQUFBLENBQUlNLGVBRGYsRUFFSUMsSUFBQSxHQUFPUCxHQUFBLENBQUlRLFVBRmYsRUFHSUMsUUFBQSxHQUFXLEVBSGYsRUFJSUMsSUFBQSxHQUFPLEVBSlgsRUFLSUMsUUFMSixDQUpnQztBQUFBLFFBV2hDeEMsSUFBQSxHQUFPcUIsUUFBQSxDQUFTckIsSUFBVCxDQUFQLENBWGdDO0FBQUEsUUFhaEMsU0FBU3lDLEdBQVQsQ0FBYXRHLEdBQWIsRUFBa0J3RixJQUFsQixFQUF3QmUsR0FBeEIsRUFBNkI7QUFBQSxVQUMzQkosUUFBQSxDQUFTNUYsTUFBVCxDQUFnQlAsR0FBaEIsRUFBcUIsQ0FBckIsRUFBd0J3RixJQUF4QixFQUQyQjtBQUFBLFVBRTNCWSxJQUFBLENBQUs3RixNQUFMLENBQVlQLEdBQVosRUFBaUIsQ0FBakIsRUFBb0J1RyxHQUFwQixDQUYyQjtBQUFBLFNBYkc7QUFBQSxRQW1CaEM7QUFBQSxRQUFBWixNQUFBLENBQU9uRixHQUFQLENBQVcsUUFBWCxFQUFxQixZQUFXO0FBQUEsVUFDOUJ5RixJQUFBLENBQUtPLFdBQUwsQ0FBaUJkLEdBQWpCLENBRDhCO0FBQUEsU0FBaEMsRUFHR2xGLEdBSEgsQ0FHTyxVQUhQLEVBR21CLFlBQVc7QUFBQSxVQUM1QixJQUFJeUYsSUFBQSxDQUFLUSxJQUFUO0FBQUEsWUFBZVIsSUFBQSxHQUFPTixNQUFBLENBQU9NLElBREQ7QUFBQSxTQUg5QixFQU1HdEcsRUFOSCxDQU1NLFFBTk4sRUFNZ0IsWUFBVztBQUFBLFVBRXpCLElBQUkrRyxLQUFBLEdBQVFyRCxJQUFBLENBQUtRLElBQUEsQ0FBS3VCLEdBQVYsRUFBZU8sTUFBZixDQUFaLENBRnlCO0FBQUEsVUFHekIsSUFBSSxDQUFDZSxLQUFMO0FBQUEsWUFBWSxPQUhhO0FBQUEsVUFNekI7QUFBQSxjQUFJLENBQUNDLEtBQUEsQ0FBTUMsT0FBTixDQUFjRixLQUFkLENBQUwsRUFBMkI7QUFBQSxZQUN6QixJQUFJRyxPQUFBLEdBQVVDLElBQUEsQ0FBS0MsU0FBTCxDQUFlTCxLQUFmLENBQWQsQ0FEeUI7QUFBQSxZQUd6QixJQUFJRyxPQUFBLElBQVdSLFFBQWY7QUFBQSxjQUF5QixPQUhBO0FBQUEsWUFJekJBLFFBQUEsR0FBV1EsT0FBWCxDQUp5QjtBQUFBLFlBT3pCO0FBQUEsWUFBQUcsSUFBQSxDQUFLWixJQUFMLEVBQVcsVUFBU0csR0FBVCxFQUFjO0FBQUEsY0FBRUEsR0FBQSxDQUFJVSxPQUFKLEVBQUY7QUFBQSxhQUF6QixFQVB5QjtBQUFBLFlBUXpCZCxRQUFBLEdBQVcsRUFBWCxDQVJ5QjtBQUFBLFlBU3pCQyxJQUFBLEdBQU8sRUFBUCxDQVR5QjtBQUFBLFlBV3pCTSxLQUFBLEdBQVFRLE1BQUEsQ0FBT0MsSUFBUCxDQUFZVCxLQUFaLEVBQW1CNUMsR0FBbkIsQ0FBdUIsVUFBU3dCLEdBQVQsRUFBYztBQUFBLGNBQzNDLE9BQU9DLE1BQUEsQ0FBTzFCLElBQVAsRUFBYXlCLEdBQWIsRUFBa0JvQixLQUFBLENBQU1wQixHQUFOLENBQWxCLENBRG9DO0FBQUEsYUFBckMsQ0FYaUI7QUFBQSxXQU5GO0FBQUEsVUF3QnpCO0FBQUEsVUFBQTBCLElBQUEsQ0FBS2IsUUFBTCxFQUFlLFVBQVNYLElBQVQsRUFBZTtBQUFBLFlBQzVCLElBQUlBLElBQUEsWUFBZ0IwQixNQUFwQixFQUE0QjtBQUFBLGNBRTFCO0FBQUEsa0JBQUlSLEtBQUEsQ0FBTS9CLE9BQU4sQ0FBY2EsSUFBZCxJQUFzQixDQUFDLENBQTNCLEVBQThCO0FBQUEsZ0JBQzVCLE1BRDRCO0FBQUEsZUFGSjtBQUFBLGFBQTVCLE1BS087QUFBQSxjQUVMO0FBQUEsa0JBQUk0QixRQUFBLEdBQVdDLGFBQUEsQ0FBY1gsS0FBZCxFQUFxQmxCLElBQXJCLENBQWYsRUFDSThCLFFBQUEsR0FBV0QsYUFBQSxDQUFjbEIsUUFBZCxFQUF3QlgsSUFBeEIsQ0FEZixDQUZLO0FBQUEsY0FNTDtBQUFBLGtCQUFJNEIsUUFBQSxDQUFTeEMsTUFBVCxJQUFtQjBDLFFBQUEsQ0FBUzFDLE1BQWhDLEVBQXdDO0FBQUEsZ0JBQ3RDLE1BRHNDO0FBQUEsZUFObkM7QUFBQSxhQU5xQjtBQUFBLFlBZ0I1QixJQUFJNUUsR0FBQSxHQUFNbUcsUUFBQSxDQUFTeEIsT0FBVCxDQUFpQmEsSUFBakIsQ0FBVixFQUNJZSxHQUFBLEdBQU1ILElBQUEsQ0FBS3BHLEdBQUwsQ0FEVixDQWhCNEI7QUFBQSxZQW1CNUIsSUFBSXVHLEdBQUosRUFBUztBQUFBLGNBQ1BBLEdBQUEsQ0FBSVUsT0FBSixHQURPO0FBQUEsY0FFUGQsUUFBQSxDQUFTNUYsTUFBVCxDQUFnQlAsR0FBaEIsRUFBcUIsQ0FBckIsRUFGTztBQUFBLGNBR1BvRyxJQUFBLENBQUs3RixNQUFMLENBQVlQLEdBQVosRUFBaUIsQ0FBakIsRUFITztBQUFBLGNBS1A7QUFBQSxxQkFBTyxLQUxBO0FBQUEsYUFuQm1CO0FBQUEsV0FBOUIsRUF4QnlCO0FBQUEsVUFzRHpCO0FBQUEsY0FBSXVILFFBQUEsR0FBVyxHQUFHNUMsT0FBSCxDQUFXN0QsSUFBWCxDQUFnQm1GLElBQUEsQ0FBS3VCLFVBQXJCLEVBQWlDekIsSUFBakMsSUFBeUMsQ0FBeEQsQ0F0RHlCO0FBQUEsVUF1RHpCaUIsSUFBQSxDQUFLTixLQUFMLEVBQVksVUFBU2xCLElBQVQsRUFBZW5GLENBQWYsRUFBa0I7QUFBQSxZQUc1QjtBQUFBLGdCQUFJTCxHQUFBLEdBQU0wRyxLQUFBLENBQU0vQixPQUFOLENBQWNhLElBQWQsRUFBb0JuRixDQUFwQixDQUFWLEVBQ0lvSCxNQUFBLEdBQVN0QixRQUFBLENBQVN4QixPQUFULENBQWlCYSxJQUFqQixFQUF1Qm5GLENBQXZCLENBRGIsQ0FINEI7QUFBQSxZQU81QjtBQUFBLFlBQUFMLEdBQUEsR0FBTSxDQUFOLElBQVksQ0FBQUEsR0FBQSxHQUFNMEcsS0FBQSxDQUFNZ0IsV0FBTixDQUFrQmxDLElBQWxCLEVBQXdCbkYsQ0FBeEIsQ0FBTixDQUFaLENBUDRCO0FBQUEsWUFRNUJvSCxNQUFBLEdBQVMsQ0FBVCxJQUFlLENBQUFBLE1BQUEsR0FBU3RCLFFBQUEsQ0FBU3VCLFdBQVQsQ0FBcUJsQyxJQUFyQixFQUEyQm5GLENBQTNCLENBQVQsQ0FBZixDQVI0QjtBQUFBLFlBVTVCLElBQUksQ0FBRSxDQUFBbUYsSUFBQSxZQUFnQjBCLE1BQWhCLENBQU4sRUFBK0I7QUFBQSxjQUU3QjtBQUFBLGtCQUFJRSxRQUFBLEdBQVdDLGFBQUEsQ0FBY1gsS0FBZCxFQUFxQmxCLElBQXJCLENBQWYsRUFDSThCLFFBQUEsR0FBV0QsYUFBQSxDQUFjbEIsUUFBZCxFQUF3QlgsSUFBeEIsQ0FEZixDQUY2QjtBQUFBLGNBTTdCO0FBQUEsa0JBQUk0QixRQUFBLENBQVN4QyxNQUFULEdBQWtCMEMsUUFBQSxDQUFTMUMsTUFBL0IsRUFBdUM7QUFBQSxnQkFDckM2QyxNQUFBLEdBQVMsQ0FBQyxDQUQyQjtBQUFBLGVBTlY7QUFBQSxhQVZIO0FBQUEsWUFzQjVCO0FBQUEsZ0JBQUlFLEtBQUEsR0FBUTFCLElBQUEsQ0FBS3VCLFVBQWpCLENBdEI0QjtBQUFBLFlBdUI1QixJQUFJQyxNQUFBLEdBQVMsQ0FBYixFQUFnQjtBQUFBLGNBQ2QsSUFBSSxDQUFDcEIsUUFBRCxJQUFheEMsSUFBQSxDQUFLeUIsR0FBdEI7QUFBQSxnQkFBMkIsSUFBSXNDLEtBQUEsR0FBUXJDLE1BQUEsQ0FBTzFCLElBQVAsRUFBYTJCLElBQWIsRUFBbUJ4RixHQUFuQixDQUFaLENBRGI7QUFBQSxjQUdkLElBQUl1RyxHQUFBLEdBQU0sSUFBSXNCLEdBQUosQ0FBUSxFQUFFeEUsSUFBQSxFQUFNd0MsUUFBUixFQUFSLEVBQTRCO0FBQUEsZ0JBQ3BDaUMsTUFBQSxFQUFRSCxLQUFBLENBQU1KLFFBQUEsR0FBV3ZILEdBQWpCLENBRDRCO0FBQUEsZ0JBRXBDMkYsTUFBQSxFQUFRQSxNQUY0QjtBQUFBLGdCQUdwQ00sSUFBQSxFQUFNQSxJQUg4QjtBQUFBLGdCQUlwQ1QsSUFBQSxFQUFNb0MsS0FBQSxJQUFTcEMsSUFKcUI7QUFBQSxlQUE1QixDQUFWLENBSGM7QUFBQSxjQVVkZSxHQUFBLENBQUl3QixLQUFKLEdBVmM7QUFBQSxjQVlkekIsR0FBQSxDQUFJdEcsR0FBSixFQUFTd0YsSUFBVCxFQUFlZSxHQUFmLEVBWmM7QUFBQSxjQWFkLE9BQU8sSUFiTztBQUFBLGFBdkJZO0FBQUEsWUF3QzVCO0FBQUEsZ0JBQUkxQyxJQUFBLENBQUs3RCxHQUFMLElBQVlvRyxJQUFBLENBQUtxQixNQUFMLEVBQWE1RCxJQUFBLENBQUs3RCxHQUFsQixLQUEwQkEsR0FBMUMsRUFBK0M7QUFBQSxjQUM3Q29HLElBQUEsQ0FBS3FCLE1BQUwsRUFBYWpILEdBQWIsQ0FBaUIsUUFBakIsRUFBMkIsVUFBU2dGLElBQVQsRUFBZTtBQUFBLGdCQUN4Q0EsSUFBQSxDQUFLM0IsSUFBQSxDQUFLN0QsR0FBVixJQUFpQkEsR0FEdUI7QUFBQSxlQUExQyxFQUQ2QztBQUFBLGNBSTdDb0csSUFBQSxDQUFLcUIsTUFBTCxFQUFhTyxNQUFiLEVBSjZDO0FBQUEsYUF4Q25CO0FBQUEsWUFnRDVCO0FBQUEsZ0JBQUloSSxHQUFBLElBQU95SCxNQUFYLEVBQW1CO0FBQUEsY0FDakJ4QixJQUFBLENBQUtnQyxZQUFMLENBQWtCTixLQUFBLENBQU1KLFFBQUEsR0FBV0UsTUFBakIsQ0FBbEIsRUFBNENFLEtBQUEsQ0FBTUosUUFBQSxHQUFZLENBQUF2SCxHQUFBLEdBQU15SCxNQUFOLEdBQWV6SCxHQUFBLEdBQU0sQ0FBckIsR0FBeUJBLEdBQXpCLENBQWxCLENBQTVDLEVBRGlCO0FBQUEsY0FFakIsT0FBT3NHLEdBQUEsQ0FBSXRHLEdBQUosRUFBU21HLFFBQUEsQ0FBUzVGLE1BQVQsQ0FBZ0JrSCxNQUFoQixFQUF3QixDQUF4QixFQUEyQixDQUEzQixDQUFULEVBQXdDckIsSUFBQSxDQUFLN0YsTUFBTCxDQUFZa0gsTUFBWixFQUFvQixDQUFwQixFQUF1QixDQUF2QixDQUF4QyxDQUZVO0FBQUEsYUFoRFM7QUFBQSxXQUE5QixFQXZEeUI7QUFBQSxVQThHekJ0QixRQUFBLEdBQVdPLEtBQUEsQ0FBTTdGLEtBQU4sRUE5R2M7QUFBQSxTQU4zQixFQXNIR0wsR0F0SEgsQ0FzSE8sU0F0SFAsRUFzSGtCLFlBQVc7QUFBQSxVQUMzQjBILElBQUEsQ0FBS2pDLElBQUwsRUFBVyxVQUFTUCxHQUFULEVBQWM7QUFBQSxZQUN2QnNCLElBQUEsQ0FBS3RCLEdBQUEsQ0FBSXlDLFVBQVQsRUFBcUIsVUFBU0MsSUFBVCxFQUFlO0FBQUEsY0FDbEMsSUFBSSxjQUFjbkYsSUFBZCxDQUFtQm1GLElBQUEsQ0FBS3JJLElBQXhCLENBQUo7QUFBQSxnQkFBbUM0RixNQUFBLENBQU95QyxJQUFBLENBQUtDLEtBQVosSUFBcUIzQyxHQUR0QjtBQUFBLGFBQXBDLENBRHVCO0FBQUEsV0FBekIsQ0FEMkI7QUFBQSxTQXRIN0IsQ0FuQmdDO0FBQUEsT0FsYWY7QUFBQSxNQXNqQm5CLFNBQVM0QyxrQkFBVCxDQUE0QnJDLElBQTVCLEVBQWtDTixNQUFsQyxFQUEwQzRDLFNBQTFDLEVBQXFEO0FBQUEsUUFFbkRMLElBQUEsQ0FBS2pDLElBQUwsRUFBVyxVQUFTUCxHQUFULEVBQWM7QUFBQSxVQUN2QixJQUFJQSxHQUFBLENBQUk4QyxRQUFKLElBQWdCLENBQXBCLEVBQXVCO0FBQUEsWUFDckI5QyxHQUFBLENBQUkrQyxNQUFKLEdBQWEsQ0FBYixDQURxQjtBQUFBLFlBRXJCLElBQUcvQyxHQUFBLENBQUlRLFVBQUosSUFBa0JSLEdBQUEsQ0FBSVEsVUFBSixDQUFldUMsTUFBcEM7QUFBQSxjQUE0Qy9DLEdBQUEsQ0FBSStDLE1BQUosR0FBYSxDQUFiLENBRnZCO0FBQUEsWUFHckIsSUFBRy9DLEdBQUEsQ0FBSWdELFlBQUosQ0FBaUIsTUFBakIsQ0FBSDtBQUFBLGNBQTZCaEQsR0FBQSxDQUFJK0MsTUFBSixHQUFhLENBQWIsQ0FIUjtBQUFBLFlBS3JCO0FBQUEsZ0JBQUlFLEtBQUEsR0FBUUMsTUFBQSxDQUFPbEQsR0FBUCxDQUFaLENBTHFCO0FBQUEsWUFPckIsSUFBSWlELEtBQUEsSUFBUyxDQUFDakQsR0FBQSxDQUFJK0MsTUFBbEIsRUFBMEI7QUFBQSxjQUN4QixJQUFJbEMsR0FBQSxHQUFNLElBQUlzQixHQUFKLENBQVFjLEtBQVIsRUFBZTtBQUFBLGtCQUFFMUMsSUFBQSxFQUFNUCxHQUFSO0FBQUEsa0JBQWFDLE1BQUEsRUFBUUEsTUFBckI7QUFBQSxpQkFBZixFQUE4Q0QsR0FBQSxDQUFJbUQsU0FBbEQsQ0FBVixFQUNJQyxRQUFBLEdBQVdwRCxHQUFBLENBQUlnRCxZQUFKLENBQWlCLE1BQWpCLENBRGYsRUFFSUssT0FBQSxHQUFVRCxRQUFBLElBQVlBLFFBQUEsQ0FBU25FLE9BQVQsQ0FBaUIvQixRQUFBLENBQVMsQ0FBVCxDQUFqQixJQUFnQyxDQUE1QyxHQUFnRGtHLFFBQWhELEdBQTJESCxLQUFBLENBQU01SSxJQUYvRSxFQUdJaUosSUFBQSxHQUFPckQsTUFIWCxFQUlJc0QsU0FKSixDQUR3QjtBQUFBLGNBT3hCLE9BQU0sQ0FBQ0wsTUFBQSxDQUFPSSxJQUFBLENBQUsvQyxJQUFaLENBQVAsRUFBMEI7QUFBQSxnQkFDeEIsSUFBRyxDQUFDK0MsSUFBQSxDQUFLckQsTUFBVDtBQUFBLGtCQUFpQixNQURPO0FBQUEsZ0JBRXhCcUQsSUFBQSxHQUFPQSxJQUFBLENBQUtyRCxNQUZZO0FBQUEsZUFQRjtBQUFBLGNBWXhCO0FBQUEsY0FBQVksR0FBQSxDQUFJWixNQUFKLEdBQWFxRCxJQUFiLENBWndCO0FBQUEsY0FjeEJDLFNBQUEsR0FBWUQsSUFBQSxDQUFLNUMsSUFBTCxDQUFVMkMsT0FBVixDQUFaLENBZHdCO0FBQUEsY0FpQnhCO0FBQUEsa0JBQUlFLFNBQUosRUFBZTtBQUFBLGdCQUdiO0FBQUE7QUFBQSxvQkFBSSxDQUFDdEMsS0FBQSxDQUFNQyxPQUFOLENBQWNxQyxTQUFkLENBQUw7QUFBQSxrQkFDRUQsSUFBQSxDQUFLNUMsSUFBTCxDQUFVMkMsT0FBVixJQUFxQixDQUFDRSxTQUFELENBQXJCLENBSlc7QUFBQSxnQkFNYjtBQUFBLGdCQUFBRCxJQUFBLENBQUs1QyxJQUFMLENBQVUyQyxPQUFWLEVBQW1COUksSUFBbkIsQ0FBd0JzRyxHQUF4QixDQU5hO0FBQUEsZUFBZixNQU9PO0FBQUEsZ0JBQ0x5QyxJQUFBLENBQUs1QyxJQUFMLENBQVUyQyxPQUFWLElBQXFCeEMsR0FEaEI7QUFBQSxlQXhCaUI7QUFBQSxjQThCeEI7QUFBQTtBQUFBLGNBQUFiLEdBQUEsQ0FBSW1ELFNBQUosR0FBZ0IsRUFBaEIsQ0E5QndCO0FBQUEsY0ErQnhCTixTQUFBLENBQVV0SSxJQUFWLENBQWVzRyxHQUFmLENBL0J3QjtBQUFBLGFBUEw7QUFBQSxZQXlDckIsSUFBRyxDQUFDYixHQUFBLENBQUkrQyxNQUFSO0FBQUEsY0FDRXpCLElBQUEsQ0FBS3RCLEdBQUEsQ0FBSXlDLFVBQVQsRUFBcUIsVUFBU0MsSUFBVCxFQUFlO0FBQUEsZ0JBQ2xDLElBQUksY0FBY25GLElBQWQsQ0FBbUJtRixJQUFBLENBQUtySSxJQUF4QixDQUFKO0FBQUEsa0JBQW1DNEYsTUFBQSxDQUFPeUMsSUFBQSxDQUFLQyxLQUFaLElBQXFCM0MsR0FEdEI7QUFBQSxlQUFwQyxDQTFDbUI7QUFBQSxXQURBO0FBQUEsU0FBekIsQ0FGbUQ7QUFBQSxPQXRqQmxDO0FBQUEsTUE0bUJuQixTQUFTd0QsZ0JBQVQsQ0FBMEJqRCxJQUExQixFQUFnQ00sR0FBaEMsRUFBcUM0QyxXQUFyQyxFQUFrRDtBQUFBLFFBRWhELFNBQVNDLE9BQVQsQ0FBaUIxRCxHQUFqQixFQUFzQk4sR0FBdEIsRUFBMkJpRSxLQUEzQixFQUFrQztBQUFBLFVBQ2hDLElBQUlqRSxHQUFBLENBQUlULE9BQUosQ0FBWS9CLFFBQUEsQ0FBUyxDQUFULENBQVosS0FBNEIsQ0FBaEMsRUFBbUM7QUFBQSxZQUNqQyxJQUFJaUIsSUFBQSxHQUFPO0FBQUEsY0FBRTZCLEdBQUEsRUFBS0EsR0FBUDtBQUFBLGNBQVk3QixJQUFBLEVBQU11QixHQUFsQjtBQUFBLGFBQVgsQ0FEaUM7QUFBQSxZQUVqQytELFdBQUEsQ0FBWWxKLElBQVosQ0FBaUJxSixNQUFBLENBQU96RixJQUFQLEVBQWF3RixLQUFiLENBQWpCLENBRmlDO0FBQUEsV0FESDtBQUFBLFNBRmM7QUFBQSxRQVNoRG5CLElBQUEsQ0FBS2pDLElBQUwsRUFBVyxVQUFTUCxHQUFULEVBQWM7QUFBQSxVQUN2QixJQUFJekQsSUFBQSxHQUFPeUQsR0FBQSxDQUFJOEMsUUFBZixDQUR1QjtBQUFBLFVBSXZCO0FBQUEsY0FBSXZHLElBQUEsSUFBUSxDQUFSLElBQWF5RCxHQUFBLENBQUlRLFVBQUosQ0FBZTZDLE9BQWYsSUFBMEIsT0FBM0M7QUFBQSxZQUFvREssT0FBQSxDQUFRMUQsR0FBUixFQUFhQSxHQUFBLENBQUk2RCxTQUFqQixFQUo3QjtBQUFBLFVBS3ZCLElBQUl0SCxJQUFBLElBQVEsQ0FBWjtBQUFBLFlBQWUsT0FMUTtBQUFBLFVBVXZCO0FBQUE7QUFBQSxjQUFJbUcsSUFBQSxHQUFPMUMsR0FBQSxDQUFJZ0QsWUFBSixDQUFpQixNQUFqQixDQUFYLENBVnVCO0FBQUEsVUFXdkIsSUFBSU4sSUFBSixFQUFVO0FBQUEsWUFBRTNDLEtBQUEsQ0FBTUMsR0FBTixFQUFXYSxHQUFYLEVBQWdCNkIsSUFBaEIsRUFBRjtBQUFBLFlBQXlCLE9BQU8sS0FBaEM7QUFBQSxXQVhhO0FBQUEsVUFjdkI7QUFBQSxVQUFBcEIsSUFBQSxDQUFLdEIsR0FBQSxDQUFJeUMsVUFBVCxFQUFxQixVQUFTQyxJQUFULEVBQWU7QUFBQSxZQUNsQyxJQUFJckksSUFBQSxHQUFPcUksSUFBQSxDQUFLckksSUFBaEIsRUFDRXlKLElBQUEsR0FBT3pKLElBQUEsQ0FBSzhCLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLENBQWpCLENBRFQsQ0FEa0M7QUFBQSxZQUlsQ3VILE9BQUEsQ0FBUTFELEdBQVIsRUFBYTBDLElBQUEsQ0FBS0MsS0FBbEIsRUFBeUI7QUFBQSxjQUFFRCxJQUFBLEVBQU1vQixJQUFBLElBQVF6SixJQUFoQjtBQUFBLGNBQXNCeUosSUFBQSxFQUFNQSxJQUE1QjtBQUFBLGFBQXpCLEVBSmtDO0FBQUEsWUFLbEMsSUFBSUEsSUFBSixFQUFVO0FBQUEsY0FBRTVELE9BQUEsQ0FBUUYsR0FBUixFQUFhM0YsSUFBYixFQUFGO0FBQUEsY0FBc0IsT0FBTyxLQUE3QjtBQUFBLGFBTHdCO0FBQUEsV0FBcEMsRUFkdUI7QUFBQSxVQXdCdkI7QUFBQSxjQUFJNkksTUFBQSxDQUFPbEQsR0FBUCxDQUFKO0FBQUEsWUFBaUIsT0FBTyxLQXhCRDtBQUFBLFNBQXpCLENBVGdEO0FBQUEsT0E1bUIvQjtBQUFBLE1Ba3BCbkIsU0FBU21DLEdBQVQsQ0FBYTRCLElBQWIsRUFBbUJDLElBQW5CLEVBQXlCYixTQUF6QixFQUFvQztBQUFBLFFBRWxDLElBQUljLElBQUEsR0FBT3ZLLElBQUEsQ0FBS0csVUFBTCxDQUFnQixJQUFoQixDQUFYLEVBQ0lxSyxJQUFBLEdBQU9DLE9BQUEsQ0FBUUgsSUFBQSxDQUFLRSxJQUFiLEtBQXNCLEVBRGpDLEVBRUlsRSxHQUFBLEdBQU1vRSxLQUFBLENBQU1MLElBQUEsQ0FBS3BHLElBQVgsQ0FGVixFQUdJc0MsTUFBQSxHQUFTK0QsSUFBQSxDQUFLL0QsTUFIbEIsRUFJSXdELFdBQUEsR0FBYyxFQUpsQixFQUtJWixTQUFBLEdBQVksRUFMaEIsRUFNSXRDLElBQUEsR0FBT3lELElBQUEsQ0FBS3pELElBTmhCLEVBT0lULElBQUEsR0FBT2tFLElBQUEsQ0FBS2xFLElBUGhCLEVBUUkzRixFQUFBLEdBQUs0SixJQUFBLENBQUs1SixFQVJkLEVBU0lrSixPQUFBLEdBQVU5QyxJQUFBLENBQUs4QyxPQUFMLENBQWFnQixXQUFiLEVBVGQsRUFVSTNCLElBQUEsR0FBTyxFQVZYLEVBV0k0QixPQVhKLEVBWUlDLGNBQUEsR0FBaUIscUNBWnJCLENBRmtDO0FBQUEsUUFnQmxDLElBQUlwSyxFQUFBLElBQU1vRyxJQUFBLENBQUtpRSxJQUFmLEVBQXFCO0FBQUEsVUFDbkJqRSxJQUFBLENBQUtpRSxJQUFMLENBQVVqRCxPQUFWLENBQWtCLElBQWxCLENBRG1CO0FBQUEsU0FoQmE7QUFBQSxRQW9CbEMsSUFBR3dDLElBQUEsQ0FBS1UsS0FBUixFQUFlO0FBQUEsVUFDYixJQUFJQSxLQUFBLEdBQVFWLElBQUEsQ0FBS1UsS0FBTCxDQUFXQyxLQUFYLENBQWlCSCxjQUFqQixDQUFaLENBRGE7QUFBQSxVQUdiakQsSUFBQSxDQUFLbUQsS0FBTCxFQUFZLFVBQVNFLENBQVQsRUFBWTtBQUFBLFlBQ3RCLElBQUlDLEVBQUEsR0FBS0QsQ0FBQSxDQUFFeEksS0FBRixDQUFRLFNBQVIsQ0FBVCxDQURzQjtBQUFBLFlBRXRCb0UsSUFBQSxDQUFLc0UsWUFBTCxDQUFrQkQsRUFBQSxDQUFHLENBQUgsQ0FBbEIsRUFBeUJBLEVBQUEsQ0FBRyxDQUFILEVBQU14SyxPQUFOLENBQWMsT0FBZCxFQUF1QixFQUF2QixDQUF6QixDQUZzQjtBQUFBLFdBQXhCLENBSGE7QUFBQSxTQXBCbUI7QUFBQSxRQStCbEM7QUFBQTtBQUFBLFFBQUFtRyxJQUFBLENBQUtpRSxJQUFMLEdBQVksSUFBWixDQS9Ca0M7QUFBQSxRQW1DbEM7QUFBQTtBQUFBLGFBQUt4SyxHQUFMLEdBQVc4SyxPQUFBLENBQVEsQ0FBQyxDQUFFLEtBQUlDLElBQUosR0FBV0MsT0FBWCxLQUF1QkMsSUFBQSxDQUFLQyxNQUFMLEVBQXZCLENBQVgsQ0FBWCxDQW5Da0M7QUFBQSxRQXFDbEN0QixNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsVUFBRTNELE1BQUEsRUFBUUEsTUFBVjtBQUFBLFVBQWtCTSxJQUFBLEVBQU1BLElBQXhCO0FBQUEsVUFBOEIyRCxJQUFBLEVBQU1BLElBQXBDO0FBQUEsVUFBMEN4RCxJQUFBLEVBQU0sRUFBaEQ7QUFBQSxTQUFiLEVBQW1FWixJQUFuRSxFQXJDa0M7QUFBQSxRQXdDbEM7QUFBQSxRQUFBd0IsSUFBQSxDQUFLZixJQUFBLENBQUtrQyxVQUFWLEVBQXNCLFVBQVMzSSxFQUFULEVBQWE7QUFBQSxVQUNqQzRJLElBQUEsQ0FBSzVJLEVBQUEsQ0FBR08sSUFBUixJQUFnQlAsRUFBQSxDQUFHNkksS0FEYztBQUFBLFNBQW5DLEVBeENrQztBQUFBLFFBNkNsQyxJQUFJM0MsR0FBQSxDQUFJbUQsU0FBSixJQUFpQixDQUFDLFNBQVM1RixJQUFULENBQWM4RixPQUFkLENBQWxCLElBQTRDLENBQUMsUUFBUTlGLElBQVIsQ0FBYThGLE9BQWIsQ0FBN0MsSUFBc0UsQ0FBQyxLQUFLOUYsSUFBTCxDQUFVOEYsT0FBVixDQUEzRTtBQUFBLFVBRUU7QUFBQSxVQUFBckQsR0FBQSxDQUFJbUQsU0FBSixHQUFnQmdDLFlBQUEsQ0FBYW5GLEdBQUEsQ0FBSW1ELFNBQWpCLEVBQTRCQSxTQUE1QixDQUFoQixDQS9DZ0M7QUFBQSxRQW1EbEM7QUFBQSxpQkFBU2lDLFVBQVQsR0FBc0I7QUFBQSxVQUNwQjlELElBQUEsQ0FBS0UsTUFBQSxDQUFPQyxJQUFQLENBQVlpQixJQUFaLENBQUwsRUFBd0IsVUFBU3JJLElBQVQsRUFBZTtBQUFBLFlBQ3JDNkosSUFBQSxDQUFLN0osSUFBTCxJQUFhc0QsSUFBQSxDQUFLK0UsSUFBQSxDQUFLckksSUFBTCxDQUFMLEVBQWlCNEYsTUFBQSxJQUFVZ0UsSUFBM0IsQ0FEd0I7QUFBQSxXQUF2QyxDQURvQjtBQUFBLFNBbkRZO0FBQUEsUUF5RGxDLEtBQUszQixNQUFMLEdBQWMsVUFBU3ZFLElBQVQsRUFBZXNILElBQWYsRUFBcUI7QUFBQSxVQUNqQ3pCLE1BQUEsQ0FBT0ssSUFBUCxFQUFhbEcsSUFBYixFQUFtQitCLElBQW5CLEVBRGlDO0FBQUEsVUFFakNzRixVQUFBLEdBRmlDO0FBQUEsVUFHakNuQixJQUFBLENBQUtoSixPQUFMLENBQWEsUUFBYixFQUF1QjZFLElBQXZCLEVBSGlDO0FBQUEsVUFJakN3QyxNQUFBLENBQU9tQixXQUFQLEVBQW9CUSxJQUFwQixFQUEwQm5FLElBQTFCLEVBSmlDO0FBQUEsVUFLakNtRSxJQUFBLENBQUtoSixPQUFMLENBQWEsU0FBYixDQUxpQztBQUFBLFNBQW5DLENBekRrQztBQUFBLFFBaUVsQyxLQUFLUSxLQUFMLEdBQWEsWUFBVztBQUFBLFVBQ3RCNkYsSUFBQSxDQUFLdEcsU0FBTCxFQUFnQixVQUFTc0ssR0FBVCxFQUFjO0FBQUEsWUFDNUJBLEdBQUEsR0FBTSxZQUFZLE9BQU9BLEdBQW5CLEdBQXlCNUwsSUFBQSxDQUFLK0IsS0FBTCxDQUFXNkosR0FBWCxDQUF6QixHQUEyQ0EsR0FBakQsQ0FENEI7QUFBQSxZQUU1QmhFLElBQUEsQ0FBS0UsTUFBQSxDQUFPQyxJQUFQLENBQVk2RCxHQUFaLENBQUwsRUFBdUIsVUFBUzFGLEdBQVQsRUFBYztBQUFBLGNBRW5DO0FBQUEsa0JBQUksVUFBVUEsR0FBZDtBQUFBLGdCQUNFcUUsSUFBQSxDQUFLckUsR0FBTCxJQUFZLGNBQWMsT0FBTzBGLEdBQUEsQ0FBSTFGLEdBQUosQ0FBckIsR0FBZ0MwRixHQUFBLENBQUkxRixHQUFKLEVBQVMyRixJQUFULENBQWN0QixJQUFkLENBQWhDLEdBQXNEcUIsR0FBQSxDQUFJMUYsR0FBSixDQUhqQztBQUFBLGFBQXJDLEVBRjRCO0FBQUEsWUFRNUI7QUFBQSxnQkFBSTBGLEdBQUEsQ0FBSUQsSUFBUjtBQUFBLGNBQWNDLEdBQUEsQ0FBSUQsSUFBSixDQUFTRSxJQUFULENBQWN0QixJQUFkLEdBUmM7QUFBQSxXQUE5QixDQURzQjtBQUFBLFNBQXhCLENBakVrQztBQUFBLFFBOEVsQyxLQUFLNUIsS0FBTCxHQUFhLFlBQVc7QUFBQSxVQUV0QitDLFVBQUEsR0FGc0I7QUFBQSxVQUt0QjtBQUFBLFVBQUFqTCxFQUFBLElBQU1BLEVBQUEsQ0FBR2lCLElBQUgsQ0FBUTZJLElBQVIsRUFBY0MsSUFBZCxDQUFOLENBTHNCO0FBQUEsVUFPdEJzQixNQUFBLENBQU8sSUFBUCxFQVBzQjtBQUFBLFVBVXRCO0FBQUEsVUFBQWhDLGdCQUFBLENBQWlCeEQsR0FBakIsRUFBc0JpRSxJQUF0QixFQUE0QlIsV0FBNUIsRUFWc0I7QUFBQSxVQVl0QixJQUFJLENBQUNRLElBQUEsQ0FBS2hFLE1BQVY7QUFBQSxZQUFrQmdFLElBQUEsQ0FBSzNCLE1BQUwsR0FaSTtBQUFBLFVBZXRCO0FBQUEsVUFBQTJCLElBQUEsQ0FBS2hKLE9BQUwsQ0FBYSxVQUFiLEVBZnNCO0FBQUEsVUFpQnRCLElBQUlkLEVBQUosRUFBUTtBQUFBLFlBQ04sT0FBTzZGLEdBQUEsQ0FBSXlGLFVBQVg7QUFBQSxjQUF1QmxGLElBQUEsQ0FBS21GLFdBQUwsQ0FBaUIxRixHQUFBLENBQUl5RixVQUFyQixDQURqQjtBQUFBLFdBQVIsTUFHTztBQUFBLFlBQ0xuQixPQUFBLEdBQVV0RSxHQUFBLENBQUl5RixVQUFkLENBREs7QUFBQSxZQUVMbEYsSUFBQSxDQUFLZ0MsWUFBTCxDQUFrQitCLE9BQWxCLEVBQTJCTixJQUFBLENBQUs1QixNQUFMLElBQWUsSUFBMUM7QUFGSyxXQXBCZTtBQUFBLFVBeUJ0QixJQUFJN0IsSUFBQSxDQUFLUSxJQUFUO0FBQUEsWUFBZWtELElBQUEsQ0FBSzFELElBQUwsR0FBWUEsSUFBQSxHQUFPTixNQUFBLENBQU9NLElBQTFCLENBekJPO0FBQUEsVUE0QnRCO0FBQUEsY0FBSSxDQUFDMEQsSUFBQSxDQUFLaEUsTUFBVjtBQUFBLFlBQWtCZ0UsSUFBQSxDQUFLaEosT0FBTCxDQUFhLE9BQWI7QUFBQSxDQUFsQjtBQUFBO0FBQUEsWUFFS2dKLElBQUEsQ0FBS2hFLE1BQUwsQ0FBWW5GLEdBQVosQ0FBZ0IsT0FBaEIsRUFBeUIsWUFBVztBQUFBLGNBQUVtSixJQUFBLENBQUtoSixPQUFMLENBQWEsT0FBYixDQUFGO0FBQUEsYUFBcEMsQ0E5QmlCO0FBQUEsU0FBeEIsQ0E5RWtDO0FBQUEsUUFnSGxDLEtBQUtzRyxPQUFMLEdBQWUsVUFBU29FLFdBQVQsRUFBc0I7QUFBQSxVQUNuQyxJQUFJN0wsRUFBQSxHQUFLSyxFQUFBLEdBQUtvRyxJQUFMLEdBQVkrRCxPQUFyQixFQUNJdEcsQ0FBQSxHQUFJbEUsRUFBQSxDQUFHMEcsVUFEWCxDQURtQztBQUFBLFVBSW5DLElBQUl4QyxDQUFKLEVBQU87QUFBQSxZQUVMLElBQUlpQyxNQUFKLEVBQVk7QUFBQSxjQUlWO0FBQUE7QUFBQTtBQUFBLGtCQUFJZ0IsS0FBQSxDQUFNQyxPQUFOLENBQWNqQixNQUFBLENBQU9TLElBQVAsQ0FBWTJDLE9BQVosQ0FBZCxDQUFKLEVBQXlDO0FBQUEsZ0JBQ3ZDL0IsSUFBQSxDQUFLckIsTUFBQSxDQUFPUyxJQUFQLENBQVkyQyxPQUFaLENBQUwsRUFBMkIsVUFBU3hDLEdBQVQsRUFBY2xHLENBQWQsRUFBaUI7QUFBQSxrQkFDMUMsSUFBSWtHLEdBQUEsQ0FBSTdHLEdBQUosSUFBV2lLLElBQUEsQ0FBS2pLLEdBQXBCO0FBQUEsb0JBQ0VpRyxNQUFBLENBQU9TLElBQVAsQ0FBWTJDLE9BQVosRUFBcUJ4SSxNQUFyQixDQUE0QkYsQ0FBNUIsRUFBK0IsQ0FBL0IsQ0FGd0M7QUFBQSxpQkFBNUMsQ0FEdUM7QUFBQSxlQUF6QztBQUFBLGdCQU9FO0FBQUEsZ0JBQUFzRixNQUFBLENBQU9TLElBQVAsQ0FBWTJDLE9BQVosSUFBdUJ1QyxTQVhmO0FBQUEsYUFBWixNQVlPO0FBQUEsY0FDTCxPQUFPOUwsRUFBQSxDQUFHMkwsVUFBVjtBQUFBLGdCQUFzQjNMLEVBQUEsQ0FBR2dILFdBQUgsQ0FBZWhILEVBQUEsQ0FBRzJMLFVBQWxCLENBRGpCO0FBQUEsYUFkRjtBQUFBLFlBa0JMLElBQUksQ0FBQ0UsV0FBTDtBQUFBLGNBQ0UzSCxDQUFBLENBQUU4QyxXQUFGLENBQWNoSCxFQUFkLENBbkJHO0FBQUEsV0FKNEI7QUFBQSxVQTRCbkNtSyxJQUFBLENBQUtoSixPQUFMLENBQWEsU0FBYixFQTVCbUM7QUFBQSxVQTZCbkN1SyxNQUFBLEdBN0JtQztBQUFBLFVBOEJuQ3ZCLElBQUEsQ0FBS3hKLEdBQUwsQ0FBUyxHQUFULEVBOUJtQztBQUFBLFVBZ0NuQztBQUFBLFVBQUE4RixJQUFBLENBQUtpRSxJQUFMLEdBQVksSUFoQ3VCO0FBQUEsU0FBckMsQ0FoSGtDO0FBQUEsUUFvSmxDLFNBQVNnQixNQUFULENBQWdCSyxPQUFoQixFQUF5QjtBQUFBLFVBR3ZCO0FBQUEsVUFBQXZFLElBQUEsQ0FBS3VCLFNBQUwsRUFBZ0IsVUFBU0ksS0FBVCxFQUFnQjtBQUFBLFlBQUVBLEtBQUEsQ0FBTTRDLE9BQUEsR0FBVSxPQUFWLEdBQW9CLFNBQTFCLEdBQUY7QUFBQSxXQUFoQyxFQUh1QjtBQUFBLFVBTXZCO0FBQUEsY0FBSTVGLE1BQUosRUFBWTtBQUFBLFlBQ1YsSUFBSXRFLEdBQUEsR0FBTWtLLE9BQUEsR0FBVSxJQUFWLEdBQWlCLEtBQTNCLENBRFU7QUFBQSxZQUVWNUYsTUFBQSxDQUFPdEUsR0FBUCxFQUFZLFFBQVosRUFBc0JzSSxJQUFBLENBQUszQixNQUEzQixFQUFtQzNHLEdBQW5DLEVBQXdDLFNBQXhDLEVBQW1Ec0ksSUFBQSxDQUFLMUMsT0FBeEQsQ0FGVTtBQUFBLFdBTlc7QUFBQSxTQXBKUztBQUFBLFFBaUtsQztBQUFBLFFBQUFxQixrQkFBQSxDQUFtQjVDLEdBQW5CLEVBQXdCLElBQXhCLEVBQThCNkMsU0FBOUIsQ0FqS2tDO0FBQUEsT0FscEJqQjtBQUFBLE1Bd3pCbkIsU0FBU2lELGVBQVQsQ0FBeUJ6TCxJQUF6QixFQUErQjBMLE9BQS9CLEVBQXdDL0YsR0FBeEMsRUFBNkNhLEdBQTdDLEVBQWtEZixJQUFsRCxFQUF3RDtBQUFBLFFBRXRERSxHQUFBLENBQUkzRixJQUFKLElBQVksVUFBUzJMLENBQVQsRUFBWTtBQUFBLFVBR3RCO0FBQUEsVUFBQUEsQ0FBQSxHQUFJQSxDQUFBLElBQUt2TSxNQUFBLENBQU93TSxLQUFoQixDQUhzQjtBQUFBLFVBSXRCRCxDQUFBLENBQUVFLEtBQUYsR0FBVUYsQ0FBQSxDQUFFRSxLQUFGLElBQVdGLENBQUEsQ0FBRUcsUUFBYixJQUF5QkgsQ0FBQSxDQUFFSSxPQUFyQyxDQUpzQjtBQUFBLFVBS3RCSixDQUFBLENBQUVLLE1BQUYsR0FBV0wsQ0FBQSxDQUFFSyxNQUFGLElBQVlMLENBQUEsQ0FBRU0sVUFBekIsQ0FMc0I7QUFBQSxVQU10Qk4sQ0FBQSxDQUFFTyxhQUFGLEdBQWtCdkcsR0FBbEIsQ0FOc0I7QUFBQSxVQU90QmdHLENBQUEsQ0FBRWxHLElBQUYsR0FBU0EsSUFBVCxDQVBzQjtBQUFBLFVBVXRCO0FBQUEsY0FBSWlHLE9BQUEsQ0FBUTNLLElBQVIsQ0FBYXlGLEdBQWIsRUFBa0JtRixDQUFsQixNQUF5QixJQUF6QixJQUFpQyxDQUFDLGNBQWN6SSxJQUFkLENBQW1CeUMsR0FBQSxDQUFJekQsSUFBdkIsQ0FBdEMsRUFBb0U7QUFBQSxZQUNsRXlKLENBQUEsQ0FBRVEsY0FBRixJQUFvQlIsQ0FBQSxDQUFFUSxjQUFGLEVBQXBCLENBRGtFO0FBQUEsWUFFbEVSLENBQUEsQ0FBRVMsV0FBRixHQUFnQixLQUZrRDtBQUFBLFdBVjlDO0FBQUEsVUFldEIsSUFBSSxDQUFDVCxDQUFBLENBQUVVLGFBQVAsRUFBc0I7QUFBQSxZQUNwQixJQUFJNU0sRUFBQSxHQUFLZ0csSUFBQSxHQUFPZSxHQUFBLENBQUlaLE1BQVgsR0FBb0JZLEdBQTdCLENBRG9CO0FBQUEsWUFFcEIvRyxFQUFBLENBQUd3SSxNQUFILEVBRm9CO0FBQUEsV0FmQTtBQUFBLFNBRjhCO0FBQUEsT0F4ekJyQztBQUFBLE1BbTFCbkI7QUFBQSxlQUFTcUUsUUFBVCxDQUFrQnBHLElBQWxCLEVBQXdCcUcsSUFBeEIsRUFBOEJ4RSxNQUE5QixFQUFzQztBQUFBLFFBQ3BDLElBQUk3QixJQUFKLEVBQVU7QUFBQSxVQUNSQSxJQUFBLENBQUtnQyxZQUFMLENBQWtCSCxNQUFsQixFQUEwQndFLElBQTFCLEVBRFE7QUFBQSxVQUVSckcsSUFBQSxDQUFLTyxXQUFMLENBQWlCOEYsSUFBakIsQ0FGUTtBQUFBLFNBRDBCO0FBQUEsT0FuMUJuQjtBQUFBLE1BMjFCbkI7QUFBQSxlQUFTdEUsTUFBVCxDQUFnQm1CLFdBQWhCLEVBQTZCNUMsR0FBN0IsRUFBa0NmLElBQWxDLEVBQXdDO0FBQUEsUUFFdEN3QixJQUFBLENBQUttQyxXQUFMLEVBQWtCLFVBQVN0RixJQUFULEVBQWV4RCxDQUFmLEVBQWtCO0FBQUEsVUFFbEMsSUFBSXFGLEdBQUEsR0FBTTdCLElBQUEsQ0FBSzZCLEdBQWYsRUFDSTZHLFFBQUEsR0FBVzFJLElBQUEsQ0FBS3VFLElBRHBCLEVBRUlDLEtBQUEsR0FBUWhGLElBQUEsQ0FBS1EsSUFBQSxDQUFLQSxJQUFWLEVBQWdCMEMsR0FBaEIsQ0FGWixFQUdJWixNQUFBLEdBQVM5QixJQUFBLENBQUs2QixHQUFMLENBQVNRLFVBSHRCLENBRmtDO0FBQUEsVUFPbEMsSUFBSW1DLEtBQUEsSUFBUyxJQUFiO0FBQUEsWUFBbUJBLEtBQUEsR0FBUSxFQUFSLENBUGU7QUFBQSxVQVVsQztBQUFBLGNBQUkxQyxNQUFBLElBQVVBLE1BQUEsQ0FBT29ELE9BQVAsSUFBa0IsVUFBaEM7QUFBQSxZQUE0Q1YsS0FBQSxHQUFRQSxLQUFBLENBQU12SSxPQUFOLENBQWMsUUFBZCxFQUF3QixFQUF4QixDQUFSLENBVlY7QUFBQSxVQWFsQztBQUFBLGNBQUkrRCxJQUFBLENBQUt3RSxLQUFMLEtBQWVBLEtBQW5CO0FBQUEsWUFBMEIsT0FiUTtBQUFBLFVBY2xDeEUsSUFBQSxDQUFLd0UsS0FBTCxHQUFhQSxLQUFiLENBZGtDO0FBQUEsVUFpQmxDO0FBQUEsY0FBSSxDQUFDa0UsUUFBTDtBQUFBLFlBQWUsT0FBTzdHLEdBQUEsQ0FBSTZELFNBQUosR0FBZ0JsQixLQUFBLENBQU1tRSxRQUFOLEVBQXZCLENBakJtQjtBQUFBLFVBb0JsQztBQUFBLFVBQUE1RyxPQUFBLENBQVFGLEdBQVIsRUFBYTZHLFFBQWIsRUFwQmtDO0FBQUEsVUF1QmxDO0FBQUEsY0FBSSxPQUFPbEUsS0FBUCxJQUFnQixVQUFwQixFQUFnQztBQUFBLFlBQzlCbUQsZUFBQSxDQUFnQmUsUUFBaEIsRUFBMEJsRSxLQUExQixFQUFpQzNDLEdBQWpDLEVBQXNDYSxHQUF0QyxFQUEyQ2YsSUFBM0M7QUFEOEIsV0FBaEMsTUFJTyxJQUFJK0csUUFBQSxJQUFZLElBQWhCLEVBQXNCO0FBQUEsWUFDM0IsSUFBSTlGLElBQUEsR0FBTzVDLElBQUEsQ0FBSzRDLElBQWhCLENBRDJCO0FBQUEsWUFJM0I7QUFBQSxnQkFBSTRCLEtBQUosRUFBVztBQUFBLGNBQ1Q1QixJQUFBLElBQVE0RixRQUFBLENBQVM1RixJQUFBLENBQUtQLFVBQWQsRUFBMEJPLElBQTFCLEVBQWdDZixHQUFoQztBQURDLGFBQVgsTUFJTztBQUFBLGNBQ0xlLElBQUEsR0FBTzVDLElBQUEsQ0FBSzRDLElBQUwsR0FBWUEsSUFBQSxJQUFRZ0csUUFBQSxDQUFTQyxjQUFULENBQXdCLEVBQXhCLENBQTNCLENBREs7QUFBQSxjQUVMTCxRQUFBLENBQVMzRyxHQUFBLENBQUlRLFVBQWIsRUFBeUJSLEdBQXpCLEVBQThCZSxJQUE5QixDQUZLO0FBQUE7QUFSb0IsV0FBdEIsTUFjQSxJQUFJLGdCQUFnQnhELElBQWhCLENBQXFCc0osUUFBckIsQ0FBSixFQUFvQztBQUFBLFlBQ3pDLElBQUlBLFFBQUEsSUFBWSxNQUFoQjtBQUFBLGNBQXdCbEUsS0FBQSxHQUFRLENBQUNBLEtBQVQsQ0FEaUI7QUFBQSxZQUV6QzNDLEdBQUEsQ0FBSWlILEtBQUosQ0FBVUMsT0FBVixHQUFvQnZFLEtBQUEsR0FBUSxFQUFSLEdBQWE7QUFGUSxXQUFwQyxNQUtBLElBQUlrRSxRQUFBLElBQVksT0FBaEIsRUFBeUI7QUFBQSxZQUM5QjdHLEdBQUEsQ0FBSTJDLEtBQUosR0FBWUE7QUFEa0IsV0FBekIsTUFJQSxJQUFJa0UsUUFBQSxDQUFTMUwsS0FBVCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsS0FBd0IsT0FBNUIsRUFBcUM7QUFBQSxZQUMxQzBMLFFBQUEsR0FBV0EsUUFBQSxDQUFTMUwsS0FBVCxDQUFlLENBQWYsQ0FBWCxDQUQwQztBQUFBLFlBRTFDd0gsS0FBQSxHQUFRM0MsR0FBQSxDQUFJNkUsWUFBSixDQUFpQmdDLFFBQWpCLEVBQTJCbEUsS0FBM0IsQ0FBUixHQUE0Q3pDLE9BQUEsQ0FBUUYsR0FBUixFQUFhNkcsUUFBYixDQUZGO0FBQUEsV0FBckMsTUFJQTtBQUFBLFlBQ0wsSUFBSTFJLElBQUEsQ0FBSzJGLElBQVQsRUFBZTtBQUFBLGNBQ2I5RCxHQUFBLENBQUk2RyxRQUFKLElBQWdCbEUsS0FBaEIsQ0FEYTtBQUFBLGNBRWIsSUFBSSxDQUFDQSxLQUFMO0FBQUEsZ0JBQVksT0FGQztBQUFBLGNBR2JBLEtBQUEsR0FBUWtFLFFBSEs7QUFBQSxhQURWO0FBQUEsWUFPTCxJQUFJLE9BQU9sRSxLQUFQLElBQWdCLFFBQXBCO0FBQUEsY0FBOEIzQyxHQUFBLENBQUk2RSxZQUFKLENBQWlCZ0MsUUFBakIsRUFBMkJsRSxLQUEzQixDQVB6QjtBQUFBLFdBdEQyQjtBQUFBLFNBQXBDLENBRnNDO0FBQUEsT0EzMUJyQjtBQUFBLE1BazZCbkIsU0FBU3JCLElBQVQsQ0FBYzNCLEdBQWQsRUFBbUJ4RixFQUFuQixFQUF1QjtBQUFBLFFBQ3JCLEtBQUssSUFBSVEsQ0FBQSxHQUFJLENBQVIsRUFBV3dNLEdBQUEsR0FBTyxDQUFBeEgsR0FBQSxJQUFPLEVBQVAsQ0FBRCxDQUFZVCxNQUE3QixFQUFxQ3BGLEVBQXJDLENBQUwsQ0FBOENhLENBQUEsR0FBSXdNLEdBQWxELEVBQXVEeE0sQ0FBQSxFQUF2RCxFQUE0RDtBQUFBLFVBQzFEYixFQUFBLEdBQUs2RixHQUFBLENBQUloRixDQUFKLENBQUwsQ0FEMEQ7QUFBQSxVQUcxRDtBQUFBLGNBQUliLEVBQUEsSUFBTSxJQUFOLElBQWNLLEVBQUEsQ0FBR0wsRUFBSCxFQUFPYSxDQUFQLE1BQWMsS0FBaEM7QUFBQSxZQUF1Q0EsQ0FBQSxFQUhtQjtBQUFBLFNBRHZDO0FBQUEsUUFNckIsT0FBT2dGLEdBTmM7QUFBQSxPQWw2Qko7QUFBQSxNQTI2Qm5CLFNBQVNPLE9BQVQsQ0FBaUJGLEdBQWpCLEVBQXNCM0YsSUFBdEIsRUFBNEI7QUFBQSxRQUMxQjJGLEdBQUEsQ0FBSW9ILGVBQUosQ0FBb0IvTSxJQUFwQixDQUQwQjtBQUFBLE9BMzZCVDtBQUFBLE1BKzZCbkIsU0FBU3lLLE9BQVQsQ0FBaUJ1QyxFQUFqQixFQUFxQjtBQUFBLFFBQ25CLE9BQVEsQ0FBQUEsRUFBQSxHQUFNQSxFQUFBLElBQU0sRUFBWixDQUFELEdBQXFCLENBQUFBLEVBQUEsSUFBTSxFQUFOLENBRFQ7QUFBQSxPQS82QkY7QUFBQSxNQW83Qm5CO0FBQUEsZUFBU3pELE1BQVQsQ0FBZ0IwRCxHQUFoQixFQUFxQkMsSUFBckIsRUFBMkJDLEtBQTNCLEVBQWtDO0FBQUEsUUFDaENELElBQUEsSUFBUWpHLElBQUEsQ0FBS0UsTUFBQSxDQUFPQyxJQUFQLENBQVk4RixJQUFaLENBQUwsRUFBd0IsVUFBUzNILEdBQVQsRUFBYztBQUFBLFVBQzVDMEgsR0FBQSxDQUFJMUgsR0FBSixJQUFXMkgsSUFBQSxDQUFLM0gsR0FBTCxDQURpQztBQUFBLFNBQXRDLENBQVIsQ0FEZ0M7QUFBQSxRQUloQyxPQUFPNEgsS0FBQSxHQUFRNUQsTUFBQSxDQUFPMEQsR0FBUCxFQUFZRSxLQUFaLENBQVIsR0FBNkJGLEdBSko7QUFBQSxPQXA3QmY7QUFBQSxNQTI3Qm5CLFNBQVNHLE9BQVQsR0FBbUI7QUFBQSxRQUNqQixJQUFJaE8sTUFBSixFQUFZO0FBQUEsVUFDVixJQUFJaU8sRUFBQSxHQUFLQyxTQUFBLENBQVVDLFNBQW5CLENBRFU7QUFBQSxVQUVWLElBQUlDLElBQUEsR0FBT0gsRUFBQSxDQUFHekksT0FBSCxDQUFXLE9BQVgsQ0FBWCxDQUZVO0FBQUEsVUFHVixJQUFJNEksSUFBQSxHQUFPLENBQVgsRUFBYztBQUFBLFlBQ1osT0FBT0MsUUFBQSxDQUFTSixFQUFBLENBQUdLLFNBQUgsQ0FBYUYsSUFBQSxHQUFPLENBQXBCLEVBQXVCSCxFQUFBLENBQUd6SSxPQUFILENBQVcsR0FBWCxFQUFnQjRJLElBQWhCLENBQXZCLENBQVQsRUFBd0QsRUFBeEQsQ0FESztBQUFBLFdBQWQsTUFHSztBQUFBLFlBQ0gsT0FBTyxDQURKO0FBQUEsV0FOSztBQUFBLFNBREs7QUFBQSxPQTM3QkE7QUFBQSxNQXc4Qm5CLFNBQVNHLGVBQVQsQ0FBeUJsTyxFQUF6QixFQUE2Qm1PLElBQTdCLEVBQW1DO0FBQUEsUUFDakMsSUFBSUMsR0FBQSxHQUFNbkIsUUFBQSxDQUFTb0IsYUFBVCxDQUF1QixRQUF2QixDQUFWLEVBQ0lDLE9BQUEsR0FBVSx1QkFEZCxFQUVJQyxPQUFBLEdBQVUsMEJBRmQsRUFHSUMsV0FBQSxHQUFjTCxJQUFBLENBQUt2RCxLQUFMLENBQVcwRCxPQUFYLENBSGxCLEVBSUlHLGFBQUEsR0FBZ0JOLElBQUEsQ0FBS3ZELEtBQUwsQ0FBVzJELE9BQVgsQ0FKcEIsQ0FEaUM7QUFBQSxRQU9qQ0gsR0FBQSxDQUFJL0UsU0FBSixHQUFnQjhFLElBQWhCLENBUGlDO0FBQUEsUUFTakMsSUFBSUssV0FBSixFQUFpQjtBQUFBLFVBQ2ZKLEdBQUEsQ0FBSXZGLEtBQUosR0FBWTJGLFdBQUEsQ0FBWSxDQUFaLENBREc7QUFBQSxTQVRnQjtBQUFBLFFBYWpDLElBQUlDLGFBQUosRUFBbUI7QUFBQSxVQUNqQkwsR0FBQSxDQUFJckQsWUFBSixDQUFpQixlQUFqQixFQUFrQzBELGFBQUEsQ0FBYyxDQUFkLENBQWxDLENBRGlCO0FBQUEsU0FiYztBQUFBLFFBaUJqQ3pPLEVBQUEsQ0FBRzRMLFdBQUgsQ0FBZXdDLEdBQWYsQ0FqQmlDO0FBQUEsT0F4OEJoQjtBQUFBLE1BNDlCbkIsU0FBU00sY0FBVCxDQUF3QjFPLEVBQXhCLEVBQTRCbU8sSUFBNUIsRUFBa0M1RSxPQUFsQyxFQUEyQztBQUFBLFFBQ3pDLElBQUlvRixHQUFBLEdBQU0xQixRQUFBLENBQVNvQixhQUFULENBQXVCLEtBQXZCLENBQVYsQ0FEeUM7QUFBQSxRQUV6Q00sR0FBQSxDQUFJdEYsU0FBSixHQUFnQixZQUFZOEUsSUFBWixHQUFtQixVQUFuQyxDQUZ5QztBQUFBLFFBSXpDLElBQUksUUFBUTFLLElBQVIsQ0FBYThGLE9BQWIsQ0FBSixFQUEyQjtBQUFBLFVBQ3pCdkosRUFBQSxDQUFHNEwsV0FBSCxDQUFlK0MsR0FBQSxDQUFJaEQsVUFBSixDQUFlQSxVQUFmLENBQTBCQSxVQUExQixDQUFxQ0EsVUFBcEQsQ0FEeUI7QUFBQSxTQUEzQixNQUVPO0FBQUEsVUFDTDNMLEVBQUEsQ0FBRzRMLFdBQUgsQ0FBZStDLEdBQUEsQ0FBSWhELFVBQUosQ0FBZUEsVUFBZixDQUEwQkEsVUFBekMsQ0FESztBQUFBLFNBTmtDO0FBQUEsT0E1OUJ4QjtBQUFBLE1BdStCbkIsU0FBU3JCLEtBQVQsQ0FBZWpFLFFBQWYsRUFBeUI7QUFBQSxRQUN2QixJQUFJa0QsT0FBQSxHQUFVbEQsUUFBQSxDQUFTdEIsSUFBVCxHQUFnQjFELEtBQWhCLENBQXNCLENBQXRCLEVBQXlCLENBQXpCLEVBQTRCa0osV0FBNUIsRUFBZCxFQUNJcUUsT0FBQSxHQUFVLFFBQVFuTCxJQUFSLENBQWE4RixPQUFiLElBQXdCLElBQXhCLEdBQStCQSxPQUFBLElBQVcsSUFBWCxHQUFrQixPQUFsQixHQUE0QixLQUR6RSxFQUVJdkosRUFBQSxHQUFLNk8sSUFBQSxDQUFLRCxPQUFMLENBRlQsQ0FEdUI7QUFBQSxRQUt2QjVPLEVBQUEsQ0FBR2lILElBQUgsR0FBVSxJQUFWLENBTHVCO0FBQUEsUUFPdkIsSUFBSXNDLE9BQUEsS0FBWSxJQUFaLElBQW9CdUYsU0FBcEIsSUFBaUNBLFNBQUEsR0FBWSxFQUFqRCxFQUFxRDtBQUFBLFVBQ25EWixlQUFBLENBQWdCbE8sRUFBaEIsRUFBb0JxRyxRQUFwQixDQURtRDtBQUFBLFNBQXJELE1BRU8sSUFBSyxDQUFBdUksT0FBQSxLQUFZLE9BQVosSUFBdUJBLE9BQUEsS0FBWSxJQUFuQyxDQUFELElBQTZDRSxTQUE3QyxJQUEwREEsU0FBQSxHQUFZLEVBQTFFLEVBQThFO0FBQUEsVUFDbkZKLGNBQUEsQ0FBZTFPLEVBQWYsRUFBbUJxRyxRQUFuQixFQUE2QmtELE9BQTdCLENBRG1GO0FBQUEsU0FBOUU7QUFBQSxVQUdMdkosRUFBQSxDQUFHcUosU0FBSCxHQUFlaEQsUUFBZixDQVpxQjtBQUFBLFFBY3ZCLE9BQU9yRyxFQWRnQjtBQUFBLE9BditCTjtBQUFBLE1Bdy9CbkIsU0FBUzBJLElBQVQsQ0FBY3hDLEdBQWQsRUFBbUI3RixFQUFuQixFQUF1QjtBQUFBLFFBQ3JCLElBQUk2RixHQUFKLEVBQVM7QUFBQSxVQUNQLElBQUk3RixFQUFBLENBQUc2RixHQUFILE1BQVksS0FBaEI7QUFBQSxZQUF1QndDLElBQUEsQ0FBS3hDLEdBQUEsQ0FBSTZJLFdBQVQsRUFBc0IxTyxFQUF0QixFQUF2QjtBQUFBLGVBQ0s7QUFBQSxZQUNINkYsR0FBQSxHQUFNQSxHQUFBLENBQUl5RixVQUFWLENBREc7QUFBQSxZQUdILE9BQU96RixHQUFQLEVBQVk7QUFBQSxjQUNWd0MsSUFBQSxDQUFLeEMsR0FBTCxFQUFVN0YsRUFBVixFQURVO0FBQUEsY0FFVjZGLEdBQUEsR0FBTUEsR0FBQSxDQUFJNkksV0FGQTtBQUFBLGFBSFQ7QUFBQSxXQUZFO0FBQUEsU0FEWTtBQUFBLE9BeC9CSjtBQUFBLE1Bc2dDbkIsU0FBU0YsSUFBVCxDQUFjdE8sSUFBZCxFQUFvQjtBQUFBLFFBQ2xCLE9BQU8wTSxRQUFBLENBQVNvQixhQUFULENBQXVCOU4sSUFBdkIsQ0FEVztBQUFBLE9BdGdDRDtBQUFBLE1BMGdDbkIsU0FBUzhLLFlBQVQsQ0FBdUJ4SCxJQUF2QixFQUE2QndGLFNBQTdCLEVBQXdDO0FBQUEsUUFDdEMsT0FBT3hGLElBQUEsQ0FBS3ZELE9BQUwsQ0FBYSwwQkFBYixFQUF5QytJLFNBQUEsSUFBYSxFQUF0RCxDQUQrQjtBQUFBLE9BMWdDckI7QUFBQSxNQThnQ25CLFNBQVMyRixFQUFULENBQVlDLFFBQVosRUFBc0JDLEdBQXRCLEVBQTJCO0FBQUEsUUFDekJBLEdBQUEsR0FBTUEsR0FBQSxJQUFPakMsUUFBYixDQUR5QjtBQUFBLFFBRXpCLE9BQU9pQyxHQUFBLENBQUlDLGdCQUFKLENBQXFCRixRQUFyQixDQUZrQjtBQUFBLE9BOWdDUjtBQUFBLE1BbWhDbkIsU0FBU0csT0FBVCxDQUFpQkMsSUFBakIsRUFBdUJDLElBQXZCLEVBQTZCO0FBQUEsUUFDM0IsT0FBT0QsSUFBQSxDQUFLRSxNQUFMLENBQVksVUFBU3ZQLEVBQVQsRUFBYTtBQUFBLFVBQzlCLE9BQU9zUCxJQUFBLENBQUtuSyxPQUFMLENBQWFuRixFQUFiLElBQW1CLENBREk7QUFBQSxTQUF6QixDQURvQjtBQUFBLE9BbmhDVjtBQUFBLE1BeWhDbkIsU0FBUzZILGFBQVQsQ0FBdUJqSCxHQUF2QixFQUE0QlosRUFBNUIsRUFBZ0M7QUFBQSxRQUM5QixPQUFPWSxHQUFBLENBQUkyTyxNQUFKLENBQVcsVUFBVUMsR0FBVixFQUFlO0FBQUEsVUFDL0IsT0FBT0EsR0FBQSxLQUFReFAsRUFEZ0I7QUFBQSxTQUExQixDQUR1QjtBQUFBLE9BemhDYjtBQUFBLE1BK2hDbkIsU0FBU3FLLE9BQVQsQ0FBaUJsRSxNQUFqQixFQUF5QjtBQUFBLFFBQ3ZCLFNBQVNzSixLQUFULEdBQWlCO0FBQUEsU0FETTtBQUFBLFFBRXZCQSxLQUFBLENBQU1DLFNBQU4sR0FBa0J2SixNQUFsQixDQUZ1QjtBQUFBLFFBR3ZCLE9BQU8sSUFBSXNKLEtBSFk7QUFBQSxPQS9oQ047QUFBQSxNQTBpQ25CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUFJWCxTQUFBLEdBQVluQixPQUFBLEVBQWhCLENBMWlDbUI7QUFBQSxNQTRpQ25CLFNBQVNBLE9BQVQsR0FBbUI7QUFBQSxRQUNqQixJQUFJaE8sTUFBSixFQUFZO0FBQUEsVUFDVixJQUFJaU8sRUFBQSxHQUFLQyxTQUFBLENBQVVDLFNBQW5CLENBRFU7QUFBQSxVQUVWLElBQUlDLElBQUEsR0FBT0gsRUFBQSxDQUFHekksT0FBSCxDQUFXLE9BQVgsQ0FBWCxDQUZVO0FBQUEsVUFHVixJQUFJNEksSUFBQSxHQUFPLENBQVgsRUFBYztBQUFBLFlBQ1osT0FBT0MsUUFBQSxDQUFTSixFQUFBLENBQUdLLFNBQUgsQ0FBYUYsSUFBQSxHQUFPLENBQXBCLEVBQXVCSCxFQUFBLENBQUd6SSxPQUFILENBQVcsR0FBWCxFQUFnQjRJLElBQWhCLENBQXZCLENBQVQsRUFBd0QsRUFBeEQsQ0FESztBQUFBLFdBQWQsTUFHSztBQUFBLFlBQ0gsT0FBTyxDQURKO0FBQUEsV0FOSztBQUFBLFNBREs7QUFBQSxPQTVpQ0E7QUFBQSxNQXlqQ25CLFNBQVNXLGNBQVQsQ0FBd0IxTyxFQUF4QixFQUE0Qm1PLElBQTVCLEVBQWtDNUUsT0FBbEMsRUFBMkM7QUFBQSxRQUN6QyxJQUFJb0YsR0FBQSxHQUFNRSxJQUFBLENBQUssS0FBTCxDQUFWLEVBQ0ljLEtBQUEsR0FBUSxRQUFRbE0sSUFBUixDQUFhOEYsT0FBYixJQUF3QixDQUF4QixHQUE0QixDQUR4QyxFQUVJSixLQUZKLENBRHlDO0FBQUEsUUFLekN3RixHQUFBLENBQUl0RixTQUFKLEdBQWdCLFlBQVk4RSxJQUFaLEdBQW1CLFVBQW5DLENBTHlDO0FBQUEsUUFNekNoRixLQUFBLEdBQVF3RixHQUFBLENBQUloRCxVQUFaLENBTnlDO0FBQUEsUUFRekMsT0FBTWdFLEtBQUEsRUFBTixFQUFlO0FBQUEsVUFDYnhHLEtBQUEsR0FBUUEsS0FBQSxDQUFNd0MsVUFERDtBQUFBLFNBUjBCO0FBQUEsUUFZekMzTCxFQUFBLENBQUc0TCxXQUFILENBQWV6QyxLQUFmLENBWnlDO0FBQUEsT0F6akN4QjtBQUFBLE1BeWtDbkIsU0FBUytFLGVBQVQsQ0FBeUJsTyxFQUF6QixFQUE2Qm1PLElBQTdCLEVBQW1DO0FBQUEsUUFDakMsSUFBSUMsR0FBQSxHQUFNUyxJQUFBLENBQUssUUFBTCxDQUFWLEVBQ0lQLE9BQUEsR0FBVSx1QkFEZCxFQUVJQyxPQUFBLEdBQVUsMEJBRmQsRUFHSUMsV0FBQSxHQUFjTCxJQUFBLENBQUt2RCxLQUFMLENBQVcwRCxPQUFYLENBSGxCLEVBSUlHLGFBQUEsR0FBZ0JOLElBQUEsQ0FBS3ZELEtBQUwsQ0FBVzJELE9BQVgsQ0FKcEIsQ0FEaUM7QUFBQSxRQU9qQ0gsR0FBQSxDQUFJL0UsU0FBSixHQUFnQjhFLElBQWhCLENBUGlDO0FBQUEsUUFTakMsSUFBSUssV0FBSixFQUFpQjtBQUFBLFVBQ2ZKLEdBQUEsQ0FBSXZGLEtBQUosR0FBWTJGLFdBQUEsQ0FBWSxDQUFaLENBREc7QUFBQSxTQVRnQjtBQUFBLFFBYWpDLElBQUlDLGFBQUosRUFBbUI7QUFBQSxVQUNqQkwsR0FBQSxDQUFJckQsWUFBSixDQUFpQixlQUFqQixFQUFrQzBELGFBQUEsQ0FBYyxDQUFkLENBQWxDLENBRGlCO0FBQUEsU0FiYztBQUFBLFFBaUJqQ3pPLEVBQUEsQ0FBRzRMLFdBQUgsQ0FBZXdDLEdBQWYsQ0FqQmlDO0FBQUEsT0F6a0NoQjtBQUFBLE1Ba21DbkI7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUFJd0IsVUFBQSxHQUFhLEVBQWpCLEVBQ0lDLE9BQUEsR0FBVSxFQURkLEVBRUlDLFNBRkosQ0FsbUNtQjtBQUFBLE1BdW1DbkIsU0FBUzFHLE1BQVQsQ0FBZ0JsRCxHQUFoQixFQUFxQjtBQUFBLFFBQ25CLE9BQU8ySixPQUFBLENBQVEzSixHQUFBLENBQUlnRCxZQUFKLENBQWlCLFVBQWpCLEtBQWdDaEQsR0FBQSxDQUFJcUQsT0FBSixDQUFZZ0IsV0FBWixFQUF4QyxDQURZO0FBQUEsT0F2bUNGO0FBQUEsTUEybUNuQixTQUFTd0YsV0FBVCxDQUFxQkMsR0FBckIsRUFBMEI7QUFBQSxRQUV4QkYsU0FBQSxHQUFZQSxTQUFBLElBQWFqQixJQUFBLENBQUssT0FBTCxDQUF6QixDQUZ3QjtBQUFBLFFBSXhCLElBQUksQ0FBQzVCLFFBQUEsQ0FBU2dELElBQWQ7QUFBQSxVQUFvQixPQUpJO0FBQUEsUUFNeEIsSUFBR0gsU0FBQSxDQUFVSSxVQUFiO0FBQUEsVUFDRUosU0FBQSxDQUFVSSxVQUFWLENBQXFCQyxPQUFyQixJQUFnQ0gsR0FBaEMsQ0FERjtBQUFBO0FBQUEsVUFHRUYsU0FBQSxDQUFVekcsU0FBVixJQUF1QjJHLEdBQXZCLENBVHNCO0FBQUEsUUFXeEIsSUFBSSxDQUFDRixTQUFBLENBQVVNLFNBQWY7QUFBQSxVQUNFLElBQUlOLFNBQUEsQ0FBVUksVUFBZDtBQUFBLFlBQ0VqRCxRQUFBLENBQVNvRCxJQUFULENBQWN6RSxXQUFkLENBQTBCa0UsU0FBMUIsRUFERjtBQUFBO0FBQUEsWUFHRTdDLFFBQUEsQ0FBU2dELElBQVQsQ0FBY3JFLFdBQWQsQ0FBMEJrRSxTQUExQixFQWZvQjtBQUFBLFFBaUJ4QkEsU0FBQSxDQUFVTSxTQUFWLEdBQXNCLElBakJFO0FBQUEsT0EzbUNQO0FBQUEsTUFnb0NuQixTQUFTRSxPQUFULENBQWlCN0osSUFBakIsRUFBdUI4QyxPQUF2QixFQUFnQ2EsSUFBaEMsRUFBc0M7QUFBQSxRQUNwQyxJQUFJckQsR0FBQSxHQUFNOEksT0FBQSxDQUFRdEcsT0FBUixDQUFWLEVBQ0lGLFNBQUEsR0FBWTVDLElBQUEsQ0FBSzRDLFNBRHJCLENBRG9DO0FBQUEsUUFLcEM7QUFBQSxRQUFBNUMsSUFBQSxDQUFLNEMsU0FBTCxHQUFpQixFQUFqQixDQUxvQztBQUFBLFFBT3BDLElBQUl0QyxHQUFBLElBQU9OLElBQVg7QUFBQSxVQUFpQk0sR0FBQSxHQUFNLElBQUlzQixHQUFKLENBQVF0QixHQUFSLEVBQWE7QUFBQSxZQUFFTixJQUFBLEVBQU1BLElBQVI7QUFBQSxZQUFjMkQsSUFBQSxFQUFNQSxJQUFwQjtBQUFBLFdBQWIsRUFBeUNmLFNBQXpDLENBQU4sQ0FQbUI7QUFBQSxRQVNwQyxJQUFJdEMsR0FBQSxJQUFPQSxHQUFBLENBQUl3QixLQUFmLEVBQXNCO0FBQUEsVUFDcEJ4QixHQUFBLENBQUl3QixLQUFKLEdBRG9CO0FBQUEsVUFFcEJxSCxVQUFBLENBQVduUCxJQUFYLENBQWdCc0csR0FBaEIsRUFGb0I7QUFBQSxVQUdwQixPQUFPQSxHQUFBLENBQUk1RyxFQUFKLENBQU8sU0FBUCxFQUFrQixZQUFXO0FBQUEsWUFDbEN5UCxVQUFBLENBQVc3TyxNQUFYLENBQWtCNk8sVUFBQSxDQUFXekssT0FBWCxDQUFtQjRCLEdBQW5CLENBQWxCLEVBQTJDLENBQTNDLENBRGtDO0FBQUEsV0FBN0IsQ0FIYTtBQUFBLFNBVGM7QUFBQSxPQWhvQ25CO0FBQUEsTUFtcENuQm5ILElBQUEsQ0FBS21ILEdBQUwsR0FBVyxVQUFTeEcsSUFBVCxFQUFlNE4sSUFBZixFQUFxQjZCLEdBQXJCLEVBQTBCckYsS0FBMUIsRUFBaUN0SyxFQUFqQyxFQUFxQztBQUFBLFFBQzlDLElBQUksT0FBT3NLLEtBQVAsSUFBZ0IsVUFBcEIsRUFBZ0M7QUFBQSxVQUM5QnRLLEVBQUEsR0FBS3NLLEtBQUwsQ0FEOEI7QUFBQSxVQUU5QixJQUFHLGVBQWVsSCxJQUFmLENBQW9CdU0sR0FBcEIsQ0FBSCxFQUE2QjtBQUFBLFlBQUNyRixLQUFBLEdBQVFxRixHQUFSLENBQUQ7QUFBQSxZQUFjQSxHQUFBLEdBQU0sRUFBcEI7QUFBQSxXQUE3QjtBQUFBLFlBQTBEckYsS0FBQSxHQUFRLEVBRnBDO0FBQUEsU0FEYztBQUFBLFFBSzlDLElBQUksT0FBT3FGLEdBQVAsSUFBYyxVQUFsQjtBQUFBLFVBQThCM1AsRUFBQSxHQUFLMlAsR0FBTCxDQUE5QjtBQUFBLGFBQ0ssSUFBSUEsR0FBSjtBQUFBLFVBQVNELFdBQUEsQ0FBWUMsR0FBWixFQU5nQztBQUFBLFFBTzlDSCxPQUFBLENBQVF0UCxJQUFSLElBQWdCO0FBQUEsVUFBRUEsSUFBQSxFQUFNQSxJQUFSO0FBQUEsVUFBY3NELElBQUEsRUFBTXNLLElBQXBCO0FBQUEsVUFBMEJ4RCxLQUFBLEVBQU9BLEtBQWpDO0FBQUEsVUFBd0N0SyxFQUFBLEVBQUlBLEVBQTVDO0FBQUEsU0FBaEIsQ0FQOEM7QUFBQSxRQVE5QyxPQUFPRSxJQVJ1QztBQUFBLE9BQWhELENBbnBDbUI7QUFBQSxNQThwQ25CWCxJQUFBLENBQUsySSxLQUFMLEdBQWEsVUFBUzBHLFFBQVQsRUFBbUIxRixPQUFuQixFQUE0QmEsSUFBNUIsRUFBa0M7QUFBQSxRQUU3QyxJQUFJcEssRUFBSixFQUNJdVEsWUFBQSxHQUFlLFlBQVc7QUFBQSxZQUN4QixJQUFJNUksSUFBQSxHQUFPRCxNQUFBLENBQU9DLElBQVAsQ0FBWWtJLE9BQVosQ0FBWCxDQUR3QjtBQUFBLFlBRXhCLElBQUlXLElBQUEsR0FBTzdJLElBQUEsQ0FBS3BELElBQUwsQ0FBVSxJQUFWLENBQVgsQ0FGd0I7QUFBQSxZQUd4QmlELElBQUEsQ0FBS0csSUFBTCxFQUFXLFVBQVM4SSxDQUFULEVBQVk7QUFBQSxjQUNyQkQsSUFBQSxJQUFRLG1CQUFrQkMsQ0FBQSxDQUFFMUwsSUFBRixFQUFsQixHQUE2QixJQURoQjtBQUFBLGFBQXZCLEVBSHdCO0FBQUEsWUFNeEIsT0FBT3lMLElBTmlCO0FBQUEsV0FEOUIsRUFTSUUsT0FUSixFQVVJOUosSUFBQSxHQUFPLEVBVlgsQ0FGNkM7QUFBQSxRQWM3QyxJQUFJLE9BQU8yQyxPQUFQLElBQWtCLFFBQXRCLEVBQWdDO0FBQUEsVUFBRWEsSUFBQSxHQUFPYixPQUFQLENBQUY7QUFBQSxVQUFrQkEsT0FBQSxHQUFVLENBQTVCO0FBQUEsU0FkYTtBQUFBLFFBaUI3QztBQUFBLFlBQUcsT0FBTzBGLFFBQVAsSUFBbUIsUUFBdEIsRUFBZ0M7QUFBQSxVQUM5QixJQUFJQSxRQUFBLElBQVksR0FBaEIsRUFBcUI7QUFBQSxZQUduQjtBQUFBO0FBQUEsWUFBQUEsUUFBQSxHQUFXeUIsT0FBQSxHQUFVSCxZQUFBLEVBSEY7QUFBQSxXQUFyQixNQUlPO0FBQUEsWUFDTHRCLFFBQUEsQ0FBUzVNLEtBQVQsQ0FBZSxHQUFmLEVBQW9CaUMsR0FBcEIsQ0FBd0IsVUFBU21NLENBQVQsRUFBWTtBQUFBLGNBQ2xDeEIsUUFBQSxJQUFZLG1CQUFrQndCLENBQUEsQ0FBRTFMLElBQUYsRUFBbEIsR0FBNkIsSUFEUDtBQUFBLGFBQXBDLENBREs7QUFBQSxXQUx1QjtBQUFBLFVBWTlCO0FBQUEsVUFBQS9FLEVBQUEsR0FBS2dQLEVBQUEsQ0FBR0MsUUFBSCxDQVp5QjtBQUFBO0FBQWhDO0FBQUEsVUFnQkVqUCxFQUFBLEdBQUtpUCxRQUFMLENBakMyQztBQUFBLFFBb0M3QztBQUFBLFlBQUkxRixPQUFBLElBQVcsR0FBZixFQUFvQjtBQUFBLFVBRWxCO0FBQUEsVUFBQUEsT0FBQSxHQUFVbUgsT0FBQSxJQUFXSCxZQUFBLEVBQXJCLENBRmtCO0FBQUEsVUFJbEI7QUFBQSxjQUFJdlEsRUFBQSxDQUFHdUosT0FBUCxFQUFnQjtBQUFBLFlBQ2R2SixFQUFBLEdBQUtnUCxFQUFBLENBQUd6RixPQUFILEVBQVl2SixFQUFaLENBRFM7QUFBQSxXQUFoQixNQUVPO0FBQUEsWUFDTCxJQUFJMlEsUUFBQSxHQUFXLEVBQWYsQ0FESztBQUFBLFlBR0w7QUFBQSxZQUFBbkosSUFBQSxDQUFLeEgsRUFBTCxFQUFTLFVBQVMrRyxHQUFULEVBQWM7QUFBQSxjQUNyQjRKLFFBQUEsR0FBVzNCLEVBQUEsQ0FBR3pGLE9BQUgsRUFBWXhDLEdBQVosQ0FEVTtBQUFBLGFBQXZCLEVBSEs7QUFBQSxZQU1ML0csRUFBQSxHQUFLMlEsUUFOQTtBQUFBLFdBTlc7QUFBQSxVQWVsQjtBQUFBLFVBQUFwSCxPQUFBLEdBQVUsQ0FmUTtBQUFBLFNBcEN5QjtBQUFBLFFBc0Q3QyxTQUFTOUksSUFBVCxDQUFjZ0csSUFBZCxFQUFvQjtBQUFBLFVBQ2xCLElBQUc4QyxPQUFBLElBQVcsQ0FBQzlDLElBQUEsQ0FBS3lDLFlBQUwsQ0FBa0IsVUFBbEIsQ0FBZjtBQUFBLFlBQThDekMsSUFBQSxDQUFLc0UsWUFBTCxDQUFrQixVQUFsQixFQUE4QnhCLE9BQTlCLEVBRDVCO0FBQUEsVUFHbEIsSUFBSWhKLElBQUEsR0FBT2dKLE9BQUEsSUFBVzlDLElBQUEsQ0FBS3lDLFlBQUwsQ0FBa0IsVUFBbEIsQ0FBWCxJQUE0Q3pDLElBQUEsQ0FBSzhDLE9BQUwsQ0FBYWdCLFdBQWIsRUFBdkQsRUFDSXhELEdBQUEsR0FBTXVKLE9BQUEsQ0FBUTdKLElBQVIsRUFBY2xHLElBQWQsRUFBb0I2SixJQUFwQixDQURWLENBSGtCO0FBQUEsVUFNbEIsSUFBSXJELEdBQUo7QUFBQSxZQUFTSCxJQUFBLENBQUtuRyxJQUFMLENBQVVzRyxHQUFWLENBTlM7QUFBQSxTQXREeUI7QUFBQSxRQWdFN0M7QUFBQSxZQUFJL0csRUFBQSxDQUFHdUosT0FBUDtBQUFBLFVBQ0U5SSxJQUFBLENBQUt3TyxRQUFMO0FBQUEsQ0FERjtBQUFBO0FBQUEsVUFJRXpILElBQUEsQ0FBS3hILEVBQUwsRUFBU1MsSUFBVCxFQXBFMkM7QUFBQSxRQXNFN0MsT0FBT21HLElBdEVzQztBQUFBLE9BQS9DLENBOXBDbUI7QUFBQSxNQXl1Q25CO0FBQUEsTUFBQWhILElBQUEsQ0FBSzRJLE1BQUwsR0FBYyxZQUFXO0FBQUEsUUFDdkIsT0FBT2hCLElBQUEsQ0FBS29JLFVBQUwsRUFBaUIsVUFBUzdJLEdBQVQsRUFBYztBQUFBLFVBQ3BDQSxHQUFBLENBQUl5QixNQUFKLEVBRG9DO0FBQUEsU0FBL0IsQ0FEZ0I7QUFBQSxPQUF6QixDQXp1Q21CO0FBQUEsTUFndkNuQjtBQUFBLE1BQUE1SSxJQUFBLENBQUswUSxPQUFMLEdBQWUxUSxJQUFBLENBQUsySSxLQUFwQixDQWh2Q21CO0FBQUEsTUFvdkNqQjtBQUFBLE1BQUEzSSxJQUFBLENBQUtnUixJQUFMLEdBQVk7QUFBQSxRQUFFeE4sUUFBQSxFQUFVQSxRQUFaO0FBQUEsUUFBc0JTLElBQUEsRUFBTUEsSUFBNUI7QUFBQSxPQUFaLENBcHZDaUI7QUFBQSxNQXV2Q2pCO0FBQUEsVUFBSSxPQUFPZ04sT0FBUCxLQUFtQixRQUF2QjtBQUFBLFFBQ0VDLE1BQUEsQ0FBT0QsT0FBUCxHQUFpQmpSLElBQWpCLENBREY7QUFBQSxXQUVLLElBQUksT0FBT21SLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0NBLE1BQUEsQ0FBT0MsR0FBM0M7QUFBQSxRQUNIRCxNQUFBLENBQU8sWUFBVztBQUFBLFVBQUUsT0FBT25SLElBQVQ7QUFBQSxTQUFsQixFQURHO0FBQUE7QUFBQSxRQUdIRCxNQUFBLENBQU9DLElBQVAsR0FBY0EsSUE1dkNDO0FBQUEsS0FBbEIsQ0E4dkNFLE9BQU9ELE1BQVAsSUFBaUIsV0FBakIsR0FBK0JBLE1BQS9CLEdBQXdDbU0sU0E5dkMxQyxFOzs7O0lDRkQsSUFBSW1GLE1BQUosQztJQUVBQSxNQUFBLEdBQVNDLE9BQUEsQ0FBUSxlQUFSLENBQVQsQztJQUVBSixNQUFBLENBQU9ELE9BQVAsR0FBaUI7QUFBQSxNQUNmTSxHQUFBLEVBQUtELE9BQUEsQ0FBUSxZQUFSLENBRFU7QUFBQSxNQUVmRSxNQUFBLEVBQVFGLE9BQUEsQ0FBUSxlQUFSLENBRk87QUFBQSxNQUdmRyxNQUFBLEVBQVFKLE1BQUEsQ0FBT0ksTUFIQTtBQUFBLE1BSWZDLDZCQUFBLEVBQStCTCxNQUFBLENBQU9LLDZCQUp2QjtBQUFBLEs7Ozs7SUNKakIsSUFBSUQsTUFBSixFQUFZRSxDQUFaLEVBQWVELDZCQUFmLEVBQThDNU0sQ0FBOUMsRUFDRW9GLE1BQUEsR0FBUyxVQUFTWCxLQUFULEVBQWdCaEQsTUFBaEIsRUFBd0I7QUFBQSxRQUFFLFNBQVNMLEdBQVQsSUFBZ0JLLE1BQWhCLEVBQXdCO0FBQUEsVUFBRSxJQUFJcUwsT0FBQSxDQUFRbFEsSUFBUixDQUFhNkUsTUFBYixFQUFxQkwsR0FBckIsQ0FBSjtBQUFBLFlBQStCcUQsS0FBQSxDQUFNckQsR0FBTixJQUFhSyxNQUFBLENBQU9MLEdBQVAsQ0FBOUM7QUFBQSxTQUExQjtBQUFBLFFBQXVGLFNBQVMyTCxJQUFULEdBQWdCO0FBQUEsVUFBRSxLQUFLQyxXQUFMLEdBQW1CdkksS0FBckI7QUFBQSxTQUF2RztBQUFBLFFBQXFJc0ksSUFBQSxDQUFLL0IsU0FBTCxHQUFpQnZKLE1BQUEsQ0FBT3VKLFNBQXhCLENBQXJJO0FBQUEsUUFBd0t2RyxLQUFBLENBQU11RyxTQUFOLEdBQWtCLElBQUkrQixJQUF0QixDQUF4SztBQUFBLFFBQXNNdEksS0FBQSxDQUFNd0ksU0FBTixHQUFrQnhMLE1BQUEsQ0FBT3VKLFNBQXpCLENBQXRNO0FBQUEsUUFBME8sT0FBT3ZHLEtBQWpQO0FBQUEsT0FEbkMsRUFFRXFJLE9BQUEsR0FBVSxHQUFHSSxjQUZmLEM7SUFJQWxOLENBQUEsR0FBSXdNLE9BQUEsQ0FBUSx1QkFBUixDQUFKLEM7SUFFQUssQ0FBQSxHQUFJTCxPQUFBLENBQVEsS0FBUixDQUFKLEM7SUFFQUcsTUFBQSxHQUFVLFlBQVc7QUFBQSxNQUNuQkEsTUFBQSxDQUFPM0IsU0FBUCxDQUFpQm1DLFlBQWpCLEdBQWdDQyxRQUFoQyxDQURtQjtBQUFBLE1BR25CVCxNQUFBLENBQU8zQixTQUFQLENBQWlCL0wsTUFBakIsR0FBMEIsSUFBMUIsQ0FIbUI7QUFBQSxNQUtuQjBOLE1BQUEsQ0FBTzNCLFNBQVAsQ0FBaUJ0UCxNQUFqQixHQUEwQixJQUExQixDQUxtQjtBQUFBLE1BT25CaVIsTUFBQSxDQUFPM0IsU0FBUCxDQUFpQnFDLE1BQWpCLEdBQTBCLFlBQVc7QUFBQSxPQUFyQyxDQVBtQjtBQUFBLE1BU25CVixNQUFBLENBQU8zQixTQUFQLENBQWlCc0MsSUFBakIsR0FBd0IsVUFBU0MsR0FBVCxFQUFjO0FBQUEsUUFDcEMsSUFBSUMsQ0FBSixFQUFPak8sSUFBUCxDQURvQztBQUFBLFFBRXBDaU8sQ0FBQSxHQUFJWCxDQUFBLENBQUVZLEtBQUYsRUFBSixDQUZvQztBQUFBLFFBR3BDbE8sSUFBQSxHQUFPZ08sR0FBQSxDQUFJaE8sSUFBWCxDQUhvQztBQUFBLFFBSXBDaU8sQ0FBQSxDQUFFRSxPQUFGLENBQVVuTyxJQUFWLEVBSm9DO0FBQUEsUUFLcEMsT0FBT2lPLENBQUEsQ0FBRUcsT0FMMkI7QUFBQSxPQUF0QyxDQVRtQjtBQUFBLE1BaUJuQixTQUFTaEIsTUFBVCxDQUFnQmlCLE9BQWhCLEVBQXlCO0FBQUEsUUFDdkIsS0FBS0EsT0FBTCxHQUFlQSxPQUFmLENBRHVCO0FBQUEsUUFFdkI1TixDQUFBLENBQUVvRixNQUFGLENBQVMsSUFBVCxFQUFlLEtBQUt3SSxPQUFwQixDQUZ1QjtBQUFBLE9BakJOO0FBQUEsTUFzQm5CakIsTUFBQSxDQUFPa0IsSUFBUCxHQUFjLElBQUlsQixNQUFsQixDQXRCbUI7QUFBQSxNQXdCbkIsT0FBT0EsTUF4Qlk7QUFBQSxLQUFaLEVBQVQsQztJQTRCQUMsNkJBQUEsR0FBaUMsVUFBU2tCLFVBQVQsRUFBcUI7QUFBQSxNQUNwRDFJLE1BQUEsQ0FBT3dILDZCQUFQLEVBQXNDa0IsVUFBdEMsRUFEb0Q7QUFBQSxNQUdwRCxTQUFTbEIsNkJBQVQsR0FBeUM7QUFBQSxRQUN2QyxPQUFPQSw2QkFBQSxDQUE4QkssU0FBOUIsQ0FBd0NELFdBQXhDLENBQW9EelEsS0FBcEQsQ0FBMEQsSUFBMUQsRUFBZ0VDLFNBQWhFLENBRGdDO0FBQUEsT0FIVztBQUFBLE1BT3BEb1EsNkJBQUEsQ0FBOEI1QixTQUE5QixDQUF3Q3NDLElBQXhDLEdBQStDLFVBQVNDLEdBQVQsRUFBYztBQUFBLFFBQzNELElBQUlDLENBQUosRUFBT2pPLElBQVAsRUFBYXdPLElBQWIsRUFBbUJDLE1BQW5CLEVBQTJCN1IsQ0FBM0IsRUFBOEI4UixFQUE5QixFQUFrQ0MsQ0FBbEMsRUFBcUN2RixHQUFyQyxFQUEwQ3dGLElBQTFDLENBRDJEO0FBQUEsUUFFM0RYLENBQUEsR0FBSVgsQ0FBQSxDQUFFWSxLQUFGLEVBQUosQ0FGMkQ7QUFBQSxRQUczRGxPLElBQUEsR0FBT2dPLEdBQUEsQ0FBSWhPLElBQVgsQ0FIMkQ7QUFBQSxRQUkzRCxJQUFJLENBQUNTLENBQUEsQ0FBRTBDLE9BQUYsQ0FBVW5ELElBQVYsQ0FBTCxFQUFzQjtBQUFBLFVBQ3BCaU8sQ0FBQSxDQUFFRSxPQUFGLENBQVVuTyxJQUFWLEVBRG9CO0FBQUEsVUFFcEIsT0FBT2lPLENBQUEsQ0FBRUcsT0FGVztBQUFBLFNBSnFDO0FBQUEsUUFRM0RRLElBQUEsR0FBTyxDQUFQLENBUjJEO0FBQUEsUUFTM0RILE1BQUEsR0FBUyxLQUFULENBVDJEO0FBQUEsUUFVM0RELElBQUEsR0FBTyxVQUFTUixHQUFULEVBQWM7QUFBQSxVQUNuQlksSUFBQSxHQURtQjtBQUFBLFVBRW5CLE9BQU9YLENBQUEsQ0FBRVksTUFBRixDQUFTYixHQUFBLENBQUljLE9BQWIsQ0FGWTtBQUFBLFNBQXJCLENBVjJEO0FBQUEsUUFjM0QsS0FBS2xTLENBQUEsR0FBSStSLENBQUEsR0FBSSxDQUFSLEVBQVd2RixHQUFBLEdBQU1wSixJQUFBLENBQUttQixNQUEzQixFQUFtQ3dOLENBQUEsR0FBSXZGLEdBQXZDLEVBQTRDeE0sQ0FBQSxHQUFJLEVBQUUrUixDQUFsRCxFQUFxRDtBQUFBLFVBQ25ERCxFQUFBLEdBQUsxTyxJQUFBLENBQUtwRCxDQUFMLENBQUwsQ0FEbUQ7QUFBQSxVQUVuRCxJQUFJLENBQUM2RCxDQUFBLENBQUVzTyxRQUFGLENBQVdMLEVBQVgsQ0FBTCxFQUFxQjtBQUFBLFlBQ25CRSxJQUFBLEdBRG1CO0FBQUEsWUFFbkI1TyxJQUFBLENBQUtwRCxDQUFMLElBQVUsSUFBVixDQUZtQjtBQUFBLFlBR25CLENBQUMsVUFBU29TLEtBQVQsRUFBZ0I7QUFBQSxjQUNmLE9BQVEsVUFBU04sRUFBVCxFQUFhOVIsQ0FBYixFQUFnQjtBQUFBLGdCQUN0QixJQUFJcVMsT0FBSixDQURzQjtBQUFBLGdCQUV0QkEsT0FBQSxHQUFVLFVBQVNqQixHQUFULEVBQWM7QUFBQSxrQkFDdEIsSUFBSWtCLEtBQUosRUFBV3hPLENBQVgsRUFBY3lPLElBQWQsRUFBb0JDLFdBQXBCLENBRHNCO0FBQUEsa0JBRXRCUixJQUFBLEdBRnNCO0FBQUEsa0JBR3RCNU8sSUFBQSxDQUFLcEQsQ0FBTCxJQUFVb1IsR0FBQSxDQUFJaE8sSUFBZCxDQUhzQjtBQUFBLGtCQUl0QixJQUFJNE8sSUFBQSxLQUFTLENBQWIsRUFBZ0I7QUFBQSxvQkFDZCxPQUFPWCxDQUFBLENBQUVFLE9BQUYsQ0FBVW5PLElBQVYsQ0FETztBQUFBLG1CQUFoQixNQUVPLElBQUksQ0FBQ3lPLE1BQUwsRUFBYTtBQUFBLG9CQUNsQlcsV0FBQSxHQUFjLEVBQWQsQ0FEa0I7QUFBQSxvQkFFbEIsS0FBSzFPLENBQUEsR0FBSSxDQUFKLEVBQU95TyxJQUFBLEdBQU9uUCxJQUFBLENBQUttQixNQUF4QixFQUFnQ1QsQ0FBQSxHQUFJeU8sSUFBcEMsRUFBMEN6TyxDQUFBLEVBQTFDLEVBQStDO0FBQUEsc0JBQzdDd08sS0FBQSxHQUFRbFAsSUFBQSxDQUFLVSxDQUFMLENBQVIsQ0FENkM7QUFBQSxzQkFFN0MsSUFBSXdPLEtBQUEsSUFBUyxJQUFiLEVBQW1CO0FBQUEsd0JBQ2pCRSxXQUFBLENBQVk1UyxJQUFaLENBQWlCMFMsS0FBakIsQ0FEaUI7QUFBQSx1QkFGMEI7QUFBQSxxQkFGN0I7QUFBQSxvQkFRbEIsT0FBT2pCLENBQUEsQ0FBRW9CLE1BQUYsQ0FBU0QsV0FBVCxDQVJXO0FBQUEsbUJBTkU7QUFBQSxpQkFBeEIsQ0FGc0I7QUFBQSxnQkFtQnRCLE9BQU9KLEtBQUEsQ0FBTXRQLE1BQU4sQ0FBYTRQLEdBQWIsQ0FBaUJDLEdBQWpCLENBQXFCUCxLQUFBLENBQU10UCxNQUFOLENBQWFwQixJQUFiLEdBQW9CLEdBQXBCLEdBQTBCb1EsRUFBL0MsRUFBbURjLElBQW5ELENBQXdEUCxPQUF4RCxFQUFpRVQsSUFBakUsQ0FuQmU7QUFBQSxlQURUO0FBQUEsYUFBakIsQ0FzQkcsSUF0QkgsRUFzQlNFLEVBdEJULEVBc0JhOVIsQ0F0QmIsRUFIbUI7QUFBQSxXQUY4QjtBQUFBLFNBZE07QUFBQSxRQTRDM0QsT0FBT3FSLENBQUEsQ0FBRUcsT0E1Q2tEO0FBQUEsT0FBN0QsQ0FQb0Q7QUFBQSxNQXNEcEQsT0FBT2YsNkJBdEQ2QztBQUFBLEtBQXRCLENBd0Q3QkQsTUF4RDZCLENBQWhDLEM7SUEwREFQLE1BQUEsQ0FBT0QsT0FBUCxHQUFpQjtBQUFBLE1BQ2ZRLE1BQUEsRUFBUUEsTUFETztBQUFBLE1BRWZDLDZCQUFBLEVBQStCQSw2QkFGaEI7QUFBQSxLOzs7O0lDekZqQjtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQUMsWUFBVztBQUFBLE1BTVY7QUFBQTtBQUFBO0FBQUEsVUFBSTdLLElBQUEsR0FBTyxJQUFYLENBTlU7QUFBQSxNQVNWO0FBQUEsVUFBSWlOLGtCQUFBLEdBQXFCak4sSUFBQSxDQUFLL0IsQ0FBOUIsQ0FUVTtBQUFBLE1BWVY7QUFBQSxVQUFJaVAsVUFBQSxHQUFheE0sS0FBQSxDQUFNdUksU0FBdkIsRUFBa0NrRSxRQUFBLEdBQVdsTSxNQUFBLENBQU9nSSxTQUFwRCxFQUErRG1FLFNBQUEsR0FBWXpQLFFBQUEsQ0FBU3NMLFNBQXBGLENBWlU7QUFBQSxNQWVWO0FBQUEsVUFDRWpQLElBQUEsR0FBbUJrVCxVQUFBLENBQVdsVCxJQURoQyxFQUVFWSxLQUFBLEdBQW1Cc1MsVUFBQSxDQUFXdFMsS0FGaEMsRUFHRTJMLFFBQUEsR0FBbUI0RyxRQUFBLENBQVM1RyxRQUg5QixFQUlFNEUsY0FBQSxHQUFtQmdDLFFBQUEsQ0FBU2hDLGNBSjlCLENBZlU7QUFBQSxNQXVCVjtBQUFBO0FBQUEsVUFDRWtDLGFBQUEsR0FBcUIzTSxLQUFBLENBQU1DLE9BRDdCLEVBRUUyTSxVQUFBLEdBQXFCck0sTUFBQSxDQUFPQyxJQUY5QixFQUdFcU0sVUFBQSxHQUFxQkgsU0FBQSxDQUFVcEksSUFIakMsRUFJRXdJLFlBQUEsR0FBcUJ2TSxNQUFBLENBQU93TSxNQUo5QixDQXZCVTtBQUFBLE1BOEJWO0FBQUEsVUFBSUMsSUFBQSxHQUFPLFlBQVU7QUFBQSxPQUFyQixDQTlCVTtBQUFBLE1BaUNWO0FBQUEsVUFBSXpQLENBQUEsR0FBSSxVQUFTOEksR0FBVCxFQUFjO0FBQUEsUUFDcEIsSUFBSUEsR0FBQSxZQUFlOUksQ0FBbkI7QUFBQSxVQUFzQixPQUFPOEksR0FBUCxDQURGO0FBQUEsUUFFcEIsSUFBSSxDQUFFLGlCQUFnQjlJLENBQWhCLENBQU47QUFBQSxVQUEwQixPQUFPLElBQUlBLENBQUosQ0FBTThJLEdBQU4sQ0FBUCxDQUZOO0FBQUEsUUFHcEIsS0FBSzRHLFFBQUwsR0FBZ0I1RyxHQUhJO0FBQUEsT0FBdEIsQ0FqQ1U7QUFBQSxNQTBDVjtBQUFBO0FBQUE7QUFBQSxVQUFJLE9BQU9xRCxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DO0FBQUEsUUFDbEMsSUFBSSxPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFBLENBQU9ELE9BQTVDLEVBQXFEO0FBQUEsVUFDbkRBLE9BQUEsR0FBVUMsTUFBQSxDQUFPRCxPQUFQLEdBQWlCbk0sQ0FEd0I7QUFBQSxTQURuQjtBQUFBLFFBSWxDbU0sT0FBQSxDQUFRbk0sQ0FBUixHQUFZQSxDQUpzQjtBQUFBLE9BQXBDLE1BS087QUFBQSxRQUNMK0IsSUFBQSxDQUFLL0IsQ0FBTCxHQUFTQSxDQURKO0FBQUEsT0EvQ0c7QUFBQSxNQW9EVjtBQUFBLE1BQUFBLENBQUEsQ0FBRTJQLE9BQUYsR0FBWSxPQUFaLENBcERVO0FBQUEsTUF5RFY7QUFBQTtBQUFBO0FBQUEsVUFBSUMsVUFBQSxHQUFhLFVBQVNDLElBQVQsRUFBZUMsT0FBZixFQUF3QkMsUUFBeEIsRUFBa0M7QUFBQSxRQUNqRCxJQUFJRCxPQUFBLEtBQVksS0FBSyxDQUFyQjtBQUFBLFVBQXdCLE9BQU9ELElBQVAsQ0FEeUI7QUFBQSxRQUVqRCxRQUFRRSxRQUFBLElBQVksSUFBWixHQUFtQixDQUFuQixHQUF1QkEsUUFBL0I7QUFBQSxRQUNFLEtBQUssQ0FBTDtBQUFBLFVBQVEsT0FBTyxVQUFTNUwsS0FBVCxFQUFnQjtBQUFBLFlBQzdCLE9BQU8wTCxJQUFBLENBQUtqVCxJQUFMLENBQVVrVCxPQUFWLEVBQW1CM0wsS0FBbkIsQ0FEc0I7QUFBQSxXQUF2QixDQURWO0FBQUEsUUFJRSxLQUFLLENBQUw7QUFBQSxVQUFRLE9BQU8sVUFBU0EsS0FBVCxFQUFnQjZMLEtBQWhCLEVBQXVCO0FBQUEsWUFDcEMsT0FBT0gsSUFBQSxDQUFLalQsSUFBTCxDQUFVa1QsT0FBVixFQUFtQjNMLEtBQW5CLEVBQTBCNkwsS0FBMUIsQ0FENkI7QUFBQSxXQUE5QixDQUpWO0FBQUEsUUFPRSxLQUFLLENBQUw7QUFBQSxVQUFRLE9BQU8sVUFBUzdMLEtBQVQsRUFBZ0I4TCxLQUFoQixFQUF1QkMsVUFBdkIsRUFBbUM7QUFBQSxZQUNoRCxPQUFPTCxJQUFBLENBQUtqVCxJQUFMLENBQVVrVCxPQUFWLEVBQW1CM0wsS0FBbkIsRUFBMEI4TCxLQUExQixFQUFpQ0MsVUFBakMsQ0FEeUM7QUFBQSxXQUExQyxDQVBWO0FBQUEsUUFVRSxLQUFLLENBQUw7QUFBQSxVQUFRLE9BQU8sVUFBU0MsV0FBVCxFQUFzQmhNLEtBQXRCLEVBQTZCOEwsS0FBN0IsRUFBb0NDLFVBQXBDLEVBQWdEO0FBQUEsWUFDN0QsT0FBT0wsSUFBQSxDQUFLalQsSUFBTCxDQUFVa1QsT0FBVixFQUFtQkssV0FBbkIsRUFBZ0NoTSxLQUFoQyxFQUF1QzhMLEtBQXZDLEVBQThDQyxVQUE5QyxDQURzRDtBQUFBLFdBVmpFO0FBQUEsU0FGaUQ7QUFBQSxRQWdCakQsT0FBTyxZQUFXO0FBQUEsVUFDaEIsT0FBT0wsSUFBQSxDQUFLdFQsS0FBTCxDQUFXdVQsT0FBWCxFQUFvQnRULFNBQXBCLENBRFM7QUFBQSxTQWhCK0I7QUFBQSxPQUFuRCxDQXpEVTtBQUFBLE1BaUZWO0FBQUE7QUFBQTtBQUFBLFVBQUlKLEVBQUEsR0FBSyxVQUFTK0gsS0FBVCxFQUFnQjJMLE9BQWhCLEVBQXlCQyxRQUF6QixFQUFtQztBQUFBLFFBQzFDLElBQUk1TCxLQUFBLElBQVMsSUFBYjtBQUFBLFVBQW1CLE9BQU9uRSxDQUFBLENBQUVvUSxRQUFULENBRHVCO0FBQUEsUUFFMUMsSUFBSXBRLENBQUEsQ0FBRXFRLFVBQUYsQ0FBYWxNLEtBQWIsQ0FBSjtBQUFBLFVBQXlCLE9BQU95TCxVQUFBLENBQVd6TCxLQUFYLEVBQWtCMkwsT0FBbEIsRUFBMkJDLFFBQTNCLENBQVAsQ0FGaUI7QUFBQSxRQUcxQyxJQUFJL1AsQ0FBQSxDQUFFc08sUUFBRixDQUFXbkssS0FBWCxDQUFKO0FBQUEsVUFBdUIsT0FBT25FLENBQUEsQ0FBRXNRLE9BQUYsQ0FBVW5NLEtBQVYsQ0FBUCxDQUhtQjtBQUFBLFFBSTFDLE9BQU9uRSxDQUFBLENBQUV1USxRQUFGLENBQVdwTSxLQUFYLENBSm1DO0FBQUEsT0FBNUMsQ0FqRlU7QUFBQSxNQXVGVm5FLENBQUEsQ0FBRXdRLFFBQUYsR0FBYSxVQUFTck0sS0FBVCxFQUFnQjJMLE9BQWhCLEVBQXlCO0FBQUEsUUFDcEMsT0FBTzFULEVBQUEsQ0FBRytILEtBQUgsRUFBVTJMLE9BQVYsRUFBbUIxQyxRQUFuQixDQUQ2QjtBQUFBLE9BQXRDLENBdkZVO0FBQUEsTUE0RlY7QUFBQSxVQUFJcUQsY0FBQSxHQUFpQixVQUFTQyxRQUFULEVBQW1CQyxhQUFuQixFQUFrQztBQUFBLFFBQ3JELE9BQU8sVUFBUzdILEdBQVQsRUFBYztBQUFBLFVBQ25CLElBQUlwSSxNQUFBLEdBQVNsRSxTQUFBLENBQVVrRSxNQUF2QixDQURtQjtBQUFBLFVBRW5CLElBQUlBLE1BQUEsR0FBUyxDQUFULElBQWNvSSxHQUFBLElBQU8sSUFBekI7QUFBQSxZQUErQixPQUFPQSxHQUFQLENBRlo7QUFBQSxVQUduQixLQUFLLElBQUltSCxLQUFBLEdBQVEsQ0FBWixDQUFMLENBQW9CQSxLQUFBLEdBQVF2UCxNQUE1QixFQUFvQ3VQLEtBQUEsRUFBcEMsRUFBNkM7QUFBQSxZQUMzQyxJQUFJaFIsTUFBQSxHQUFTekMsU0FBQSxDQUFVeVQsS0FBVixDQUFiLEVBQ0loTixJQUFBLEdBQU95TixRQUFBLENBQVN6UixNQUFULENBRFgsRUFFSTJSLENBQUEsR0FBSTNOLElBQUEsQ0FBS3ZDLE1BRmIsQ0FEMkM7QUFBQSxZQUkzQyxLQUFLLElBQUl2RSxDQUFBLEdBQUksQ0FBUixDQUFMLENBQWdCQSxDQUFBLEdBQUl5VSxDQUFwQixFQUF1QnpVLENBQUEsRUFBdkIsRUFBNEI7QUFBQSxjQUMxQixJQUFJaUYsR0FBQSxHQUFNNkIsSUFBQSxDQUFLOUcsQ0FBTCxDQUFWLENBRDBCO0FBQUEsY0FFMUIsSUFBSSxDQUFDd1UsYUFBRCxJQUFrQjdILEdBQUEsQ0FBSTFILEdBQUosTUFBYSxLQUFLLENBQXhDO0FBQUEsZ0JBQTJDMEgsR0FBQSxDQUFJMUgsR0FBSixJQUFXbkMsTUFBQSxDQUFPbUMsR0FBUCxDQUY1QjtBQUFBLGFBSmU7QUFBQSxXQUgxQjtBQUFBLFVBWW5CLE9BQU8wSCxHQVpZO0FBQUEsU0FEZ0M7QUFBQSxPQUF2RCxDQTVGVTtBQUFBLE1BOEdWO0FBQUEsVUFBSStILFVBQUEsR0FBYSxVQUFTN0YsU0FBVCxFQUFvQjtBQUFBLFFBQ25DLElBQUksQ0FBQ2hMLENBQUEsQ0FBRXNPLFFBQUYsQ0FBV3RELFNBQVgsQ0FBTDtBQUFBLFVBQTRCLE9BQU8sRUFBUCxDQURPO0FBQUEsUUFFbkMsSUFBSXVFLFlBQUo7QUFBQSxVQUFrQixPQUFPQSxZQUFBLENBQWF2RSxTQUFiLENBQVAsQ0FGaUI7QUFBQSxRQUduQ3lFLElBQUEsQ0FBS3pFLFNBQUwsR0FBaUJBLFNBQWpCLENBSG1DO0FBQUEsUUFJbkMsSUFBSThGLE1BQUEsR0FBUyxJQUFJckIsSUFBakIsQ0FKbUM7QUFBQSxRQUtuQ0EsSUFBQSxDQUFLekUsU0FBTCxHQUFpQixJQUFqQixDQUxtQztBQUFBLFFBTW5DLE9BQU84RixNQU40QjtBQUFBLE9BQXJDLENBOUdVO0FBQUEsTUF1SFYsSUFBSVAsUUFBQSxHQUFXLFVBQVNuUCxHQUFULEVBQWM7QUFBQSxRQUMzQixPQUFPLFVBQVMwSCxHQUFULEVBQWM7QUFBQSxVQUNuQixPQUFPQSxHQUFBLElBQU8sSUFBUCxHQUFjLEtBQUssQ0FBbkIsR0FBdUJBLEdBQUEsQ0FBSTFILEdBQUosQ0FEWDtBQUFBLFNBRE07QUFBQSxPQUE3QixDQXZIVTtBQUFBLE1BaUlWO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFBSTJQLGVBQUEsR0FBa0J0SyxJQUFBLENBQUt1SyxHQUFMLENBQVMsQ0FBVCxFQUFZLEVBQVosSUFBa0IsQ0FBeEMsQ0FqSVU7QUFBQSxNQWtJVixJQUFJQyxTQUFBLEdBQVlWLFFBQUEsQ0FBUyxRQUFULENBQWhCLENBbElVO0FBQUEsTUFtSVYsSUFBSVcsV0FBQSxHQUFjLFVBQVNoQixVQUFULEVBQXFCO0FBQUEsUUFDckMsSUFBSXhQLE1BQUEsR0FBU3VRLFNBQUEsQ0FBVWYsVUFBVixDQUFiLENBRHFDO0FBQUEsUUFFckMsT0FBTyxPQUFPeFAsTUFBUCxJQUFpQixRQUFqQixJQUE2QkEsTUFBQSxJQUFVLENBQXZDLElBQTRDQSxNQUFBLElBQVVxUSxlQUZ4QjtBQUFBLE9BQXZDLENBbklVO0FBQUEsTUE4SVY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEvUSxDQUFBLENBQUU4QyxJQUFGLEdBQVM5QyxDQUFBLENBQUVtUixPQUFGLEdBQVksVUFBU3JJLEdBQVQsRUFBYzBILFFBQWQsRUFBd0JWLE9BQXhCLEVBQWlDO0FBQUEsUUFDcERVLFFBQUEsR0FBV1osVUFBQSxDQUFXWSxRQUFYLEVBQXFCVixPQUFyQixDQUFYLENBRG9EO0FBQUEsUUFFcEQsSUFBSTNULENBQUosRUFBT3VFLE1BQVAsQ0FGb0Q7QUFBQSxRQUdwRCxJQUFJd1EsV0FBQSxDQUFZcEksR0FBWixDQUFKLEVBQXNCO0FBQUEsVUFDcEIsS0FBSzNNLENBQUEsR0FBSSxDQUFKLEVBQU91RSxNQUFBLEdBQVNvSSxHQUFBLENBQUlwSSxNQUF6QixFQUFpQ3ZFLENBQUEsR0FBSXVFLE1BQXJDLEVBQTZDdkUsQ0FBQSxFQUE3QyxFQUFrRDtBQUFBLFlBQ2hEcVUsUUFBQSxDQUFTMUgsR0FBQSxDQUFJM00sQ0FBSixDQUFULEVBQWlCQSxDQUFqQixFQUFvQjJNLEdBQXBCLENBRGdEO0FBQUEsV0FEOUI7QUFBQSxTQUF0QixNQUlPO0FBQUEsVUFDTCxJQUFJN0YsSUFBQSxHQUFPakQsQ0FBQSxDQUFFaUQsSUFBRixDQUFPNkYsR0FBUCxDQUFYLENBREs7QUFBQSxVQUVMLEtBQUszTSxDQUFBLEdBQUksQ0FBSixFQUFPdUUsTUFBQSxHQUFTdUMsSUFBQSxDQUFLdkMsTUFBMUIsRUFBa0N2RSxDQUFBLEdBQUl1RSxNQUF0QyxFQUE4Q3ZFLENBQUEsRUFBOUMsRUFBbUQ7QUFBQSxZQUNqRHFVLFFBQUEsQ0FBUzFILEdBQUEsQ0FBSTdGLElBQUEsQ0FBSzlHLENBQUwsQ0FBSixDQUFULEVBQXVCOEcsSUFBQSxDQUFLOUcsQ0FBTCxDQUF2QixFQUFnQzJNLEdBQWhDLENBRGlEO0FBQUEsV0FGOUM7QUFBQSxTQVA2QztBQUFBLFFBYXBELE9BQU9BLEdBYjZDO0FBQUEsT0FBdEQsQ0E5SVU7QUFBQSxNQStKVjtBQUFBLE1BQUE5SSxDQUFBLENBQUVKLEdBQUYsR0FBUUksQ0FBQSxDQUFFb1IsT0FBRixHQUFZLFVBQVN0SSxHQUFULEVBQWMwSCxRQUFkLEVBQXdCVixPQUF4QixFQUFpQztBQUFBLFFBQ25EVSxRQUFBLEdBQVdwVSxFQUFBLENBQUdvVSxRQUFILEVBQWFWLE9BQWIsQ0FBWCxDQURtRDtBQUFBLFFBRW5ELElBQUk3TSxJQUFBLEdBQU8sQ0FBQ2lPLFdBQUEsQ0FBWXBJLEdBQVosQ0FBRCxJQUFxQjlJLENBQUEsQ0FBRWlELElBQUYsQ0FBTzZGLEdBQVAsQ0FBaEMsRUFDSXBJLE1BQUEsR0FBVSxDQUFBdUMsSUFBQSxJQUFRNkYsR0FBUixDQUFELENBQWNwSSxNQUQzQixFQUVJMlEsT0FBQSxHQUFVNU8sS0FBQSxDQUFNL0IsTUFBTixDQUZkLENBRm1EO0FBQUEsUUFLbkQsS0FBSyxJQUFJdVAsS0FBQSxHQUFRLENBQVosQ0FBTCxDQUFvQkEsS0FBQSxHQUFRdlAsTUFBNUIsRUFBb0N1UCxLQUFBLEVBQXBDLEVBQTZDO0FBQUEsVUFDM0MsSUFBSXFCLFVBQUEsR0FBYXJPLElBQUEsR0FBT0EsSUFBQSxDQUFLZ04sS0FBTCxDQUFQLEdBQXFCQSxLQUF0QyxDQUQyQztBQUFBLFVBRTNDb0IsT0FBQSxDQUFRcEIsS0FBUixJQUFpQk8sUUFBQSxDQUFTMUgsR0FBQSxDQUFJd0ksVUFBSixDQUFULEVBQTBCQSxVQUExQixFQUFzQ3hJLEdBQXRDLENBRjBCO0FBQUEsU0FMTTtBQUFBLFFBU25ELE9BQU91SSxPQVQ0QztBQUFBLE9BQXJELENBL0pVO0FBQUEsTUE0S1Y7QUFBQSxlQUFTRSxZQUFULENBQXNCQyxHQUF0QixFQUEyQjtBQUFBLFFBR3pCO0FBQUE7QUFBQSxpQkFBU0MsUUFBVCxDQUFrQjNJLEdBQWxCLEVBQXVCMEgsUUFBdkIsRUFBaUNrQixJQUFqQyxFQUF1Q3pPLElBQXZDLEVBQTZDZ04sS0FBN0MsRUFBb0R2UCxNQUFwRCxFQUE0RDtBQUFBLFVBQzFELE9BQU91UCxLQUFBLElBQVMsQ0FBVCxJQUFjQSxLQUFBLEdBQVF2UCxNQUE3QixFQUFxQ3VQLEtBQUEsSUFBU3VCLEdBQTlDLEVBQW1EO0FBQUEsWUFDakQsSUFBSUYsVUFBQSxHQUFhck8sSUFBQSxHQUFPQSxJQUFBLENBQUtnTixLQUFMLENBQVAsR0FBcUJBLEtBQXRDLENBRGlEO0FBQUEsWUFFakR5QixJQUFBLEdBQU9sQixRQUFBLENBQVNrQixJQUFULEVBQWU1SSxHQUFBLENBQUl3SSxVQUFKLENBQWYsRUFBZ0NBLFVBQWhDLEVBQTRDeEksR0FBNUMsQ0FGMEM7QUFBQSxXQURPO0FBQUEsVUFLMUQsT0FBTzRJLElBTG1EO0FBQUEsU0FIbkM7QUFBQSxRQVd6QixPQUFPLFVBQVM1SSxHQUFULEVBQWMwSCxRQUFkLEVBQXdCa0IsSUFBeEIsRUFBOEI1QixPQUE5QixFQUF1QztBQUFBLFVBQzVDVSxRQUFBLEdBQVdaLFVBQUEsQ0FBV1ksUUFBWCxFQUFxQlYsT0FBckIsRUFBOEIsQ0FBOUIsQ0FBWCxDQUQ0QztBQUFBLFVBRTVDLElBQUk3TSxJQUFBLEdBQU8sQ0FBQ2lPLFdBQUEsQ0FBWXBJLEdBQVosQ0FBRCxJQUFxQjlJLENBQUEsQ0FBRWlELElBQUYsQ0FBTzZGLEdBQVAsQ0FBaEMsRUFDSXBJLE1BQUEsR0FBVSxDQUFBdUMsSUFBQSxJQUFRNkYsR0FBUixDQUFELENBQWNwSSxNQUQzQixFQUVJdVAsS0FBQSxHQUFRdUIsR0FBQSxHQUFNLENBQU4sR0FBVSxDQUFWLEdBQWM5USxNQUFBLEdBQVMsQ0FGbkMsQ0FGNEM7QUFBQSxVQU01QztBQUFBLGNBQUlsRSxTQUFBLENBQVVrRSxNQUFWLEdBQW1CLENBQXZCLEVBQTBCO0FBQUEsWUFDeEJnUixJQUFBLEdBQU81SSxHQUFBLENBQUk3RixJQUFBLEdBQU9BLElBQUEsQ0FBS2dOLEtBQUwsQ0FBUCxHQUFxQkEsS0FBekIsQ0FBUCxDQUR3QjtBQUFBLFlBRXhCQSxLQUFBLElBQVN1QixHQUZlO0FBQUEsV0FOa0I7QUFBQSxVQVU1QyxPQUFPQyxRQUFBLENBQVMzSSxHQUFULEVBQWMwSCxRQUFkLEVBQXdCa0IsSUFBeEIsRUFBOEJ6TyxJQUE5QixFQUFvQ2dOLEtBQXBDLEVBQTJDdlAsTUFBM0MsQ0FWcUM7QUFBQSxTQVhyQjtBQUFBLE9BNUtqQjtBQUFBLE1BdU1WO0FBQUE7QUFBQSxNQUFBVixDQUFBLENBQUUyUixNQUFGLEdBQVczUixDQUFBLENBQUU0UixLQUFGLEdBQVU1UixDQUFBLENBQUU2UixNQUFGLEdBQVdOLFlBQUEsQ0FBYSxDQUFiLENBQWhDLENBdk1VO0FBQUEsTUEwTVY7QUFBQSxNQUFBdlIsQ0FBQSxDQUFFOFIsV0FBRixHQUFnQjlSLENBQUEsQ0FBRStSLEtBQUYsR0FBVVIsWUFBQSxDQUFhLENBQUMsQ0FBZCxDQUExQixDQTFNVTtBQUFBLE1BNk1WO0FBQUEsTUFBQXZSLENBQUEsQ0FBRWdTLElBQUYsR0FBU2hTLENBQUEsQ0FBRWlTLE1BQUYsR0FBVyxVQUFTbkosR0FBVCxFQUFjb0osU0FBZCxFQUF5QnBDLE9BQXpCLEVBQWtDO0FBQUEsUUFDcEQsSUFBSTFPLEdBQUosQ0FEb0Q7QUFBQSxRQUVwRCxJQUFJOFAsV0FBQSxDQUFZcEksR0FBWixDQUFKLEVBQXNCO0FBQUEsVUFDcEIxSCxHQUFBLEdBQU1wQixDQUFBLENBQUVtUyxTQUFGLENBQVlySixHQUFaLEVBQWlCb0osU0FBakIsRUFBNEJwQyxPQUE1QixDQURjO0FBQUEsU0FBdEIsTUFFTztBQUFBLFVBQ0wxTyxHQUFBLEdBQU1wQixDQUFBLENBQUVvUyxPQUFGLENBQVV0SixHQUFWLEVBQWVvSixTQUFmLEVBQTBCcEMsT0FBMUIsQ0FERDtBQUFBLFNBSjZDO0FBQUEsUUFPcEQsSUFBSTFPLEdBQUEsS0FBUSxLQUFLLENBQWIsSUFBa0JBLEdBQUEsS0FBUSxDQUFDLENBQS9CO0FBQUEsVUFBa0MsT0FBTzBILEdBQUEsQ0FBSTFILEdBQUosQ0FQVztBQUFBLE9BQXRELENBN01VO0FBQUEsTUF5TlY7QUFBQTtBQUFBLE1BQUFwQixDQUFBLENBQUU2SyxNQUFGLEdBQVc3SyxDQUFBLENBQUVxUyxNQUFGLEdBQVcsVUFBU3ZKLEdBQVQsRUFBY29KLFNBQWQsRUFBeUJwQyxPQUF6QixFQUFrQztBQUFBLFFBQ3RELElBQUl1QixPQUFBLEdBQVUsRUFBZCxDQURzRDtBQUFBLFFBRXREYSxTQUFBLEdBQVk5VixFQUFBLENBQUc4VixTQUFILEVBQWNwQyxPQUFkLENBQVosQ0FGc0Q7QUFBQSxRQUd0RDlQLENBQUEsQ0FBRThDLElBQUYsQ0FBT2dHLEdBQVAsRUFBWSxVQUFTM0UsS0FBVCxFQUFnQjhMLEtBQWhCLEVBQXVCbkUsSUFBdkIsRUFBNkI7QUFBQSxVQUN2QyxJQUFJb0csU0FBQSxDQUFVL04sS0FBVixFQUFpQjhMLEtBQWpCLEVBQXdCbkUsSUFBeEIsQ0FBSjtBQUFBLFlBQW1DdUYsT0FBQSxDQUFRdFYsSUFBUixDQUFhb0ksS0FBYixDQURJO0FBQUEsU0FBekMsRUFIc0Q7QUFBQSxRQU10RCxPQUFPa04sT0FOK0M7QUFBQSxPQUF4RCxDQXpOVTtBQUFBLE1BbU9WO0FBQUEsTUFBQXJSLENBQUEsQ0FBRW9PLE1BQUYsR0FBVyxVQUFTdEYsR0FBVCxFQUFjb0osU0FBZCxFQUF5QnBDLE9BQXpCLEVBQWtDO0FBQUEsUUFDM0MsT0FBTzlQLENBQUEsQ0FBRTZLLE1BQUYsQ0FBUy9CLEdBQVQsRUFBYzlJLENBQUEsQ0FBRXNTLE1BQUYsQ0FBU2xXLEVBQUEsQ0FBRzhWLFNBQUgsQ0FBVCxDQUFkLEVBQXVDcEMsT0FBdkMsQ0FEb0M7QUFBQSxPQUE3QyxDQW5PVTtBQUFBLE1BeU9WO0FBQUE7QUFBQSxNQUFBOVAsQ0FBQSxDQUFFdVMsS0FBRixHQUFVdlMsQ0FBQSxDQUFFaEQsR0FBRixHQUFRLFVBQVM4TCxHQUFULEVBQWNvSixTQUFkLEVBQXlCcEMsT0FBekIsRUFBa0M7QUFBQSxRQUNsRG9DLFNBQUEsR0FBWTlWLEVBQUEsQ0FBRzhWLFNBQUgsRUFBY3BDLE9BQWQsQ0FBWixDQURrRDtBQUFBLFFBRWxELElBQUk3TSxJQUFBLEdBQU8sQ0FBQ2lPLFdBQUEsQ0FBWXBJLEdBQVosQ0FBRCxJQUFxQjlJLENBQUEsQ0FBRWlELElBQUYsQ0FBTzZGLEdBQVAsQ0FBaEMsRUFDSXBJLE1BQUEsR0FBVSxDQUFBdUMsSUFBQSxJQUFRNkYsR0FBUixDQUFELENBQWNwSSxNQUQzQixDQUZrRDtBQUFBLFFBSWxELEtBQUssSUFBSXVQLEtBQUEsR0FBUSxDQUFaLENBQUwsQ0FBb0JBLEtBQUEsR0FBUXZQLE1BQTVCLEVBQW9DdVAsS0FBQSxFQUFwQyxFQUE2QztBQUFBLFVBQzNDLElBQUlxQixVQUFBLEdBQWFyTyxJQUFBLEdBQU9BLElBQUEsQ0FBS2dOLEtBQUwsQ0FBUCxHQUFxQkEsS0FBdEMsQ0FEMkM7QUFBQSxVQUUzQyxJQUFJLENBQUNpQyxTQUFBLENBQVVwSixHQUFBLENBQUl3SSxVQUFKLENBQVYsRUFBMkJBLFVBQTNCLEVBQXVDeEksR0FBdkMsQ0FBTDtBQUFBLFlBQWtELE9BQU8sS0FGZDtBQUFBLFNBSks7QUFBQSxRQVFsRCxPQUFPLElBUjJDO0FBQUEsT0FBcEQsQ0F6T1U7QUFBQSxNQXNQVjtBQUFBO0FBQUEsTUFBQTlJLENBQUEsQ0FBRXdTLElBQUYsR0FBU3hTLENBQUEsQ0FBRXlTLEdBQUYsR0FBUSxVQUFTM0osR0FBVCxFQUFjb0osU0FBZCxFQUF5QnBDLE9BQXpCLEVBQWtDO0FBQUEsUUFDakRvQyxTQUFBLEdBQVk5VixFQUFBLENBQUc4VixTQUFILEVBQWNwQyxPQUFkLENBQVosQ0FEaUQ7QUFBQSxRQUVqRCxJQUFJN00sSUFBQSxHQUFPLENBQUNpTyxXQUFBLENBQVlwSSxHQUFaLENBQUQsSUFBcUI5SSxDQUFBLENBQUVpRCxJQUFGLENBQU82RixHQUFQLENBQWhDLEVBQ0lwSSxNQUFBLEdBQVUsQ0FBQXVDLElBQUEsSUFBUTZGLEdBQVIsQ0FBRCxDQUFjcEksTUFEM0IsQ0FGaUQ7QUFBQSxRQUlqRCxLQUFLLElBQUl1UCxLQUFBLEdBQVEsQ0FBWixDQUFMLENBQW9CQSxLQUFBLEdBQVF2UCxNQUE1QixFQUFvQ3VQLEtBQUEsRUFBcEMsRUFBNkM7QUFBQSxVQUMzQyxJQUFJcUIsVUFBQSxHQUFhck8sSUFBQSxHQUFPQSxJQUFBLENBQUtnTixLQUFMLENBQVAsR0FBcUJBLEtBQXRDLENBRDJDO0FBQUEsVUFFM0MsSUFBSWlDLFNBQUEsQ0FBVXBKLEdBQUEsQ0FBSXdJLFVBQUosQ0FBVixFQUEyQkEsVUFBM0IsRUFBdUN4SSxHQUF2QyxDQUFKO0FBQUEsWUFBaUQsT0FBTyxJQUZiO0FBQUEsU0FKSTtBQUFBLFFBUWpELE9BQU8sS0FSMEM7QUFBQSxPQUFuRCxDQXRQVTtBQUFBLE1BbVFWO0FBQUE7QUFBQSxNQUFBOUksQ0FBQSxDQUFFMFMsUUFBRixHQUFhMVMsQ0FBQSxDQUFFMlMsUUFBRixHQUFhM1MsQ0FBQSxDQUFFNFMsT0FBRixHQUFZLFVBQVM5SixHQUFULEVBQWN4SCxJQUFkLEVBQW9CdVIsU0FBcEIsRUFBK0JDLEtBQS9CLEVBQXNDO0FBQUEsUUFDMUUsSUFBSSxDQUFDNUIsV0FBQSxDQUFZcEksR0FBWixDQUFMO0FBQUEsVUFBdUJBLEdBQUEsR0FBTTlJLENBQUEsQ0FBRStTLE1BQUYsQ0FBU2pLLEdBQVQsQ0FBTixDQURtRDtBQUFBLFFBRTFFLElBQUksT0FBTytKLFNBQVAsSUFBb0IsUUFBcEIsSUFBZ0NDLEtBQXBDO0FBQUEsVUFBMkNELFNBQUEsR0FBWSxDQUFaLENBRitCO0FBQUEsUUFHMUUsT0FBTzdTLENBQUEsQ0FBRVMsT0FBRixDQUFVcUksR0FBVixFQUFleEgsSUFBZixFQUFxQnVSLFNBQXJCLEtBQW1DLENBSGdDO0FBQUEsT0FBNUUsQ0FuUVU7QUFBQSxNQTBRVjtBQUFBLE1BQUE3UyxDQUFBLENBQUVnVCxNQUFGLEdBQVcsVUFBU2xLLEdBQVQsRUFBY21LLE1BQWQsRUFBc0I7QUFBQSxRQUMvQixJQUFJdlcsSUFBQSxHQUFPQyxLQUFBLENBQU1DLElBQU4sQ0FBV0osU0FBWCxFQUFzQixDQUF0QixDQUFYLENBRCtCO0FBQUEsUUFFL0IsSUFBSTBXLE1BQUEsR0FBU2xULENBQUEsQ0FBRXFRLFVBQUYsQ0FBYTRDLE1BQWIsQ0FBYixDQUYrQjtBQUFBLFFBRy9CLE9BQU9qVCxDQUFBLENBQUVKLEdBQUYsQ0FBTWtKLEdBQU4sRUFBVyxVQUFTM0UsS0FBVCxFQUFnQjtBQUFBLFVBQ2hDLElBQUkwTCxJQUFBLEdBQU9xRCxNQUFBLEdBQVNELE1BQVQsR0FBa0I5TyxLQUFBLENBQU04TyxNQUFOLENBQTdCLENBRGdDO0FBQUEsVUFFaEMsT0FBT3BELElBQUEsSUFBUSxJQUFSLEdBQWVBLElBQWYsR0FBc0JBLElBQUEsQ0FBS3RULEtBQUwsQ0FBVzRILEtBQVgsRUFBa0J6SCxJQUFsQixDQUZHO0FBQUEsU0FBM0IsQ0FId0I7QUFBQSxPQUFqQyxDQTFRVTtBQUFBLE1Bb1JWO0FBQUEsTUFBQXNELENBQUEsQ0FBRW1ULEtBQUYsR0FBVSxVQUFTckssR0FBVCxFQUFjMUgsR0FBZCxFQUFtQjtBQUFBLFFBQzNCLE9BQU9wQixDQUFBLENBQUVKLEdBQUYsQ0FBTWtKLEdBQU4sRUFBVzlJLENBQUEsQ0FBRXVRLFFBQUYsQ0FBV25QLEdBQVgsQ0FBWCxDQURvQjtBQUFBLE9BQTdCLENBcFJVO0FBQUEsTUEwUlY7QUFBQTtBQUFBLE1BQUFwQixDQUFBLENBQUVvVCxLQUFGLEdBQVUsVUFBU3RLLEdBQVQsRUFBYzdDLEtBQWQsRUFBcUI7QUFBQSxRQUM3QixPQUFPakcsQ0FBQSxDQUFFNkssTUFBRixDQUFTL0IsR0FBVCxFQUFjOUksQ0FBQSxDQUFFc1EsT0FBRixDQUFVckssS0FBVixDQUFkLENBRHNCO0FBQUEsT0FBL0IsQ0ExUlU7QUFBQSxNQWdTVjtBQUFBO0FBQUEsTUFBQWpHLENBQUEsQ0FBRXFULFNBQUYsR0FBYyxVQUFTdkssR0FBVCxFQUFjN0MsS0FBZCxFQUFxQjtBQUFBLFFBQ2pDLE9BQU9qRyxDQUFBLENBQUVnUyxJQUFGLENBQU9sSixHQUFQLEVBQVk5SSxDQUFBLENBQUVzUSxPQUFGLENBQVVySyxLQUFWLENBQVosQ0FEMEI7QUFBQSxPQUFuQyxDQWhTVTtBQUFBLE1BcVNWO0FBQUEsTUFBQWpHLENBQUEsQ0FBRXNULEdBQUYsR0FBUSxVQUFTeEssR0FBVCxFQUFjMEgsUUFBZCxFQUF3QlYsT0FBeEIsRUFBaUM7QUFBQSxRQUN2QyxJQUFJZ0IsTUFBQSxHQUFTLENBQUMxRCxRQUFkLEVBQXdCbUcsWUFBQSxHQUFlLENBQUNuRyxRQUF4QyxFQUNJakosS0FESixFQUNXcVAsUUFEWCxDQUR1QztBQUFBLFFBR3ZDLElBQUloRCxRQUFBLElBQVksSUFBWixJQUFvQjFILEdBQUEsSUFBTyxJQUEvQixFQUFxQztBQUFBLFVBQ25DQSxHQUFBLEdBQU1vSSxXQUFBLENBQVlwSSxHQUFaLElBQW1CQSxHQUFuQixHQUF5QjlJLENBQUEsQ0FBRStTLE1BQUYsQ0FBU2pLLEdBQVQsQ0FBL0IsQ0FEbUM7QUFBQSxVQUVuQyxLQUFLLElBQUkzTSxDQUFBLEdBQUksQ0FBUixFQUFXdUUsTUFBQSxHQUFTb0ksR0FBQSxDQUFJcEksTUFBeEIsQ0FBTCxDQUFxQ3ZFLENBQUEsR0FBSXVFLE1BQXpDLEVBQWlEdkUsQ0FBQSxFQUFqRCxFQUFzRDtBQUFBLFlBQ3BEZ0ksS0FBQSxHQUFRMkUsR0FBQSxDQUFJM00sQ0FBSixDQUFSLENBRG9EO0FBQUEsWUFFcEQsSUFBSWdJLEtBQUEsR0FBUTJNLE1BQVosRUFBb0I7QUFBQSxjQUNsQkEsTUFBQSxHQUFTM00sS0FEUztBQUFBLGFBRmdDO0FBQUEsV0FGbkI7QUFBQSxTQUFyQyxNQVFPO0FBQUEsVUFDTHFNLFFBQUEsR0FBV3BVLEVBQUEsQ0FBR29VLFFBQUgsRUFBYVYsT0FBYixDQUFYLENBREs7QUFBQSxVQUVMOVAsQ0FBQSxDQUFFOEMsSUFBRixDQUFPZ0csR0FBUCxFQUFZLFVBQVMzRSxLQUFULEVBQWdCOEwsS0FBaEIsRUFBdUJuRSxJQUF2QixFQUE2QjtBQUFBLFlBQ3ZDMEgsUUFBQSxHQUFXaEQsUUFBQSxDQUFTck0sS0FBVCxFQUFnQjhMLEtBQWhCLEVBQXVCbkUsSUFBdkIsQ0FBWCxDQUR1QztBQUFBLFlBRXZDLElBQUkwSCxRQUFBLEdBQVdELFlBQVgsSUFBMkJDLFFBQUEsS0FBYSxDQUFDcEcsUUFBZCxJQUEwQjBELE1BQUEsS0FBVyxDQUFDMUQsUUFBckUsRUFBK0U7QUFBQSxjQUM3RTBELE1BQUEsR0FBUzNNLEtBQVQsQ0FENkU7QUFBQSxjQUU3RW9QLFlBQUEsR0FBZUMsUUFGOEQ7QUFBQSxhQUZ4QztBQUFBLFdBQXpDLENBRks7QUFBQSxTQVhnQztBQUFBLFFBcUJ2QyxPQUFPMUMsTUFyQmdDO0FBQUEsT0FBekMsQ0FyU1U7QUFBQSxNQThUVjtBQUFBLE1BQUE5USxDQUFBLENBQUV5VCxHQUFGLEdBQVEsVUFBUzNLLEdBQVQsRUFBYzBILFFBQWQsRUFBd0JWLE9BQXhCLEVBQWlDO0FBQUEsUUFDdkMsSUFBSWdCLE1BQUEsR0FBUzFELFFBQWIsRUFBdUJtRyxZQUFBLEdBQWVuRyxRQUF0QyxFQUNJakosS0FESixFQUNXcVAsUUFEWCxDQUR1QztBQUFBLFFBR3ZDLElBQUloRCxRQUFBLElBQVksSUFBWixJQUFvQjFILEdBQUEsSUFBTyxJQUEvQixFQUFxQztBQUFBLFVBQ25DQSxHQUFBLEdBQU1vSSxXQUFBLENBQVlwSSxHQUFaLElBQW1CQSxHQUFuQixHQUF5QjlJLENBQUEsQ0FBRStTLE1BQUYsQ0FBU2pLLEdBQVQsQ0FBL0IsQ0FEbUM7QUFBQSxVQUVuQyxLQUFLLElBQUkzTSxDQUFBLEdBQUksQ0FBUixFQUFXdUUsTUFBQSxHQUFTb0ksR0FBQSxDQUFJcEksTUFBeEIsQ0FBTCxDQUFxQ3ZFLENBQUEsR0FBSXVFLE1BQXpDLEVBQWlEdkUsQ0FBQSxFQUFqRCxFQUFzRDtBQUFBLFlBQ3BEZ0ksS0FBQSxHQUFRMkUsR0FBQSxDQUFJM00sQ0FBSixDQUFSLENBRG9EO0FBQUEsWUFFcEQsSUFBSWdJLEtBQUEsR0FBUTJNLE1BQVosRUFBb0I7QUFBQSxjQUNsQkEsTUFBQSxHQUFTM00sS0FEUztBQUFBLGFBRmdDO0FBQUEsV0FGbkI7QUFBQSxTQUFyQyxNQVFPO0FBQUEsVUFDTHFNLFFBQUEsR0FBV3BVLEVBQUEsQ0FBR29VLFFBQUgsRUFBYVYsT0FBYixDQUFYLENBREs7QUFBQSxVQUVMOVAsQ0FBQSxDQUFFOEMsSUFBRixDQUFPZ0csR0FBUCxFQUFZLFVBQVMzRSxLQUFULEVBQWdCOEwsS0FBaEIsRUFBdUJuRSxJQUF2QixFQUE2QjtBQUFBLFlBQ3ZDMEgsUUFBQSxHQUFXaEQsUUFBQSxDQUFTck0sS0FBVCxFQUFnQjhMLEtBQWhCLEVBQXVCbkUsSUFBdkIsQ0FBWCxDQUR1QztBQUFBLFlBRXZDLElBQUkwSCxRQUFBLEdBQVdELFlBQVgsSUFBMkJDLFFBQUEsS0FBYXBHLFFBQWIsSUFBeUIwRCxNQUFBLEtBQVcxRCxRQUFuRSxFQUE2RTtBQUFBLGNBQzNFMEQsTUFBQSxHQUFTM00sS0FBVCxDQUQyRTtBQUFBLGNBRTNFb1AsWUFBQSxHQUFlQyxRQUY0RDtBQUFBLGFBRnRDO0FBQUEsV0FBekMsQ0FGSztBQUFBLFNBWGdDO0FBQUEsUUFxQnZDLE9BQU8xQyxNQXJCZ0M7QUFBQSxPQUF6QyxDQTlUVTtBQUFBLE1Bd1ZWO0FBQUE7QUFBQSxNQUFBOVEsQ0FBQSxDQUFFMFQsT0FBRixHQUFZLFVBQVM1SyxHQUFULEVBQWM7QUFBQSxRQUN4QixJQUFJNkssR0FBQSxHQUFNekMsV0FBQSxDQUFZcEksR0FBWixJQUFtQkEsR0FBbkIsR0FBeUI5SSxDQUFBLENBQUUrUyxNQUFGLENBQVNqSyxHQUFULENBQW5DLENBRHdCO0FBQUEsUUFFeEIsSUFBSXBJLE1BQUEsR0FBU2lULEdBQUEsQ0FBSWpULE1BQWpCLENBRndCO0FBQUEsUUFHeEIsSUFBSWtULFFBQUEsR0FBV25SLEtBQUEsQ0FBTS9CLE1BQU4sQ0FBZixDQUh3QjtBQUFBLFFBSXhCLEtBQUssSUFBSXVQLEtBQUEsR0FBUSxDQUFaLEVBQWU0RCxJQUFmLENBQUwsQ0FBMEI1RCxLQUFBLEdBQVF2UCxNQUFsQyxFQUEwQ3VQLEtBQUEsRUFBMUMsRUFBbUQ7QUFBQSxVQUNqRDRELElBQUEsR0FBTzdULENBQUEsQ0FBRTBHLE1BQUYsQ0FBUyxDQUFULEVBQVl1SixLQUFaLENBQVAsQ0FEaUQ7QUFBQSxVQUVqRCxJQUFJNEQsSUFBQSxLQUFTNUQsS0FBYjtBQUFBLFlBQW9CMkQsUUFBQSxDQUFTM0QsS0FBVCxJQUFrQjJELFFBQUEsQ0FBU0MsSUFBVCxDQUFsQixDQUY2QjtBQUFBLFVBR2pERCxRQUFBLENBQVNDLElBQVQsSUFBaUJGLEdBQUEsQ0FBSTFELEtBQUosQ0FIZ0M7QUFBQSxTQUozQjtBQUFBLFFBU3hCLE9BQU8yRCxRQVRpQjtBQUFBLE9BQTFCLENBeFZVO0FBQUEsTUF1V1Y7QUFBQTtBQUFBO0FBQUEsTUFBQTVULENBQUEsQ0FBRThULE1BQUYsR0FBVyxVQUFTaEwsR0FBVCxFQUFjaEosQ0FBZCxFQUFpQmdULEtBQWpCLEVBQXdCO0FBQUEsUUFDakMsSUFBSWhULENBQUEsSUFBSyxJQUFMLElBQWFnVCxLQUFqQixFQUF3QjtBQUFBLFVBQ3RCLElBQUksQ0FBQzVCLFdBQUEsQ0FBWXBJLEdBQVosQ0FBTDtBQUFBLFlBQXVCQSxHQUFBLEdBQU05SSxDQUFBLENBQUUrUyxNQUFGLENBQVNqSyxHQUFULENBQU4sQ0FERDtBQUFBLFVBRXRCLE9BQU9BLEdBQUEsQ0FBSTlJLENBQUEsQ0FBRTBHLE1BQUYsQ0FBU29DLEdBQUEsQ0FBSXBJLE1BQUosR0FBYSxDQUF0QixDQUFKLENBRmU7QUFBQSxTQURTO0FBQUEsUUFLakMsT0FBT1YsQ0FBQSxDQUFFMFQsT0FBRixDQUFVNUssR0FBVixFQUFlbk0sS0FBZixDQUFxQixDQUFyQixFQUF3QjhKLElBQUEsQ0FBSzZNLEdBQUwsQ0FBUyxDQUFULEVBQVl4VCxDQUFaLENBQXhCLENBTDBCO0FBQUEsT0FBbkMsQ0F2V1U7QUFBQSxNQWdYVjtBQUFBLE1BQUFFLENBQUEsQ0FBRStULE1BQUYsR0FBVyxVQUFTakwsR0FBVCxFQUFjMEgsUUFBZCxFQUF3QlYsT0FBeEIsRUFBaUM7QUFBQSxRQUMxQ1UsUUFBQSxHQUFXcFUsRUFBQSxDQUFHb1UsUUFBSCxFQUFhVixPQUFiLENBQVgsQ0FEMEM7QUFBQSxRQUUxQyxPQUFPOVAsQ0FBQSxDQUFFbVQsS0FBRixDQUFRblQsQ0FBQSxDQUFFSixHQUFGLENBQU1rSixHQUFOLEVBQVcsVUFBUzNFLEtBQVQsRUFBZ0I4TCxLQUFoQixFQUF1Qm5FLElBQXZCLEVBQTZCO0FBQUEsVUFDckQsT0FBTztBQUFBLFlBQ0wzSCxLQUFBLEVBQU9BLEtBREY7QUFBQSxZQUVMOEwsS0FBQSxFQUFPQSxLQUZGO0FBQUEsWUFHTCtELFFBQUEsRUFBVXhELFFBQUEsQ0FBU3JNLEtBQVQsRUFBZ0I4TCxLQUFoQixFQUF1Qm5FLElBQXZCLENBSEw7QUFBQSxXQUQ4QztBQUFBLFNBQXhDLEVBTVptSSxJQU5ZLENBTVAsVUFBU0MsSUFBVCxFQUFlQyxLQUFmLEVBQXNCO0FBQUEsVUFDNUIsSUFBSWhPLENBQUEsR0FBSStOLElBQUEsQ0FBS0YsUUFBYixDQUQ0QjtBQUFBLFVBRTVCLElBQUluVixDQUFBLEdBQUlzVixLQUFBLENBQU1ILFFBQWQsQ0FGNEI7QUFBQSxVQUc1QixJQUFJN04sQ0FBQSxLQUFNdEgsQ0FBVixFQUFhO0FBQUEsWUFDWCxJQUFJc0gsQ0FBQSxHQUFJdEgsQ0FBSixJQUFTc0gsQ0FBQSxLQUFNLEtBQUssQ0FBeEI7QUFBQSxjQUEyQixPQUFPLENBQVAsQ0FEaEI7QUFBQSxZQUVYLElBQUlBLENBQUEsR0FBSXRILENBQUosSUFBU0EsQ0FBQSxLQUFNLEtBQUssQ0FBeEI7QUFBQSxjQUEyQixPQUFPLENBQUMsQ0FGeEI7QUFBQSxXQUhlO0FBQUEsVUFPNUIsT0FBT3FWLElBQUEsQ0FBS2pFLEtBQUwsR0FBYWtFLEtBQUEsQ0FBTWxFLEtBUEU7QUFBQSxTQU5mLENBQVIsRUFjSCxPQWRHLENBRm1DO0FBQUEsT0FBNUMsQ0FoWFU7QUFBQSxNQW9ZVjtBQUFBLFVBQUltRSxLQUFBLEdBQVEsVUFBU0MsUUFBVCxFQUFtQjtBQUFBLFFBQzdCLE9BQU8sVUFBU3ZMLEdBQVQsRUFBYzBILFFBQWQsRUFBd0JWLE9BQXhCLEVBQWlDO0FBQUEsVUFDdEMsSUFBSWdCLE1BQUEsR0FBUyxFQUFiLENBRHNDO0FBQUEsVUFFdENOLFFBQUEsR0FBV3BVLEVBQUEsQ0FBR29VLFFBQUgsRUFBYVYsT0FBYixDQUFYLENBRnNDO0FBQUEsVUFHdEM5UCxDQUFBLENBQUU4QyxJQUFGLENBQU9nRyxHQUFQLEVBQVksVUFBUzNFLEtBQVQsRUFBZ0I4TCxLQUFoQixFQUF1QjtBQUFBLFlBQ2pDLElBQUk3TyxHQUFBLEdBQU1vUCxRQUFBLENBQVNyTSxLQUFULEVBQWdCOEwsS0FBaEIsRUFBdUJuSCxHQUF2QixDQUFWLENBRGlDO0FBQUEsWUFFakN1TCxRQUFBLENBQVN2RCxNQUFULEVBQWlCM00sS0FBakIsRUFBd0IvQyxHQUF4QixDQUZpQztBQUFBLFdBQW5DLEVBSHNDO0FBQUEsVUFPdEMsT0FBTzBQLE1BUCtCO0FBQUEsU0FEWDtBQUFBLE9BQS9CLENBcFlVO0FBQUEsTUFrWlY7QUFBQTtBQUFBLE1BQUE5USxDQUFBLENBQUVzVSxPQUFGLEdBQVlGLEtBQUEsQ0FBTSxVQUFTdEQsTUFBVCxFQUFpQjNNLEtBQWpCLEVBQXdCL0MsR0FBeEIsRUFBNkI7QUFBQSxRQUM3QyxJQUFJcEIsQ0FBQSxDQUFFdVUsR0FBRixDQUFNekQsTUFBTixFQUFjMVAsR0FBZCxDQUFKO0FBQUEsVUFBd0IwUCxNQUFBLENBQU8xUCxHQUFQLEVBQVlyRixJQUFaLENBQWlCb0ksS0FBakIsRUFBeEI7QUFBQTtBQUFBLFVBQXNEMk0sTUFBQSxDQUFPMVAsR0FBUCxJQUFjLENBQUMrQyxLQUFELENBRHZCO0FBQUEsT0FBbkMsQ0FBWixDQWxaVTtBQUFBLE1Bd1pWO0FBQUE7QUFBQSxNQUFBbkUsQ0FBQSxDQUFFd1UsT0FBRixHQUFZSixLQUFBLENBQU0sVUFBU3RELE1BQVQsRUFBaUIzTSxLQUFqQixFQUF3Qi9DLEdBQXhCLEVBQTZCO0FBQUEsUUFDN0MwUCxNQUFBLENBQU8xUCxHQUFQLElBQWMrQyxLQUQrQjtBQUFBLE9BQW5DLENBQVosQ0F4WlU7QUFBQSxNQStaVjtBQUFBO0FBQUE7QUFBQSxNQUFBbkUsQ0FBQSxDQUFFeVUsT0FBRixHQUFZTCxLQUFBLENBQU0sVUFBU3RELE1BQVQsRUFBaUIzTSxLQUFqQixFQUF3Qi9DLEdBQXhCLEVBQTZCO0FBQUEsUUFDN0MsSUFBSXBCLENBQUEsQ0FBRXVVLEdBQUYsQ0FBTXpELE1BQU4sRUFBYzFQLEdBQWQsQ0FBSjtBQUFBLFVBQXdCMFAsTUFBQSxDQUFPMVAsR0FBUCxJQUF4QjtBQUFBO0FBQUEsVUFBNEMwUCxNQUFBLENBQU8xUCxHQUFQLElBQWMsQ0FEYjtBQUFBLE9BQW5DLENBQVosQ0EvWlU7QUFBQSxNQW9hVjtBQUFBLE1BQUFwQixDQUFBLENBQUUwVSxPQUFGLEdBQVksVUFBUzVMLEdBQVQsRUFBYztBQUFBLFFBQ3hCLElBQUksQ0FBQ0EsR0FBTDtBQUFBLFVBQVUsT0FBTyxFQUFQLENBRGM7QUFBQSxRQUV4QixJQUFJOUksQ0FBQSxDQUFFMEMsT0FBRixDQUFVb0csR0FBVixDQUFKO0FBQUEsVUFBb0IsT0FBT25NLEtBQUEsQ0FBTUMsSUFBTixDQUFXa00sR0FBWCxDQUFQLENBRkk7QUFBQSxRQUd4QixJQUFJb0ksV0FBQSxDQUFZcEksR0FBWixDQUFKO0FBQUEsVUFBc0IsT0FBTzlJLENBQUEsQ0FBRUosR0FBRixDQUFNa0osR0FBTixFQUFXOUksQ0FBQSxDQUFFb1EsUUFBYixDQUFQLENBSEU7QUFBQSxRQUl4QixPQUFPcFEsQ0FBQSxDQUFFK1MsTUFBRixDQUFTakssR0FBVCxDQUppQjtBQUFBLE9BQTFCLENBcGFVO0FBQUEsTUE0YVY7QUFBQSxNQUFBOUksQ0FBQSxDQUFFMlUsSUFBRixHQUFTLFVBQVM3TCxHQUFULEVBQWM7QUFBQSxRQUNyQixJQUFJQSxHQUFBLElBQU8sSUFBWDtBQUFBLFVBQWlCLE9BQU8sQ0FBUCxDQURJO0FBQUEsUUFFckIsT0FBT29JLFdBQUEsQ0FBWXBJLEdBQVosSUFBbUJBLEdBQUEsQ0FBSXBJLE1BQXZCLEdBQWdDVixDQUFBLENBQUVpRCxJQUFGLENBQU82RixHQUFQLEVBQVlwSSxNQUY5QjtBQUFBLE9BQXZCLENBNWFVO0FBQUEsTUFtYlY7QUFBQTtBQUFBLE1BQUFWLENBQUEsQ0FBRTRVLFNBQUYsR0FBYyxVQUFTOUwsR0FBVCxFQUFjb0osU0FBZCxFQUF5QnBDLE9BQXpCLEVBQWtDO0FBQUEsUUFDOUNvQyxTQUFBLEdBQVk5VixFQUFBLENBQUc4VixTQUFILEVBQWNwQyxPQUFkLENBQVosQ0FEOEM7QUFBQSxRQUU5QyxJQUFJK0UsSUFBQSxHQUFPLEVBQVgsRUFBZTlHLElBQUEsR0FBTyxFQUF0QixDQUY4QztBQUFBLFFBRzlDL04sQ0FBQSxDQUFFOEMsSUFBRixDQUFPZ0csR0FBUCxFQUFZLFVBQVMzRSxLQUFULEVBQWdCL0MsR0FBaEIsRUFBcUIwSCxHQUFyQixFQUEwQjtBQUFBLFVBQ25DLENBQUFvSixTQUFBLENBQVUvTixLQUFWLEVBQWlCL0MsR0FBakIsRUFBc0IwSCxHQUF0QixJQUE2QitMLElBQTdCLEdBQW9DOUcsSUFBcEMsQ0FBRCxDQUEyQ2hTLElBQTNDLENBQWdEb0ksS0FBaEQsQ0FEb0M7QUFBQSxTQUF0QyxFQUg4QztBQUFBLFFBTTlDLE9BQU87QUFBQSxVQUFDMFEsSUFBRDtBQUFBLFVBQU85RyxJQUFQO0FBQUEsU0FOdUM7QUFBQSxPQUFoRCxDQW5iVTtBQUFBLE1Ba2NWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBL04sQ0FBQSxDQUFFOFUsS0FBRixHQUFVOVUsQ0FBQSxDQUFFdUwsSUFBRixHQUFTdkwsQ0FBQSxDQUFFK1UsSUFBRixHQUFTLFVBQVNDLEtBQVQsRUFBZ0JsVixDQUFoQixFQUFtQmdULEtBQW5CLEVBQTBCO0FBQUEsUUFDcEQsSUFBSWtDLEtBQUEsSUFBUyxJQUFiO0FBQUEsVUFBbUIsT0FBTyxLQUFLLENBQVosQ0FEaUM7QUFBQSxRQUVwRCxJQUFJbFYsQ0FBQSxJQUFLLElBQUwsSUFBYWdULEtBQWpCO0FBQUEsVUFBd0IsT0FBT2tDLEtBQUEsQ0FBTSxDQUFOLENBQVAsQ0FGNEI7QUFBQSxRQUdwRCxPQUFPaFYsQ0FBQSxDQUFFaVYsT0FBRixDQUFVRCxLQUFWLEVBQWlCQSxLQUFBLENBQU10VSxNQUFOLEdBQWVaLENBQWhDLENBSDZDO0FBQUEsT0FBdEQsQ0FsY1U7QUFBQSxNQTJjVjtBQUFBO0FBQUE7QUFBQSxNQUFBRSxDQUFBLENBQUVpVixPQUFGLEdBQVksVUFBU0QsS0FBVCxFQUFnQmxWLENBQWhCLEVBQW1CZ1QsS0FBbkIsRUFBMEI7QUFBQSxRQUNwQyxPQUFPblcsS0FBQSxDQUFNQyxJQUFOLENBQVdvWSxLQUFYLEVBQWtCLENBQWxCLEVBQXFCdk8sSUFBQSxDQUFLNk0sR0FBTCxDQUFTLENBQVQsRUFBWTBCLEtBQUEsQ0FBTXRVLE1BQU4sR0FBZ0IsQ0FBQVosQ0FBQSxJQUFLLElBQUwsSUFBYWdULEtBQWIsR0FBcUIsQ0FBckIsR0FBeUJoVCxDQUF6QixDQUE1QixDQUFyQixDQUQ2QjtBQUFBLE9BQXRDLENBM2NVO0FBQUEsTUFpZFY7QUFBQTtBQUFBLE1BQUFFLENBQUEsQ0FBRWtWLElBQUYsR0FBUyxVQUFTRixLQUFULEVBQWdCbFYsQ0FBaEIsRUFBbUJnVCxLQUFuQixFQUEwQjtBQUFBLFFBQ2pDLElBQUlrQyxLQUFBLElBQVMsSUFBYjtBQUFBLFVBQW1CLE9BQU8sS0FBSyxDQUFaLENBRGM7QUFBQSxRQUVqQyxJQUFJbFYsQ0FBQSxJQUFLLElBQUwsSUFBYWdULEtBQWpCO0FBQUEsVUFBd0IsT0FBT2tDLEtBQUEsQ0FBTUEsS0FBQSxDQUFNdFUsTUFBTixHQUFlLENBQXJCLENBQVAsQ0FGUztBQUFBLFFBR2pDLE9BQU9WLENBQUEsQ0FBRW1WLElBQUYsQ0FBT0gsS0FBUCxFQUFjdk8sSUFBQSxDQUFLNk0sR0FBTCxDQUFTLENBQVQsRUFBWTBCLEtBQUEsQ0FBTXRVLE1BQU4sR0FBZVosQ0FBM0IsQ0FBZCxDQUgwQjtBQUFBLE9BQW5DLENBamRVO0FBQUEsTUEwZFY7QUFBQTtBQUFBO0FBQUEsTUFBQUUsQ0FBQSxDQUFFbVYsSUFBRixHQUFTblYsQ0FBQSxDQUFFb1YsSUFBRixHQUFTcFYsQ0FBQSxDQUFFcVYsSUFBRixHQUFTLFVBQVNMLEtBQVQsRUFBZ0JsVixDQUFoQixFQUFtQmdULEtBQW5CLEVBQTBCO0FBQUEsUUFDbkQsT0FBT25XLEtBQUEsQ0FBTUMsSUFBTixDQUFXb1ksS0FBWCxFQUFrQmxWLENBQUEsSUFBSyxJQUFMLElBQWFnVCxLQUFiLEdBQXFCLENBQXJCLEdBQXlCaFQsQ0FBM0MsQ0FENEM7QUFBQSxPQUFyRCxDQTFkVTtBQUFBLE1BK2RWO0FBQUEsTUFBQUUsQ0FBQSxDQUFFc1YsT0FBRixHQUFZLFVBQVNOLEtBQVQsRUFBZ0I7QUFBQSxRQUMxQixPQUFPaFYsQ0FBQSxDQUFFNkssTUFBRixDQUFTbUssS0FBVCxFQUFnQmhWLENBQUEsQ0FBRW9RLFFBQWxCLENBRG1CO0FBQUEsT0FBNUIsQ0EvZFU7QUFBQSxNQW9lVjtBQUFBLFVBQUltRixPQUFBLEdBQVUsVUFBU0MsS0FBVCxFQUFnQkMsT0FBaEIsRUFBeUJDLE1BQXpCLEVBQWlDQyxVQUFqQyxFQUE2QztBQUFBLFFBQ3pELElBQUlDLE1BQUEsR0FBUyxFQUFiLEVBQWlCQyxHQUFBLEdBQU0sQ0FBdkIsQ0FEeUQ7QUFBQSxRQUV6RCxLQUFLLElBQUkxWixDQUFBLEdBQUl3WixVQUFBLElBQWMsQ0FBdEIsRUFBeUJqVixNQUFBLEdBQVN1USxTQUFBLENBQVV1RSxLQUFWLENBQWxDLENBQUwsQ0FBeURyWixDQUFBLEdBQUl1RSxNQUE3RCxFQUFxRXZFLENBQUEsRUFBckUsRUFBMEU7QUFBQSxVQUN4RSxJQUFJZ0ksS0FBQSxHQUFRcVIsS0FBQSxDQUFNclosQ0FBTixDQUFaLENBRHdFO0FBQUEsVUFFeEUsSUFBSStVLFdBQUEsQ0FBWS9NLEtBQVosS0FBdUIsQ0FBQW5FLENBQUEsQ0FBRTBDLE9BQUYsQ0FBVXlCLEtBQVYsS0FBb0JuRSxDQUFBLENBQUU4VixXQUFGLENBQWMzUixLQUFkLENBQXBCLENBQTNCLEVBQXNFO0FBQUEsWUFFcEU7QUFBQSxnQkFBSSxDQUFDc1IsT0FBTDtBQUFBLGNBQWN0UixLQUFBLEdBQVFvUixPQUFBLENBQVFwUixLQUFSLEVBQWVzUixPQUFmLEVBQXdCQyxNQUF4QixDQUFSLENBRnNEO0FBQUEsWUFHcEUsSUFBSXhILENBQUEsR0FBSSxDQUFSLEVBQVd2RixHQUFBLEdBQU14RSxLQUFBLENBQU16RCxNQUF2QixDQUhvRTtBQUFBLFlBSXBFa1YsTUFBQSxDQUFPbFYsTUFBUCxJQUFpQmlJLEdBQWpCLENBSm9FO0FBQUEsWUFLcEUsT0FBT3VGLENBQUEsR0FBSXZGLEdBQVgsRUFBZ0I7QUFBQSxjQUNkaU4sTUFBQSxDQUFPQyxHQUFBLEVBQVAsSUFBZ0IxUixLQUFBLENBQU0rSixDQUFBLEVBQU4sQ0FERjtBQUFBLGFBTG9EO0FBQUEsV0FBdEUsTUFRTyxJQUFJLENBQUN3SCxNQUFMLEVBQWE7QUFBQSxZQUNsQkUsTUFBQSxDQUFPQyxHQUFBLEVBQVAsSUFBZ0IxUixLQURFO0FBQUEsV0FWb0Q7QUFBQSxTQUZqQjtBQUFBLFFBZ0J6RCxPQUFPeVIsTUFoQmtEO0FBQUEsT0FBM0QsQ0FwZVU7QUFBQSxNQXdmVjtBQUFBLE1BQUE1VixDQUFBLENBQUV1VixPQUFGLEdBQVksVUFBU1AsS0FBVCxFQUFnQlMsT0FBaEIsRUFBeUI7QUFBQSxRQUNuQyxPQUFPRixPQUFBLENBQVFQLEtBQVIsRUFBZVMsT0FBZixFQUF3QixLQUF4QixDQUQ0QjtBQUFBLE9BQXJDLENBeGZVO0FBQUEsTUE2ZlY7QUFBQSxNQUFBelYsQ0FBQSxDQUFFK1YsT0FBRixHQUFZLFVBQVNmLEtBQVQsRUFBZ0I7QUFBQSxRQUMxQixPQUFPaFYsQ0FBQSxDQUFFZ1csVUFBRixDQUFhaEIsS0FBYixFQUFvQnJZLEtBQUEsQ0FBTUMsSUFBTixDQUFXSixTQUFYLEVBQXNCLENBQXRCLENBQXBCLENBRG1CO0FBQUEsT0FBNUIsQ0E3ZlU7QUFBQSxNQW9nQlY7QUFBQTtBQUFBO0FBQUEsTUFBQXdELENBQUEsQ0FBRWlXLElBQUYsR0FBU2pXLENBQUEsQ0FBRWtXLE1BQUYsR0FBVyxVQUFTbEIsS0FBVCxFQUFnQm1CLFFBQWhCLEVBQTBCM0YsUUFBMUIsRUFBb0NWLE9BQXBDLEVBQTZDO0FBQUEsUUFDL0QsSUFBSSxDQUFDOVAsQ0FBQSxDQUFFb1csU0FBRixDQUFZRCxRQUFaLENBQUwsRUFBNEI7QUFBQSxVQUMxQnJHLE9BQUEsR0FBVVUsUUFBVixDQUQwQjtBQUFBLFVBRTFCQSxRQUFBLEdBQVcyRixRQUFYLENBRjBCO0FBQUEsVUFHMUJBLFFBQUEsR0FBVyxLQUhlO0FBQUEsU0FEbUM7QUFBQSxRQU0vRCxJQUFJM0YsUUFBQSxJQUFZLElBQWhCO0FBQUEsVUFBc0JBLFFBQUEsR0FBV3BVLEVBQUEsQ0FBR29VLFFBQUgsRUFBYVYsT0FBYixDQUFYLENBTnlDO0FBQUEsUUFPL0QsSUFBSWdCLE1BQUEsR0FBUyxFQUFiLENBUCtEO0FBQUEsUUFRL0QsSUFBSXVGLElBQUEsR0FBTyxFQUFYLENBUitEO0FBQUEsUUFTL0QsS0FBSyxJQUFJbGEsQ0FBQSxHQUFJLENBQVIsRUFBV3VFLE1BQUEsR0FBU3VRLFNBQUEsQ0FBVStELEtBQVYsQ0FBcEIsQ0FBTCxDQUEyQzdZLENBQUEsR0FBSXVFLE1BQS9DLEVBQXVEdkUsQ0FBQSxFQUF2RCxFQUE0RDtBQUFBLFVBQzFELElBQUlnSSxLQUFBLEdBQVE2USxLQUFBLENBQU03WSxDQUFOLENBQVosRUFDSXFYLFFBQUEsR0FBV2hELFFBQUEsR0FBV0EsUUFBQSxDQUFTck0sS0FBVCxFQUFnQmhJLENBQWhCLEVBQW1CNlksS0FBbkIsQ0FBWCxHQUF1QzdRLEtBRHRELENBRDBEO0FBQUEsVUFHMUQsSUFBSWdTLFFBQUosRUFBYztBQUFBLFlBQ1osSUFBSSxDQUFDaGEsQ0FBRCxJQUFNa2EsSUFBQSxLQUFTN0MsUUFBbkI7QUFBQSxjQUE2QjFDLE1BQUEsQ0FBTy9VLElBQVAsQ0FBWW9JLEtBQVosRUFEakI7QUFBQSxZQUVaa1MsSUFBQSxHQUFPN0MsUUFGSztBQUFBLFdBQWQsTUFHTyxJQUFJaEQsUUFBSixFQUFjO0FBQUEsWUFDbkIsSUFBSSxDQUFDeFEsQ0FBQSxDQUFFMFMsUUFBRixDQUFXMkQsSUFBWCxFQUFpQjdDLFFBQWpCLENBQUwsRUFBaUM7QUFBQSxjQUMvQjZDLElBQUEsQ0FBS3RhLElBQUwsQ0FBVXlYLFFBQVYsRUFEK0I7QUFBQSxjQUUvQjFDLE1BQUEsQ0FBTy9VLElBQVAsQ0FBWW9JLEtBQVosQ0FGK0I7QUFBQSxhQURkO0FBQUEsV0FBZCxNQUtBLElBQUksQ0FBQ25FLENBQUEsQ0FBRTBTLFFBQUYsQ0FBVzVCLE1BQVgsRUFBbUIzTSxLQUFuQixDQUFMLEVBQWdDO0FBQUEsWUFDckMyTSxNQUFBLENBQU8vVSxJQUFQLENBQVlvSSxLQUFaLENBRHFDO0FBQUEsV0FYbUI7QUFBQSxTQVRHO0FBQUEsUUF3Qi9ELE9BQU8yTSxNQXhCd0Q7QUFBQSxPQUFqRSxDQXBnQlU7QUFBQSxNQWlpQlY7QUFBQTtBQUFBLE1BQUE5USxDQUFBLENBQUVzVyxLQUFGLEdBQVUsWUFBVztBQUFBLFFBQ25CLE9BQU90VyxDQUFBLENBQUVpVyxJQUFGLENBQU9WLE9BQUEsQ0FBUS9ZLFNBQVIsRUFBbUIsSUFBbkIsRUFBeUIsSUFBekIsQ0FBUCxDQURZO0FBQUEsT0FBckIsQ0FqaUJVO0FBQUEsTUF1aUJWO0FBQUE7QUFBQSxNQUFBd0QsQ0FBQSxDQUFFdVcsWUFBRixHQUFpQixVQUFTdkIsS0FBVCxFQUFnQjtBQUFBLFFBQy9CLElBQUlsRSxNQUFBLEdBQVMsRUFBYixDQUQrQjtBQUFBLFFBRS9CLElBQUkwRixVQUFBLEdBQWFoYSxTQUFBLENBQVVrRSxNQUEzQixDQUYrQjtBQUFBLFFBRy9CLEtBQUssSUFBSXZFLENBQUEsR0FBSSxDQUFSLEVBQVd1RSxNQUFBLEdBQVN1USxTQUFBLENBQVUrRCxLQUFWLENBQXBCLENBQUwsQ0FBMkM3WSxDQUFBLEdBQUl1RSxNQUEvQyxFQUF1RHZFLENBQUEsRUFBdkQsRUFBNEQ7QUFBQSxVQUMxRCxJQUFJbUYsSUFBQSxHQUFPMFQsS0FBQSxDQUFNN1ksQ0FBTixDQUFYLENBRDBEO0FBQUEsVUFFMUQsSUFBSTZELENBQUEsQ0FBRTBTLFFBQUYsQ0FBVzVCLE1BQVgsRUFBbUJ4UCxJQUFuQixDQUFKO0FBQUEsWUFBOEIsU0FGNEI7QUFBQSxVQUcxRCxLQUFLLElBQUk0TSxDQUFBLEdBQUksQ0FBUixDQUFMLENBQWdCQSxDQUFBLEdBQUlzSSxVQUFwQixFQUFnQ3RJLENBQUEsRUFBaEMsRUFBcUM7QUFBQSxZQUNuQyxJQUFJLENBQUNsTyxDQUFBLENBQUUwUyxRQUFGLENBQVdsVyxTQUFBLENBQVUwUixDQUFWLENBQVgsRUFBeUI1TSxJQUF6QixDQUFMO0FBQUEsY0FBcUMsS0FERjtBQUFBLFdBSHFCO0FBQUEsVUFNMUQsSUFBSTRNLENBQUEsS0FBTXNJLFVBQVY7QUFBQSxZQUFzQjFGLE1BQUEsQ0FBTy9VLElBQVAsQ0FBWXVGLElBQVosQ0FOb0M7QUFBQSxTQUg3QjtBQUFBLFFBVy9CLE9BQU93UCxNQVh3QjtBQUFBLE9BQWpDLENBdmlCVTtBQUFBLE1BdWpCVjtBQUFBO0FBQUEsTUFBQTlRLENBQUEsQ0FBRWdXLFVBQUYsR0FBZSxVQUFTaEIsS0FBVCxFQUFnQjtBQUFBLFFBQzdCLElBQUlHLElBQUEsR0FBT0ksT0FBQSxDQUFRL1ksU0FBUixFQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixDQUEvQixDQUFYLENBRDZCO0FBQUEsUUFFN0IsT0FBT3dELENBQUEsQ0FBRTZLLE1BQUYsQ0FBU21LLEtBQVQsRUFBZ0IsVUFBUzdRLEtBQVQsRUFBZTtBQUFBLFVBQ3BDLE9BQU8sQ0FBQ25FLENBQUEsQ0FBRTBTLFFBQUYsQ0FBV3lDLElBQVgsRUFBaUJoUixLQUFqQixDQUQ0QjtBQUFBLFNBQS9CLENBRnNCO0FBQUEsT0FBL0IsQ0F2akJVO0FBQUEsTUFna0JWO0FBQUE7QUFBQSxNQUFBbkUsQ0FBQSxDQUFFeVcsR0FBRixHQUFRLFlBQVc7QUFBQSxRQUNqQixPQUFPelcsQ0FBQSxDQUFFMFcsS0FBRixDQUFRbGEsU0FBUixDQURVO0FBQUEsT0FBbkIsQ0Foa0JVO0FBQUEsTUFza0JWO0FBQUE7QUFBQSxNQUFBd0QsQ0FBQSxDQUFFMFcsS0FBRixHQUFVLFVBQVMxQixLQUFULEVBQWdCO0FBQUEsUUFDeEIsSUFBSXRVLE1BQUEsR0FBU3NVLEtBQUEsSUFBU2hWLENBQUEsQ0FBRXNULEdBQUYsQ0FBTTBCLEtBQU4sRUFBYS9ELFNBQWIsRUFBd0J2USxNQUFqQyxJQUEyQyxDQUF4RCxDQUR3QjtBQUFBLFFBRXhCLElBQUlvUSxNQUFBLEdBQVNyTyxLQUFBLENBQU0vQixNQUFOLENBQWIsQ0FGd0I7QUFBQSxRQUl4QixLQUFLLElBQUl1UCxLQUFBLEdBQVEsQ0FBWixDQUFMLENBQW9CQSxLQUFBLEdBQVF2UCxNQUE1QixFQUFvQ3VQLEtBQUEsRUFBcEMsRUFBNkM7QUFBQSxVQUMzQ2EsTUFBQSxDQUFPYixLQUFQLElBQWdCalEsQ0FBQSxDQUFFbVQsS0FBRixDQUFRNkIsS0FBUixFQUFlL0UsS0FBZixDQUQyQjtBQUFBLFNBSnJCO0FBQUEsUUFPeEIsT0FBT2EsTUFQaUI7QUFBQSxPQUExQixDQXRrQlU7QUFBQSxNQW1sQlY7QUFBQTtBQUFBO0FBQUEsTUFBQTlRLENBQUEsQ0FBRTJXLE1BQUYsR0FBVyxVQUFTN0ssSUFBVCxFQUFlaUgsTUFBZixFQUF1QjtBQUFBLFFBQ2hDLElBQUlqQyxNQUFBLEdBQVMsRUFBYixDQURnQztBQUFBLFFBRWhDLEtBQUssSUFBSTNVLENBQUEsR0FBSSxDQUFSLEVBQVd1RSxNQUFBLEdBQVN1USxTQUFBLENBQVVuRixJQUFWLENBQXBCLENBQUwsQ0FBMEMzUCxDQUFBLEdBQUl1RSxNQUE5QyxFQUFzRHZFLENBQUEsRUFBdEQsRUFBMkQ7QUFBQSxVQUN6RCxJQUFJNFcsTUFBSixFQUFZO0FBQUEsWUFDVmpDLE1BQUEsQ0FBT2hGLElBQUEsQ0FBSzNQLENBQUwsQ0FBUCxJQUFrQjRXLE1BQUEsQ0FBTzVXLENBQVAsQ0FEUjtBQUFBLFdBQVosTUFFTztBQUFBLFlBQ0wyVSxNQUFBLENBQU9oRixJQUFBLENBQUszUCxDQUFMLEVBQVEsQ0FBUixDQUFQLElBQXFCMlAsSUFBQSxDQUFLM1AsQ0FBTCxFQUFRLENBQVIsQ0FEaEI7QUFBQSxXQUhrRDtBQUFBLFNBRjNCO0FBQUEsUUFTaEMsT0FBTzJVLE1BVHlCO0FBQUEsT0FBbEMsQ0FubEJVO0FBQUEsTUFnbUJWO0FBQUEsZUFBUzhGLDBCQUFULENBQW9DcEYsR0FBcEMsRUFBeUM7QUFBQSxRQUN2QyxPQUFPLFVBQVN3RCxLQUFULEVBQWdCOUMsU0FBaEIsRUFBMkJwQyxPQUEzQixFQUFvQztBQUFBLFVBQ3pDb0MsU0FBQSxHQUFZOVYsRUFBQSxDQUFHOFYsU0FBSCxFQUFjcEMsT0FBZCxDQUFaLENBRHlDO0FBQUEsVUFFekMsSUFBSXBQLE1BQUEsR0FBU3VRLFNBQUEsQ0FBVStELEtBQVYsQ0FBYixDQUZ5QztBQUFBLFVBR3pDLElBQUkvRSxLQUFBLEdBQVF1QixHQUFBLEdBQU0sQ0FBTixHQUFVLENBQVYsR0FBYzlRLE1BQUEsR0FBUyxDQUFuQyxDQUh5QztBQUFBLFVBSXpDLE9BQU91UCxLQUFBLElBQVMsQ0FBVCxJQUFjQSxLQUFBLEdBQVF2UCxNQUE3QixFQUFxQ3VQLEtBQUEsSUFBU3VCLEdBQTlDLEVBQW1EO0FBQUEsWUFDakQsSUFBSVUsU0FBQSxDQUFVOEMsS0FBQSxDQUFNL0UsS0FBTixDQUFWLEVBQXdCQSxLQUF4QixFQUErQitFLEtBQS9CLENBQUo7QUFBQSxjQUEyQyxPQUFPL0UsS0FERDtBQUFBLFdBSlY7QUFBQSxVQU96QyxPQUFPLENBQUMsQ0FQaUM7QUFBQSxTQURKO0FBQUEsT0FobUIvQjtBQUFBLE1BNm1CVjtBQUFBLE1BQUFqUSxDQUFBLENBQUVtUyxTQUFGLEdBQWN5RSwwQkFBQSxDQUEyQixDQUEzQixDQUFkLENBN21CVTtBQUFBLE1BOG1CVjVXLENBQUEsQ0FBRTZXLGFBQUYsR0FBa0JELDBCQUFBLENBQTJCLENBQUMsQ0FBNUIsQ0FBbEIsQ0E5bUJVO0FBQUEsTUFrbkJWO0FBQUE7QUFBQSxNQUFBNVcsQ0FBQSxDQUFFOFcsV0FBRixHQUFnQixVQUFTOUIsS0FBVCxFQUFnQmxNLEdBQWhCLEVBQXFCMEgsUUFBckIsRUFBK0JWLE9BQS9CLEVBQXdDO0FBQUEsUUFDdERVLFFBQUEsR0FBV3BVLEVBQUEsQ0FBR29VLFFBQUgsRUFBYVYsT0FBYixFQUFzQixDQUF0QixDQUFYLENBRHNEO0FBQUEsUUFFdEQsSUFBSTNMLEtBQUEsR0FBUXFNLFFBQUEsQ0FBUzFILEdBQVQsQ0FBWixDQUZzRDtBQUFBLFFBR3RELElBQUlpTyxHQUFBLEdBQU0sQ0FBVixFQUFhQyxJQUFBLEdBQU8vRixTQUFBLENBQVUrRCxLQUFWLENBQXBCLENBSHNEO0FBQUEsUUFJdEQsT0FBTytCLEdBQUEsR0FBTUMsSUFBYixFQUFtQjtBQUFBLFVBQ2pCLElBQUlDLEdBQUEsR0FBTXhRLElBQUEsQ0FBS3lRLEtBQUwsQ0FBWSxDQUFBSCxHQUFBLEdBQU1DLElBQU4sQ0FBRCxHQUFlLENBQTFCLENBQVYsQ0FEaUI7QUFBQSxVQUVqQixJQUFJeEcsUUFBQSxDQUFTd0UsS0FBQSxDQUFNaUMsR0FBTixDQUFULElBQXVCOVMsS0FBM0I7QUFBQSxZQUFrQzRTLEdBQUEsR0FBTUUsR0FBQSxHQUFNLENBQVosQ0FBbEM7QUFBQTtBQUFBLFlBQXNERCxJQUFBLEdBQU9DLEdBRjVDO0FBQUEsU0FKbUM7QUFBQSxRQVF0RCxPQUFPRixHQVIrQztBQUFBLE9BQXhELENBbG5CVTtBQUFBLE1BOG5CVjtBQUFBLGVBQVNJLGlCQUFULENBQTJCM0YsR0FBM0IsRUFBZ0M0RixhQUFoQyxFQUErQ04sV0FBL0MsRUFBNEQ7QUFBQSxRQUMxRCxPQUFPLFVBQVM5QixLQUFULEVBQWdCMVQsSUFBaEIsRUFBc0J1VSxHQUF0QixFQUEyQjtBQUFBLFVBQ2hDLElBQUkxWixDQUFBLEdBQUksQ0FBUixFQUFXdUUsTUFBQSxHQUFTdVEsU0FBQSxDQUFVK0QsS0FBVixDQUFwQixDQURnQztBQUFBLFVBRWhDLElBQUksT0FBT2EsR0FBUCxJQUFjLFFBQWxCLEVBQTRCO0FBQUEsWUFDMUIsSUFBSXJFLEdBQUEsR0FBTSxDQUFWLEVBQWE7QUFBQSxjQUNUclYsQ0FBQSxHQUFJMFosR0FBQSxJQUFPLENBQVAsR0FBV0EsR0FBWCxHQUFpQnBQLElBQUEsQ0FBSzZNLEdBQUwsQ0FBU3VDLEdBQUEsR0FBTW5WLE1BQWYsRUFBdUJ2RSxDQUF2QixDQURaO0FBQUEsYUFBYixNQUVPO0FBQUEsY0FDSHVFLE1BQUEsR0FBU21WLEdBQUEsSUFBTyxDQUFQLEdBQVdwUCxJQUFBLENBQUtnTixHQUFMLENBQVNvQyxHQUFBLEdBQU0sQ0FBZixFQUFrQm5WLE1BQWxCLENBQVgsR0FBdUNtVixHQUFBLEdBQU1uVixNQUFOLEdBQWUsQ0FENUQ7QUFBQSxhQUhtQjtBQUFBLFdBQTVCLE1BTU8sSUFBSW9XLFdBQUEsSUFBZWpCLEdBQWYsSUFBc0JuVixNQUExQixFQUFrQztBQUFBLFlBQ3ZDbVYsR0FBQSxHQUFNaUIsV0FBQSxDQUFZOUIsS0FBWixFQUFtQjFULElBQW5CLENBQU4sQ0FEdUM7QUFBQSxZQUV2QyxPQUFPMFQsS0FBQSxDQUFNYSxHQUFOLE1BQWV2VSxJQUFmLEdBQXNCdVUsR0FBdEIsR0FBNEIsQ0FBQyxDQUZHO0FBQUEsV0FSVDtBQUFBLFVBWWhDLElBQUl2VSxJQUFBLEtBQVNBLElBQWIsRUFBbUI7QUFBQSxZQUNqQnVVLEdBQUEsR0FBTXVCLGFBQUEsQ0FBY3phLEtBQUEsQ0FBTUMsSUFBTixDQUFXb1ksS0FBWCxFQUFrQjdZLENBQWxCLEVBQXFCdUUsTUFBckIsQ0FBZCxFQUE0Q1YsQ0FBQSxDQUFFcVgsS0FBOUMsQ0FBTixDQURpQjtBQUFBLFlBRWpCLE9BQU94QixHQUFBLElBQU8sQ0FBUCxHQUFXQSxHQUFBLEdBQU0xWixDQUFqQixHQUFxQixDQUFDLENBRlo7QUFBQSxXQVphO0FBQUEsVUFnQmhDLEtBQUswWixHQUFBLEdBQU1yRSxHQUFBLEdBQU0sQ0FBTixHQUFVclYsQ0FBVixHQUFjdUUsTUFBQSxHQUFTLENBQWxDLEVBQXFDbVYsR0FBQSxJQUFPLENBQVAsSUFBWUEsR0FBQSxHQUFNblYsTUFBdkQsRUFBK0RtVixHQUFBLElBQU9yRSxHQUF0RSxFQUEyRTtBQUFBLFlBQ3pFLElBQUl3RCxLQUFBLENBQU1hLEdBQU4sTUFBZXZVLElBQW5CO0FBQUEsY0FBeUIsT0FBT3VVLEdBRHlDO0FBQUEsV0FoQjNDO0FBQUEsVUFtQmhDLE9BQU8sQ0FBQyxDQW5Cd0I7QUFBQSxTQUR3QjtBQUFBLE9BOW5CbEQ7QUFBQSxNQTBwQlY7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBN1YsQ0FBQSxDQUFFUyxPQUFGLEdBQVkwVyxpQkFBQSxDQUFrQixDQUFsQixFQUFxQm5YLENBQUEsQ0FBRW1TLFNBQXZCLEVBQWtDblMsQ0FBQSxDQUFFOFcsV0FBcEMsQ0FBWixDQTFwQlU7QUFBQSxNQTJwQlY5VyxDQUFBLENBQUV3RCxXQUFGLEdBQWdCMlQsaUJBQUEsQ0FBa0IsQ0FBQyxDQUFuQixFQUFzQm5YLENBQUEsQ0FBRTZXLGFBQXhCLENBQWhCLENBM3BCVTtBQUFBLE1BZ3FCVjtBQUFBO0FBQUE7QUFBQSxNQUFBN1csQ0FBQSxDQUFFc1gsS0FBRixHQUFVLFVBQVMvWSxLQUFULEVBQWdCSCxJQUFoQixFQUFzQm1aLElBQXRCLEVBQTRCO0FBQUEsUUFDcEMsSUFBSW5aLElBQUEsSUFBUSxJQUFaLEVBQWtCO0FBQUEsVUFDaEJBLElBQUEsR0FBT0csS0FBQSxJQUFTLENBQWhCLENBRGdCO0FBQUEsVUFFaEJBLEtBQUEsR0FBUSxDQUZRO0FBQUEsU0FEa0I7QUFBQSxRQUtwQ2daLElBQUEsR0FBT0EsSUFBQSxJQUFRLENBQWYsQ0FMb0M7QUFBQSxRQU9wQyxJQUFJN1csTUFBQSxHQUFTK0YsSUFBQSxDQUFLNk0sR0FBTCxDQUFTN00sSUFBQSxDQUFLK1EsSUFBTCxDQUFXLENBQUFwWixJQUFBLEdBQU9HLEtBQVAsQ0FBRCxHQUFpQmdaLElBQTNCLENBQVQsRUFBMkMsQ0FBM0MsQ0FBYixDQVBvQztBQUFBLFFBUXBDLElBQUlELEtBQUEsR0FBUTdVLEtBQUEsQ0FBTS9CLE1BQU4sQ0FBWixDQVJvQztBQUFBLFFBVXBDLEtBQUssSUFBSW1WLEdBQUEsR0FBTSxDQUFWLENBQUwsQ0FBa0JBLEdBQUEsR0FBTW5WLE1BQXhCLEVBQWdDbVYsR0FBQSxJQUFPdFgsS0FBQSxJQUFTZ1osSUFBaEQsRUFBc0Q7QUFBQSxVQUNwREQsS0FBQSxDQUFNekIsR0FBTixJQUFhdFgsS0FEdUM7QUFBQSxTQVZsQjtBQUFBLFFBY3BDLE9BQU8rWSxLQWQ2QjtBQUFBLE9BQXRDLENBaHFCVTtBQUFBLE1Bc3JCVjtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBQUlHLFlBQUEsR0FBZSxVQUFTQyxVQUFULEVBQXFCQyxTQUFyQixFQUFnQzdILE9BQWhDLEVBQXlDOEgsY0FBekMsRUFBeURsYixJQUF6RCxFQUErRDtBQUFBLFFBQ2hGLElBQUksQ0FBRSxDQUFBa2IsY0FBQSxZQUEwQkQsU0FBMUIsQ0FBTjtBQUFBLFVBQTRDLE9BQU9ELFVBQUEsQ0FBV25iLEtBQVgsQ0FBaUJ1VCxPQUFqQixFQUEwQnBULElBQTFCLENBQVAsQ0FEb0M7QUFBQSxRQUVoRixJQUFJK0ksSUFBQSxHQUFPb0wsVUFBQSxDQUFXNkcsVUFBQSxDQUFXMU0sU0FBdEIsQ0FBWCxDQUZnRjtBQUFBLFFBR2hGLElBQUk4RixNQUFBLEdBQVM0RyxVQUFBLENBQVduYixLQUFYLENBQWlCa0osSUFBakIsRUFBdUIvSSxJQUF2QixDQUFiLENBSGdGO0FBQUEsUUFJaEYsSUFBSXNELENBQUEsQ0FBRXNPLFFBQUYsQ0FBV3dDLE1BQVgsQ0FBSjtBQUFBLFVBQXdCLE9BQU9BLE1BQVAsQ0FKd0Q7QUFBQSxRQUtoRixPQUFPckwsSUFMeUU7QUFBQSxPQUFsRixDQXRyQlU7QUFBQSxNQWlzQlY7QUFBQTtBQUFBO0FBQUEsTUFBQXpGLENBQUEsQ0FBRStHLElBQUYsR0FBUyxVQUFTOEksSUFBVCxFQUFlQyxPQUFmLEVBQXdCO0FBQUEsUUFDL0IsSUFBSVIsVUFBQSxJQUFjTyxJQUFBLENBQUs5SSxJQUFMLEtBQWN1SSxVQUFoQztBQUFBLFVBQTRDLE9BQU9BLFVBQUEsQ0FBVy9TLEtBQVgsQ0FBaUJzVCxJQUFqQixFQUF1QmxULEtBQUEsQ0FBTUMsSUFBTixDQUFXSixTQUFYLEVBQXNCLENBQXRCLENBQXZCLENBQVAsQ0FEYjtBQUFBLFFBRS9CLElBQUksQ0FBQ3dELENBQUEsQ0FBRXFRLFVBQUYsQ0FBYVIsSUFBYixDQUFMO0FBQUEsVUFBeUIsTUFBTSxJQUFJZ0ksU0FBSixDQUFjLG1DQUFkLENBQU4sQ0FGTTtBQUFBLFFBRy9CLElBQUluYixJQUFBLEdBQU9DLEtBQUEsQ0FBTUMsSUFBTixDQUFXSixTQUFYLEVBQXNCLENBQXRCLENBQVgsQ0FIK0I7QUFBQSxRQUkvQixJQUFJc2IsS0FBQSxHQUFRLFlBQVc7QUFBQSxVQUNyQixPQUFPTCxZQUFBLENBQWE1SCxJQUFiLEVBQW1CaUksS0FBbkIsRUFBMEJoSSxPQUExQixFQUFtQyxJQUFuQyxFQUF5Q3BULElBQUEsQ0FBS0ssTUFBTCxDQUFZSixLQUFBLENBQU1DLElBQU4sQ0FBV0osU0FBWCxDQUFaLENBQXpDLENBRGM7QUFBQSxTQUF2QixDQUorQjtBQUFBLFFBTy9CLE9BQU9zYixLQVB3QjtBQUFBLE9BQWpDLENBanNCVTtBQUFBLE1BOHNCVjtBQUFBO0FBQUE7QUFBQSxNQUFBOVgsQ0FBQSxDQUFFK1gsT0FBRixHQUFZLFVBQVNsSSxJQUFULEVBQWU7QUFBQSxRQUN6QixJQUFJbUksU0FBQSxHQUFZcmIsS0FBQSxDQUFNQyxJQUFOLENBQVdKLFNBQVgsRUFBc0IsQ0FBdEIsQ0FBaEIsQ0FEeUI7QUFBQSxRQUV6QixJQUFJc2IsS0FBQSxHQUFRLFlBQVc7QUFBQSxVQUNyQixJQUFJRyxRQUFBLEdBQVcsQ0FBZixFQUFrQnZYLE1BQUEsR0FBU3NYLFNBQUEsQ0FBVXRYLE1BQXJDLENBRHFCO0FBQUEsVUFFckIsSUFBSWhFLElBQUEsR0FBTytGLEtBQUEsQ0FBTS9CLE1BQU4sQ0FBWCxDQUZxQjtBQUFBLFVBR3JCLEtBQUssSUFBSXZFLENBQUEsR0FBSSxDQUFSLENBQUwsQ0FBZ0JBLENBQUEsR0FBSXVFLE1BQXBCLEVBQTRCdkUsQ0FBQSxFQUE1QixFQUFpQztBQUFBLFlBQy9CTyxJQUFBLENBQUtQLENBQUwsSUFBVTZiLFNBQUEsQ0FBVTdiLENBQVYsTUFBaUI2RCxDQUFqQixHQUFxQnhELFNBQUEsQ0FBVXliLFFBQUEsRUFBVixDQUFyQixHQUE2Q0QsU0FBQSxDQUFVN2IsQ0FBVixDQUR4QjtBQUFBLFdBSFo7QUFBQSxVQU1yQixPQUFPOGIsUUFBQSxHQUFXemIsU0FBQSxDQUFVa0UsTUFBNUI7QUFBQSxZQUFvQ2hFLElBQUEsQ0FBS1gsSUFBTCxDQUFVUyxTQUFBLENBQVV5YixRQUFBLEVBQVYsQ0FBVixFQU5mO0FBQUEsVUFPckIsT0FBT1IsWUFBQSxDQUFhNUgsSUFBYixFQUFtQmlJLEtBQW5CLEVBQTBCLElBQTFCLEVBQWdDLElBQWhDLEVBQXNDcGIsSUFBdEMsQ0FQYztBQUFBLFNBQXZCLENBRnlCO0FBQUEsUUFXekIsT0FBT29iLEtBWGtCO0FBQUEsT0FBM0IsQ0E5c0JVO0FBQUEsTUErdEJWO0FBQUE7QUFBQTtBQUFBLE1BQUE5WCxDQUFBLENBQUVrWSxPQUFGLEdBQVksVUFBU3BQLEdBQVQsRUFBYztBQUFBLFFBQ3hCLElBQUkzTSxDQUFKLEVBQU91RSxNQUFBLEdBQVNsRSxTQUFBLENBQVVrRSxNQUExQixFQUFrQ1UsR0FBbEMsQ0FEd0I7QUFBQSxRQUV4QixJQUFJVixNQUFBLElBQVUsQ0FBZDtBQUFBLFVBQWlCLE1BQU0sSUFBSXlYLEtBQUosQ0FBVSx1Q0FBVixDQUFOLENBRk87QUFBQSxRQUd4QixLQUFLaGMsQ0FBQSxHQUFJLENBQVQsRUFBWUEsQ0FBQSxHQUFJdUUsTUFBaEIsRUFBd0J2RSxDQUFBLEVBQXhCLEVBQTZCO0FBQUEsVUFDM0JpRixHQUFBLEdBQU01RSxTQUFBLENBQVVMLENBQVYsQ0FBTixDQUQyQjtBQUFBLFVBRTNCMk0sR0FBQSxDQUFJMUgsR0FBSixJQUFXcEIsQ0FBQSxDQUFFK0csSUFBRixDQUFPK0IsR0FBQSxDQUFJMUgsR0FBSixDQUFQLEVBQWlCMEgsR0FBakIsQ0FGZ0I7QUFBQSxTQUhMO0FBQUEsUUFPeEIsT0FBT0EsR0FQaUI7QUFBQSxPQUExQixDQS90QlU7QUFBQSxNQTB1QlY7QUFBQSxNQUFBOUksQ0FBQSxDQUFFb1ksT0FBRixHQUFZLFVBQVN2SSxJQUFULEVBQWV3SSxNQUFmLEVBQXVCO0FBQUEsUUFDakMsSUFBSUQsT0FBQSxHQUFVLFVBQVNoWCxHQUFULEVBQWM7QUFBQSxVQUMxQixJQUFJaEMsS0FBQSxHQUFRZ1osT0FBQSxDQUFRaFosS0FBcEIsQ0FEMEI7QUFBQSxVQUUxQixJQUFJa1osT0FBQSxHQUFVLEtBQU0sQ0FBQUQsTUFBQSxHQUFTQSxNQUFBLENBQU85YixLQUFQLENBQWEsSUFBYixFQUFtQkMsU0FBbkIsQ0FBVCxHQUF5QzRFLEdBQXpDLENBQXBCLENBRjBCO0FBQUEsVUFHMUIsSUFBSSxDQUFDcEIsQ0FBQSxDQUFFdVUsR0FBRixDQUFNblYsS0FBTixFQUFha1osT0FBYixDQUFMO0FBQUEsWUFBNEJsWixLQUFBLENBQU1rWixPQUFOLElBQWlCekksSUFBQSxDQUFLdFQsS0FBTCxDQUFXLElBQVgsRUFBaUJDLFNBQWpCLENBQWpCLENBSEY7QUFBQSxVQUkxQixPQUFPNEMsS0FBQSxDQUFNa1osT0FBTixDQUptQjtBQUFBLFNBQTVCLENBRGlDO0FBQUEsUUFPakNGLE9BQUEsQ0FBUWhaLEtBQVIsR0FBZ0IsRUFBaEIsQ0FQaUM7QUFBQSxRQVFqQyxPQUFPZ1osT0FSMEI7QUFBQSxPQUFuQyxDQTF1QlU7QUFBQSxNQXV2QlY7QUFBQTtBQUFBLE1BQUFwWSxDQUFBLENBQUV1WSxLQUFGLEdBQVUsVUFBUzFJLElBQVQsRUFBZTJJLElBQWYsRUFBcUI7QUFBQSxRQUM3QixJQUFJOWIsSUFBQSxHQUFPQyxLQUFBLENBQU1DLElBQU4sQ0FBV0osU0FBWCxFQUFzQixDQUF0QixDQUFYLENBRDZCO0FBQUEsUUFFN0IsT0FBT2ljLFVBQUEsQ0FBVyxZQUFVO0FBQUEsVUFDMUIsT0FBTzVJLElBQUEsQ0FBS3RULEtBQUwsQ0FBVyxJQUFYLEVBQWlCRyxJQUFqQixDQURtQjtBQUFBLFNBQXJCLEVBRUo4YixJQUZJLENBRnNCO0FBQUEsT0FBL0IsQ0F2dkJVO0FBQUEsTUFnd0JWO0FBQUE7QUFBQSxNQUFBeFksQ0FBQSxDQUFFeU4sS0FBRixHQUFVek4sQ0FBQSxDQUFFK1gsT0FBRixDQUFVL1gsQ0FBQSxDQUFFdVksS0FBWixFQUFtQnZZLENBQW5CLEVBQXNCLENBQXRCLENBQVYsQ0Fod0JVO0FBQUEsTUF1d0JWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBQSxDQUFBLENBQUUwWSxRQUFGLEdBQWEsVUFBUzdJLElBQVQsRUFBZTJJLElBQWYsRUFBcUI1SyxPQUFyQixFQUE4QjtBQUFBLFFBQ3pDLElBQUlrQyxPQUFKLEVBQWFwVCxJQUFiLEVBQW1Cb1UsTUFBbkIsQ0FEeUM7QUFBQSxRQUV6QyxJQUFJNkgsT0FBQSxHQUFVLElBQWQsQ0FGeUM7QUFBQSxRQUd6QyxJQUFJQyxRQUFBLEdBQVcsQ0FBZixDQUh5QztBQUFBLFFBSXpDLElBQUksQ0FBQ2hMLE9BQUw7QUFBQSxVQUFjQSxPQUFBLEdBQVUsRUFBVixDQUoyQjtBQUFBLFFBS3pDLElBQUlpTCxLQUFBLEdBQVEsWUFBVztBQUFBLFVBQ3JCRCxRQUFBLEdBQVdoTCxPQUFBLENBQVFrTCxPQUFSLEtBQW9CLEtBQXBCLEdBQTRCLENBQTVCLEdBQWdDOVksQ0FBQSxDQUFFK1ksR0FBRixFQUEzQyxDQURxQjtBQUFBLFVBRXJCSixPQUFBLEdBQVUsSUFBVixDQUZxQjtBQUFBLFVBR3JCN0gsTUFBQSxHQUFTakIsSUFBQSxDQUFLdFQsS0FBTCxDQUFXdVQsT0FBWCxFQUFvQnBULElBQXBCLENBQVQsQ0FIcUI7QUFBQSxVQUlyQixJQUFJLENBQUNpYyxPQUFMO0FBQUEsWUFBYzdJLE9BQUEsR0FBVXBULElBQUEsR0FBTyxJQUpWO0FBQUEsU0FBdkIsQ0FMeUM7QUFBQSxRQVd6QyxPQUFPLFlBQVc7QUFBQSxVQUNoQixJQUFJcWMsR0FBQSxHQUFNL1ksQ0FBQSxDQUFFK1ksR0FBRixFQUFWLENBRGdCO0FBQUEsVUFFaEIsSUFBSSxDQUFDSCxRQUFELElBQWFoTCxPQUFBLENBQVFrTCxPQUFSLEtBQW9CLEtBQXJDO0FBQUEsWUFBNENGLFFBQUEsR0FBV0csR0FBWCxDQUY1QjtBQUFBLFVBR2hCLElBQUlDLFNBQUEsR0FBWVIsSUFBQSxHQUFRLENBQUFPLEdBQUEsR0FBTUgsUUFBTixDQUF4QixDQUhnQjtBQUFBLFVBSWhCOUksT0FBQSxHQUFVLElBQVYsQ0FKZ0I7QUFBQSxVQUtoQnBULElBQUEsR0FBT0YsU0FBUCxDQUxnQjtBQUFBLFVBTWhCLElBQUl3YyxTQUFBLElBQWEsQ0FBYixJQUFrQkEsU0FBQSxHQUFZUixJQUFsQyxFQUF3QztBQUFBLFlBQ3RDLElBQUlHLE9BQUosRUFBYTtBQUFBLGNBQ1hNLFlBQUEsQ0FBYU4sT0FBYixFQURXO0FBQUEsY0FFWEEsT0FBQSxHQUFVLElBRkM7QUFBQSxhQUR5QjtBQUFBLFlBS3RDQyxRQUFBLEdBQVdHLEdBQVgsQ0FMc0M7QUFBQSxZQU10Q2pJLE1BQUEsR0FBU2pCLElBQUEsQ0FBS3RULEtBQUwsQ0FBV3VULE9BQVgsRUFBb0JwVCxJQUFwQixDQUFULENBTnNDO0FBQUEsWUFPdEMsSUFBSSxDQUFDaWMsT0FBTDtBQUFBLGNBQWM3SSxPQUFBLEdBQVVwVCxJQUFBLEdBQU8sSUFQTztBQUFBLFdBQXhDLE1BUU8sSUFBSSxDQUFDaWMsT0FBRCxJQUFZL0ssT0FBQSxDQUFRc0wsUUFBUixLQUFxQixLQUFyQyxFQUE0QztBQUFBLFlBQ2pEUCxPQUFBLEdBQVVGLFVBQUEsQ0FBV0ksS0FBWCxFQUFrQkcsU0FBbEIsQ0FEdUM7QUFBQSxXQWRuQztBQUFBLFVBaUJoQixPQUFPbEksTUFqQlM7QUFBQSxTQVh1QjtBQUFBLE9BQTNDLENBdndCVTtBQUFBLE1BMnlCVjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUE5USxDQUFBLENBQUVtWixRQUFGLEdBQWEsVUFBU3RKLElBQVQsRUFBZTJJLElBQWYsRUFBcUJZLFNBQXJCLEVBQWdDO0FBQUEsUUFDM0MsSUFBSVQsT0FBSixFQUFhamMsSUFBYixFQUFtQm9ULE9BQW5CLEVBQTRCdUosU0FBNUIsRUFBdUN2SSxNQUF2QyxDQUQyQztBQUFBLFFBRzNDLElBQUkrSCxLQUFBLEdBQVEsWUFBVztBQUFBLFVBQ3JCLElBQUkzRCxJQUFBLEdBQU9sVixDQUFBLENBQUUrWSxHQUFGLEtBQVVNLFNBQXJCLENBRHFCO0FBQUEsVUFHckIsSUFBSW5FLElBQUEsR0FBT3NELElBQVAsSUFBZXRELElBQUEsSUFBUSxDQUEzQixFQUE4QjtBQUFBLFlBQzVCeUQsT0FBQSxHQUFVRixVQUFBLENBQVdJLEtBQVgsRUFBa0JMLElBQUEsR0FBT3RELElBQXpCLENBRGtCO0FBQUEsV0FBOUIsTUFFTztBQUFBLFlBQ0x5RCxPQUFBLEdBQVUsSUFBVixDQURLO0FBQUEsWUFFTCxJQUFJLENBQUNTLFNBQUwsRUFBZ0I7QUFBQSxjQUNkdEksTUFBQSxHQUFTakIsSUFBQSxDQUFLdFQsS0FBTCxDQUFXdVQsT0FBWCxFQUFvQnBULElBQXBCLENBQVQsQ0FEYztBQUFBLGNBRWQsSUFBSSxDQUFDaWMsT0FBTDtBQUFBLGdCQUFjN0ksT0FBQSxHQUFVcFQsSUFBQSxHQUFPLElBRmpCO0FBQUEsYUFGWDtBQUFBLFdBTGM7QUFBQSxTQUF2QixDQUgyQztBQUFBLFFBaUIzQyxPQUFPLFlBQVc7QUFBQSxVQUNoQm9ULE9BQUEsR0FBVSxJQUFWLENBRGdCO0FBQUEsVUFFaEJwVCxJQUFBLEdBQU9GLFNBQVAsQ0FGZ0I7QUFBQSxVQUdoQjZjLFNBQUEsR0FBWXJaLENBQUEsQ0FBRStZLEdBQUYsRUFBWixDQUhnQjtBQUFBLFVBSWhCLElBQUlPLE9BQUEsR0FBVUYsU0FBQSxJQUFhLENBQUNULE9BQTVCLENBSmdCO0FBQUEsVUFLaEIsSUFBSSxDQUFDQSxPQUFMO0FBQUEsWUFBY0EsT0FBQSxHQUFVRixVQUFBLENBQVdJLEtBQVgsRUFBa0JMLElBQWxCLENBQVYsQ0FMRTtBQUFBLFVBTWhCLElBQUljLE9BQUosRUFBYTtBQUFBLFlBQ1h4SSxNQUFBLEdBQVNqQixJQUFBLENBQUt0VCxLQUFMLENBQVd1VCxPQUFYLEVBQW9CcFQsSUFBcEIsQ0FBVCxDQURXO0FBQUEsWUFFWG9ULE9BQUEsR0FBVXBULElBQUEsR0FBTyxJQUZOO0FBQUEsV0FORztBQUFBLFVBV2hCLE9BQU9vVSxNQVhTO0FBQUEsU0FqQnlCO0FBQUEsT0FBN0MsQ0EzeUJVO0FBQUEsTUE4MEJWO0FBQUE7QUFBQTtBQUFBLE1BQUE5USxDQUFBLENBQUVHLElBQUYsR0FBUyxVQUFTMFAsSUFBVCxFQUFlMEosT0FBZixFQUF3QjtBQUFBLFFBQy9CLE9BQU92WixDQUFBLENBQUUrWCxPQUFGLENBQVV3QixPQUFWLEVBQW1CMUosSUFBbkIsQ0FEd0I7QUFBQSxPQUFqQyxDQTkwQlU7QUFBQSxNQW0xQlY7QUFBQSxNQUFBN1AsQ0FBQSxDQUFFc1MsTUFBRixHQUFXLFVBQVNKLFNBQVQsRUFBb0I7QUFBQSxRQUM3QixPQUFPLFlBQVc7QUFBQSxVQUNoQixPQUFPLENBQUNBLFNBQUEsQ0FBVTNWLEtBQVYsQ0FBZ0IsSUFBaEIsRUFBc0JDLFNBQXRCLENBRFE7QUFBQSxTQURXO0FBQUEsT0FBL0IsQ0FuMUJVO0FBQUEsTUEyMUJWO0FBQUE7QUFBQSxNQUFBd0QsQ0FBQSxDQUFFd1osT0FBRixHQUFZLFlBQVc7QUFBQSxRQUNyQixJQUFJOWMsSUFBQSxHQUFPRixTQUFYLENBRHFCO0FBQUEsUUFFckIsSUFBSStCLEtBQUEsR0FBUTdCLElBQUEsQ0FBS2dFLE1BQUwsR0FBYyxDQUExQixDQUZxQjtBQUFBLFFBR3JCLE9BQU8sWUFBVztBQUFBLFVBQ2hCLElBQUl2RSxDQUFBLEdBQUlvQyxLQUFSLENBRGdCO0FBQUEsVUFFaEIsSUFBSXVTLE1BQUEsR0FBU3BVLElBQUEsQ0FBSzZCLEtBQUwsRUFBWWhDLEtBQVosQ0FBa0IsSUFBbEIsRUFBd0JDLFNBQXhCLENBQWIsQ0FGZ0I7QUFBQSxVQUdoQixPQUFPTCxDQUFBLEVBQVA7QUFBQSxZQUFZMlUsTUFBQSxHQUFTcFUsSUFBQSxDQUFLUCxDQUFMLEVBQVFTLElBQVIsQ0FBYSxJQUFiLEVBQW1Ca1UsTUFBbkIsQ0FBVCxDQUhJO0FBQUEsVUFJaEIsT0FBT0EsTUFKUztBQUFBLFNBSEc7QUFBQSxPQUF2QixDQTMxQlU7QUFBQSxNQXUyQlY7QUFBQSxNQUFBOVEsQ0FBQSxDQUFFeVosS0FBRixHQUFVLFVBQVNDLEtBQVQsRUFBZ0I3SixJQUFoQixFQUFzQjtBQUFBLFFBQzlCLE9BQU8sWUFBVztBQUFBLFVBQ2hCLElBQUksRUFBRTZKLEtBQUYsR0FBVSxDQUFkLEVBQWlCO0FBQUEsWUFDZixPQUFPN0osSUFBQSxDQUFLdFQsS0FBTCxDQUFXLElBQVgsRUFBaUJDLFNBQWpCLENBRFE7QUFBQSxXQUREO0FBQUEsU0FEWTtBQUFBLE9BQWhDLENBdjJCVTtBQUFBLE1BZzNCVjtBQUFBLE1BQUF3RCxDQUFBLENBQUU0RCxNQUFGLEdBQVcsVUFBUzhWLEtBQVQsRUFBZ0I3SixJQUFoQixFQUFzQjtBQUFBLFFBQy9CLElBQUk2QixJQUFKLENBRCtCO0FBQUEsUUFFL0IsT0FBTyxZQUFXO0FBQUEsVUFDaEIsSUFBSSxFQUFFZ0ksS0FBRixHQUFVLENBQWQsRUFBaUI7QUFBQSxZQUNmaEksSUFBQSxHQUFPN0IsSUFBQSxDQUFLdFQsS0FBTCxDQUFXLElBQVgsRUFBaUJDLFNBQWpCLENBRFE7QUFBQSxXQUREO0FBQUEsVUFJaEIsSUFBSWtkLEtBQUEsSUFBUyxDQUFiO0FBQUEsWUFBZ0I3SixJQUFBLEdBQU8sSUFBUCxDQUpBO0FBQUEsVUFLaEIsT0FBTzZCLElBTFM7QUFBQSxTQUZhO0FBQUEsT0FBakMsQ0FoM0JVO0FBQUEsTUE2M0JWO0FBQUE7QUFBQSxNQUFBMVIsQ0FBQSxDQUFFMlosSUFBRixHQUFTM1osQ0FBQSxDQUFFK1gsT0FBRixDQUFVL1gsQ0FBQSxDQUFFNEQsTUFBWixFQUFvQixDQUFwQixDQUFULENBNzNCVTtBQUFBLE1BbTRCVjtBQUFBO0FBQUE7QUFBQSxVQUFJZ1csVUFBQSxHQUFhLENBQUMsRUFBQ3RSLFFBQUEsRUFBVSxJQUFYLEdBQWlCdVIsb0JBQWpCLENBQXNDLFVBQXRDLENBQWxCLENBbjRCVTtBQUFBLE1BbzRCVixJQUFJQyxrQkFBQSxHQUFxQjtBQUFBLFFBQUMsU0FBRDtBQUFBLFFBQVksZUFBWjtBQUFBLFFBQTZCLFVBQTdCO0FBQUEsUUFDTCxzQkFESztBQUFBLFFBQ21CLGdCQURuQjtBQUFBLFFBQ3FDLGdCQURyQztBQUFBLE9BQXpCLENBcDRCVTtBQUFBLE1BdTRCVixTQUFTQyxtQkFBVCxDQUE2QmpSLEdBQTdCLEVBQWtDN0YsSUFBbEMsRUFBd0M7QUFBQSxRQUN0QyxJQUFJK1csVUFBQSxHQUFhRixrQkFBQSxDQUFtQnBaLE1BQXBDLENBRHNDO0FBQUEsUUFFdEMsSUFBSXNNLFdBQUEsR0FBY2xFLEdBQUEsQ0FBSWtFLFdBQXRCLENBRnNDO0FBQUEsUUFHdEMsSUFBSWlOLEtBQUEsR0FBU2phLENBQUEsQ0FBRXFRLFVBQUYsQ0FBYXJELFdBQWIsS0FBNkJBLFdBQUEsQ0FBWWhDLFNBQTFDLElBQXdEa0UsUUFBcEUsQ0FIc0M7QUFBQSxRQU10QztBQUFBLFlBQUlnTCxJQUFBLEdBQU8sYUFBWCxDQU5zQztBQUFBLFFBT3RDLElBQUlsYSxDQUFBLENBQUV1VSxHQUFGLENBQU16TCxHQUFOLEVBQVdvUixJQUFYLEtBQW9CLENBQUNsYSxDQUFBLENBQUUwUyxRQUFGLENBQVd6UCxJQUFYLEVBQWlCaVgsSUFBakIsQ0FBekI7QUFBQSxVQUFpRGpYLElBQUEsQ0FBS2xILElBQUwsQ0FBVW1lLElBQVYsRUFQWDtBQUFBLFFBU3RDLE9BQU9GLFVBQUEsRUFBUCxFQUFxQjtBQUFBLFVBQ25CRSxJQUFBLEdBQU9KLGtCQUFBLENBQW1CRSxVQUFuQixDQUFQLENBRG1CO0FBQUEsVUFFbkIsSUFBSUUsSUFBQSxJQUFRcFIsR0FBUixJQUFlQSxHQUFBLENBQUlvUixJQUFKLE1BQWNELEtBQUEsQ0FBTUMsSUFBTixDQUE3QixJQUE0QyxDQUFDbGEsQ0FBQSxDQUFFMFMsUUFBRixDQUFXelAsSUFBWCxFQUFpQmlYLElBQWpCLENBQWpELEVBQXlFO0FBQUEsWUFDdkVqWCxJQUFBLENBQUtsSCxJQUFMLENBQVVtZSxJQUFWLENBRHVFO0FBQUEsV0FGdEQ7QUFBQSxTQVRpQjtBQUFBLE9BdjRCOUI7QUFBQSxNQTA1QlY7QUFBQTtBQUFBLE1BQUFsYSxDQUFBLENBQUVpRCxJQUFGLEdBQVMsVUFBUzZGLEdBQVQsRUFBYztBQUFBLFFBQ3JCLElBQUksQ0FBQzlJLENBQUEsQ0FBRXNPLFFBQUYsQ0FBV3hGLEdBQVgsQ0FBTDtBQUFBLFVBQXNCLE9BQU8sRUFBUCxDQUREO0FBQUEsUUFFckIsSUFBSXVHLFVBQUo7QUFBQSxVQUFnQixPQUFPQSxVQUFBLENBQVd2RyxHQUFYLENBQVAsQ0FGSztBQUFBLFFBR3JCLElBQUk3RixJQUFBLEdBQU8sRUFBWCxDQUhxQjtBQUFBLFFBSXJCLFNBQVM3QixHQUFULElBQWdCMEgsR0FBaEI7QUFBQSxVQUFxQixJQUFJOUksQ0FBQSxDQUFFdVUsR0FBRixDQUFNekwsR0FBTixFQUFXMUgsR0FBWCxDQUFKO0FBQUEsWUFBcUI2QixJQUFBLENBQUtsSCxJQUFMLENBQVVxRixHQUFWLEVBSnJCO0FBQUEsUUFNckI7QUFBQSxZQUFJd1ksVUFBSjtBQUFBLFVBQWdCRyxtQkFBQSxDQUFvQmpSLEdBQXBCLEVBQXlCN0YsSUFBekIsRUFOSztBQUFBLFFBT3JCLE9BQU9BLElBUGM7QUFBQSxPQUF2QixDQTE1QlU7QUFBQSxNQXE2QlY7QUFBQSxNQUFBakQsQ0FBQSxDQUFFbWEsT0FBRixHQUFZLFVBQVNyUixHQUFULEVBQWM7QUFBQSxRQUN4QixJQUFJLENBQUM5SSxDQUFBLENBQUVzTyxRQUFGLENBQVd4RixHQUFYLENBQUw7QUFBQSxVQUFzQixPQUFPLEVBQVAsQ0FERTtBQUFBLFFBRXhCLElBQUk3RixJQUFBLEdBQU8sRUFBWCxDQUZ3QjtBQUFBLFFBR3hCLFNBQVM3QixHQUFULElBQWdCMEgsR0FBaEI7QUFBQSxVQUFxQjdGLElBQUEsQ0FBS2xILElBQUwsQ0FBVXFGLEdBQVYsRUFIRztBQUFBLFFBS3hCO0FBQUEsWUFBSXdZLFVBQUo7QUFBQSxVQUFnQkcsbUJBQUEsQ0FBb0JqUixHQUFwQixFQUF5QjdGLElBQXpCLEVBTFE7QUFBQSxRQU14QixPQUFPQSxJQU5pQjtBQUFBLE9BQTFCLENBcjZCVTtBQUFBLE1BKzZCVjtBQUFBLE1BQUFqRCxDQUFBLENBQUUrUyxNQUFGLEdBQVcsVUFBU2pLLEdBQVQsRUFBYztBQUFBLFFBQ3ZCLElBQUk3RixJQUFBLEdBQU9qRCxDQUFBLENBQUVpRCxJQUFGLENBQU82RixHQUFQLENBQVgsQ0FEdUI7QUFBQSxRQUV2QixJQUFJcEksTUFBQSxHQUFTdUMsSUFBQSxDQUFLdkMsTUFBbEIsQ0FGdUI7QUFBQSxRQUd2QixJQUFJcVMsTUFBQSxHQUFTdFEsS0FBQSxDQUFNL0IsTUFBTixDQUFiLENBSHVCO0FBQUEsUUFJdkIsS0FBSyxJQUFJdkUsQ0FBQSxHQUFJLENBQVIsQ0FBTCxDQUFnQkEsQ0FBQSxHQUFJdUUsTUFBcEIsRUFBNEJ2RSxDQUFBLEVBQTVCLEVBQWlDO0FBQUEsVUFDL0I0VyxNQUFBLENBQU81VyxDQUFQLElBQVkyTSxHQUFBLENBQUk3RixJQUFBLENBQUs5RyxDQUFMLENBQUosQ0FEbUI7QUFBQSxTQUpWO0FBQUEsUUFPdkIsT0FBTzRXLE1BUGdCO0FBQUEsT0FBekIsQ0EvNkJVO0FBQUEsTUEyN0JWO0FBQUE7QUFBQSxNQUFBL1MsQ0FBQSxDQUFFb2EsU0FBRixHQUFjLFVBQVN0UixHQUFULEVBQWMwSCxRQUFkLEVBQXdCVixPQUF4QixFQUFpQztBQUFBLFFBQzdDVSxRQUFBLEdBQVdwVSxFQUFBLENBQUdvVSxRQUFILEVBQWFWLE9BQWIsQ0FBWCxDQUQ2QztBQUFBLFFBRTdDLElBQUk3TSxJQUFBLEdBQVFqRCxDQUFBLENBQUVpRCxJQUFGLENBQU82RixHQUFQLENBQVosRUFDTXBJLE1BQUEsR0FBU3VDLElBQUEsQ0FBS3ZDLE1BRHBCLEVBRU0yUSxPQUFBLEdBQVUsRUFGaEIsRUFHTUMsVUFITixDQUY2QztBQUFBLFFBTTNDLEtBQUssSUFBSXJCLEtBQUEsR0FBUSxDQUFaLENBQUwsQ0FBb0JBLEtBQUEsR0FBUXZQLE1BQTVCLEVBQW9DdVAsS0FBQSxFQUFwQyxFQUE2QztBQUFBLFVBQzNDcUIsVUFBQSxHQUFhck8sSUFBQSxDQUFLZ04sS0FBTCxDQUFiLENBRDJDO0FBQUEsVUFFM0NvQixPQUFBLENBQVFDLFVBQVIsSUFBc0JkLFFBQUEsQ0FBUzFILEdBQUEsQ0FBSXdJLFVBQUosQ0FBVCxFQUEwQkEsVUFBMUIsRUFBc0N4SSxHQUF0QyxDQUZxQjtBQUFBLFNBTkY7QUFBQSxRQVUzQyxPQUFPdUksT0FWb0M7QUFBQSxPQUEvQyxDQTM3QlU7QUFBQSxNQXk4QlY7QUFBQSxNQUFBclIsQ0FBQSxDQUFFcWEsS0FBRixHQUFVLFVBQVN2UixHQUFULEVBQWM7QUFBQSxRQUN0QixJQUFJN0YsSUFBQSxHQUFPakQsQ0FBQSxDQUFFaUQsSUFBRixDQUFPNkYsR0FBUCxDQUFYLENBRHNCO0FBQUEsUUFFdEIsSUFBSXBJLE1BQUEsR0FBU3VDLElBQUEsQ0FBS3ZDLE1BQWxCLENBRnNCO0FBQUEsUUFHdEIsSUFBSTJaLEtBQUEsR0FBUTVYLEtBQUEsQ0FBTS9CLE1BQU4sQ0FBWixDQUhzQjtBQUFBLFFBSXRCLEtBQUssSUFBSXZFLENBQUEsR0FBSSxDQUFSLENBQUwsQ0FBZ0JBLENBQUEsR0FBSXVFLE1BQXBCLEVBQTRCdkUsQ0FBQSxFQUE1QixFQUFpQztBQUFBLFVBQy9Ca2UsS0FBQSxDQUFNbGUsQ0FBTixJQUFXO0FBQUEsWUFBQzhHLElBQUEsQ0FBSzlHLENBQUwsQ0FBRDtBQUFBLFlBQVUyTSxHQUFBLENBQUk3RixJQUFBLENBQUs5RyxDQUFMLENBQUosQ0FBVjtBQUFBLFdBRG9CO0FBQUEsU0FKWDtBQUFBLFFBT3RCLE9BQU9rZSxLQVBlO0FBQUEsT0FBeEIsQ0F6OEJVO0FBQUEsTUFvOUJWO0FBQUEsTUFBQXJhLENBQUEsQ0FBRXNhLE1BQUYsR0FBVyxVQUFTeFIsR0FBVCxFQUFjO0FBQUEsUUFDdkIsSUFBSWdJLE1BQUEsR0FBUyxFQUFiLENBRHVCO0FBQUEsUUFFdkIsSUFBSTdOLElBQUEsR0FBT2pELENBQUEsQ0FBRWlELElBQUYsQ0FBTzZGLEdBQVAsQ0FBWCxDQUZ1QjtBQUFBLFFBR3ZCLEtBQUssSUFBSTNNLENBQUEsR0FBSSxDQUFSLEVBQVd1RSxNQUFBLEdBQVN1QyxJQUFBLENBQUt2QyxNQUF6QixDQUFMLENBQXNDdkUsQ0FBQSxHQUFJdUUsTUFBMUMsRUFBa0R2RSxDQUFBLEVBQWxELEVBQXVEO0FBQUEsVUFDckQyVSxNQUFBLENBQU9oSSxHQUFBLENBQUk3RixJQUFBLENBQUs5RyxDQUFMLENBQUosQ0FBUCxJQUF1QjhHLElBQUEsQ0FBSzlHLENBQUwsQ0FEOEI7QUFBQSxTQUhoQztBQUFBLFFBTXZCLE9BQU8yVSxNQU5nQjtBQUFBLE9BQXpCLENBcDlCVTtBQUFBLE1BKzlCVjtBQUFBO0FBQUEsTUFBQTlRLENBQUEsQ0FBRXVhLFNBQUYsR0FBY3ZhLENBQUEsQ0FBRXdhLE9BQUYsR0FBWSxVQUFTMVIsR0FBVCxFQUFjO0FBQUEsUUFDdEMsSUFBSTJSLEtBQUEsR0FBUSxFQUFaLENBRHNDO0FBQUEsUUFFdEMsU0FBU3JaLEdBQVQsSUFBZ0IwSCxHQUFoQixFQUFxQjtBQUFBLFVBQ25CLElBQUk5SSxDQUFBLENBQUVxUSxVQUFGLENBQWF2SCxHQUFBLENBQUkxSCxHQUFKLENBQWIsQ0FBSjtBQUFBLFlBQTRCcVosS0FBQSxDQUFNMWUsSUFBTixDQUFXcUYsR0FBWCxDQURUO0FBQUEsU0FGaUI7QUFBQSxRQUt0QyxPQUFPcVosS0FBQSxDQUFNeEcsSUFBTixFQUwrQjtBQUFBLE9BQXhDLENBLzlCVTtBQUFBLE1BdytCVjtBQUFBLE1BQUFqVSxDQUFBLENBQUVvRixNQUFGLEdBQVdxTCxjQUFBLENBQWV6USxDQUFBLENBQUVtYSxPQUFqQixDQUFYLENBeCtCVTtBQUFBLE1BNCtCVjtBQUFBO0FBQUEsTUFBQW5hLENBQUEsQ0FBRTBhLFNBQUYsR0FBYzFhLENBQUEsQ0FBRTJhLE1BQUYsR0FBV2xLLGNBQUEsQ0FBZXpRLENBQUEsQ0FBRWlELElBQWpCLENBQXpCLENBNStCVTtBQUFBLE1BKytCVjtBQUFBLE1BQUFqRCxDQUFBLENBQUVvUyxPQUFGLEdBQVksVUFBU3RKLEdBQVQsRUFBY29KLFNBQWQsRUFBeUJwQyxPQUF6QixFQUFrQztBQUFBLFFBQzVDb0MsU0FBQSxHQUFZOVYsRUFBQSxDQUFHOFYsU0FBSCxFQUFjcEMsT0FBZCxDQUFaLENBRDRDO0FBQUEsUUFFNUMsSUFBSTdNLElBQUEsR0FBT2pELENBQUEsQ0FBRWlELElBQUYsQ0FBTzZGLEdBQVAsQ0FBWCxFQUF3QjFILEdBQXhCLENBRjRDO0FBQUEsUUFHNUMsS0FBSyxJQUFJakYsQ0FBQSxHQUFJLENBQVIsRUFBV3VFLE1BQUEsR0FBU3VDLElBQUEsQ0FBS3ZDLE1BQXpCLENBQUwsQ0FBc0N2RSxDQUFBLEdBQUl1RSxNQUExQyxFQUFrRHZFLENBQUEsRUFBbEQsRUFBdUQ7QUFBQSxVQUNyRGlGLEdBQUEsR0FBTTZCLElBQUEsQ0FBSzlHLENBQUwsQ0FBTixDQURxRDtBQUFBLFVBRXJELElBQUkrVixTQUFBLENBQVVwSixHQUFBLENBQUkxSCxHQUFKLENBQVYsRUFBb0JBLEdBQXBCLEVBQXlCMEgsR0FBekIsQ0FBSjtBQUFBLFlBQW1DLE9BQU8xSCxHQUZXO0FBQUEsU0FIWDtBQUFBLE9BQTlDLENBLytCVTtBQUFBLE1BeS9CVjtBQUFBLE1BQUFwQixDQUFBLENBQUU0YSxJQUFGLEdBQVMsVUFBU2pFLE1BQVQsRUFBaUJrRSxTQUFqQixFQUE0Qi9LLE9BQTVCLEVBQXFDO0FBQUEsUUFDNUMsSUFBSWdCLE1BQUEsR0FBUyxFQUFiLEVBQWlCaEksR0FBQSxHQUFNNk4sTUFBdkIsRUFBK0JuRyxRQUEvQixFQUF5Q3ZOLElBQXpDLENBRDRDO0FBQUEsUUFFNUMsSUFBSTZGLEdBQUEsSUFBTyxJQUFYO0FBQUEsVUFBaUIsT0FBT2dJLE1BQVAsQ0FGMkI7QUFBQSxRQUc1QyxJQUFJOVEsQ0FBQSxDQUFFcVEsVUFBRixDQUFhd0ssU0FBYixDQUFKLEVBQTZCO0FBQUEsVUFDM0I1WCxJQUFBLEdBQU9qRCxDQUFBLENBQUVtYSxPQUFGLENBQVVyUixHQUFWLENBQVAsQ0FEMkI7QUFBQSxVQUUzQjBILFFBQUEsR0FBV1osVUFBQSxDQUFXaUwsU0FBWCxFQUFzQi9LLE9BQXRCLENBRmdCO0FBQUEsU0FBN0IsTUFHTztBQUFBLFVBQ0w3TSxJQUFBLEdBQU9zUyxPQUFBLENBQVEvWSxTQUFSLEVBQW1CLEtBQW5CLEVBQTBCLEtBQTFCLEVBQWlDLENBQWpDLENBQVAsQ0FESztBQUFBLFVBRUxnVSxRQUFBLEdBQVcsVUFBU3JNLEtBQVQsRUFBZ0IvQyxHQUFoQixFQUFxQjBILEdBQXJCLEVBQTBCO0FBQUEsWUFBRSxPQUFPMUgsR0FBQSxJQUFPMEgsR0FBaEI7QUFBQSxXQUFyQyxDQUZLO0FBQUEsVUFHTEEsR0FBQSxHQUFNOUYsTUFBQSxDQUFPOEYsR0FBUCxDQUhEO0FBQUEsU0FOcUM7QUFBQSxRQVc1QyxLQUFLLElBQUkzTSxDQUFBLEdBQUksQ0FBUixFQUFXdUUsTUFBQSxHQUFTdUMsSUFBQSxDQUFLdkMsTUFBekIsQ0FBTCxDQUFzQ3ZFLENBQUEsR0FBSXVFLE1BQTFDLEVBQWtEdkUsQ0FBQSxFQUFsRCxFQUF1RDtBQUFBLFVBQ3JELElBQUlpRixHQUFBLEdBQU02QixJQUFBLENBQUs5RyxDQUFMLENBQVYsQ0FEcUQ7QUFBQSxVQUVyRCxJQUFJZ0ksS0FBQSxHQUFRMkUsR0FBQSxDQUFJMUgsR0FBSixDQUFaLENBRnFEO0FBQUEsVUFHckQsSUFBSW9QLFFBQUEsQ0FBU3JNLEtBQVQsRUFBZ0IvQyxHQUFoQixFQUFxQjBILEdBQXJCLENBQUo7QUFBQSxZQUErQmdJLE1BQUEsQ0FBTzFQLEdBQVAsSUFBYytDLEtBSFE7QUFBQSxTQVhYO0FBQUEsUUFnQjVDLE9BQU8yTSxNQWhCcUM7QUFBQSxPQUE5QyxDQXovQlU7QUFBQSxNQTZnQ1Y7QUFBQSxNQUFBOVEsQ0FBQSxDQUFFOGEsSUFBRixHQUFTLFVBQVNoUyxHQUFULEVBQWMwSCxRQUFkLEVBQXdCVixPQUF4QixFQUFpQztBQUFBLFFBQ3hDLElBQUk5UCxDQUFBLENBQUVxUSxVQUFGLENBQWFHLFFBQWIsQ0FBSixFQUE0QjtBQUFBLFVBQzFCQSxRQUFBLEdBQVd4USxDQUFBLENBQUVzUyxNQUFGLENBQVM5QixRQUFULENBRGU7QUFBQSxTQUE1QixNQUVPO0FBQUEsVUFDTCxJQUFJdk4sSUFBQSxHQUFPakQsQ0FBQSxDQUFFSixHQUFGLENBQU0yVixPQUFBLENBQVEvWSxTQUFSLEVBQW1CLEtBQW5CLEVBQTBCLEtBQTFCLEVBQWlDLENBQWpDLENBQU4sRUFBMkN1ZSxNQUEzQyxDQUFYLENBREs7QUFBQSxVQUVMdkssUUFBQSxHQUFXLFVBQVNyTSxLQUFULEVBQWdCL0MsR0FBaEIsRUFBcUI7QUFBQSxZQUM5QixPQUFPLENBQUNwQixDQUFBLENBQUUwUyxRQUFGLENBQVd6UCxJQUFYLEVBQWlCN0IsR0FBakIsQ0FEc0I7QUFBQSxXQUYzQjtBQUFBLFNBSGlDO0FBQUEsUUFTeEMsT0FBT3BCLENBQUEsQ0FBRTRhLElBQUYsQ0FBTzlSLEdBQVAsRUFBWTBILFFBQVosRUFBc0JWLE9BQXRCLENBVGlDO0FBQUEsT0FBMUMsQ0E3Z0NVO0FBQUEsTUEwaENWO0FBQUEsTUFBQTlQLENBQUEsQ0FBRWdiLFFBQUYsR0FBYXZLLGNBQUEsQ0FBZXpRLENBQUEsQ0FBRW1hLE9BQWpCLEVBQTBCLElBQTFCLENBQWIsQ0ExaENVO0FBQUEsTUEraENWO0FBQUE7QUFBQTtBQUFBLE1BQUFuYSxDQUFBLENBQUV3UCxNQUFGLEdBQVcsVUFBU3hFLFNBQVQsRUFBb0JpUSxLQUFwQixFQUEyQjtBQUFBLFFBQ3BDLElBQUluSyxNQUFBLEdBQVNELFVBQUEsQ0FBVzdGLFNBQVgsQ0FBYixDQURvQztBQUFBLFFBRXBDLElBQUlpUSxLQUFKO0FBQUEsVUFBV2piLENBQUEsQ0FBRTBhLFNBQUYsQ0FBWTVKLE1BQVosRUFBb0JtSyxLQUFwQixFQUZ5QjtBQUFBLFFBR3BDLE9BQU9uSyxNQUg2QjtBQUFBLE9BQXRDLENBL2hDVTtBQUFBLE1Bc2lDVjtBQUFBLE1BQUE5USxDQUFBLENBQUVrYixLQUFGLEdBQVUsVUFBU3BTLEdBQVQsRUFBYztBQUFBLFFBQ3RCLElBQUksQ0FBQzlJLENBQUEsQ0FBRXNPLFFBQUYsQ0FBV3hGLEdBQVgsQ0FBTDtBQUFBLFVBQXNCLE9BQU9BLEdBQVAsQ0FEQTtBQUFBLFFBRXRCLE9BQU85SSxDQUFBLENBQUUwQyxPQUFGLENBQVVvRyxHQUFWLElBQWlCQSxHQUFBLENBQUluTSxLQUFKLEVBQWpCLEdBQStCcUQsQ0FBQSxDQUFFb0YsTUFBRixDQUFTLEVBQVQsRUFBYTBELEdBQWIsQ0FGaEI7QUFBQSxPQUF4QixDQXRpQ1U7QUFBQSxNQThpQ1Y7QUFBQTtBQUFBO0FBQUEsTUFBQTlJLENBQUEsQ0FBRW1iLEdBQUYsR0FBUSxVQUFTclMsR0FBVCxFQUFjc1MsV0FBZCxFQUEyQjtBQUFBLFFBQ2pDQSxXQUFBLENBQVl0UyxHQUFaLEVBRGlDO0FBQUEsUUFFakMsT0FBT0EsR0FGMEI7QUFBQSxPQUFuQyxDQTlpQ1U7QUFBQSxNQW9qQ1Y7QUFBQSxNQUFBOUksQ0FBQSxDQUFFcWIsT0FBRixHQUFZLFVBQVMxRSxNQUFULEVBQWlCMVEsS0FBakIsRUFBd0I7QUFBQSxRQUNsQyxJQUFJaEQsSUFBQSxHQUFPakQsQ0FBQSxDQUFFaUQsSUFBRixDQUFPZ0QsS0FBUCxDQUFYLEVBQTBCdkYsTUFBQSxHQUFTdUMsSUFBQSxDQUFLdkMsTUFBeEMsQ0FEa0M7QUFBQSxRQUVsQyxJQUFJaVcsTUFBQSxJQUFVLElBQWQ7QUFBQSxVQUFvQixPQUFPLENBQUNqVyxNQUFSLENBRmM7QUFBQSxRQUdsQyxJQUFJb0ksR0FBQSxHQUFNOUYsTUFBQSxDQUFPMlQsTUFBUCxDQUFWLENBSGtDO0FBQUEsUUFJbEMsS0FBSyxJQUFJeGEsQ0FBQSxHQUFJLENBQVIsQ0FBTCxDQUFnQkEsQ0FBQSxHQUFJdUUsTUFBcEIsRUFBNEJ2RSxDQUFBLEVBQTVCLEVBQWlDO0FBQUEsVUFDL0IsSUFBSWlGLEdBQUEsR0FBTTZCLElBQUEsQ0FBSzlHLENBQUwsQ0FBVixDQUQrQjtBQUFBLFVBRS9CLElBQUk4SixLQUFBLENBQU03RSxHQUFOLE1BQWUwSCxHQUFBLENBQUkxSCxHQUFKLENBQWYsSUFBMkIsQ0FBRSxDQUFBQSxHQUFBLElBQU8wSCxHQUFQLENBQWpDO0FBQUEsWUFBOEMsT0FBTyxLQUZ0QjtBQUFBLFNBSkM7QUFBQSxRQVFsQyxPQUFPLElBUjJCO0FBQUEsT0FBcEMsQ0FwakNVO0FBQUEsTUFpa0NWO0FBQUEsVUFBSXdTLEVBQUEsR0FBSyxVQUFTblYsQ0FBVCxFQUFZdEgsQ0FBWixFQUFlMGMsTUFBZixFQUF1QkMsTUFBdkIsRUFBK0I7QUFBQSxRQUd0QztBQUFBO0FBQUEsWUFBSXJWLENBQUEsS0FBTXRILENBQVY7QUFBQSxVQUFhLE9BQU9zSCxDQUFBLEtBQU0sQ0FBTixJQUFXLElBQUlBLENBQUosS0FBVSxJQUFJdEgsQ0FBaEMsQ0FIeUI7QUFBQSxRQUt0QztBQUFBLFlBQUlzSCxDQUFBLElBQUssSUFBTCxJQUFhdEgsQ0FBQSxJQUFLLElBQXRCO0FBQUEsVUFBNEIsT0FBT3NILENBQUEsS0FBTXRILENBQWIsQ0FMVTtBQUFBLFFBT3RDO0FBQUEsWUFBSXNILENBQUEsWUFBYW5HLENBQWpCO0FBQUEsVUFBb0JtRyxDQUFBLEdBQUlBLENBQUEsQ0FBRXVKLFFBQU4sQ0FQa0I7QUFBQSxRQVF0QyxJQUFJN1EsQ0FBQSxZQUFhbUIsQ0FBakI7QUFBQSxVQUFvQm5CLENBQUEsR0FBSUEsQ0FBQSxDQUFFNlEsUUFBTixDQVJrQjtBQUFBLFFBVXRDO0FBQUEsWUFBSStMLFNBQUEsR0FBWW5ULFFBQUEsQ0FBUzFMLElBQVQsQ0FBY3VKLENBQWQsQ0FBaEIsQ0FWc0M7QUFBQSxRQVd0QyxJQUFJc1YsU0FBQSxLQUFjblQsUUFBQSxDQUFTMUwsSUFBVCxDQUFjaUMsQ0FBZCxDQUFsQjtBQUFBLFVBQW9DLE9BQU8sS0FBUCxDQVhFO0FBQUEsUUFZdEMsUUFBUTRjLFNBQVI7QUFBQSxRQUVFO0FBQUEsYUFBSyxpQkFBTCxDQUZGO0FBQUEsUUFJRTtBQUFBLGFBQUssaUJBQUw7QUFBQSxVQUdFO0FBQUE7QUFBQSxpQkFBTyxLQUFLdFYsQ0FBTCxLQUFXLEtBQUt0SCxDQUF2QixDQVBKO0FBQUEsUUFRRSxLQUFLLGlCQUFMO0FBQUEsVUFHRTtBQUFBO0FBQUEsY0FBSSxDQUFDc0gsQ0FBRCxLQUFPLENBQUNBLENBQVo7QUFBQSxZQUFlLE9BQU8sQ0FBQ3RILENBQUQsS0FBTyxDQUFDQSxDQUFmLENBSGpCO0FBQUEsVUFLRTtBQUFBLGlCQUFPLENBQUNzSCxDQUFELEtBQU8sQ0FBUCxHQUFXLElBQUksQ0FBQ0EsQ0FBTCxLQUFXLElBQUl0SCxDQUExQixHQUE4QixDQUFDc0gsQ0FBRCxLQUFPLENBQUN0SCxDQUE3QyxDQWJKO0FBQUEsUUFjRSxLQUFLLGVBQUwsQ0FkRjtBQUFBLFFBZUUsS0FBSyxrQkFBTDtBQUFBLFVBSUU7QUFBQTtBQUFBO0FBQUEsaUJBQU8sQ0FBQ3NILENBQUQsS0FBTyxDQUFDdEgsQ0FuQm5CO0FBQUEsU0Fac0M7QUFBQSxRQWtDdEMsSUFBSTZjLFNBQUEsR0FBWUQsU0FBQSxLQUFjLGdCQUE5QixDQWxDc0M7QUFBQSxRQW1DdEMsSUFBSSxDQUFDQyxTQUFMLEVBQWdCO0FBQUEsVUFDZCxJQUFJLE9BQU92VixDQUFQLElBQVksUUFBWixJQUF3QixPQUFPdEgsQ0FBUCxJQUFZLFFBQXhDO0FBQUEsWUFBa0QsT0FBTyxLQUFQLENBRHBDO0FBQUEsVUFLZDtBQUFBO0FBQUEsY0FBSThjLEtBQUEsR0FBUXhWLENBQUEsQ0FBRTZHLFdBQWQsRUFBMkI0TyxLQUFBLEdBQVEvYyxDQUFBLENBQUVtTyxXQUFyQyxDQUxjO0FBQUEsVUFNZCxJQUFJMk8sS0FBQSxLQUFVQyxLQUFWLElBQW1CLENBQUUsQ0FBQTViLENBQUEsQ0FBRXFRLFVBQUYsQ0FBYXNMLEtBQWIsS0FBdUJBLEtBQUEsWUFBaUJBLEtBQXhDLElBQ0EzYixDQUFBLENBQUVxUSxVQUFGLENBQWF1TCxLQUFiLENBREEsSUFDdUJBLEtBQUEsWUFBaUJBLEtBRHhDLENBQXJCLElBRW9CLGtCQUFpQnpWLENBQWpCLElBQXNCLGlCQUFpQnRILENBQXZDLENBRnhCLEVBRW1FO0FBQUEsWUFDakUsT0FBTyxLQUQwRDtBQUFBLFdBUnJEO0FBQUEsU0FuQ3NCO0FBQUEsUUFvRHRDO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFBQTBjLE1BQUEsR0FBU0EsTUFBQSxJQUFVLEVBQW5CLENBcERzQztBQUFBLFFBcUR0Q0MsTUFBQSxHQUFTQSxNQUFBLElBQVUsRUFBbkIsQ0FyRHNDO0FBQUEsUUFzRHRDLElBQUk5YSxNQUFBLEdBQVM2YSxNQUFBLENBQU83YSxNQUFwQixDQXREc0M7QUFBQSxRQXVEdEMsT0FBT0EsTUFBQSxFQUFQLEVBQWlCO0FBQUEsVUFHZjtBQUFBO0FBQUEsY0FBSTZhLE1BQUEsQ0FBTzdhLE1BQVAsTUFBbUJ5RixDQUF2QjtBQUFBLFlBQTBCLE9BQU9xVixNQUFBLENBQU85YSxNQUFQLE1BQW1CN0IsQ0FIckM7QUFBQSxTQXZEcUI7QUFBQSxRQThEdEM7QUFBQSxRQUFBMGMsTUFBQSxDQUFPeGYsSUFBUCxDQUFZb0ssQ0FBWixFQTlEc0M7QUFBQSxRQStEdENxVixNQUFBLENBQU96ZixJQUFQLENBQVk4QyxDQUFaLEVBL0RzQztBQUFBLFFBa0V0QztBQUFBLFlBQUk2YyxTQUFKLEVBQWU7QUFBQSxVQUViO0FBQUEsVUFBQWhiLE1BQUEsR0FBU3lGLENBQUEsQ0FBRXpGLE1BQVgsQ0FGYTtBQUFBLFVBR2IsSUFBSUEsTUFBQSxLQUFXN0IsQ0FBQSxDQUFFNkIsTUFBakI7QUFBQSxZQUF5QixPQUFPLEtBQVAsQ0FIWjtBQUFBLFVBS2I7QUFBQSxpQkFBT0EsTUFBQSxFQUFQLEVBQWlCO0FBQUEsWUFDZixJQUFJLENBQUM0YSxFQUFBLENBQUduVixDQUFBLENBQUV6RixNQUFGLENBQUgsRUFBYzdCLENBQUEsQ0FBRTZCLE1BQUYsQ0FBZCxFQUF5QjZhLE1BQXpCLEVBQWlDQyxNQUFqQyxDQUFMO0FBQUEsY0FBK0MsT0FBTyxLQUR2QztBQUFBLFdBTEo7QUFBQSxTQUFmLE1BUU87QUFBQSxVQUVMO0FBQUEsY0FBSXZZLElBQUEsR0FBT2pELENBQUEsQ0FBRWlELElBQUYsQ0FBT2tELENBQVAsQ0FBWCxFQUFzQi9FLEdBQXRCLENBRks7QUFBQSxVQUdMVixNQUFBLEdBQVN1QyxJQUFBLENBQUt2QyxNQUFkLENBSEs7QUFBQSxVQUtMO0FBQUEsY0FBSVYsQ0FBQSxDQUFFaUQsSUFBRixDQUFPcEUsQ0FBUCxFQUFVNkIsTUFBVixLQUFxQkEsTUFBekI7QUFBQSxZQUFpQyxPQUFPLEtBQVAsQ0FMNUI7QUFBQSxVQU1MLE9BQU9BLE1BQUEsRUFBUCxFQUFpQjtBQUFBLFlBRWY7QUFBQSxZQUFBVSxHQUFBLEdBQU02QixJQUFBLENBQUt2QyxNQUFMLENBQU4sQ0FGZTtBQUFBLFlBR2YsSUFBSSxDQUFFLENBQUFWLENBQUEsQ0FBRXVVLEdBQUYsQ0FBTTFWLENBQU4sRUFBU3VDLEdBQVQsS0FBaUJrYSxFQUFBLENBQUduVixDQUFBLENBQUUvRSxHQUFGLENBQUgsRUFBV3ZDLENBQUEsQ0FBRXVDLEdBQUYsQ0FBWCxFQUFtQm1hLE1BQW5CLEVBQTJCQyxNQUEzQixDQUFqQixDQUFOO0FBQUEsY0FBNEQsT0FBTyxLQUhwRDtBQUFBLFdBTlo7QUFBQSxTQTFFK0I7QUFBQSxRQXVGdEM7QUFBQSxRQUFBRCxNQUFBLENBQU9NLEdBQVAsR0F2RnNDO0FBQUEsUUF3RnRDTCxNQUFBLENBQU9LLEdBQVAsR0F4RnNDO0FBQUEsUUF5RnRDLE9BQU8sSUF6RitCO0FBQUEsT0FBeEMsQ0Fqa0NVO0FBQUEsTUE4cENWO0FBQUEsTUFBQTdiLENBQUEsQ0FBRThiLE9BQUYsR0FBWSxVQUFTM1YsQ0FBVCxFQUFZdEgsQ0FBWixFQUFlO0FBQUEsUUFDekIsT0FBT3ljLEVBQUEsQ0FBR25WLENBQUgsRUFBTXRILENBQU4sQ0FEa0I7QUFBQSxPQUEzQixDQTlwQ1U7QUFBQSxNQW9xQ1Y7QUFBQTtBQUFBLE1BQUFtQixDQUFBLENBQUUrYixPQUFGLEdBQVksVUFBU2pULEdBQVQsRUFBYztBQUFBLFFBQ3hCLElBQUlBLEdBQUEsSUFBTyxJQUFYO0FBQUEsVUFBaUIsT0FBTyxJQUFQLENBRE87QUFBQSxRQUV4QixJQUFJb0ksV0FBQSxDQUFZcEksR0FBWixLQUFxQixDQUFBOUksQ0FBQSxDQUFFMEMsT0FBRixDQUFVb0csR0FBVixLQUFrQjlJLENBQUEsQ0FBRWdjLFFBQUYsQ0FBV2xULEdBQVgsQ0FBbEIsSUFBcUM5SSxDQUFBLENBQUU4VixXQUFGLENBQWNoTixHQUFkLENBQXJDLENBQXpCO0FBQUEsVUFBbUYsT0FBT0EsR0FBQSxDQUFJcEksTUFBSixLQUFlLENBQXRCLENBRjNEO0FBQUEsUUFHeEIsT0FBT1YsQ0FBQSxDQUFFaUQsSUFBRixDQUFPNkYsR0FBUCxFQUFZcEksTUFBWixLQUF1QixDQUhOO0FBQUEsT0FBMUIsQ0FwcUNVO0FBQUEsTUEycUNWO0FBQUEsTUFBQVYsQ0FBQSxDQUFFaWMsU0FBRixHQUFjLFVBQVNuVCxHQUFULEVBQWM7QUFBQSxRQUMxQixPQUFPLENBQUMsQ0FBRSxDQUFBQSxHQUFBLElBQU9BLEdBQUEsQ0FBSXhFLFFBQUosS0FBaUIsQ0FBeEIsQ0FEZ0I7QUFBQSxPQUE1QixDQTNxQ1U7QUFBQSxNQWlyQ1Y7QUFBQTtBQUFBLE1BQUF0RSxDQUFBLENBQUUwQyxPQUFGLEdBQVkwTSxhQUFBLElBQWlCLFVBQVN0RyxHQUFULEVBQWM7QUFBQSxRQUN6QyxPQUFPUixRQUFBLENBQVMxTCxJQUFULENBQWNrTSxHQUFkLE1BQXVCLGdCQURXO0FBQUEsT0FBM0MsQ0FqckNVO0FBQUEsTUFzckNWO0FBQUEsTUFBQTlJLENBQUEsQ0FBRXNPLFFBQUYsR0FBYSxVQUFTeEYsR0FBVCxFQUFjO0FBQUEsUUFDekIsSUFBSS9LLElBQUEsR0FBTyxPQUFPK0ssR0FBbEIsQ0FEeUI7QUFBQSxRQUV6QixPQUFPL0ssSUFBQSxLQUFTLFVBQVQsSUFBdUJBLElBQUEsS0FBUyxRQUFULElBQXFCLENBQUMsQ0FBQytLLEdBRjVCO0FBQUEsT0FBM0IsQ0F0ckNVO0FBQUEsTUE0ckNWO0FBQUEsTUFBQTlJLENBQUEsQ0FBRThDLElBQUYsQ0FBTztBQUFBLFFBQUMsV0FBRDtBQUFBLFFBQWMsVUFBZDtBQUFBLFFBQTBCLFFBQTFCO0FBQUEsUUFBb0MsUUFBcEM7QUFBQSxRQUE4QyxNQUE5QztBQUFBLFFBQXNELFFBQXREO0FBQUEsUUFBZ0UsT0FBaEU7QUFBQSxPQUFQLEVBQWlGLFVBQVNqSCxJQUFULEVBQWU7QUFBQSxRQUM5Rm1FLENBQUEsQ0FBRSxPQUFPbkUsSUFBVCxJQUFpQixVQUFTaU4sR0FBVCxFQUFjO0FBQUEsVUFDN0IsT0FBT1IsUUFBQSxDQUFTMUwsSUFBVCxDQUFja00sR0FBZCxNQUF1QixhQUFhak4sSUFBYixHQUFvQixHQURyQjtBQUFBLFNBRCtEO0FBQUEsT0FBaEcsRUE1ckNVO0FBQUEsTUFvc0NWO0FBQUE7QUFBQSxVQUFJLENBQUNtRSxDQUFBLENBQUU4VixXQUFGLENBQWN0WixTQUFkLENBQUwsRUFBK0I7QUFBQSxRQUM3QndELENBQUEsQ0FBRThWLFdBQUYsR0FBZ0IsVUFBU2hOLEdBQVQsRUFBYztBQUFBLFVBQzVCLE9BQU85SSxDQUFBLENBQUV1VSxHQUFGLENBQU16TCxHQUFOLEVBQVcsUUFBWCxDQURxQjtBQUFBLFNBREQ7QUFBQSxPQXBzQ3JCO0FBQUEsTUE0c0NWO0FBQUE7QUFBQSxVQUFJLE9BQU8sR0FBUCxJQUFjLFVBQWQsSUFBNEIsT0FBT29ULFNBQVAsSUFBb0IsUUFBcEQsRUFBOEQ7QUFBQSxRQUM1RGxjLENBQUEsQ0FBRXFRLFVBQUYsR0FBZSxVQUFTdkgsR0FBVCxFQUFjO0FBQUEsVUFDM0IsT0FBTyxPQUFPQSxHQUFQLElBQWMsVUFBZCxJQUE0QixLQURSO0FBQUEsU0FEK0I7QUFBQSxPQTVzQ3BEO0FBQUEsTUFtdENWO0FBQUEsTUFBQTlJLENBQUEsQ0FBRW1jLFFBQUYsR0FBYSxVQUFTclQsR0FBVCxFQUFjO0FBQUEsUUFDekIsT0FBT3FULFFBQUEsQ0FBU3JULEdBQVQsS0FBaUIsQ0FBQ3VPLEtBQUEsQ0FBTStFLFVBQUEsQ0FBV3RULEdBQVgsQ0FBTixDQURBO0FBQUEsT0FBM0IsQ0FudENVO0FBQUEsTUF3dENWO0FBQUEsTUFBQTlJLENBQUEsQ0FBRXFYLEtBQUYsR0FBVSxVQUFTdk8sR0FBVCxFQUFjO0FBQUEsUUFDdEIsT0FBTzlJLENBQUEsQ0FBRXFjLFFBQUYsQ0FBV3ZULEdBQVgsS0FBbUJBLEdBQUEsS0FBUSxDQUFDQSxHQURiO0FBQUEsT0FBeEIsQ0F4dENVO0FBQUEsTUE2dENWO0FBQUEsTUFBQTlJLENBQUEsQ0FBRW9XLFNBQUYsR0FBYyxVQUFTdE4sR0FBVCxFQUFjO0FBQUEsUUFDMUIsT0FBT0EsR0FBQSxLQUFRLElBQVIsSUFBZ0JBLEdBQUEsS0FBUSxLQUF4QixJQUFpQ1IsUUFBQSxDQUFTMUwsSUFBVCxDQUFja00sR0FBZCxNQUF1QixrQkFEckM7QUFBQSxPQUE1QixDQTd0Q1U7QUFBQSxNQWt1Q1Y7QUFBQSxNQUFBOUksQ0FBQSxDQUFFc2MsTUFBRixHQUFXLFVBQVN4VCxHQUFULEVBQWM7QUFBQSxRQUN2QixPQUFPQSxHQUFBLEtBQVEsSUFEUTtBQUFBLE9BQXpCLENBbHVDVTtBQUFBLE1BdXVDVjtBQUFBLE1BQUE5SSxDQUFBLENBQUV1YyxXQUFGLEdBQWdCLFVBQVN6VCxHQUFULEVBQWM7QUFBQSxRQUM1QixPQUFPQSxHQUFBLEtBQVEsS0FBSyxDQURRO0FBQUEsT0FBOUIsQ0F2dUNVO0FBQUEsTUE2dUNWO0FBQUE7QUFBQSxNQUFBOUksQ0FBQSxDQUFFdVUsR0FBRixHQUFRLFVBQVN6TCxHQUFULEVBQWMxSCxHQUFkLEVBQW1CO0FBQUEsUUFDekIsT0FBTzBILEdBQUEsSUFBTyxJQUFQLElBQWVvRSxjQUFBLENBQWV0USxJQUFmLENBQW9Ca00sR0FBcEIsRUFBeUIxSCxHQUF6QixDQURHO0FBQUEsT0FBM0IsQ0E3dUNVO0FBQUEsTUFzdkNWO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQXBCLENBQUEsQ0FBRXdjLFVBQUYsR0FBZSxZQUFXO0FBQUEsUUFDeEJ6YSxJQUFBLENBQUsvQixDQUFMLEdBQVNnUCxrQkFBVCxDQUR3QjtBQUFBLFFBRXhCLE9BQU8sSUFGaUI7QUFBQSxPQUExQixDQXR2Q1U7QUFBQSxNQTR2Q1Y7QUFBQSxNQUFBaFAsQ0FBQSxDQUFFb1EsUUFBRixHQUFhLFVBQVNqTSxLQUFULEVBQWdCO0FBQUEsUUFDM0IsT0FBT0EsS0FEb0I7QUFBQSxPQUE3QixDQTV2Q1U7QUFBQSxNQWl3Q1Y7QUFBQSxNQUFBbkUsQ0FBQSxDQUFFeWMsUUFBRixHQUFhLFVBQVN0WSxLQUFULEVBQWdCO0FBQUEsUUFDM0IsT0FBTyxZQUFXO0FBQUEsVUFDaEIsT0FBT0EsS0FEUztBQUFBLFNBRFM7QUFBQSxPQUE3QixDQWp3Q1U7QUFBQSxNQXV3Q1ZuRSxDQUFBLENBQUUwYyxJQUFGLEdBQVMsWUFBVTtBQUFBLE9BQW5CLENBdndDVTtBQUFBLE1BeXdDVjFjLENBQUEsQ0FBRXVRLFFBQUYsR0FBYUEsUUFBYixDQXp3Q1U7QUFBQSxNQTR3Q1Y7QUFBQSxNQUFBdlEsQ0FBQSxDQUFFMmMsVUFBRixHQUFlLFVBQVM3VCxHQUFULEVBQWM7QUFBQSxRQUMzQixPQUFPQSxHQUFBLElBQU8sSUFBUCxHQUFjLFlBQVU7QUFBQSxTQUF4QixHQUE2QixVQUFTMUgsR0FBVCxFQUFjO0FBQUEsVUFDaEQsT0FBTzBILEdBQUEsQ0FBSTFILEdBQUosQ0FEeUM7QUFBQSxTQUR2QjtBQUFBLE9BQTdCLENBNXdDVTtBQUFBLE1Bb3hDVjtBQUFBO0FBQUEsTUFBQXBCLENBQUEsQ0FBRXNRLE9BQUYsR0FBWXRRLENBQUEsQ0FBRWMsT0FBRixHQUFZLFVBQVNtRixLQUFULEVBQWdCO0FBQUEsUUFDdENBLEtBQUEsR0FBUWpHLENBQUEsQ0FBRTBhLFNBQUYsQ0FBWSxFQUFaLEVBQWdCelUsS0FBaEIsQ0FBUixDQURzQztBQUFBLFFBRXRDLE9BQU8sVUFBUzZDLEdBQVQsRUFBYztBQUFBLFVBQ25CLE9BQU85SSxDQUFBLENBQUVxYixPQUFGLENBQVV2UyxHQUFWLEVBQWU3QyxLQUFmLENBRFk7QUFBQSxTQUZpQjtBQUFBLE9BQXhDLENBcHhDVTtBQUFBLE1BNHhDVjtBQUFBLE1BQUFqRyxDQUFBLENBQUUwWixLQUFGLEdBQVUsVUFBUzVaLENBQVQsRUFBWTBRLFFBQVosRUFBc0JWLE9BQXRCLEVBQStCO0FBQUEsUUFDdkMsSUFBSThNLEtBQUEsR0FBUW5hLEtBQUEsQ0FBTWdFLElBQUEsQ0FBSzZNLEdBQUwsQ0FBUyxDQUFULEVBQVl4VCxDQUFaLENBQU4sQ0FBWixDQUR1QztBQUFBLFFBRXZDMFEsUUFBQSxHQUFXWixVQUFBLENBQVdZLFFBQVgsRUFBcUJWLE9BQXJCLEVBQThCLENBQTlCLENBQVgsQ0FGdUM7QUFBQSxRQUd2QyxLQUFLLElBQUkzVCxDQUFBLEdBQUksQ0FBUixDQUFMLENBQWdCQSxDQUFBLEdBQUkyRCxDQUFwQixFQUF1QjNELENBQUEsRUFBdkI7QUFBQSxVQUE0QnlnQixLQUFBLENBQU16Z0IsQ0FBTixJQUFXcVUsUUFBQSxDQUFTclUsQ0FBVCxDQUFYLENBSFc7QUFBQSxRQUl2QyxPQUFPeWdCLEtBSmdDO0FBQUEsT0FBekMsQ0E1eENVO0FBQUEsTUFveUNWO0FBQUEsTUFBQTVjLENBQUEsQ0FBRTBHLE1BQUYsR0FBVyxVQUFTK00sR0FBVCxFQUFjSCxHQUFkLEVBQW1CO0FBQUEsUUFDNUIsSUFBSUEsR0FBQSxJQUFPLElBQVgsRUFBaUI7QUFBQSxVQUNmQSxHQUFBLEdBQU1HLEdBQU4sQ0FEZTtBQUFBLFVBRWZBLEdBQUEsR0FBTSxDQUZTO0FBQUEsU0FEVztBQUFBLFFBSzVCLE9BQU9BLEdBQUEsR0FBTWhOLElBQUEsQ0FBS3lRLEtBQUwsQ0FBV3pRLElBQUEsQ0FBS0MsTUFBTCxLQUFpQixDQUFBNE0sR0FBQSxHQUFNRyxHQUFOLEdBQVksQ0FBWixDQUE1QixDQUxlO0FBQUEsT0FBOUIsQ0FweUNVO0FBQUEsTUE2eUNWO0FBQUEsTUFBQXpULENBQUEsQ0FBRStZLEdBQUYsR0FBUXhTLElBQUEsQ0FBS3dTLEdBQUwsSUFBWSxZQUFXO0FBQUEsUUFDN0IsT0FBTyxJQUFJeFMsSUFBSixHQUFXQyxPQUFYLEVBRHNCO0FBQUEsT0FBL0IsQ0E3eUNVO0FBQUEsTUFrekNWO0FBQUEsVUFBSXFXLFNBQUEsR0FBWTtBQUFBLFFBQ2QsS0FBSyxPQURTO0FBQUEsUUFFZCxLQUFLLE1BRlM7QUFBQSxRQUdkLEtBQUssTUFIUztBQUFBLFFBSWQsS0FBSyxRQUpTO0FBQUEsUUFLZCxLQUFLLFFBTFM7QUFBQSxRQU1kLEtBQUssUUFOUztBQUFBLE9BQWhCLENBbHpDVTtBQUFBLE1BMHpDVixJQUFJQyxXQUFBLEdBQWM5YyxDQUFBLENBQUVzYSxNQUFGLENBQVN1QyxTQUFULENBQWxCLENBMXpDVTtBQUFBLE1BNnpDVjtBQUFBLFVBQUlFLGFBQUEsR0FBZ0IsVUFBU25kLEdBQVQsRUFBYztBQUFBLFFBQ2hDLElBQUlvZCxPQUFBLEdBQVUsVUFBUzlXLEtBQVQsRUFBZ0I7QUFBQSxVQUM1QixPQUFPdEcsR0FBQSxDQUFJc0csS0FBSixDQURxQjtBQUFBLFNBQTlCLENBRGdDO0FBQUEsUUFLaEM7QUFBQSxZQUFJakgsTUFBQSxHQUFTLFFBQVFlLENBQUEsQ0FBRWlELElBQUYsQ0FBT3JELEdBQVAsRUFBWUMsSUFBWixDQUFpQixHQUFqQixDQUFSLEdBQWdDLEdBQTdDLENBTGdDO0FBQUEsUUFNaEMsSUFBSW9kLFVBQUEsR0FBYWplLE1BQUEsQ0FBT0MsTUFBUCxDQUFqQixDQU5nQztBQUFBLFFBT2hDLElBQUlpZSxhQUFBLEdBQWdCbGUsTUFBQSxDQUFPQyxNQUFQLEVBQWUsR0FBZixDQUFwQixDQVBnQztBQUFBLFFBUWhDLE9BQU8sVUFBU2tlLE1BQVQsRUFBaUI7QUFBQSxVQUN0QkEsTUFBQSxHQUFTQSxNQUFBLElBQVUsSUFBVixHQUFpQixFQUFqQixHQUFzQixLQUFLQSxNQUFwQyxDQURzQjtBQUFBLFVBRXRCLE9BQU9GLFVBQUEsQ0FBV2xlLElBQVgsQ0FBZ0JvZSxNQUFoQixJQUEwQkEsTUFBQSxDQUFPdmhCLE9BQVAsQ0FBZXNoQixhQUFmLEVBQThCRixPQUE5QixDQUExQixHQUFtRUcsTUFGcEQ7QUFBQSxTQVJRO0FBQUEsT0FBbEMsQ0E3ekNVO0FBQUEsTUEwMENWbmQsQ0FBQSxDQUFFb2QsTUFBRixHQUFXTCxhQUFBLENBQWNGLFNBQWQsQ0FBWCxDQTEwQ1U7QUFBQSxNQTIwQ1Y3YyxDQUFBLENBQUVxZCxRQUFGLEdBQWFOLGFBQUEsQ0FBY0QsV0FBZCxDQUFiLENBMzBDVTtBQUFBLE1BKzBDVjtBQUFBO0FBQUEsTUFBQTljLENBQUEsQ0FBRThRLE1BQUYsR0FBVyxVQUFTNkYsTUFBVCxFQUFpQnBHLFFBQWpCLEVBQTJCK00sUUFBM0IsRUFBcUM7QUFBQSxRQUM5QyxJQUFJblosS0FBQSxHQUFRd1MsTUFBQSxJQUFVLElBQVYsR0FBaUIsS0FBSyxDQUF0QixHQUEwQkEsTUFBQSxDQUFPcEcsUUFBUCxDQUF0QyxDQUQ4QztBQUFBLFFBRTlDLElBQUlwTSxLQUFBLEtBQVUsS0FBSyxDQUFuQixFQUFzQjtBQUFBLFVBQ3BCQSxLQUFBLEdBQVFtWixRQURZO0FBQUEsU0FGd0I7QUFBQSxRQUs5QyxPQUFPdGQsQ0FBQSxDQUFFcVEsVUFBRixDQUFhbE0sS0FBYixJQUFzQkEsS0FBQSxDQUFNdkgsSUFBTixDQUFXK1osTUFBWCxDQUF0QixHQUEyQ3hTLEtBTEo7QUFBQSxPQUFoRCxDQS8wQ1U7QUFBQSxNQXkxQ1Y7QUFBQTtBQUFBLFVBQUlvWixTQUFBLEdBQVksQ0FBaEIsQ0F6MUNVO0FBQUEsTUEwMUNWdmQsQ0FBQSxDQUFFd2QsUUFBRixHQUFhLFVBQVNDLE1BQVQsRUFBaUI7QUFBQSxRQUM1QixJQUFJeFAsRUFBQSxHQUFLLEVBQUVzUCxTQUFGLEdBQWMsRUFBdkIsQ0FENEI7QUFBQSxRQUU1QixPQUFPRSxNQUFBLEdBQVNBLE1BQUEsR0FBU3hQLEVBQWxCLEdBQXVCQSxFQUZGO0FBQUEsT0FBOUIsQ0ExMUNVO0FBQUEsTUFpMkNWO0FBQUE7QUFBQSxNQUFBak8sQ0FBQSxDQUFFMGQsZ0JBQUYsR0FBcUI7QUFBQSxRQUNuQkMsUUFBQSxFQUFjLGlCQURLO0FBQUEsUUFFbkJDLFdBQUEsRUFBYyxrQkFGSztBQUFBLFFBR25CUixNQUFBLEVBQWMsa0JBSEs7QUFBQSxPQUFyQixDQWoyQ1U7QUFBQSxNQTAyQ1Y7QUFBQTtBQUFBO0FBQUEsVUFBSVMsT0FBQSxHQUFVLE1BQWQsQ0ExMkNVO0FBQUEsTUE4MkNWO0FBQUE7QUFBQSxVQUFJQyxPQUFBLEdBQVU7QUFBQSxRQUNaLEtBQVUsR0FERTtBQUFBLFFBRVosTUFBVSxJQUZFO0FBQUEsUUFHWixNQUFVLEdBSEU7QUFBQSxRQUlaLE1BQVUsR0FKRTtBQUFBLFFBS1osVUFBVSxPQUxFO0FBQUEsUUFNWixVQUFVLE9BTkU7QUFBQSxPQUFkLENBOTJDVTtBQUFBLE1BdTNDVixJQUFJZCxPQUFBLEdBQVUsMkJBQWQsQ0F2M0NVO0FBQUEsTUF5M0NWLElBQUllLFVBQUEsR0FBYSxVQUFTN1gsS0FBVCxFQUFnQjtBQUFBLFFBQy9CLE9BQU8sT0FBTzRYLE9BQUEsQ0FBUTVYLEtBQVIsQ0FEaUI7QUFBQSxPQUFqQyxDQXozQ1U7QUFBQSxNQWk0Q1Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBbEcsQ0FBQSxDQUFFMkIsUUFBRixHQUFhLFVBQVNxYyxJQUFULEVBQWU1aUIsUUFBZixFQUF5QjZpQixXQUF6QixFQUFzQztBQUFBLFFBQ2pELElBQUksQ0FBQzdpQixRQUFELElBQWE2aUIsV0FBakI7QUFBQSxVQUE4QjdpQixRQUFBLEdBQVc2aUIsV0FBWCxDQURtQjtBQUFBLFFBRWpEN2lCLFFBQUEsR0FBVzRFLENBQUEsQ0FBRWdiLFFBQUYsQ0FBVyxFQUFYLEVBQWU1ZixRQUFmLEVBQXlCNEUsQ0FBQSxDQUFFMGQsZ0JBQTNCLENBQVgsQ0FGaUQ7QUFBQSxRQUtqRDtBQUFBLFlBQUlwTixPQUFBLEdBQVV0UixNQUFBLENBQU87QUFBQSxVQUNsQixDQUFBNUQsUUFBQSxDQUFTZ2lCLE1BQVQsSUFBbUJTLE9BQW5CLENBQUQsQ0FBNkI1ZSxNQURWO0FBQUEsVUFFbEIsQ0FBQTdELFFBQUEsQ0FBU3dpQixXQUFULElBQXdCQyxPQUF4QixDQUFELENBQWtDNWUsTUFGZjtBQUFBLFVBR2xCLENBQUE3RCxRQUFBLENBQVN1aUIsUUFBVCxJQUFxQkUsT0FBckIsQ0FBRCxDQUErQjVlLE1BSFo7QUFBQSxVQUluQlksSUFKbUIsQ0FJZCxHQUpjLElBSVAsSUFKQSxFQUlNLEdBSk4sQ0FBZCxDQUxpRDtBQUFBLFFBWWpEO0FBQUEsWUFBSW9RLEtBQUEsR0FBUSxDQUFaLENBWmlEO0FBQUEsUUFhakQsSUFBSWhSLE1BQUEsR0FBUyxRQUFiLENBYmlEO0FBQUEsUUFjakQrZSxJQUFBLENBQUtwaUIsT0FBTCxDQUFhMFUsT0FBYixFQUFzQixVQUFTcEssS0FBVCxFQUFnQmtYLE1BQWhCLEVBQXdCUSxXQUF4QixFQUFxQ0QsUUFBckMsRUFBK0NPLE1BQS9DLEVBQXVEO0FBQUEsVUFDM0VqZixNQUFBLElBQVUrZSxJQUFBLENBQUtyaEIsS0FBTCxDQUFXc1QsS0FBWCxFQUFrQmlPLE1BQWxCLEVBQTBCdGlCLE9BQTFCLENBQWtDb2hCLE9BQWxDLEVBQTJDZSxVQUEzQyxDQUFWLENBRDJFO0FBQUEsVUFFM0U5TixLQUFBLEdBQVFpTyxNQUFBLEdBQVNoWSxLQUFBLENBQU14RixNQUF2QixDQUYyRTtBQUFBLFVBSTNFLElBQUkwYyxNQUFKLEVBQVk7QUFBQSxZQUNWbmUsTUFBQSxJQUFVLGdCQUFnQm1lLE1BQWhCLEdBQXlCLGdDQUR6QjtBQUFBLFdBQVosTUFFTyxJQUFJUSxXQUFKLEVBQWlCO0FBQUEsWUFDdEIzZSxNQUFBLElBQVUsZ0JBQWdCMmUsV0FBaEIsR0FBOEIsc0JBRGxCO0FBQUEsV0FBakIsTUFFQSxJQUFJRCxRQUFKLEVBQWM7QUFBQSxZQUNuQjFlLE1BQUEsSUFBVSxTQUFTMGUsUUFBVCxHQUFvQixVQURYO0FBQUEsV0FSc0Q7QUFBQSxVQWEzRTtBQUFBLGlCQUFPelgsS0Fib0U7QUFBQSxTQUE3RSxFQWRpRDtBQUFBLFFBNkJqRGpILE1BQUEsSUFBVSxNQUFWLENBN0JpRDtBQUFBLFFBZ0NqRDtBQUFBLFlBQUksQ0FBQzdELFFBQUEsQ0FBUytpQixRQUFkO0FBQUEsVUFBd0JsZixNQUFBLEdBQVMscUJBQXFCQSxNQUFyQixHQUE4QixLQUF2QyxDQWhDeUI7QUFBQSxRQWtDakRBLE1BQUEsR0FBUyw2Q0FDUCxtREFETyxHQUVQQSxNQUZPLEdBRUUsZUFGWCxDQWxDaUQ7QUFBQSxRQXNDakQsSUFBSTtBQUFBLFVBQ0YsSUFBSW1mLE1BQUEsR0FBUyxJQUFJMWUsUUFBSixDQUFhdEUsUUFBQSxDQUFTK2lCLFFBQVQsSUFBcUIsS0FBbEMsRUFBeUMsR0FBekMsRUFBOENsZixNQUE5QyxDQURYO0FBQUEsU0FBSixDQUVFLE9BQU91SSxDQUFQLEVBQVU7QUFBQSxVQUNWQSxDQUFBLENBQUV2SSxNQUFGLEdBQVdBLE1BQVgsQ0FEVTtBQUFBLFVBRVYsTUFBTXVJLENBRkk7QUFBQSxTQXhDcUM7QUFBQSxRQTZDakQsSUFBSTdGLFFBQUEsR0FBVyxVQUFTcEMsSUFBVCxFQUFlO0FBQUEsVUFDNUIsT0FBTzZlLE1BQUEsQ0FBT3hoQixJQUFQLENBQVksSUFBWixFQUFrQjJDLElBQWxCLEVBQXdCUyxDQUF4QixDQURxQjtBQUFBLFNBQTlCLENBN0NpRDtBQUFBLFFBa0RqRDtBQUFBLFlBQUlxZSxRQUFBLEdBQVdqakIsUUFBQSxDQUFTK2lCLFFBQVQsSUFBcUIsS0FBcEMsQ0FsRGlEO0FBQUEsUUFtRGpEeGMsUUFBQSxDQUFTMUMsTUFBVCxHQUFrQixjQUFjb2YsUUFBZCxHQUF5QixNQUF6QixHQUFrQ3BmLE1BQWxDLEdBQTJDLEdBQTdELENBbkRpRDtBQUFBLFFBcURqRCxPQUFPMEMsUUFyRDBDO0FBQUEsT0FBbkQsQ0FqNENVO0FBQUEsTUEwN0NWO0FBQUEsTUFBQTNCLENBQUEsQ0FBRXNlLEtBQUYsR0FBVSxVQUFTeFYsR0FBVCxFQUFjO0FBQUEsUUFDdEIsSUFBSXlWLFFBQUEsR0FBV3ZlLENBQUEsQ0FBRThJLEdBQUYsQ0FBZixDQURzQjtBQUFBLFFBRXRCeVYsUUFBQSxDQUFTQyxNQUFULEdBQWtCLElBQWxCLENBRnNCO0FBQUEsUUFHdEIsT0FBT0QsUUFIZTtBQUFBLE9BQXhCLENBMTdDVTtBQUFBLE1BdThDVjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUFJek4sTUFBQSxHQUFTLFVBQVN5TixRQUFULEVBQW1CelYsR0FBbkIsRUFBd0I7QUFBQSxRQUNuQyxPQUFPeVYsUUFBQSxDQUFTQyxNQUFULEdBQWtCeGUsQ0FBQSxDQUFFOEksR0FBRixFQUFPd1YsS0FBUCxFQUFsQixHQUFtQ3hWLEdBRFA7QUFBQSxPQUFyQyxDQXY4Q1U7QUFBQSxNQTQ4Q1Y7QUFBQSxNQUFBOUksQ0FBQSxDQUFFL0MsS0FBRixHQUFVLFVBQVM2TCxHQUFULEVBQWM7QUFBQSxRQUN0QjlJLENBQUEsQ0FBRThDLElBQUYsQ0FBTzlDLENBQUEsQ0FBRXVhLFNBQUYsQ0FBWXpSLEdBQVosQ0FBUCxFQUF5QixVQUFTak4sSUFBVCxFQUFlO0FBQUEsVUFDdEMsSUFBSWdVLElBQUEsR0FBTzdQLENBQUEsQ0FBRW5FLElBQUYsSUFBVWlOLEdBQUEsQ0FBSWpOLElBQUosQ0FBckIsQ0FEc0M7QUFBQSxVQUV0Q21FLENBQUEsQ0FBRWdMLFNBQUYsQ0FBWW5QLElBQVosSUFBb0IsWUFBVztBQUFBLFlBQzdCLElBQUlhLElBQUEsR0FBTyxDQUFDLEtBQUtnVCxRQUFOLENBQVgsQ0FENkI7QUFBQSxZQUU3QjNULElBQUEsQ0FBS1EsS0FBTCxDQUFXRyxJQUFYLEVBQWlCRixTQUFqQixFQUY2QjtBQUFBLFlBRzdCLE9BQU9zVSxNQUFBLENBQU8sSUFBUCxFQUFhakIsSUFBQSxDQUFLdFQsS0FBTCxDQUFXeUQsQ0FBWCxFQUFjdEQsSUFBZCxDQUFiLENBSHNCO0FBQUEsV0FGTztBQUFBLFNBQXhDLENBRHNCO0FBQUEsT0FBeEIsQ0E1OENVO0FBQUEsTUF3OUNWO0FBQUEsTUFBQXNELENBQUEsQ0FBRS9DLEtBQUYsQ0FBUStDLENBQVIsRUF4OUNVO0FBQUEsTUEyOUNWO0FBQUEsTUFBQUEsQ0FBQSxDQUFFOEMsSUFBRixDQUFPO0FBQUEsUUFBQyxLQUFEO0FBQUEsUUFBUSxNQUFSO0FBQUEsUUFBZ0IsU0FBaEI7QUFBQSxRQUEyQixPQUEzQjtBQUFBLFFBQW9DLE1BQXBDO0FBQUEsUUFBNEMsUUFBNUM7QUFBQSxRQUFzRCxTQUF0RDtBQUFBLE9BQVAsRUFBeUUsVUFBU2pILElBQVQsRUFBZTtBQUFBLFFBQ3RGLElBQUlvWCxNQUFBLEdBQVNoRSxVQUFBLENBQVdwVCxJQUFYLENBQWIsQ0FEc0Y7QUFBQSxRQUV0Rm1FLENBQUEsQ0FBRWdMLFNBQUYsQ0FBWW5QLElBQVosSUFBb0IsWUFBVztBQUFBLFVBQzdCLElBQUlpTixHQUFBLEdBQU0sS0FBSzRHLFFBQWYsQ0FENkI7QUFBQSxVQUU3QnVELE1BQUEsQ0FBTzFXLEtBQVAsQ0FBYXVNLEdBQWIsRUFBa0J0TSxTQUFsQixFQUY2QjtBQUFBLFVBRzdCLElBQUssQ0FBQVgsSUFBQSxLQUFTLE9BQVQsSUFBb0JBLElBQUEsS0FBUyxRQUE3QixDQUFELElBQTJDaU4sR0FBQSxDQUFJcEksTUFBSixLQUFlLENBQTlEO0FBQUEsWUFBaUUsT0FBT29JLEdBQUEsQ0FBSSxDQUFKLENBQVAsQ0FIcEM7QUFBQSxVQUk3QixPQUFPZ0ksTUFBQSxDQUFPLElBQVAsRUFBYWhJLEdBQWIsQ0FKc0I7QUFBQSxTQUZ1RDtBQUFBLE9BQXhGLEVBMzlDVTtBQUFBLE1BcytDVjtBQUFBLE1BQUE5SSxDQUFBLENBQUU4QyxJQUFGLENBQU87QUFBQSxRQUFDLFFBQUQ7QUFBQSxRQUFXLE1BQVg7QUFBQSxRQUFtQixPQUFuQjtBQUFBLE9BQVAsRUFBb0MsVUFBU2pILElBQVQsRUFBZTtBQUFBLFFBQ2pELElBQUlvWCxNQUFBLEdBQVNoRSxVQUFBLENBQVdwVCxJQUFYLENBQWIsQ0FEaUQ7QUFBQSxRQUVqRG1FLENBQUEsQ0FBRWdMLFNBQUYsQ0FBWW5QLElBQVosSUFBb0IsWUFBVztBQUFBLFVBQzdCLE9BQU9pVixNQUFBLENBQU8sSUFBUCxFQUFhbUMsTUFBQSxDQUFPMVcsS0FBUCxDQUFhLEtBQUttVCxRQUFsQixFQUE0QmxULFNBQTVCLENBQWIsQ0FEc0I7QUFBQSxTQUZrQjtBQUFBLE9BQW5ELEVBdCtDVTtBQUFBLE1BOCtDVjtBQUFBLE1BQUF3RCxDQUFBLENBQUVnTCxTQUFGLENBQVk3RyxLQUFaLEdBQW9CLFlBQVc7QUFBQSxRQUM3QixPQUFPLEtBQUt1TCxRQURpQjtBQUFBLE9BQS9CLENBOStDVTtBQUFBLE1Bby9DVjtBQUFBO0FBQUEsTUFBQTFQLENBQUEsQ0FBRWdMLFNBQUYsQ0FBWXlULE9BQVosR0FBc0J6ZSxDQUFBLENBQUVnTCxTQUFGLENBQVkwVCxNQUFaLEdBQXFCMWUsQ0FBQSxDQUFFZ0wsU0FBRixDQUFZN0csS0FBdkQsQ0FwL0NVO0FBQUEsTUFzL0NWbkUsQ0FBQSxDQUFFZ0wsU0FBRixDQUFZMUMsUUFBWixHQUF1QixZQUFXO0FBQUEsUUFDaEMsT0FBTyxLQUFLLEtBQUtvSCxRQURlO0FBQUEsT0FBbEMsQ0F0L0NVO0FBQUEsTUFpZ0RWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFBSSxPQUFPckQsTUFBUCxLQUFrQixVQUFsQixJQUFnQ0EsTUFBQSxDQUFPQyxHQUEzQyxFQUFnRDtBQUFBLFFBQzlDRCxNQUFBLENBQU8sWUFBUCxFQUFxQixFQUFyQixFQUF5QixZQUFXO0FBQUEsVUFDbEMsT0FBT3JNLENBRDJCO0FBQUEsU0FBcEMsQ0FEOEM7QUFBQSxPQWpnRHRDO0FBQUEsS0FBWCxDQXNnRENwRCxJQXRnREQsQ0FzZ0RNLElBdGdETixDQUFELEM7Ozs7SUN1QkE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBQyxVQUFVK2hCLFVBQVYsRUFBc0I7QUFBQSxNQUNuQixhQURtQjtBQUFBLE1BU25CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUFJLE9BQU9DLFNBQVAsS0FBcUIsVUFBekIsRUFBcUM7QUFBQSxRQUNqQ0EsU0FBQSxDQUFVLFNBQVYsRUFBcUJELFVBQXJCO0FBRGlDLE9BQXJDLE1BSU8sSUFBSSxPQUFPeFMsT0FBUCxLQUFtQixRQUFuQixJQUErQixPQUFPQyxNQUFQLEtBQWtCLFFBQXJELEVBQStEO0FBQUEsUUFDbEVBLE1BQUEsQ0FBT0QsT0FBUCxHQUFpQndTLFVBQUEsRUFBakI7QUFEa0UsT0FBL0QsTUFJQSxJQUFJLE9BQU90UyxNQUFQLEtBQWtCLFVBQWxCLElBQWdDQSxNQUFBLENBQU9DLEdBQTNDLEVBQWdEO0FBQUEsUUFDbkRELE1BQUEsQ0FBT3NTLFVBQVA7QUFEbUQsT0FBaEQsTUFJQSxJQUFJLE9BQU9FLEdBQVAsS0FBZSxXQUFuQixFQUFnQztBQUFBLFFBQ25DLElBQUksQ0FBQ0EsR0FBQSxDQUFJQyxFQUFKLEVBQUwsRUFBZTtBQUFBLFVBQ1gsTUFEVztBQUFBLFNBQWYsTUFFTztBQUFBLFVBQ0hELEdBQUEsQ0FBSUUsS0FBSixHQUFZSixVQURUO0FBQUE7QUFINEIsT0FBaEMsTUFRQSxJQUFJLE9BQU8xakIsTUFBUCxLQUFrQixXQUFsQixJQUFpQyxPQUFPd0ssSUFBUCxLQUFnQixXQUFyRCxFQUFrRTtBQUFBLFFBR3JFO0FBQUE7QUFBQSxZQUFJdkcsTUFBQSxHQUFTLE9BQU9qRSxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQSxNQUFoQyxHQUF5Q3dLLElBQXRELENBSHFFO0FBQUEsUUFPckU7QUFBQTtBQUFBLFlBQUl1WixTQUFBLEdBQVk5ZixNQUFBLENBQU8yTixDQUF2QixDQVBxRTtBQUFBLFFBUXJFM04sTUFBQSxDQUFPMk4sQ0FBUCxHQUFXOFIsVUFBQSxFQUFYLENBUnFFO0FBQUEsUUFZckU7QUFBQTtBQUFBLFFBQUF6ZixNQUFBLENBQU8yTixDQUFQLENBQVMyUCxVQUFULEdBQXNCLFlBQVk7QUFBQSxVQUM5QnRkLE1BQUEsQ0FBTzJOLENBQVAsR0FBV21TLFNBQVgsQ0FEOEI7QUFBQSxVQUU5QixPQUFPLElBRnVCO0FBQUEsU0FabUM7QUFBQSxPQUFsRSxNQWlCQTtBQUFBLFFBQ0gsTUFBTSxJQUFJN0csS0FBSixDQUFVLCtEQUFWLENBREg7QUFBQSxPQTlDWTtBQUFBLEtBQXZCLENBa0RHLFlBQVk7QUFBQSxNQUNmLGFBRGU7QUFBQSxNQUdmLElBQUk4RyxTQUFBLEdBQVksS0FBaEIsQ0FIZTtBQUFBLE1BSWYsSUFBSTtBQUFBLFFBQ0EsTUFBTSxJQUFJOUcsS0FEVjtBQUFBLE9BQUosQ0FFRSxPQUFPM1EsQ0FBUCxFQUFVO0FBQUEsUUFDUnlYLFNBQUEsR0FBWSxDQUFDLENBQUN6WCxDQUFBLENBQUUwWCxLQURSO0FBQUEsT0FORztBQUFBLE1BWWY7QUFBQTtBQUFBLFVBQUlDLGFBQUEsR0FBZ0JDLFdBQUEsRUFBcEIsQ0FaZTtBQUFBLE1BYWYsSUFBSUMsU0FBSixDQWJlO0FBQUEsTUFrQmY7QUFBQTtBQUFBLFVBQUkzQyxJQUFBLEdBQU8sWUFBWTtBQUFBLE9BQXZCLENBbEJlO0FBQUEsTUFzQmY7QUFBQTtBQUFBLFVBQUk0QyxRQUFBLEdBQVcsWUFBWTtBQUFBLFFBRXZCO0FBQUEsWUFBSS9ULElBQUEsR0FBTztBQUFBLFVBQUNnVSxJQUFBLEVBQU0sS0FBSyxDQUFaO0FBQUEsVUFBZUMsSUFBQSxFQUFNLElBQXJCO0FBQUEsU0FBWCxDQUZ1QjtBQUFBLFFBR3ZCLElBQUlwSyxJQUFBLEdBQU83SixJQUFYLENBSHVCO0FBQUEsUUFJdkIsSUFBSWtVLFFBQUEsR0FBVyxLQUFmLENBSnVCO0FBQUEsUUFLdkIsSUFBSUMsV0FBQSxHQUFjLEtBQUssQ0FBdkIsQ0FMdUI7QUFBQSxRQU12QixJQUFJQyxRQUFBLEdBQVcsS0FBZixDQU51QjtBQUFBLFFBUXZCO0FBQUEsWUFBSUMsVUFBQSxHQUFhLEVBQWpCLENBUnVCO0FBQUEsUUFVdkIsU0FBU0MsS0FBVCxHQUFpQjtBQUFBLFVBRWI7QUFBQSxjQUFJTixJQUFKLEVBQVVPLE1BQVYsQ0FGYTtBQUFBLFVBSWIsT0FBT3ZVLElBQUEsQ0FBS2lVLElBQVosRUFBa0I7QUFBQSxZQUNkalUsSUFBQSxHQUFPQSxJQUFBLENBQUtpVSxJQUFaLENBRGM7QUFBQSxZQUVkRCxJQUFBLEdBQU9oVSxJQUFBLENBQUtnVSxJQUFaLENBRmM7QUFBQSxZQUdkaFUsSUFBQSxDQUFLZ1UsSUFBTCxHQUFZLEtBQUssQ0FBakIsQ0FIYztBQUFBLFlBSWRPLE1BQUEsR0FBU3ZVLElBQUEsQ0FBS3VVLE1BQWQsQ0FKYztBQUFBLFlBTWQsSUFBSUEsTUFBSixFQUFZO0FBQUEsY0FDUnZVLElBQUEsQ0FBS3VVLE1BQUwsR0FBYyxLQUFLLENBQW5CLENBRFE7QUFBQSxjQUVSQSxNQUFBLENBQU9DLEtBQVAsRUFGUTtBQUFBLGFBTkU7QUFBQSxZQVVkQyxTQUFBLENBQVVULElBQVYsRUFBZ0JPLE1BQWhCLENBVmM7QUFBQSxXQUpMO0FBQUEsVUFpQmIsT0FBT0YsVUFBQSxDQUFXbGYsTUFBbEIsRUFBMEI7QUFBQSxZQUN0QjZlLElBQUEsR0FBT0ssVUFBQSxDQUFXL0QsR0FBWCxFQUFQLENBRHNCO0FBQUEsWUFFdEJtRSxTQUFBLENBQVVULElBQVYsQ0FGc0I7QUFBQSxXQWpCYjtBQUFBLFVBcUJiRSxRQUFBLEdBQVcsS0FyQkU7QUFBQSxTQVZNO0FBQUEsUUFrQ3ZCO0FBQUEsaUJBQVNPLFNBQVQsQ0FBbUJULElBQW5CLEVBQXlCTyxNQUF6QixFQUFpQztBQUFBLFVBQzdCLElBQUk7QUFBQSxZQUNBUCxJQUFBLEVBREE7QUFBQSxXQUFKLENBR0UsT0FBTy9YLENBQVAsRUFBVTtBQUFBLFlBQ1IsSUFBSW1ZLFFBQUosRUFBYztBQUFBLGNBT1Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQUFJRyxNQUFKLEVBQVk7QUFBQSxnQkFDUkEsTUFBQSxDQUFPRyxJQUFQLEVBRFE7QUFBQSxlQVBGO0FBQUEsY0FVVnhILFVBQUEsQ0FBV29ILEtBQVgsRUFBa0IsQ0FBbEIsRUFWVTtBQUFBLGNBV1YsSUFBSUMsTUFBSixFQUFZO0FBQUEsZ0JBQ1JBLE1BQUEsQ0FBT0MsS0FBUCxFQURRO0FBQUEsZUFYRjtBQUFBLGNBZVYsTUFBTXZZLENBZkk7QUFBQSxhQUFkLE1BaUJPO0FBQUEsY0FHSDtBQUFBO0FBQUEsY0FBQWlSLFVBQUEsQ0FBVyxZQUFZO0FBQUEsZ0JBQ25CLE1BQU1qUixDQURhO0FBQUEsZUFBdkIsRUFFRyxDQUZILENBSEc7QUFBQSxhQWxCQztBQUFBLFdBSmlCO0FBQUEsVUErQjdCLElBQUlzWSxNQUFKLEVBQVk7QUFBQSxZQUNSQSxNQUFBLENBQU9HLElBQVAsRUFEUTtBQUFBLFdBL0JpQjtBQUFBLFNBbENWO0FBQUEsUUFzRXZCWCxRQUFBLEdBQVcsVUFBVUMsSUFBVixFQUFnQjtBQUFBLFVBQ3ZCbkssSUFBQSxHQUFPQSxJQUFBLENBQUtvSyxJQUFMLEdBQVk7QUFBQSxZQUNmRCxJQUFBLEVBQU1BLElBRFM7QUFBQSxZQUVmTyxNQUFBLEVBQVFILFFBQUEsSUFBWU8sT0FBQSxDQUFRSixNQUZiO0FBQUEsWUFHZk4sSUFBQSxFQUFNLElBSFM7QUFBQSxXQUFuQixDQUR1QjtBQUFBLFVBT3ZCLElBQUksQ0FBQ0MsUUFBTCxFQUFlO0FBQUEsWUFDWEEsUUFBQSxHQUFXLElBQVgsQ0FEVztBQUFBLFlBRVhDLFdBQUEsRUFGVztBQUFBLFdBUFE7QUFBQSxTQUEzQixDQXRFdUI7QUFBQSxRQW1GdkIsSUFBSSxPQUFPUSxPQUFQLEtBQW1CLFFBQW5CLElBQ0FBLE9BQUEsQ0FBUTVYLFFBQVIsT0FBdUIsa0JBRHZCLElBQzZDNFgsT0FBQSxDQUFRWixRQUR6RCxFQUNtRTtBQUFBLFVBUy9EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUFBSyxRQUFBLEdBQVcsSUFBWCxDQVQrRDtBQUFBLFVBVy9ERCxXQUFBLEdBQWMsWUFBWTtBQUFBLFlBQ3RCUSxPQUFBLENBQVFaLFFBQVIsQ0FBaUJPLEtBQWpCLENBRHNCO0FBQUEsV0FYcUM7QUFBQSxTQURuRSxNQWdCTyxJQUFJLE9BQU9NLFlBQVAsS0FBd0IsVUFBNUIsRUFBd0M7QUFBQSxVQUUzQztBQUFBLGNBQUksT0FBT2xsQixNQUFQLEtBQWtCLFdBQXRCLEVBQW1DO0FBQUEsWUFDL0J5a0IsV0FBQSxHQUFjUyxZQUFBLENBQWFwWixJQUFiLENBQWtCOUwsTUFBbEIsRUFBMEI0a0IsS0FBMUIsQ0FEaUI7QUFBQSxXQUFuQyxNQUVPO0FBQUEsWUFDSEgsV0FBQSxHQUFjLFlBQVk7QUFBQSxjQUN0QlMsWUFBQSxDQUFhTixLQUFiLENBRHNCO0FBQUEsYUFEdkI7QUFBQSxXQUpvQztBQUFBLFNBQXhDLE1BVUEsSUFBSSxPQUFPTyxjQUFQLEtBQTBCLFdBQTlCLEVBQTJDO0FBQUEsVUFHOUM7QUFBQTtBQUFBLGNBQUlDLE9BQUEsR0FBVSxJQUFJRCxjQUFsQixDQUg4QztBQUFBLFVBTTlDO0FBQUE7QUFBQSxVQUFBQyxPQUFBLENBQVFDLEtBQVIsQ0FBY0MsU0FBZCxHQUEwQixZQUFZO0FBQUEsWUFDbENiLFdBQUEsR0FBY2MsZUFBZCxDQURrQztBQUFBLFlBRWxDSCxPQUFBLENBQVFDLEtBQVIsQ0FBY0MsU0FBZCxHQUEwQlYsS0FBMUIsQ0FGa0M7QUFBQSxZQUdsQ0EsS0FBQSxFQUhrQztBQUFBLFdBQXRDLENBTjhDO0FBQUEsVUFXOUMsSUFBSVcsZUFBQSxHQUFrQixZQUFZO0FBQUEsWUFHOUI7QUFBQTtBQUFBLFlBQUFILE9BQUEsQ0FBUUksS0FBUixDQUFjQyxXQUFkLENBQTBCLENBQTFCLENBSDhCO0FBQUEsV0FBbEMsQ0FYOEM7QUFBQSxVQWdCOUNoQixXQUFBLEdBQWMsWUFBWTtBQUFBLFlBQ3RCakgsVUFBQSxDQUFXb0gsS0FBWCxFQUFrQixDQUFsQixFQURzQjtBQUFBLFlBRXRCVyxlQUFBLEVBRnNCO0FBQUEsV0FoQm9CO0FBQUEsU0FBM0MsTUFxQkE7QUFBQSxVQUVIO0FBQUEsVUFBQWQsV0FBQSxHQUFjLFlBQVk7QUFBQSxZQUN0QmpILFVBQUEsQ0FBV29ILEtBQVgsRUFBa0IsQ0FBbEIsQ0FEc0I7QUFBQSxXQUZ2QjtBQUFBLFNBbElnQjtBQUFBLFFBMkl2QjtBQUFBO0FBQUE7QUFBQSxRQUFBUCxRQUFBLENBQVNxQixRQUFULEdBQW9CLFVBQVVwQixJQUFWLEVBQWdCO0FBQUEsVUFDaENLLFVBQUEsQ0FBVzdqQixJQUFYLENBQWdCd2pCLElBQWhCLEVBRGdDO0FBQUEsVUFFaEMsSUFBSSxDQUFDRSxRQUFMLEVBQWU7QUFBQSxZQUNYQSxRQUFBLEdBQVcsSUFBWCxDQURXO0FBQUEsWUFFWEMsV0FBQSxFQUZXO0FBQUEsV0FGaUI7QUFBQSxTQUFwQyxDQTNJdUI7QUFBQSxRQWtKdkIsT0FBT0osUUFsSmdCO0FBQUEsT0FBYixFQUFkLENBdEJlO0FBQUEsTUFxTGY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUFJMWlCLElBQUEsR0FBTzhDLFFBQUEsQ0FBUzlDLElBQXBCLENBckxlO0FBQUEsTUFzTGYsU0FBU2drQixXQUFULENBQXFCQyxDQUFyQixFQUF3QjtBQUFBLFFBQ3BCLE9BQU8sWUFBWTtBQUFBLFVBQ2YsT0FBT2prQixJQUFBLENBQUtMLEtBQUwsQ0FBV3NrQixDQUFYLEVBQWNya0IsU0FBZCxDQURRO0FBQUEsU0FEQztBQUFBLE9BdExUO0FBQUEsTUErTGY7QUFBQTtBQUFBO0FBQUEsVUFBSXNrQixXQUFBLEdBQWNGLFdBQUEsQ0FBWW5lLEtBQUEsQ0FBTXVJLFNBQU4sQ0FBZ0JyTyxLQUE1QixDQUFsQixDQS9MZTtBQUFBLE1BaU1mLElBQUlva0IsWUFBQSxHQUFlSCxXQUFBLENBQ2ZuZSxLQUFBLENBQU11SSxTQUFOLENBQWdCMkcsTUFBaEIsSUFBMEIsVUFBVXFQLFFBQVYsRUFBb0JDLEtBQXBCLEVBQTJCO0FBQUEsUUFDakQsSUFBSWhSLEtBQUEsR0FBUSxDQUFaLEVBQ0l2UCxNQUFBLEdBQVMsS0FBS0EsTUFEbEIsQ0FEaUQ7QUFBQSxRQUlqRDtBQUFBLFlBQUlsRSxTQUFBLENBQVVrRSxNQUFWLEtBQXFCLENBQXpCLEVBQTRCO0FBQUEsVUFHeEI7QUFBQTtBQUFBLGFBQUc7QUFBQSxZQUNDLElBQUl1UCxLQUFBLElBQVMsSUFBYixFQUFtQjtBQUFBLGNBQ2ZnUixLQUFBLEdBQVEsS0FBS2hSLEtBQUEsRUFBTCxDQUFSLENBRGU7QUFBQSxjQUVmLEtBRmU7QUFBQSxhQURwQjtBQUFBLFlBS0MsSUFBSSxFQUFFQSxLQUFGLElBQVd2UCxNQUFmLEVBQXVCO0FBQUEsY0FDbkIsTUFBTSxJQUFJbVgsU0FEUztBQUFBLGFBTHhCO0FBQUEsV0FBSCxRQVFTLENBUlQsQ0FId0I7QUFBQSxTQUpxQjtBQUFBLFFBa0JqRDtBQUFBLGVBQU81SCxLQUFBLEdBQVF2UCxNQUFmLEVBQXVCdVAsS0FBQSxFQUF2QixFQUFnQztBQUFBLFVBRTVCO0FBQUEsY0FBSUEsS0FBQSxJQUFTLElBQWIsRUFBbUI7QUFBQSxZQUNmZ1IsS0FBQSxHQUFRRCxRQUFBLENBQVNDLEtBQVQsRUFBZ0IsS0FBS2hSLEtBQUwsQ0FBaEIsRUFBNkJBLEtBQTdCLENBRE87QUFBQSxXQUZTO0FBQUEsU0FsQmlCO0FBQUEsUUF3QmpELE9BQU9nUixLQXhCMEM7QUFBQSxPQUR0QyxDQUFuQixDQWpNZTtBQUFBLE1BOE5mLElBQUlDLGFBQUEsR0FBZ0JOLFdBQUEsQ0FDaEJuZSxLQUFBLENBQU11SSxTQUFOLENBQWdCdkssT0FBaEIsSUFBMkIsVUFBVTBELEtBQVYsRUFBaUI7QUFBQSxRQUV4QztBQUFBLGFBQUssSUFBSWhJLENBQUEsR0FBSSxDQUFSLENBQUwsQ0FBZ0JBLENBQUEsR0FBSSxLQUFLdUUsTUFBekIsRUFBaUN2RSxDQUFBLEVBQWpDLEVBQXNDO0FBQUEsVUFDbEMsSUFBSSxLQUFLQSxDQUFMLE1BQVlnSSxLQUFoQixFQUF1QjtBQUFBLFlBQ25CLE9BQU9oSSxDQURZO0FBQUEsV0FEVztBQUFBLFNBRkU7QUFBQSxRQU94QyxPQUFPLENBQUMsQ0FQZ0M7QUFBQSxPQUQ1QixDQUFwQixDQTlOZTtBQUFBLE1BME9mLElBQUlnbEIsU0FBQSxHQUFZUCxXQUFBLENBQ1puZSxLQUFBLENBQU11SSxTQUFOLENBQWdCcEwsR0FBaEIsSUFBdUIsVUFBVW9oQixRQUFWLEVBQW9CSSxLQUFwQixFQUEyQjtBQUFBLFFBQzlDLElBQUkzYixJQUFBLEdBQU8sSUFBWCxDQUQ4QztBQUFBLFFBRTlDLElBQUkyTCxPQUFBLEdBQVUsRUFBZCxDQUY4QztBQUFBLFFBRzlDMlAsWUFBQSxDQUFhdGIsSUFBYixFQUFtQixVQUFVMkIsU0FBVixFQUFxQmpELEtBQXJCLEVBQTRCOEwsS0FBNUIsRUFBbUM7QUFBQSxVQUNsRG1CLE9BQUEsQ0FBUXJWLElBQVIsQ0FBYWlsQixRQUFBLENBQVNwa0IsSUFBVCxDQUFjd2tCLEtBQWQsRUFBcUJqZCxLQUFyQixFQUE0QjhMLEtBQTVCLEVBQW1DeEssSUFBbkMsQ0FBYixDQURrRDtBQUFBLFNBQXRELEVBRUcsS0FBSyxDQUZSLEVBSDhDO0FBQUEsUUFNOUMsT0FBTzJMLE9BTnVDO0FBQUEsT0FEdEMsQ0FBaEIsQ0ExT2U7QUFBQSxNQXFQZixJQUFJaVEsYUFBQSxHQUFnQnJlLE1BQUEsQ0FBT3dNLE1BQVAsSUFBaUIsVUFBVXhFLFNBQVYsRUFBcUI7QUFBQSxRQUN0RCxTQUFTc1csSUFBVCxHQUFnQjtBQUFBLFNBRHNDO0FBQUEsUUFFdERBLElBQUEsQ0FBS3RXLFNBQUwsR0FBaUJBLFNBQWpCLENBRnNEO0FBQUEsUUFHdEQsT0FBTyxJQUFJc1csSUFIMkM7QUFBQSxPQUExRCxDQXJQZTtBQUFBLE1BMlBmLElBQUlDLHFCQUFBLEdBQXdCWCxXQUFBLENBQVk1ZCxNQUFBLENBQU9nSSxTQUFQLENBQWlCa0MsY0FBN0IsQ0FBNUIsQ0EzUGU7QUFBQSxNQTZQZixJQUFJc1UsV0FBQSxHQUFjeGUsTUFBQSxDQUFPQyxJQUFQLElBQWUsVUFBVTBULE1BQVYsRUFBa0I7QUFBQSxRQUMvQyxJQUFJMVQsSUFBQSxHQUFPLEVBQVgsQ0FEK0M7QUFBQSxRQUUvQyxTQUFTN0IsR0FBVCxJQUFnQnVWLE1BQWhCLEVBQXdCO0FBQUEsVUFDcEIsSUFBSTRLLHFCQUFBLENBQXNCNUssTUFBdEIsRUFBOEJ2VixHQUE5QixDQUFKLEVBQXdDO0FBQUEsWUFDcEM2QixJQUFBLENBQUtsSCxJQUFMLENBQVVxRixHQUFWLENBRG9DO0FBQUEsV0FEcEI7QUFBQSxTQUZ1QjtBQUFBLFFBTy9DLE9BQU82QixJQVB3QztBQUFBLE9BQW5ELENBN1BlO0FBQUEsTUF1UWYsSUFBSXdlLGVBQUEsR0FBa0JiLFdBQUEsQ0FBWTVkLE1BQUEsQ0FBT2dJLFNBQVAsQ0FBaUIxQyxRQUE3QixDQUF0QixDQXZRZTtBQUFBLE1BeVFmLFNBQVNnRyxRQUFULENBQWtCbkssS0FBbEIsRUFBeUI7QUFBQSxRQUNyQixPQUFPQSxLQUFBLEtBQVVuQixNQUFBLENBQU9tQixLQUFQLENBREk7QUFBQSxPQXpRVjtBQUFBLE1BZ1JmO0FBQUE7QUFBQSxlQUFTdWQsZUFBVCxDQUF5QkMsU0FBekIsRUFBb0M7QUFBQSxRQUNoQyxPQUNJRixlQUFBLENBQWdCRSxTQUFoQixNQUErQix3QkFBL0IsSUFDQUEsU0FBQSxZQUFxQkMsWUFITztBQUFBLE9BaFJyQjtBQUFBLE1BeVJmO0FBQUE7QUFBQSxVQUFJQSxZQUFKLENBelJlO0FBQUEsTUEwUmYsSUFBSSxPQUFPQyxXQUFQLEtBQXVCLFdBQTNCLEVBQXdDO0FBQUEsUUFDcENELFlBQUEsR0FBZUMsV0FEcUI7QUFBQSxPQUF4QyxNQUVPO0FBQUEsUUFDSEQsWUFBQSxHQUFlLFVBQVV6ZCxLQUFWLEVBQWlCO0FBQUEsVUFDNUIsS0FBS0EsS0FBTCxHQUFhQSxLQURlO0FBQUEsU0FEN0I7QUFBQSxPQTVSUTtBQUFBLE1Bb1NmO0FBQUEsVUFBSTJkLG9CQUFBLEdBQXVCLHNCQUEzQixDQXBTZTtBQUFBLE1Bc1NmLFNBQVNDLGtCQUFULENBQTRCQyxLQUE1QixFQUFtQ3JVLE9BQW5DLEVBQTRDO0FBQUEsUUFHeEM7QUFBQTtBQUFBLFlBQUlzUixTQUFBLElBQ0F0UixPQUFBLENBQVF1UixLQURSLElBRUEsT0FBTzhDLEtBQVAsS0FBaUIsUUFGakIsSUFHQUEsS0FBQSxLQUFVLElBSFYsSUFJQUEsS0FBQSxDQUFNOUMsS0FKTixJQUtBOEMsS0FBQSxDQUFNOUMsS0FBTixDQUFZemUsT0FBWixDQUFvQnFoQixvQkFBcEIsTUFBOEMsQ0FBQyxDQUxuRCxFQU1FO0FBQUEsVUFDRSxJQUFJRyxNQUFBLEdBQVMsRUFBYixDQURGO0FBQUEsVUFFRSxLQUFLLElBQUl6aUIsQ0FBQSxHQUFJbU8sT0FBUixDQUFMLENBQXNCLENBQUMsQ0FBQ25PLENBQXhCLEVBQTJCQSxDQUFBLEdBQUlBLENBQUEsQ0FBRVAsTUFBakMsRUFBeUM7QUFBQSxZQUNyQyxJQUFJTyxDQUFBLENBQUUwZixLQUFOLEVBQWE7QUFBQSxjQUNUK0MsTUFBQSxDQUFPQyxPQUFQLENBQWUxaUIsQ0FBQSxDQUFFMGYsS0FBakIsQ0FEUztBQUFBLGFBRHdCO0FBQUEsV0FGM0M7QUFBQSxVQU9FK0MsTUFBQSxDQUFPQyxPQUFQLENBQWVGLEtBQUEsQ0FBTTlDLEtBQXJCLEVBUEY7QUFBQSxVQVNFLElBQUlpRCxjQUFBLEdBQWlCRixNQUFBLENBQU9waUIsSUFBUCxDQUFZLE9BQU9paUIsb0JBQVAsR0FBOEIsSUFBMUMsQ0FBckIsQ0FURjtBQUFBLFVBVUVFLEtBQUEsQ0FBTTlDLEtBQU4sR0FBY2tELGlCQUFBLENBQWtCRCxjQUFsQixDQVZoQjtBQUFBLFNBVHNDO0FBQUEsT0F0UzdCO0FBQUEsTUE2VGYsU0FBU0MsaUJBQVQsQ0FBMkJDLFdBQTNCLEVBQXdDO0FBQUEsUUFDcEMsSUFBSUMsS0FBQSxHQUFRRCxXQUFBLENBQVkxa0IsS0FBWixDQUFrQixJQUFsQixDQUFaLENBRG9DO0FBQUEsUUFFcEMsSUFBSTRrQixZQUFBLEdBQWUsRUFBbkIsQ0FGb0M7QUFBQSxRQUdwQyxLQUFLLElBQUlwbUIsQ0FBQSxHQUFJLENBQVIsQ0FBTCxDQUFnQkEsQ0FBQSxHQUFJbW1CLEtBQUEsQ0FBTTVoQixNQUExQixFQUFrQyxFQUFFdkUsQ0FBcEMsRUFBdUM7QUFBQSxVQUNuQyxJQUFJcW1CLElBQUEsR0FBT0YsS0FBQSxDQUFNbm1CLENBQU4sQ0FBWCxDQURtQztBQUFBLFVBR25DLElBQUksQ0FBQ3NtQixlQUFBLENBQWdCRCxJQUFoQixDQUFELElBQTBCLENBQUNFLFdBQUEsQ0FBWUYsSUFBWixDQUEzQixJQUFnREEsSUFBcEQsRUFBMEQ7QUFBQSxZQUN0REQsWUFBQSxDQUFheG1CLElBQWIsQ0FBa0J5bUIsSUFBbEIsQ0FEc0Q7QUFBQSxXQUh2QjtBQUFBLFNBSEg7QUFBQSxRQVVwQyxPQUFPRCxZQUFBLENBQWExaUIsSUFBYixDQUFrQixJQUFsQixDQVY2QjtBQUFBLE9BN1R6QjtBQUFBLE1BMFVmLFNBQVM2aUIsV0FBVCxDQUFxQkMsU0FBckIsRUFBZ0M7QUFBQSxRQUM1QixPQUFPQSxTQUFBLENBQVVsaUIsT0FBVixDQUFrQixhQUFsQixNQUFxQyxDQUFDLENBQXRDLElBQ0FraUIsU0FBQSxDQUFVbGlCLE9BQVYsQ0FBa0IsV0FBbEIsTUFBbUMsQ0FBQyxDQUZmO0FBQUEsT0ExVWpCO0FBQUEsTUErVWYsU0FBU21pQix3QkFBVCxDQUFrQ0QsU0FBbEMsRUFBNkM7QUFBQSxRQUd6QztBQUFBO0FBQUEsWUFBSUUsUUFBQSxHQUFXLGdDQUFnQzFrQixJQUFoQyxDQUFxQ3drQixTQUFyQyxDQUFmLENBSHlDO0FBQUEsUUFJekMsSUFBSUUsUUFBSixFQUFjO0FBQUEsVUFDVixPQUFPO0FBQUEsWUFBQ0EsUUFBQSxDQUFTLENBQVQsQ0FBRDtBQUFBLFlBQWNDLE1BQUEsQ0FBT0QsUUFBQSxDQUFTLENBQVQsQ0FBUCxDQUFkO0FBQUEsV0FERztBQUFBLFNBSjJCO0FBQUEsUUFTekM7QUFBQSxZQUFJRSxRQUFBLEdBQVcsNEJBQTRCNWtCLElBQTVCLENBQWlDd2tCLFNBQWpDLENBQWYsQ0FUeUM7QUFBQSxRQVV6QyxJQUFJSSxRQUFKLEVBQWM7QUFBQSxVQUNWLE9BQU87QUFBQSxZQUFDQSxRQUFBLENBQVMsQ0FBVCxDQUFEO0FBQUEsWUFBY0QsTUFBQSxDQUFPQyxRQUFBLENBQVMsQ0FBVCxDQUFQLENBQWQ7QUFBQSxXQURHO0FBQUEsU0FWMkI7QUFBQSxRQWV6QztBQUFBLFlBQUlDLFFBQUEsR0FBVyxpQkFBaUI3a0IsSUFBakIsQ0FBc0J3a0IsU0FBdEIsQ0FBZixDQWZ5QztBQUFBLFFBZ0J6QyxJQUFJSyxRQUFKLEVBQWM7QUFBQSxVQUNWLE9BQU87QUFBQSxZQUFDQSxRQUFBLENBQVMsQ0FBVCxDQUFEO0FBQUEsWUFBY0YsTUFBQSxDQUFPRSxRQUFBLENBQVMsQ0FBVCxDQUFQLENBQWQ7QUFBQSxXQURHO0FBQUEsU0FoQjJCO0FBQUEsT0EvVTlCO0FBQUEsTUFvV2YsU0FBU1AsZUFBVCxDQUF5QkUsU0FBekIsRUFBb0M7QUFBQSxRQUNoQyxJQUFJTSxxQkFBQSxHQUF3Qkwsd0JBQUEsQ0FBeUJELFNBQXpCLENBQTVCLENBRGdDO0FBQUEsUUFHaEMsSUFBSSxDQUFDTSxxQkFBTCxFQUE0QjtBQUFBLFVBQ3hCLE9BQU8sS0FEaUI7QUFBQSxTQUhJO0FBQUEsUUFPaEMsSUFBSUMsUUFBQSxHQUFXRCxxQkFBQSxDQUFzQixDQUF0QixDQUFmLENBUGdDO0FBQUEsUUFRaEMsSUFBSUUsVUFBQSxHQUFhRixxQkFBQSxDQUFzQixDQUF0QixDQUFqQixDQVJnQztBQUFBLFFBVWhDLE9BQU9DLFFBQUEsS0FBYTdELFNBQWIsSUFDSDhELFVBQUEsSUFBY2hFLGFBRFgsSUFFSGdFLFVBQUEsSUFBY0MsV0FaYztBQUFBLE9BcFdyQjtBQUFBLE1BcVhmO0FBQUE7QUFBQSxlQUFTaEUsV0FBVCxHQUF1QjtBQUFBLFFBQ25CLElBQUksQ0FBQ0gsU0FBTCxFQUFnQjtBQUFBLFVBQ1osTUFEWTtBQUFBLFNBREc7QUFBQSxRQUtuQixJQUFJO0FBQUEsVUFDQSxNQUFNLElBQUk5RyxLQURWO0FBQUEsU0FBSixDQUVFLE9BQU8zUSxDQUFQLEVBQVU7QUFBQSxVQUNSLElBQUk4YSxLQUFBLEdBQVE5YSxDQUFBLENBQUUwWCxLQUFGLENBQVF2aEIsS0FBUixDQUFjLElBQWQsQ0FBWixDQURRO0FBQUEsVUFFUixJQUFJMGxCLFNBQUEsR0FBWWYsS0FBQSxDQUFNLENBQU4sRUFBUzdoQixPQUFULENBQWlCLEdBQWpCLElBQXdCLENBQXhCLEdBQTRCNmhCLEtBQUEsQ0FBTSxDQUFOLENBQTVCLEdBQXVDQSxLQUFBLENBQU0sQ0FBTixDQUF2RCxDQUZRO0FBQUEsVUFHUixJQUFJVyxxQkFBQSxHQUF3Qkwsd0JBQUEsQ0FBeUJTLFNBQXpCLENBQTVCLENBSFE7QUFBQSxVQUlSLElBQUksQ0FBQ0oscUJBQUwsRUFBNEI7QUFBQSxZQUN4QixNQUR3QjtBQUFBLFdBSnBCO0FBQUEsVUFRUjVELFNBQUEsR0FBWTRELHFCQUFBLENBQXNCLENBQXRCLENBQVosQ0FSUTtBQUFBLFVBU1IsT0FBT0EscUJBQUEsQ0FBc0IsQ0FBdEIsQ0FUQztBQUFBLFNBUE87QUFBQSxPQXJYUjtBQUFBLE1BeVlmLFNBQVNLLFNBQVQsQ0FBbUJ0QyxRQUFuQixFQUE2Qm5sQixJQUE3QixFQUFtQzBuQixXQUFuQyxFQUFnRDtBQUFBLFFBQzVDLE9BQU8sWUFBWTtBQUFBLFVBQ2YsSUFBSSxPQUFPQyxPQUFQLEtBQW1CLFdBQW5CLElBQ0EsT0FBT0EsT0FBQSxDQUFRQyxJQUFmLEtBQXdCLFVBRDVCLEVBQ3dDO0FBQUEsWUFDcENELE9BQUEsQ0FBUUMsSUFBUixDQUFhNW5CLElBQUEsR0FBTyxzQkFBUCxHQUFnQzBuQixXQUFoQyxHQUNBLFdBRGIsRUFDMEIsSUFBSXBMLEtBQUosQ0FBVSxFQUFWLEVBQWMrRyxLQUR4QyxDQURvQztBQUFBLFdBRnpCO0FBQUEsVUFNZixPQUFPOEIsUUFBQSxDQUFTemtCLEtBQVQsQ0FBZXlrQixRQUFmLEVBQXlCeGtCLFNBQXpCLENBTlE7QUFBQSxTQUR5QjtBQUFBLE9BellqQztBQUFBLE1BNFpmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBU3FRLENBQVQsQ0FBVzFJLEtBQVgsRUFBa0I7QUFBQSxRQUlkO0FBQUE7QUFBQTtBQUFBLFlBQUlBLEtBQUEsWUFBaUJ1ZixPQUFyQixFQUE4QjtBQUFBLFVBQzFCLE9BQU92ZixLQURtQjtBQUFBLFNBSmhCO0FBQUEsUUFTZDtBQUFBLFlBQUl3ZixjQUFBLENBQWV4ZixLQUFmLENBQUosRUFBMkI7QUFBQSxVQUN2QixPQUFPeWYsTUFBQSxDQUFPemYsS0FBUCxDQURnQjtBQUFBLFNBQTNCLE1BRU87QUFBQSxVQUNILE9BQU8wZixPQUFBLENBQVExZixLQUFSLENBREo7QUFBQSxTQVhPO0FBQUEsT0E1Wkg7QUFBQSxNQTJhZjBJLENBQUEsQ0FBRWEsT0FBRixHQUFZYixDQUFaLENBM2FlO0FBQUEsTUFpYmY7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBQSxDQUFBLENBQUV5UyxRQUFGLEdBQWFBLFFBQWIsQ0FqYmU7QUFBQSxNQXNiZjtBQUFBO0FBQUE7QUFBQSxNQUFBelMsQ0FBQSxDQUFFaVgsZ0JBQUYsR0FBcUIsS0FBckIsQ0F0YmU7QUFBQSxNQXliZjtBQUFBLFVBQUksT0FBTzVELE9BQVAsS0FBbUIsUUFBbkIsSUFBK0JBLE9BQS9CLElBQTBDQSxPQUFBLENBQVE2RCxHQUFsRCxJQUF5RDdELE9BQUEsQ0FBUTZELEdBQVIsQ0FBWUMsT0FBekUsRUFBa0Y7QUFBQSxRQUM5RW5YLENBQUEsQ0FBRWlYLGdCQUFGLEdBQXFCLElBRHlEO0FBQUEsT0F6Ym5FO0FBQUEsTUF1Y2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBalgsQ0FBQSxDQUFFWSxLQUFGLEdBQVVBLEtBQVYsQ0F2Y2U7QUFBQSxNQXdjZixTQUFTQSxLQUFULEdBQWlCO0FBQUEsUUFPYjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUFJd1csUUFBQSxHQUFXLEVBQWYsRUFBbUJDLGlCQUFBLEdBQW9CLEVBQXZDLEVBQTJDQyxlQUEzQyxDQVBhO0FBQUEsUUFTYixJQUFJQyxRQUFBLEdBQVcvQyxhQUFBLENBQWM1VCxLQUFBLENBQU16QyxTQUFwQixDQUFmLENBVGE7QUFBQSxRQVViLElBQUkyQyxPQUFBLEdBQVUwVCxhQUFBLENBQWNxQyxPQUFBLENBQVExWSxTQUF0QixDQUFkLENBVmE7QUFBQSxRQVliMkMsT0FBQSxDQUFRMFcsZUFBUixHQUEwQixVQUFVM1csT0FBVixFQUFtQjRXLEVBQW5CLEVBQXVCQyxRQUF2QixFQUFpQztBQUFBLFVBQ3ZELElBQUk3bkIsSUFBQSxHQUFPb2tCLFdBQUEsQ0FBWXRrQixTQUFaLENBQVgsQ0FEdUQ7QUFBQSxVQUV2RCxJQUFJeW5CLFFBQUosRUFBYztBQUFBLFlBQ1ZBLFFBQUEsQ0FBU2xvQixJQUFULENBQWNXLElBQWQsRUFEVTtBQUFBLFlBRVYsSUFBSTRuQixFQUFBLEtBQU8sTUFBUCxJQUFpQkMsUUFBQSxDQUFTLENBQVQsQ0FBckIsRUFBa0M7QUFBQSxjQUM5QjtBQUFBLGNBQUFMLGlCQUFBLENBQWtCbm9CLElBQWxCLENBQXVCd29CLFFBQUEsQ0FBUyxDQUFULENBQXZCLENBRDhCO0FBQUEsYUFGeEI7QUFBQSxXQUFkLE1BS087QUFBQSxZQUNIMVgsQ0FBQSxDQUFFeVMsUUFBRixDQUFXLFlBQVk7QUFBQSxjQUNuQjZFLGVBQUEsQ0FBZ0JFLGVBQWhCLENBQWdDOW5CLEtBQWhDLENBQXNDNG5CLGVBQXRDLEVBQXVEem5CLElBQXZELENBRG1CO0FBQUEsYUFBdkIsQ0FERztBQUFBLFdBUGdEO0FBQUEsU0FBM0QsQ0FaYTtBQUFBLFFBMkJiO0FBQUEsUUFBQWlSLE9BQUEsQ0FBUThRLE9BQVIsR0FBa0IsWUFBWTtBQUFBLFVBQzFCLElBQUl3RixRQUFKLEVBQWM7QUFBQSxZQUNWLE9BQU90VyxPQURHO0FBQUEsV0FEWTtBQUFBLFVBSTFCLElBQUk2VyxXQUFBLEdBQWNDLE1BQUEsQ0FBT04sZUFBUCxDQUFsQixDQUowQjtBQUFBLFVBSzFCLElBQUlPLFNBQUEsQ0FBVUYsV0FBVixDQUFKLEVBQTRCO0FBQUEsWUFDeEJMLGVBQUEsR0FBa0JLLFdBQWxCO0FBRHdCLFdBTEY7QUFBQSxVQVExQixPQUFPQSxXQVJtQjtBQUFBLFNBQTlCLENBM0JhO0FBQUEsUUFzQ2I3VyxPQUFBLENBQVFnWCxPQUFSLEdBQWtCLFlBQVk7QUFBQSxVQUMxQixJQUFJLENBQUNSLGVBQUwsRUFBc0I7QUFBQSxZQUNsQixPQUFPLEVBQUVTLEtBQUEsRUFBTyxTQUFULEVBRFc7QUFBQSxXQURJO0FBQUEsVUFJMUIsT0FBT1QsZUFBQSxDQUFnQlEsT0FBaEIsRUFKbUI7QUFBQSxTQUE5QixDQXRDYTtBQUFBLFFBNkNiLElBQUk5WCxDQUFBLENBQUVpWCxnQkFBRixJQUFzQjdFLFNBQTFCLEVBQXFDO0FBQUEsVUFDakMsSUFBSTtBQUFBLFlBQ0EsTUFBTSxJQUFJOUcsS0FEVjtBQUFBLFdBQUosQ0FFRSxPQUFPM1EsQ0FBUCxFQUFVO0FBQUEsWUFPUjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUFBbUcsT0FBQSxDQUFRdVIsS0FBUixHQUFnQjFYLENBQUEsQ0FBRTBYLEtBQUYsQ0FBUTNWLFNBQVIsQ0FBa0IvQixDQUFBLENBQUUwWCxLQUFGLENBQVF6ZSxPQUFSLENBQWdCLElBQWhCLElBQXdCLENBQTFDLENBUFI7QUFBQSxXQUhxQjtBQUFBLFNBN0N4QjtBQUFBLFFBK0RiO0FBQUE7QUFBQTtBQUFBLGlCQUFTb2tCLE1BQVQsQ0FBZ0JDLFVBQWhCLEVBQTRCO0FBQUEsVUFDeEJYLGVBQUEsR0FBa0JXLFVBQWxCLENBRHdCO0FBQUEsVUFFeEJuWCxPQUFBLENBQVExTyxNQUFSLEdBQWlCNmxCLFVBQWpCLENBRndCO0FBQUEsVUFJeEIvRCxZQUFBLENBQWFrRCxRQUFiLEVBQXVCLFVBQVU3YyxTQUFWLEVBQXFCaUgsT0FBckIsRUFBOEI7QUFBQSxZQUNqRHhCLENBQUEsQ0FBRXlTLFFBQUYsQ0FBVyxZQUFZO0FBQUEsY0FDbkJ3RixVQUFBLENBQVdULGVBQVgsQ0FBMkI5bkIsS0FBM0IsQ0FBaUN1b0IsVUFBakMsRUFBNkN6VyxPQUE3QyxDQURtQjtBQUFBLGFBQXZCLENBRGlEO0FBQUEsV0FBckQsRUFJRyxLQUFLLENBSlIsRUFKd0I7QUFBQSxVQVV4QjRWLFFBQUEsR0FBVyxLQUFLLENBQWhCLENBVndCO0FBQUEsVUFXeEJDLGlCQUFBLEdBQW9CLEtBQUssQ0FYRDtBQUFBLFNBL0RmO0FBQUEsUUE2RWJFLFFBQUEsQ0FBU3pXLE9BQVQsR0FBbUJBLE9BQW5CLENBN0VhO0FBQUEsUUE4RWJ5VyxRQUFBLENBQVMxVyxPQUFULEdBQW1CLFVBQVV2SixLQUFWLEVBQWlCO0FBQUEsVUFDaEMsSUFBSWdnQixlQUFKLEVBQXFCO0FBQUEsWUFDakIsTUFEaUI7QUFBQSxXQURXO0FBQUEsVUFLaENVLE1BQUEsQ0FBT2hZLENBQUEsQ0FBRTFJLEtBQUYsQ0FBUCxDQUxnQztBQUFBLFNBQXBDLENBOUVhO0FBQUEsUUFzRmJpZ0IsUUFBQSxDQUFTUCxPQUFULEdBQW1CLFVBQVUxZixLQUFWLEVBQWlCO0FBQUEsVUFDaEMsSUFBSWdnQixlQUFKLEVBQXFCO0FBQUEsWUFDakIsTUFEaUI7QUFBQSxXQURXO0FBQUEsVUFLaENVLE1BQUEsQ0FBT2hCLE9BQUEsQ0FBUTFmLEtBQVIsQ0FBUCxDQUxnQztBQUFBLFNBQXBDLENBdEZhO0FBQUEsUUE2RmJpZ0IsUUFBQSxDQUFTaFcsTUFBVCxHQUFrQixVQUFVMlcsTUFBVixFQUFrQjtBQUFBLFVBQ2hDLElBQUlaLGVBQUosRUFBcUI7QUFBQSxZQUNqQixNQURpQjtBQUFBLFdBRFc7QUFBQSxVQUtoQ1UsTUFBQSxDQUFPelcsTUFBQSxDQUFPMlcsTUFBUCxDQUFQLENBTGdDO0FBQUEsU0FBcEMsQ0E3RmE7QUFBQSxRQW9HYlgsUUFBQSxDQUFTeFYsTUFBVCxHQUFrQixVQUFVb1csUUFBVixFQUFvQjtBQUFBLFVBQ2xDLElBQUliLGVBQUosRUFBcUI7QUFBQSxZQUNqQixNQURpQjtBQUFBLFdBRGE7QUFBQSxVQUtsQ3BELFlBQUEsQ0FBYW1ELGlCQUFiLEVBQWdDLFVBQVU5YyxTQUFWLEVBQXFCNmQsZ0JBQXJCLEVBQXVDO0FBQUEsWUFDbkVwWSxDQUFBLENBQUV5UyxRQUFGLENBQVcsWUFBWTtBQUFBLGNBQ25CMkYsZ0JBQUEsQ0FBaUJELFFBQWpCLENBRG1CO0FBQUEsYUFBdkIsQ0FEbUU7QUFBQSxXQUF2RSxFQUlHLEtBQUssQ0FKUixDQUxrQztBQUFBLFNBQXRDLENBcEdhO0FBQUEsUUFnSGIsT0FBT1osUUFoSE07QUFBQSxPQXhjRjtBQUFBLE1BZ2tCZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQTNXLEtBQUEsQ0FBTXpDLFNBQU4sQ0FBZ0JrYSxnQkFBaEIsR0FBbUMsWUFBWTtBQUFBLFFBQzNDLElBQUl6ZixJQUFBLEdBQU8sSUFBWCxDQUQyQztBQUFBLFFBRTNDLE9BQU8sVUFBVXVjLEtBQVYsRUFBaUI3ZCxLQUFqQixFQUF3QjtBQUFBLFVBQzNCLElBQUk2ZCxLQUFKLEVBQVc7QUFBQSxZQUNQdmMsSUFBQSxDQUFLMkksTUFBTCxDQUFZNFQsS0FBWixDQURPO0FBQUEsV0FBWCxNQUVPLElBQUl4bEIsU0FBQSxDQUFVa0UsTUFBVixHQUFtQixDQUF2QixFQUEwQjtBQUFBLFlBQzdCK0UsSUFBQSxDQUFLaUksT0FBTCxDQUFhb1QsV0FBQSxDQUFZdGtCLFNBQVosRUFBdUIsQ0FBdkIsQ0FBYixDQUQ2QjtBQUFBLFdBQTFCLE1BRUE7QUFBQSxZQUNIaUosSUFBQSxDQUFLaUksT0FBTCxDQUFhdkosS0FBYixDQURHO0FBQUEsV0FMb0I7QUFBQSxTQUZZO0FBQUEsT0FBL0MsQ0Foa0JlO0FBQUEsTUFtbEJmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEwSSxDQUFBLENBQUU2VyxPQUFGLEdBQVkvVixPQUFaLENBbmxCZTtBQUFBLE1Bb2xCZjtBQUFBLE1BQUFkLENBQUEsQ0FBRWMsT0FBRixHQUFZQSxPQUFaLENBcGxCZTtBQUFBLE1BcWxCZixTQUFTQSxPQUFULENBQWlCd1gsUUFBakIsRUFBMkI7QUFBQSxRQUN2QixJQUFJLE9BQU9BLFFBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFBQSxVQUNoQyxNQUFNLElBQUl0TixTQUFKLENBQWMsOEJBQWQsQ0FEMEI7QUFBQSxTQURiO0FBQUEsUUFJdkIsSUFBSXVNLFFBQUEsR0FBVzNXLEtBQUEsRUFBZixDQUp1QjtBQUFBLFFBS3ZCLElBQUk7QUFBQSxVQUNBMFgsUUFBQSxDQUFTZixRQUFBLENBQVMxVyxPQUFsQixFQUEyQjBXLFFBQUEsQ0FBU2hXLE1BQXBDLEVBQTRDZ1csUUFBQSxDQUFTeFYsTUFBckQsQ0FEQTtBQUFBLFNBQUosQ0FFRSxPQUFPbVcsTUFBUCxFQUFlO0FBQUEsVUFDYlgsUUFBQSxDQUFTaFcsTUFBVCxDQUFnQjJXLE1BQWhCLENBRGE7QUFBQSxTQVBNO0FBQUEsUUFVdkIsT0FBT1gsUUFBQSxDQUFTelcsT0FWTztBQUFBLE9BcmxCWjtBQUFBLE1Ba21CZkEsT0FBQSxDQUFReVgsSUFBUixHQUFlQSxJQUFmLENBbG1CZTtBQUFBLE1BbW1CZjtBQUFBLE1BQUF6WCxPQUFBLENBQVEzUSxHQUFSLEdBQWNBLEdBQWQsQ0FubUJlO0FBQUEsTUFvbUJmO0FBQUEsTUFBQTJRLE9BQUEsQ0FBUVMsTUFBUixHQUFpQkEsTUFBakIsQ0FwbUJlO0FBQUEsTUFxbUJmO0FBQUEsTUFBQVQsT0FBQSxDQUFRRCxPQUFSLEdBQWtCYixDQUFsQixDQXJtQmU7QUFBQSxNQTBtQmY7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBQSxDQUFBLENBQUV3WSxVQUFGLEdBQWUsVUFBVTFPLE1BQVYsRUFBa0I7QUFBQSxRQUc3QjtBQUFBO0FBQUEsZUFBT0EsTUFIc0I7QUFBQSxPQUFqQyxDQTFtQmU7QUFBQSxNQWduQmYrTSxPQUFBLENBQVExWSxTQUFSLENBQWtCcWEsVUFBbEIsR0FBK0IsWUFBWTtBQUFBLFFBR3ZDO0FBQUE7QUFBQSxlQUFPLElBSGdDO0FBQUEsT0FBM0MsQ0FobkJlO0FBQUEsTUErbkJmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUF4WSxDQUFBLENBQUVoTixJQUFGLEdBQVMsVUFBVWYsQ0FBVixFQUFhd21CLENBQWIsRUFBZ0I7QUFBQSxRQUNyQixPQUFPelksQ0FBQSxDQUFFL04sQ0FBRixFQUFLZSxJQUFMLENBQVV5bEIsQ0FBVixDQURjO0FBQUEsT0FBekIsQ0EvbkJlO0FBQUEsTUFtb0JmNUIsT0FBQSxDQUFRMVksU0FBUixDQUFrQm5MLElBQWxCLEdBQXlCLFVBQVUwbEIsSUFBVixFQUFnQjtBQUFBLFFBQ3JDLE9BQU8xWSxDQUFBLENBQUU7QUFBQSxVQUFDLElBQUQ7QUFBQSxVQUFPMFksSUFBUDtBQUFBLFNBQUYsRUFBZ0JDLE1BQWhCLENBQXVCLFVBQVUxbUIsQ0FBVixFQUFhd21CLENBQWIsRUFBZ0I7QUFBQSxVQUMxQyxJQUFJeG1CLENBQUEsS0FBTXdtQixDQUFWLEVBQWE7QUFBQSxZQUVUO0FBQUEsbUJBQU94bUIsQ0FGRTtBQUFBLFdBQWIsTUFHTztBQUFBLFlBQ0gsTUFBTSxJQUFJcVosS0FBSixDQUFVLCtCQUErQnJaLENBQS9CLEdBQW1DLEdBQW5DLEdBQXlDd21CLENBQW5ELENBREg7QUFBQSxXQUptQztBQUFBLFNBQXZDLENBRDhCO0FBQUEsT0FBekMsQ0Fub0JlO0FBQUEsTUFtcEJmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBelksQ0FBQSxDQUFFdVksSUFBRixHQUFTQSxJQUFULENBbnBCZTtBQUFBLE1Bb3BCZixTQUFTQSxJQUFULENBQWNLLFFBQWQsRUFBd0I7QUFBQSxRQUNwQixPQUFPOVgsT0FBQSxDQUFRLFVBQVVELE9BQVYsRUFBbUJVLE1BQW5CLEVBQTJCO0FBQUEsVUFNdEM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQUssSUFBSWpTLENBQUEsR0FBSSxDQUFSLEVBQVd3TSxHQUFBLEdBQU04YyxRQUFBLENBQVMva0IsTUFBMUIsQ0FBTCxDQUF1Q3ZFLENBQUEsR0FBSXdNLEdBQTNDLEVBQWdEeE0sQ0FBQSxFQUFoRCxFQUFxRDtBQUFBLFlBQ2pEMFEsQ0FBQSxDQUFFNFksUUFBQSxDQUFTdHBCLENBQVQsQ0FBRixFQUFlNFMsSUFBZixDQUFvQnJCLE9BQXBCLEVBQTZCVSxNQUE3QixDQURpRDtBQUFBLFdBTmY7QUFBQSxTQUFuQyxDQURhO0FBQUEsT0FwcEJUO0FBQUEsTUFpcUJmc1YsT0FBQSxDQUFRMVksU0FBUixDQUFrQm9hLElBQWxCLEdBQXlCLFlBQVk7QUFBQSxRQUNqQyxPQUFPLEtBQUtyVyxJQUFMLENBQVVsQyxDQUFBLENBQUV1WSxJQUFaLENBRDBCO0FBQUEsT0FBckMsQ0FqcUJlO0FBQUEsTUFnckJmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBdlksQ0FBQSxDQUFFNlksV0FBRixHQUFnQmhDLE9BQWhCLENBaHJCZTtBQUFBLE1BaXJCZixTQUFTQSxPQUFULENBQWlCaUMsVUFBakIsRUFBNkJySSxRQUE3QixFQUF1Q3FILE9BQXZDLEVBQWdEO0FBQUEsUUFDNUMsSUFBSXJILFFBQUEsS0FBYSxLQUFLLENBQXRCLEVBQXlCO0FBQUEsVUFDckJBLFFBQUEsR0FBVyxVQUFVZ0gsRUFBVixFQUFjO0FBQUEsWUFDckIsT0FBT2xXLE1BQUEsQ0FBTyxJQUFJK0osS0FBSixDQUNWLHlDQUF5Q21NLEVBRC9CLENBQVAsQ0FEYztBQUFBLFdBREo7QUFBQSxTQURtQjtBQUFBLFFBUTVDLElBQUlLLE9BQUEsS0FBWSxLQUFLLENBQXJCLEVBQXdCO0FBQUEsVUFDcEJBLE9BQUEsR0FBVSxZQUFZO0FBQUEsWUFDbEIsT0FBTyxFQUFDQyxLQUFBLEVBQU8sU0FBUixFQURXO0FBQUEsV0FERjtBQUFBLFNBUm9CO0FBQUEsUUFjNUMsSUFBSWpYLE9BQUEsR0FBVTBULGFBQUEsQ0FBY3FDLE9BQUEsQ0FBUTFZLFNBQXRCLENBQWQsQ0FkNEM7QUFBQSxRQWdCNUMyQyxPQUFBLENBQVEwVyxlQUFSLEdBQTBCLFVBQVUzVyxPQUFWLEVBQW1CNFcsRUFBbkIsRUFBdUI1bkIsSUFBdkIsRUFBNkI7QUFBQSxVQUNuRCxJQUFJb1UsTUFBSixDQURtRDtBQUFBLFVBRW5ELElBQUk7QUFBQSxZQUNBLElBQUk2VSxVQUFBLENBQVdyQixFQUFYLENBQUosRUFBb0I7QUFBQSxjQUNoQnhULE1BQUEsR0FBUzZVLFVBQUEsQ0FBV3JCLEVBQVgsRUFBZS9uQixLQUFmLENBQXFCb1IsT0FBckIsRUFBOEJqUixJQUE5QixDQURPO0FBQUEsYUFBcEIsTUFFTztBQUFBLGNBQ0hvVSxNQUFBLEdBQVN3TSxRQUFBLENBQVMxZ0IsSUFBVCxDQUFjK1EsT0FBZCxFQUF1QjJXLEVBQXZCLEVBQTJCNW5CLElBQTNCLENBRE47QUFBQSxhQUhQO0FBQUEsV0FBSixDQU1FLE9BQU9pbEIsU0FBUCxFQUFrQjtBQUFBLFlBQ2hCN1EsTUFBQSxHQUFTMUMsTUFBQSxDQUFPdVQsU0FBUCxDQURPO0FBQUEsV0FSK0I7QUFBQSxVQVduRCxJQUFJalUsT0FBSixFQUFhO0FBQUEsWUFDVEEsT0FBQSxDQUFRb0QsTUFBUixDQURTO0FBQUEsV0FYc0M7QUFBQSxTQUF2RCxDQWhCNEM7QUFBQSxRQWdDNUNuRCxPQUFBLENBQVFnWCxPQUFSLEdBQWtCQSxPQUFsQixDQWhDNEM7QUFBQSxRQW1DNUM7QUFBQSxZQUFJQSxPQUFKLEVBQWE7QUFBQSxVQUNULElBQUlpQixTQUFBLEdBQVlqQixPQUFBLEVBQWhCLENBRFM7QUFBQSxVQUVULElBQUlpQixTQUFBLENBQVVoQixLQUFWLEtBQW9CLFVBQXhCLEVBQW9DO0FBQUEsWUFDaENqWCxPQUFBLENBQVFnVSxTQUFSLEdBQW9CaUUsU0FBQSxDQUFVYixNQURFO0FBQUEsV0FGM0I7QUFBQSxVQU1UcFgsT0FBQSxDQUFROFEsT0FBUixHQUFrQixZQUFZO0FBQUEsWUFDMUIsSUFBSW1ILFNBQUEsR0FBWWpCLE9BQUEsRUFBaEIsQ0FEMEI7QUFBQSxZQUUxQixJQUFJaUIsU0FBQSxDQUFVaEIsS0FBVixLQUFvQixTQUFwQixJQUNBZ0IsU0FBQSxDQUFVaEIsS0FBVixLQUFvQixVQUR4QixFQUNvQztBQUFBLGNBQ2hDLE9BQU9qWCxPQUR5QjtBQUFBLGFBSFY7QUFBQSxZQU0xQixPQUFPaVksU0FBQSxDQUFVemhCLEtBTlM7QUFBQSxXQU5yQjtBQUFBLFNBbkMrQjtBQUFBLFFBbUQ1QyxPQUFPd0osT0FuRHFDO0FBQUEsT0FqckJqQztBQUFBLE1BdXVCZitWLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0IxQyxRQUFsQixHQUE2QixZQUFZO0FBQUEsUUFDckMsT0FBTyxrQkFEOEI7QUFBQSxPQUF6QyxDQXZ1QmU7QUFBQSxNQTJ1QmZvYixPQUFBLENBQVExWSxTQUFSLENBQWtCK0QsSUFBbEIsR0FBeUIsVUFBVThXLFNBQVYsRUFBcUJDLFFBQXJCLEVBQStCQyxVQUEvQixFQUEyQztBQUFBLFFBQ2hFLElBQUl0Z0IsSUFBQSxHQUFPLElBQVgsQ0FEZ0U7QUFBQSxRQUVoRSxJQUFJMmUsUUFBQSxHQUFXM1csS0FBQSxFQUFmLENBRmdFO0FBQUEsUUFHaEUsSUFBSXVZLElBQUEsR0FBTyxLQUFYLENBSGdFO0FBQUEsUUFNaEU7QUFBQTtBQUFBLGlCQUFTQyxVQUFULENBQW9COWhCLEtBQXBCLEVBQTJCO0FBQUEsVUFDdkIsSUFBSTtBQUFBLFlBQ0EsT0FBTyxPQUFPMGhCLFNBQVAsS0FBcUIsVUFBckIsR0FBa0NBLFNBQUEsQ0FBVTFoQixLQUFWLENBQWxDLEdBQXFEQSxLQUQ1RDtBQUFBLFdBQUosQ0FFRSxPQUFPd2QsU0FBUCxFQUFrQjtBQUFBLFlBQ2hCLE9BQU92VCxNQUFBLENBQU91VCxTQUFQLENBRFM7QUFBQSxXQUhHO0FBQUEsU0FOcUM7QUFBQSxRQWNoRSxTQUFTdUUsU0FBVCxDQUFtQnZFLFNBQW5CLEVBQThCO0FBQUEsVUFDMUIsSUFBSSxPQUFPbUUsUUFBUCxLQUFvQixVQUF4QixFQUFvQztBQUFBLFlBQ2hDL0Qsa0JBQUEsQ0FBbUJKLFNBQW5CLEVBQThCbGMsSUFBOUIsRUFEZ0M7QUFBQSxZQUVoQyxJQUFJO0FBQUEsY0FDQSxPQUFPcWdCLFFBQUEsQ0FBU25FLFNBQVQsQ0FEUDtBQUFBLGFBQUosQ0FFRSxPQUFPd0UsWUFBUCxFQUFxQjtBQUFBLGNBQ25CLE9BQU8vWCxNQUFBLENBQU8rWCxZQUFQLENBRFk7QUFBQSxhQUpTO0FBQUEsV0FEVjtBQUFBLFVBUzFCLE9BQU8vWCxNQUFBLENBQU91VCxTQUFQLENBVG1CO0FBQUEsU0Fka0M7QUFBQSxRQTBCaEUsU0FBU3lFLFdBQVQsQ0FBcUJqaUIsS0FBckIsRUFBNEI7QUFBQSxVQUN4QixPQUFPLE9BQU80aEIsVUFBUCxLQUFzQixVQUF0QixHQUFtQ0EsVUFBQSxDQUFXNWhCLEtBQVgsQ0FBbkMsR0FBdURBLEtBRHRDO0FBQUEsU0ExQm9DO0FBQUEsUUE4QmhFMEksQ0FBQSxDQUFFeVMsUUFBRixDQUFXLFlBQVk7QUFBQSxVQUNuQjdaLElBQUEsQ0FBSzRlLGVBQUwsQ0FBcUIsVUFBVWxnQixLQUFWLEVBQWlCO0FBQUEsWUFDbEMsSUFBSTZoQixJQUFKLEVBQVU7QUFBQSxjQUNOLE1BRE07QUFBQSxhQUR3QjtBQUFBLFlBSWxDQSxJQUFBLEdBQU8sSUFBUCxDQUprQztBQUFBLFlBTWxDNUIsUUFBQSxDQUFTMVcsT0FBVCxDQUFpQnVZLFVBQUEsQ0FBVzloQixLQUFYLENBQWpCLENBTmtDO0FBQUEsV0FBdEMsRUFPRyxNQVBILEVBT1csQ0FBQyxVQUFVd2QsU0FBVixFQUFxQjtBQUFBLGNBQzdCLElBQUlxRSxJQUFKLEVBQVU7QUFBQSxnQkFDTixNQURNO0FBQUEsZUFEbUI7QUFBQSxjQUk3QkEsSUFBQSxHQUFPLElBQVAsQ0FKNkI7QUFBQSxjQU03QjVCLFFBQUEsQ0FBUzFXLE9BQVQsQ0FBaUJ3WSxTQUFBLENBQVV2RSxTQUFWLENBQWpCLENBTjZCO0FBQUEsYUFBdEIsQ0FQWCxDQURtQjtBQUFBLFNBQXZCLEVBOUJnRTtBQUFBLFFBaURoRTtBQUFBLFFBQUFsYyxJQUFBLENBQUs0ZSxlQUFMLENBQXFCLEtBQUssQ0FBMUIsRUFBNkIsTUFBN0IsRUFBcUM7QUFBQSxVQUFDLEtBQUssQ0FBTjtBQUFBLFVBQVMsVUFBVWxnQixLQUFWLEVBQWlCO0FBQUEsWUFDM0QsSUFBSWtpQixRQUFKLENBRDJEO0FBQUEsWUFFM0QsSUFBSUMsS0FBQSxHQUFRLEtBQVosQ0FGMkQ7QUFBQSxZQUczRCxJQUFJO0FBQUEsY0FDQUQsUUFBQSxHQUFXRCxXQUFBLENBQVlqaUIsS0FBWixDQURYO0FBQUEsYUFBSixDQUVFLE9BQU9xRCxDQUFQLEVBQVU7QUFBQSxjQUNSOGUsS0FBQSxHQUFRLElBQVIsQ0FEUTtBQUFBLGNBRVIsSUFBSXpaLENBQUEsQ0FBRTBaLE9BQU4sRUFBZTtBQUFBLGdCQUNYMVosQ0FBQSxDQUFFMFosT0FBRixDQUFVL2UsQ0FBVixDQURXO0FBQUEsZUFBZixNQUVPO0FBQUEsZ0JBQ0gsTUFBTUEsQ0FESDtBQUFBLGVBSkM7QUFBQSxhQUwrQztBQUFBLFlBYzNELElBQUksQ0FBQzhlLEtBQUwsRUFBWTtBQUFBLGNBQ1JsQyxRQUFBLENBQVN4VixNQUFULENBQWdCeVgsUUFBaEIsQ0FEUTtBQUFBLGFBZCtDO0FBQUEsV0FBMUI7QUFBQSxTQUFyQyxFQWpEZ0U7QUFBQSxRQW9FaEUsT0FBT2pDLFFBQUEsQ0FBU3pXLE9BcEVnRDtBQUFBLE9BQXBFLENBM3VCZTtBQUFBLE1Ba3pCZmQsQ0FBQSxDQUFFc08sR0FBRixHQUFRLFVBQVV4TixPQUFWLEVBQW1CcVQsUUFBbkIsRUFBNkI7QUFBQSxRQUNqQyxPQUFPblUsQ0FBQSxDQUFFYyxPQUFGLEVBQVd3TixHQUFYLENBQWU2RixRQUFmLENBRDBCO0FBQUEsT0FBckMsQ0FsekJlO0FBQUEsTUFrMEJmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEwQyxPQUFBLENBQVExWSxTQUFSLENBQWtCbVEsR0FBbEIsR0FBd0IsVUFBVTZGLFFBQVYsRUFBb0I7QUFBQSxRQUN4Q0EsUUFBQSxHQUFXblUsQ0FBQSxDQUFFbVUsUUFBRixDQUFYLENBRHdDO0FBQUEsUUFHeEMsT0FBTyxLQUFLalMsSUFBTCxDQUFVLFVBQVU1SyxLQUFWLEVBQWlCO0FBQUEsVUFDOUIsT0FBTzZjLFFBQUEsQ0FBU3dGLEtBQVQsQ0FBZXJpQixLQUFmLEVBQXNCc2lCLFdBQXRCLENBQWtDdGlCLEtBQWxDLENBRHVCO0FBQUEsU0FBM0IsQ0FIaUM7QUFBQSxPQUE1QyxDQWwwQmU7QUFBQSxNQTAxQmY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBMEksQ0FBQSxDQUFFNlosSUFBRixHQUFTQSxJQUFULENBMTFCZTtBQUFBLE1BMjFCZixTQUFTQSxJQUFULENBQWN2aUIsS0FBZCxFQUFxQjBoQixTQUFyQixFQUFnQ0MsUUFBaEMsRUFBMENDLFVBQTFDLEVBQXNEO0FBQUEsUUFDbEQsT0FBT2xaLENBQUEsQ0FBRTFJLEtBQUYsRUFBUzRLLElBQVQsQ0FBYzhXLFNBQWQsRUFBeUJDLFFBQXpCLEVBQW1DQyxVQUFuQyxDQUQyQztBQUFBLE9BMzFCdkM7QUFBQSxNQSsxQmZyQyxPQUFBLENBQVExWSxTQUFSLENBQWtCeWIsV0FBbEIsR0FBZ0MsVUFBVXRpQixLQUFWLEVBQWlCO0FBQUEsUUFDN0MsT0FBTyxLQUFLNEssSUFBTCxDQUFVLFlBQVk7QUFBQSxVQUFFLE9BQU81SyxLQUFUO0FBQUEsU0FBdEIsQ0FEc0M7QUFBQSxPQUFqRCxDQS8xQmU7QUFBQSxNQW0yQmYwSSxDQUFBLENBQUU0WixXQUFGLEdBQWdCLFVBQVU5WSxPQUFWLEVBQW1CeEosS0FBbkIsRUFBMEI7QUFBQSxRQUN0QyxPQUFPMEksQ0FBQSxDQUFFYyxPQUFGLEVBQVc4WSxXQUFYLENBQXVCdGlCLEtBQXZCLENBRCtCO0FBQUEsT0FBMUMsQ0FuMkJlO0FBQUEsTUF1MkJmdWYsT0FBQSxDQUFRMVksU0FBUixDQUFrQjJiLFVBQWxCLEdBQStCLFVBQVU1QixNQUFWLEVBQWtCO0FBQUEsUUFDN0MsT0FBTyxLQUFLaFcsSUFBTCxDQUFVLFlBQVk7QUFBQSxVQUFFLE1BQU1nVyxNQUFSO0FBQUEsU0FBdEIsQ0FEc0M7QUFBQSxPQUFqRCxDQXYyQmU7QUFBQSxNQTIyQmZsWSxDQUFBLENBQUU4WixVQUFGLEdBQWUsVUFBVWhaLE9BQVYsRUFBbUJvWCxNQUFuQixFQUEyQjtBQUFBLFFBQ3RDLE9BQU9sWSxDQUFBLENBQUVjLE9BQUYsRUFBV2daLFVBQVgsQ0FBc0I1QixNQUF0QixDQUQrQjtBQUFBLE9BQTFDLENBMzJCZTtBQUFBLE1BMDNCZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFsWSxDQUFBLENBQUU0WCxNQUFGLEdBQVdBLE1BQVgsQ0ExM0JlO0FBQUEsTUEyM0JmLFNBQVNBLE1BQVQsQ0FBZ0J0Z0IsS0FBaEIsRUFBdUI7QUFBQSxRQUNuQixJQUFJdWdCLFNBQUEsQ0FBVXZnQixLQUFWLENBQUosRUFBc0I7QUFBQSxVQUNsQixJQUFJeWhCLFNBQUEsR0FBWXpoQixLQUFBLENBQU13Z0IsT0FBTixFQUFoQixDQURrQjtBQUFBLFVBRWxCLElBQUlpQixTQUFBLENBQVVoQixLQUFWLEtBQW9CLFdBQXhCLEVBQXFDO0FBQUEsWUFDakMsT0FBT2dCLFNBQUEsQ0FBVXpoQixLQURnQjtBQUFBLFdBRm5CO0FBQUEsU0FESDtBQUFBLFFBT25CLE9BQU9BLEtBUFk7QUFBQSxPQTMzQlI7QUFBQSxNQXk0QmY7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBMEksQ0FBQSxDQUFFNlgsU0FBRixHQUFjQSxTQUFkLENBejRCZTtBQUFBLE1BMDRCZixTQUFTQSxTQUFULENBQW1CL04sTUFBbkIsRUFBMkI7QUFBQSxRQUN2QixPQUFPQSxNQUFBLFlBQWtCK00sT0FERjtBQUFBLE9BMTRCWjtBQUFBLE1BODRCZjdXLENBQUEsQ0FBRThXLGNBQUYsR0FBbUJBLGNBQW5CLENBOTRCZTtBQUFBLE1BKzRCZixTQUFTQSxjQUFULENBQXdCaE4sTUFBeEIsRUFBZ0M7QUFBQSxRQUM1QixPQUFPckksUUFBQSxDQUFTcUksTUFBVCxLQUFvQixPQUFPQSxNQUFBLENBQU81SCxJQUFkLEtBQXVCLFVBRHRCO0FBQUEsT0EvNEJqQjtBQUFBLE1BdTVCZjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFsQyxDQUFBLENBQUUrWixTQUFGLEdBQWNBLFNBQWQsQ0F2NUJlO0FBQUEsTUF3NUJmLFNBQVNBLFNBQVQsQ0FBbUJqUSxNQUFuQixFQUEyQjtBQUFBLFFBQ3ZCLE9BQU8rTixTQUFBLENBQVUvTixNQUFWLEtBQXFCQSxNQUFBLENBQU9nTyxPQUFQLEdBQWlCQyxLQUFqQixLQUEyQixTQURoQztBQUFBLE9BeDVCWjtBQUFBLE1BNDVCZmxCLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0I0YixTQUFsQixHQUE4QixZQUFZO0FBQUEsUUFDdEMsT0FBTyxLQUFLakMsT0FBTCxHQUFlQyxLQUFmLEtBQXlCLFNBRE07QUFBQSxPQUExQyxDQTU1QmU7QUFBQSxNQW82QmY7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBL1gsQ0FBQSxDQUFFZ2EsV0FBRixHQUFnQkEsV0FBaEIsQ0FwNkJlO0FBQUEsTUFxNkJmLFNBQVNBLFdBQVQsQ0FBcUJsUSxNQUFyQixFQUE2QjtBQUFBLFFBQ3pCLE9BQU8sQ0FBQytOLFNBQUEsQ0FBVS9OLE1BQVYsQ0FBRCxJQUFzQkEsTUFBQSxDQUFPZ08sT0FBUCxHQUFpQkMsS0FBakIsS0FBMkIsV0FEL0I7QUFBQSxPQXI2QmQ7QUFBQSxNQXk2QmZsQixPQUFBLENBQVExWSxTQUFSLENBQWtCNmIsV0FBbEIsR0FBZ0MsWUFBWTtBQUFBLFFBQ3hDLE9BQU8sS0FBS2xDLE9BQUwsR0FBZUMsS0FBZixLQUF5QixXQURRO0FBQUEsT0FBNUMsQ0F6NkJlO0FBQUEsTUFnN0JmO0FBQUE7QUFBQTtBQUFBLE1BQUEvWCxDQUFBLENBQUVpYSxVQUFGLEdBQWVBLFVBQWYsQ0FoN0JlO0FBQUEsTUFpN0JmLFNBQVNBLFVBQVQsQ0FBb0JuUSxNQUFwQixFQUE0QjtBQUFBLFFBQ3hCLE9BQU8rTixTQUFBLENBQVUvTixNQUFWLEtBQXFCQSxNQUFBLENBQU9nTyxPQUFQLEdBQWlCQyxLQUFqQixLQUEyQixVQUQvQjtBQUFBLE9BajdCYjtBQUFBLE1BcTdCZmxCLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0I4YixVQUFsQixHQUErQixZQUFZO0FBQUEsUUFDdkMsT0FBTyxLQUFLbkMsT0FBTCxHQUFlQyxLQUFmLEtBQXlCLFVBRE87QUFBQSxPQUEzQyxDQXI3QmU7QUFBQSxNQSs3QmY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBQUltQyxnQkFBQSxHQUFtQixFQUF2QixDQS83QmU7QUFBQSxNQWc4QmYsSUFBSUMsbUJBQUEsR0FBc0IsRUFBMUIsQ0FoOEJlO0FBQUEsTUFpOEJmLElBQUlDLDJCQUFBLEdBQThCLEVBQWxDLENBajhCZTtBQUFBLE1BazhCZixJQUFJQyx3QkFBQSxHQUEyQixJQUEvQixDQWw4QmU7QUFBQSxNQW84QmYsU0FBU0Msd0JBQVQsR0FBb0M7QUFBQSxRQUNoQ0osZ0JBQUEsQ0FBaUJybUIsTUFBakIsR0FBMEIsQ0FBMUIsQ0FEZ0M7QUFBQSxRQUVoQ3NtQixtQkFBQSxDQUFvQnRtQixNQUFwQixHQUE2QixDQUE3QixDQUZnQztBQUFBLFFBSWhDLElBQUksQ0FBQ3dtQix3QkFBTCxFQUErQjtBQUFBLFVBQzNCQSx3QkFBQSxHQUEyQixJQURBO0FBQUEsU0FKQztBQUFBLE9BcDhCckI7QUFBQSxNQTY4QmYsU0FBU0UsY0FBVCxDQUF3QnpaLE9BQXhCLEVBQWlDb1gsTUFBakMsRUFBeUM7QUFBQSxRQUNyQyxJQUFJLENBQUNtQyx3QkFBTCxFQUErQjtBQUFBLFVBQzNCLE1BRDJCO0FBQUEsU0FETTtBQUFBLFFBSXJDLElBQUksT0FBT2hILE9BQVAsS0FBbUIsUUFBbkIsSUFBK0IsT0FBT0EsT0FBQSxDQUFRcGlCLElBQWYsS0FBd0IsVUFBM0QsRUFBdUU7QUFBQSxVQUNuRStPLENBQUEsQ0FBRXlTLFFBQUYsQ0FBV3FCLFFBQVgsQ0FBb0IsWUFBWTtBQUFBLFlBQzVCLElBQUlPLGFBQUEsQ0FBYzhGLG1CQUFkLEVBQW1DclosT0FBbkMsTUFBZ0QsQ0FBQyxDQUFyRCxFQUF3RDtBQUFBLGNBQ3BEdVMsT0FBQSxDQUFRcGlCLElBQVIsQ0FBYSxvQkFBYixFQUFtQ2luQixNQUFuQyxFQUEyQ3BYLE9BQTNDLEVBRG9EO0FBQUEsY0FFcERzWiwyQkFBQSxDQUE0QmxyQixJQUE1QixDQUFpQzRSLE9BQWpDLENBRm9EO0FBQUEsYUFENUI7QUFBQSxXQUFoQyxDQURtRTtBQUFBLFNBSmxDO0FBQUEsUUFhckNxWixtQkFBQSxDQUFvQmpyQixJQUFwQixDQUF5QjRSLE9BQXpCLEVBYnFDO0FBQUEsUUFjckMsSUFBSW9YLE1BQUEsSUFBVSxPQUFPQSxNQUFBLENBQU83RixLQUFkLEtBQXdCLFdBQXRDLEVBQW1EO0FBQUEsVUFDL0M2SCxnQkFBQSxDQUFpQmhyQixJQUFqQixDQUFzQmdwQixNQUFBLENBQU83RixLQUE3QixDQUQrQztBQUFBLFNBQW5ELE1BRU87QUFBQSxVQUNINkgsZ0JBQUEsQ0FBaUJockIsSUFBakIsQ0FBc0IsZ0JBQWdCZ3BCLE1BQXRDLENBREc7QUFBQSxTQWhCOEI7QUFBQSxPQTc4QjFCO0FBQUEsTUFrK0JmLFNBQVNzQyxnQkFBVCxDQUEwQjFaLE9BQTFCLEVBQW1DO0FBQUEsUUFDL0IsSUFBSSxDQUFDdVosd0JBQUwsRUFBK0I7QUFBQSxVQUMzQixNQUQyQjtBQUFBLFNBREE7QUFBQSxRQUsvQixJQUFJSSxFQUFBLEdBQUtwRyxhQUFBLENBQWM4RixtQkFBZCxFQUFtQ3JaLE9BQW5DLENBQVQsQ0FMK0I7QUFBQSxRQU0vQixJQUFJMlosRUFBQSxLQUFPLENBQUMsQ0FBWixFQUFlO0FBQUEsVUFDWCxJQUFJLE9BQU9wSCxPQUFQLEtBQW1CLFFBQW5CLElBQStCLE9BQU9BLE9BQUEsQ0FBUXBpQixJQUFmLEtBQXdCLFVBQTNELEVBQXVFO0FBQUEsWUFDbkUrTyxDQUFBLENBQUV5UyxRQUFGLENBQVdxQixRQUFYLENBQW9CLFlBQVk7QUFBQSxjQUM1QixJQUFJNEcsUUFBQSxHQUFXckcsYUFBQSxDQUFjK0YsMkJBQWQsRUFBMkN0WixPQUEzQyxDQUFmLENBRDRCO0FBQUEsY0FFNUIsSUFBSTRaLFFBQUEsS0FBYSxDQUFDLENBQWxCLEVBQXFCO0FBQUEsZ0JBQ2pCckgsT0FBQSxDQUFRcGlCLElBQVIsQ0FBYSxrQkFBYixFQUFpQ2lwQixnQkFBQSxDQUFpQk8sRUFBakIsQ0FBakMsRUFBdUQzWixPQUF2RCxFQURpQjtBQUFBLGdCQUVqQnNaLDJCQUFBLENBQTRCNXFCLE1BQTVCLENBQW1Da3JCLFFBQW5DLEVBQTZDLENBQTdDLENBRmlCO0FBQUEsZUFGTztBQUFBLGFBQWhDLENBRG1FO0FBQUEsV0FENUQ7QUFBQSxVQVVYUCxtQkFBQSxDQUFvQjNxQixNQUFwQixDQUEyQmlyQixFQUEzQixFQUErQixDQUEvQixFQVZXO0FBQUEsVUFXWFAsZ0JBQUEsQ0FBaUIxcUIsTUFBakIsQ0FBd0JpckIsRUFBeEIsRUFBNEIsQ0FBNUIsQ0FYVztBQUFBLFNBTmdCO0FBQUEsT0FsK0JwQjtBQUFBLE1BdS9CZnphLENBQUEsQ0FBRXNhLHdCQUFGLEdBQTZCQSx3QkFBN0IsQ0F2L0JlO0FBQUEsTUF5L0JmdGEsQ0FBQSxDQUFFMmEsbUJBQUYsR0FBd0IsWUFBWTtBQUFBLFFBRWhDO0FBQUEsZUFBT1QsZ0JBQUEsQ0FBaUJwcUIsS0FBakIsRUFGeUI7QUFBQSxPQUFwQyxDQXovQmU7QUFBQSxNQTgvQmZrUSxDQUFBLENBQUU0YSw4QkFBRixHQUFtQyxZQUFZO0FBQUEsUUFDM0NOLHdCQUFBLEdBRDJDO0FBQUEsUUFFM0NELHdCQUFBLEdBQTJCLEtBRmdCO0FBQUEsT0FBL0MsQ0E5L0JlO0FBQUEsTUFtZ0NmQyx3QkFBQSxHQW5nQ2U7QUFBQSxNQTJnQ2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUF0YSxDQUFBLENBQUV1QixNQUFGLEdBQVdBLE1BQVgsQ0EzZ0NlO0FBQUEsTUE0Z0NmLFNBQVNBLE1BQVQsQ0FBZ0IyVyxNQUFoQixFQUF3QjtBQUFBLFFBQ3BCLElBQUkyQyxTQUFBLEdBQVloRSxPQUFBLENBQVE7QUFBQSxVQUNwQixRQUFRLFVBQVVvQyxRQUFWLEVBQW9CO0FBQUEsWUFFeEI7QUFBQSxnQkFBSUEsUUFBSixFQUFjO0FBQUEsY0FDVnVCLGdCQUFBLENBQWlCLElBQWpCLENBRFU7QUFBQSxhQUZVO0FBQUEsWUFLeEIsT0FBT3ZCLFFBQUEsR0FBV0EsUUFBQSxDQUFTZixNQUFULENBQVgsR0FBOEIsSUFMYjtBQUFBLFdBRFI7QUFBQSxTQUFSLEVBUWIsU0FBU3pILFFBQVQsR0FBb0I7QUFBQSxVQUNuQixPQUFPLElBRFk7QUFBQSxTQVJQLEVBVWIsU0FBU3FILE9BQVQsR0FBbUI7QUFBQSxVQUNsQixPQUFPO0FBQUEsWUFBRUMsS0FBQSxFQUFPLFVBQVQ7QUFBQSxZQUFxQkcsTUFBQSxFQUFRQSxNQUE3QjtBQUFBLFdBRFc7QUFBQSxTQVZOLENBQWhCLENBRG9CO0FBQUEsUUFnQnBCO0FBQUEsUUFBQXFDLGNBQUEsQ0FBZU0sU0FBZixFQUEwQjNDLE1BQTFCLEVBaEJvQjtBQUFBLFFBa0JwQixPQUFPMkMsU0FsQmE7QUFBQSxPQTVnQ1Q7QUFBQSxNQXFpQ2Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBN2EsQ0FBQSxDQUFFZ1gsT0FBRixHQUFZQSxPQUFaLENBcmlDZTtBQUFBLE1Bc2lDZixTQUFTQSxPQUFULENBQWlCMWYsS0FBakIsRUFBd0I7QUFBQSxRQUNwQixPQUFPdWYsT0FBQSxDQUFRO0FBQUEsVUFDWCxRQUFRLFlBQVk7QUFBQSxZQUNoQixPQUFPdmYsS0FEUztBQUFBLFdBRFQ7QUFBQSxVQUlYLE9BQU8sVUFBVXRJLElBQVYsRUFBZ0I7QUFBQSxZQUNuQixPQUFPc0ksS0FBQSxDQUFNdEksSUFBTixDQURZO0FBQUEsV0FKWjtBQUFBLFVBT1gsT0FBTyxVQUFVQSxJQUFWLEVBQWdCOHJCLEdBQWhCLEVBQXFCO0FBQUEsWUFDeEJ4akIsS0FBQSxDQUFNdEksSUFBTixJQUFjOHJCLEdBRFU7QUFBQSxXQVBqQjtBQUFBLFVBVVgsVUFBVSxVQUFVOXJCLElBQVYsRUFBZ0I7QUFBQSxZQUN0QixPQUFPc0ksS0FBQSxDQUFNdEksSUFBTixDQURlO0FBQUEsV0FWZjtBQUFBLFVBYVgsUUFBUSxVQUFVQSxJQUFWLEVBQWdCYSxJQUFoQixFQUFzQjtBQUFBLFlBRzFCO0FBQUE7QUFBQSxnQkFBSWIsSUFBQSxLQUFTLElBQVQsSUFBaUJBLElBQUEsS0FBUyxLQUFLLENBQW5DLEVBQXNDO0FBQUEsY0FDbEMsT0FBT3NJLEtBQUEsQ0FBTTVILEtBQU4sQ0FBWSxLQUFLLENBQWpCLEVBQW9CRyxJQUFwQixDQUQyQjtBQUFBLGFBQXRDLE1BRU87QUFBQSxjQUNILE9BQU95SCxLQUFBLENBQU10SSxJQUFOLEVBQVlVLEtBQVosQ0FBa0I0SCxLQUFsQixFQUF5QnpILElBQXpCLENBREo7QUFBQSxhQUxtQjtBQUFBLFdBYm5CO0FBQUEsVUFzQlgsU0FBUyxVQUFVMGtCLEtBQVYsRUFBaUIxa0IsSUFBakIsRUFBdUI7QUFBQSxZQUM1QixPQUFPeUgsS0FBQSxDQUFNNUgsS0FBTixDQUFZNmtCLEtBQVosRUFBbUIxa0IsSUFBbkIsQ0FEcUI7QUFBQSxXQXRCckI7QUFBQSxVQXlCWCxRQUFRLFlBQVk7QUFBQSxZQUNoQixPQUFPOGtCLFdBQUEsQ0FBWXJkLEtBQVosQ0FEUztBQUFBLFdBekJUO0FBQUEsU0FBUixFQTRCSixLQUFLLENBNUJELEVBNEJJLFNBQVN3Z0IsT0FBVCxHQUFtQjtBQUFBLFVBQzFCLE9BQU87QUFBQSxZQUFFQyxLQUFBLEVBQU8sV0FBVDtBQUFBLFlBQXNCemdCLEtBQUEsRUFBT0EsS0FBN0I7QUFBQSxXQURtQjtBQUFBLFNBNUJ2QixDQURhO0FBQUEsT0F0aUNUO0FBQUEsTUE2a0NmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUFTeWYsTUFBVCxDQUFnQmpXLE9BQWhCLEVBQXlCO0FBQUEsUUFDckIsSUFBSXlXLFFBQUEsR0FBVzNXLEtBQUEsRUFBZixDQURxQjtBQUFBLFFBRXJCWixDQUFBLENBQUV5UyxRQUFGLENBQVcsWUFBWTtBQUFBLFVBQ25CLElBQUk7QUFBQSxZQUNBM1IsT0FBQSxDQUFRb0IsSUFBUixDQUFhcVYsUUFBQSxDQUFTMVcsT0FBdEIsRUFBK0IwVyxRQUFBLENBQVNoVyxNQUF4QyxFQUFnRGdXLFFBQUEsQ0FBU3hWLE1BQXpELENBREE7QUFBQSxXQUFKLENBRUUsT0FBTytTLFNBQVAsRUFBa0I7QUFBQSxZQUNoQnlDLFFBQUEsQ0FBU2hXLE1BQVQsQ0FBZ0J1VCxTQUFoQixDQURnQjtBQUFBLFdBSEQ7QUFBQSxTQUF2QixFQUZxQjtBQUFBLFFBU3JCLE9BQU95QyxRQUFBLENBQVN6VyxPQVRLO0FBQUEsT0E3a0NWO0FBQUEsTUFrbUNmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFkLENBQUEsQ0FBRSthLE1BQUYsR0FBV0EsTUFBWCxDQWxtQ2U7QUFBQSxNQW1tQ2YsU0FBU0EsTUFBVCxDQUFnQmpSLE1BQWhCLEVBQXdCO0FBQUEsUUFDcEIsT0FBTytNLE9BQUEsQ0FBUTtBQUFBLFVBQ1gsU0FBUyxZQUFZO0FBQUEsV0FEVjtBQUFBLFNBQVIsRUFFSixTQUFTcEcsUUFBVCxDQUFrQmdILEVBQWxCLEVBQXNCNW5CLElBQXRCLEVBQTRCO0FBQUEsVUFDM0IsT0FBT21yQixRQUFBLENBQVNsUixNQUFULEVBQWlCMk4sRUFBakIsRUFBcUI1bkIsSUFBckIsQ0FEb0I7QUFBQSxTQUZ4QixFQUlKLFlBQVk7QUFBQSxVQUNYLE9BQU9tUSxDQUFBLENBQUU4SixNQUFGLEVBQVVnTyxPQUFWLEVBREk7QUFBQSxTQUpSLENBRGE7QUFBQSxPQW5tQ1Q7QUFBQSxNQXVuQ2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBOVgsQ0FBQSxDQUFFMlksTUFBRixHQUFXQSxNQUFYLENBdm5DZTtBQUFBLE1Bd25DZixTQUFTQSxNQUFULENBQWdCcmhCLEtBQWhCLEVBQXVCMGhCLFNBQXZCLEVBQWtDQyxRQUFsQyxFQUE0QztBQUFBLFFBQ3hDLE9BQU9qWixDQUFBLENBQUUxSSxLQUFGLEVBQVNxaEIsTUFBVCxDQUFnQkssU0FBaEIsRUFBMkJDLFFBQTNCLENBRGlDO0FBQUEsT0F4bkM3QjtBQUFBLE1BNG5DZnBDLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0J3YSxNQUFsQixHQUEyQixVQUFVSyxTQUFWLEVBQXFCQyxRQUFyQixFQUErQjtBQUFBLFFBQ3RELE9BQU8sS0FBSzlvQixHQUFMLEdBQVcrUixJQUFYLENBQWdCLFVBQVVpRyxLQUFWLEVBQWlCO0FBQUEsVUFDcEMsT0FBTzZRLFNBQUEsQ0FBVXRwQixLQUFWLENBQWdCLEtBQUssQ0FBckIsRUFBd0J5WSxLQUF4QixDQUQ2QjtBQUFBLFNBQWpDLEVBRUo4USxRQUZJLENBRCtDO0FBQUEsT0FBMUQsQ0E1bkNlO0FBQUEsTUE0cENmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBalosQ0FBQSxDQUFFaWIsS0FBRixHQUFVQSxLQUFWLENBNXBDZTtBQUFBLE1BNnBDZixTQUFTQSxLQUFULENBQWVDLGFBQWYsRUFBOEI7QUFBQSxRQUMxQixPQUFPLFlBQVk7QUFBQSxVQUdmO0FBQUE7QUFBQSxtQkFBU0MsU0FBVCxDQUFtQkMsSUFBbkIsRUFBeUIvcEIsR0FBekIsRUFBOEI7QUFBQSxZQUMxQixJQUFJNFMsTUFBSixDQUQwQjtBQUFBLFlBVzFCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZ0JBQUksT0FBT29YLGFBQVAsS0FBeUIsV0FBN0IsRUFBMEM7QUFBQSxjQUV0QztBQUFBLGtCQUFJO0FBQUEsZ0JBQ0FwWCxNQUFBLEdBQVNxWCxTQUFBLENBQVVGLElBQVYsRUFBZ0IvcEIsR0FBaEIsQ0FEVDtBQUFBLGVBQUosQ0FFRSxPQUFPeWpCLFNBQVAsRUFBa0I7QUFBQSxnQkFDaEIsT0FBT3ZULE1BQUEsQ0FBT3VULFNBQVAsQ0FEUztBQUFBLGVBSmtCO0FBQUEsY0FPdEMsSUFBSTdRLE1BQUEsQ0FBT2tWLElBQVgsRUFBaUI7QUFBQSxnQkFDYixPQUFPblosQ0FBQSxDQUFFaUUsTUFBQSxDQUFPM00sS0FBVCxDQURNO0FBQUEsZUFBakIsTUFFTztBQUFBLGdCQUNILE9BQU91aUIsSUFBQSxDQUFLNVYsTUFBQSxDQUFPM00sS0FBWixFQUFtQjZjLFFBQW5CLEVBQTZCb0gsT0FBN0IsQ0FESjtBQUFBLGVBVCtCO0FBQUEsYUFBMUMsTUFZTztBQUFBLGNBR0g7QUFBQTtBQUFBLGtCQUFJO0FBQUEsZ0JBQ0F0WCxNQUFBLEdBQVNxWCxTQUFBLENBQVVGLElBQVYsRUFBZ0IvcEIsR0FBaEIsQ0FEVDtBQUFBLGVBQUosQ0FFRSxPQUFPeWpCLFNBQVAsRUFBa0I7QUFBQSxnQkFDaEIsSUFBSUQsZUFBQSxDQUFnQkMsU0FBaEIsQ0FBSixFQUFnQztBQUFBLGtCQUM1QixPQUFPOVUsQ0FBQSxDQUFFOFUsU0FBQSxDQUFVeGQsS0FBWixDQURxQjtBQUFBLGlCQUFoQyxNQUVPO0FBQUEsa0JBQ0gsT0FBT2lLLE1BQUEsQ0FBT3VULFNBQVAsQ0FESjtBQUFBLGlCQUhTO0FBQUEsZUFMakI7QUFBQSxjQVlILE9BQU8rRSxJQUFBLENBQUs1VixNQUFMLEVBQWFrUSxRQUFiLEVBQXVCb0gsT0FBdkIsQ0FaSjtBQUFBLGFBdkJtQjtBQUFBLFdBSGY7QUFBQSxVQXlDZixJQUFJRCxTQUFBLEdBQVlKLGFBQUEsQ0FBY3hyQixLQUFkLENBQW9CLElBQXBCLEVBQTBCQyxTQUExQixDQUFoQixDQXpDZTtBQUFBLFVBMENmLElBQUl3a0IsUUFBQSxHQUFXZ0gsU0FBQSxDQUFVamhCLElBQVYsQ0FBZWloQixTQUFmLEVBQTBCLE1BQTFCLENBQWYsQ0ExQ2U7QUFBQSxVQTJDZixJQUFJSSxPQUFBLEdBQVVKLFNBQUEsQ0FBVWpoQixJQUFWLENBQWVpaEIsU0FBZixFQUEwQixPQUExQixDQUFkLENBM0NlO0FBQUEsVUE0Q2YsT0FBT2hILFFBQUEsRUE1Q1E7QUFBQSxTQURPO0FBQUEsT0E3cENmO0FBQUEsTUFxdENmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQW5VLENBQUEsQ0FBRXdiLEtBQUYsR0FBVUEsS0FBVixDQXJ0Q2U7QUFBQSxNQXN0Q2YsU0FBU0EsS0FBVCxDQUFlTixhQUFmLEVBQThCO0FBQUEsUUFDMUJsYixDQUFBLENBQUVtWixJQUFGLENBQU9uWixDQUFBLENBQUVpYixLQUFGLENBQVFDLGFBQVIsR0FBUCxDQUQwQjtBQUFBLE9BdHRDZjtBQUFBLE1BbXZDZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFsYixDQUFBLENBQUUsUUFBRixJQUFjeWIsT0FBZCxDQW52Q2U7QUFBQSxNQW92Q2YsU0FBU0EsT0FBVCxDQUFpQm5rQixLQUFqQixFQUF3QjtBQUFBLFFBQ3BCLE1BQU0sSUFBSXlkLFlBQUosQ0FBaUJ6ZCxLQUFqQixDQURjO0FBQUEsT0FwdkNUO0FBQUEsTUF1d0NmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEwSSxDQUFBLENBQUUwYixRQUFGLEdBQWFBLFFBQWIsQ0F2d0NlO0FBQUEsTUF3d0NmLFNBQVNBLFFBQVQsQ0FBa0J2SCxRQUFsQixFQUE0QjtBQUFBLFFBQ3hCLE9BQU8sWUFBWTtBQUFBLFVBQ2YsT0FBT3dFLE1BQUEsQ0FBTztBQUFBLFlBQUMsSUFBRDtBQUFBLFlBQU94b0IsR0FBQSxDQUFJUixTQUFKLENBQVA7QUFBQSxXQUFQLEVBQStCLFVBQVVpSixJQUFWLEVBQWdCL0ksSUFBaEIsRUFBc0I7QUFBQSxZQUN4RCxPQUFPc2tCLFFBQUEsQ0FBU3prQixLQUFULENBQWVrSixJQUFmLEVBQXFCL0ksSUFBckIsQ0FEaUQ7QUFBQSxXQUFyRCxDQURRO0FBQUEsU0FESztBQUFBLE9BeHdDYjtBQUFBLE1BdXhDZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFtUSxDQUFBLENBQUVnYixRQUFGLEdBQWFBLFFBQWIsQ0F2eENlO0FBQUEsTUF3eENmLFNBQVNBLFFBQVQsQ0FBa0JsUixNQUFsQixFQUEwQjJOLEVBQTFCLEVBQThCNW5CLElBQTlCLEVBQW9DO0FBQUEsUUFDaEMsT0FBT21RLENBQUEsQ0FBRThKLE1BQUYsRUFBVWtSLFFBQVYsQ0FBbUJ2RCxFQUFuQixFQUF1QjVuQixJQUF2QixDQUR5QjtBQUFBLE9BeHhDckI7QUFBQSxNQTR4Q2ZnbkIsT0FBQSxDQUFRMVksU0FBUixDQUFrQjZjLFFBQWxCLEdBQTZCLFVBQVV2RCxFQUFWLEVBQWM1bkIsSUFBZCxFQUFvQjtBQUFBLFFBQzdDLElBQUkrSSxJQUFBLEdBQU8sSUFBWCxDQUQ2QztBQUFBLFFBRTdDLElBQUkyZSxRQUFBLEdBQVczVyxLQUFBLEVBQWYsQ0FGNkM7QUFBQSxRQUc3Q1osQ0FBQSxDQUFFeVMsUUFBRixDQUFXLFlBQVk7QUFBQSxVQUNuQjdaLElBQUEsQ0FBSzRlLGVBQUwsQ0FBcUJELFFBQUEsQ0FBUzFXLE9BQTlCLEVBQXVDNFcsRUFBdkMsRUFBMkM1bkIsSUFBM0MsQ0FEbUI7QUFBQSxTQUF2QixFQUg2QztBQUFBLFFBTTdDLE9BQU8wbkIsUUFBQSxDQUFTelcsT0FONkI7QUFBQSxPQUFqRCxDQTV4Q2U7QUFBQSxNQTJ5Q2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQWQsQ0FBQSxDQUFFaUMsR0FBRixHQUFRLFVBQVU2SCxNQUFWLEVBQWtCdlYsR0FBbEIsRUFBdUI7QUFBQSxRQUMzQixPQUFPeUwsQ0FBQSxDQUFFOEosTUFBRixFQUFVa1IsUUFBVixDQUFtQixLQUFuQixFQUEwQixDQUFDem1CLEdBQUQsQ0FBMUIsQ0FEb0I7QUFBQSxPQUEvQixDQTN5Q2U7QUFBQSxNQSt5Q2ZzaUIsT0FBQSxDQUFRMVksU0FBUixDQUFrQjhELEdBQWxCLEdBQXdCLFVBQVUxTixHQUFWLEVBQWU7QUFBQSxRQUNuQyxPQUFPLEtBQUt5bUIsUUFBTCxDQUFjLEtBQWQsRUFBcUIsQ0FBQ3ptQixHQUFELENBQXJCLENBRDRCO0FBQUEsT0FBdkMsQ0EveUNlO0FBQUEsTUEwekNmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQXlMLENBQUEsQ0FBRThHLEdBQUYsR0FBUSxVQUFVZ0QsTUFBVixFQUFrQnZWLEdBQWxCLEVBQXVCK0MsS0FBdkIsRUFBOEI7QUFBQSxRQUNsQyxPQUFPMEksQ0FBQSxDQUFFOEosTUFBRixFQUFVa1IsUUFBVixDQUFtQixLQUFuQixFQUEwQjtBQUFBLFVBQUN6bUIsR0FBRDtBQUFBLFVBQU0rQyxLQUFOO0FBQUEsU0FBMUIsQ0FEMkI7QUFBQSxPQUF0QyxDQTF6Q2U7QUFBQSxNQTh6Q2Z1ZixPQUFBLENBQVExWSxTQUFSLENBQWtCMkksR0FBbEIsR0FBd0IsVUFBVXZTLEdBQVYsRUFBZStDLEtBQWYsRUFBc0I7QUFBQSxRQUMxQyxPQUFPLEtBQUswakIsUUFBTCxDQUFjLEtBQWQsRUFBcUI7QUFBQSxVQUFDem1CLEdBQUQ7QUFBQSxVQUFNK0MsS0FBTjtBQUFBLFNBQXJCLENBRG1DO0FBQUEsT0FBOUMsQ0E5ekNlO0FBQUEsTUF3MENmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEwSSxDQUFBLENBQUUyYixHQUFGLEdBQ0E7QUFBQSxNQUFBM2IsQ0FBQSxDQUFFLFFBQUYsSUFBYyxVQUFVOEosTUFBVixFQUFrQnZWLEdBQWxCLEVBQXVCO0FBQUEsUUFDakMsT0FBT3lMLENBQUEsQ0FBRThKLE1BQUYsRUFBVWtSLFFBQVYsQ0FBbUIsUUFBbkIsRUFBNkIsQ0FBQ3ptQixHQUFELENBQTdCLENBRDBCO0FBQUEsT0FEckMsQ0F4MENlO0FBQUEsTUE2MENmc2lCLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0J3ZCxHQUFsQixHQUNBO0FBQUEsTUFBQTlFLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0IsUUFBbEIsSUFBOEIsVUFBVTVKLEdBQVYsRUFBZTtBQUFBLFFBQ3pDLE9BQU8sS0FBS3ltQixRQUFMLENBQWMsUUFBZCxFQUF3QixDQUFDem1CLEdBQUQsQ0FBeEIsQ0FEa0M7QUFBQSxPQUQ3QyxDQTcwQ2U7QUFBQSxNQSsxQ2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBeUwsQ0FBQSxDQUFFNGIsTUFBRixHQUNBO0FBQUEsTUFBQTViLENBQUEsQ0FBRTZiLElBQUYsR0FBUyxVQUFVL1IsTUFBVixFQUFrQjlhLElBQWxCLEVBQXdCYSxJQUF4QixFQUE4QjtBQUFBLFFBQ25DLE9BQU9tUSxDQUFBLENBQUU4SixNQUFGLEVBQVVrUixRQUFWLENBQW1CLE1BQW5CLEVBQTJCO0FBQUEsVUFBQ2hzQixJQUFEO0FBQUEsVUFBT2EsSUFBUDtBQUFBLFNBQTNCLENBRDRCO0FBQUEsT0FEdkMsQ0EvMUNlO0FBQUEsTUFvMkNmZ25CLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0J5ZCxNQUFsQixHQUNBO0FBQUEsTUFBQS9FLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0IwZCxJQUFsQixHQUF5QixVQUFVN3NCLElBQVYsRUFBZ0JhLElBQWhCLEVBQXNCO0FBQUEsUUFDM0MsT0FBTyxLQUFLbXJCLFFBQUwsQ0FBYyxNQUFkLEVBQXNCO0FBQUEsVUFBQ2hzQixJQUFEO0FBQUEsVUFBT2EsSUFBUDtBQUFBLFNBQXRCLENBRG9DO0FBQUEsT0FEL0MsQ0FwMkNlO0FBQUEsTUFnM0NmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQW1RLENBQUEsQ0FBRThiLElBQUYsR0FDQTtBQUFBLE1BQUE5YixDQUFBLENBQUUrYixLQUFGLEdBQ0E7QUFBQSxNQUFBL2IsQ0FBQSxDQUFFbUcsTUFBRixHQUFXLFVBQVUyRCxNQUFWLEVBQWtCOWEsSUFBbEIsRUFBb0M7QUFBQSxRQUMzQyxPQUFPZ1IsQ0FBQSxDQUFFOEosTUFBRixFQUFVa1IsUUFBVixDQUFtQixNQUFuQixFQUEyQjtBQUFBLFVBQUNoc0IsSUFBRDtBQUFBLFVBQU9pbEIsV0FBQSxDQUFZdGtCLFNBQVosRUFBdUIsQ0FBdkIsQ0FBUDtBQUFBLFNBQTNCLENBRG9DO0FBQUEsT0FGL0MsQ0FoM0NlO0FBQUEsTUFzM0Nma25CLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0IyZCxJQUFsQixHQUNBO0FBQUEsTUFBQWpGLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0I0ZCxLQUFsQixHQUNBO0FBQUEsTUFBQWxGLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0JnSSxNQUFsQixHQUEyQixVQUFVblgsSUFBVixFQUE0QjtBQUFBLFFBQ25ELE9BQU8sS0FBS2dzQixRQUFMLENBQWMsTUFBZCxFQUFzQjtBQUFBLFVBQUNoc0IsSUFBRDtBQUFBLFVBQU9pbEIsV0FBQSxDQUFZdGtCLFNBQVosRUFBdUIsQ0FBdkIsQ0FBUDtBQUFBLFNBQXRCLENBRDRDO0FBQUEsT0FGdkQsQ0F0M0NlO0FBQUEsTUFpNENmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBcVEsQ0FBQSxDQUFFZ2MsTUFBRixHQUFXLFVBQVVsUyxNQUFWLEVBQWtCamEsSUFBbEIsRUFBd0I7QUFBQSxRQUMvQixPQUFPbVEsQ0FBQSxDQUFFOEosTUFBRixFQUFVa1IsUUFBVixDQUFtQixPQUFuQixFQUE0QjtBQUFBLFVBQUMsS0FBSyxDQUFOO0FBQUEsVUFBU25yQixJQUFUO0FBQUEsU0FBNUIsQ0FEd0I7QUFBQSxPQUFuQyxDQWo0Q2U7QUFBQSxNQXE0Q2ZnbkIsT0FBQSxDQUFRMVksU0FBUixDQUFrQjZkLE1BQWxCLEdBQTJCLFVBQVVuc0IsSUFBVixFQUFnQjtBQUFBLFFBQ3ZDLE9BQU8sS0FBS21yQixRQUFMLENBQWMsT0FBZCxFQUF1QjtBQUFBLFVBQUMsS0FBSyxDQUFOO0FBQUEsVUFBU25yQixJQUFUO0FBQUEsU0FBdkIsQ0FEZ0M7QUFBQSxPQUEzQyxDQXI0Q2U7QUFBQSxNQTg0Q2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFtUSxDQUFBLENBQUUsS0FBRixJQUNBQSxDQUFBLENBQUUyWixLQUFGLEdBQVUsVUFBVTdQLE1BQVYsRUFBK0I7QUFBQSxRQUNyQyxPQUFPOUosQ0FBQSxDQUFFOEosTUFBRixFQUFVa1IsUUFBVixDQUFtQixPQUFuQixFQUE0QjtBQUFBLFVBQUMsS0FBSyxDQUFOO0FBQUEsVUFBUy9HLFdBQUEsQ0FBWXRrQixTQUFaLEVBQXVCLENBQXZCLENBQVQ7QUFBQSxTQUE1QixDQUQ4QjtBQUFBLE9BRHpDLENBOTRDZTtBQUFBLE1BbTVDZmtuQixPQUFBLENBQVExWSxTQUFSLENBQWtCd2IsS0FBbEIsR0FBMEIsWUFBdUI7QUFBQSxRQUM3QyxPQUFPLEtBQUtxQixRQUFMLENBQWMsT0FBZCxFQUF1QjtBQUFBLFVBQUMsS0FBSyxDQUFOO0FBQUEsVUFBUy9HLFdBQUEsQ0FBWXRrQixTQUFaLENBQVQ7QUFBQSxTQUF2QixDQURzQztBQUFBLE9BQWpELENBbjVDZTtBQUFBLE1BNjVDZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBcVEsQ0FBQSxDQUFFaWMsS0FBRixHQUFVLFVBQVVuUyxNQUFWLEVBQThCO0FBQUEsUUFDcEMsSUFBSWhKLE9BQUEsR0FBVWQsQ0FBQSxDQUFFOEosTUFBRixDQUFkLENBRG9DO0FBQUEsUUFFcEMsSUFBSWphLElBQUEsR0FBT29rQixXQUFBLENBQVl0a0IsU0FBWixFQUF1QixDQUF2QixDQUFYLENBRm9DO0FBQUEsUUFHcEMsT0FBTyxTQUFTdXNCLE1BQVQsR0FBa0I7QUFBQSxVQUNyQixPQUFPcGIsT0FBQSxDQUFRa2EsUUFBUixDQUFpQixPQUFqQixFQUEwQjtBQUFBLFlBQzdCLElBRDZCO0FBQUEsWUFFN0JuckIsSUFBQSxDQUFLSyxNQUFMLENBQVkrakIsV0FBQSxDQUFZdGtCLFNBQVosQ0FBWixDQUY2QjtBQUFBLFdBQTFCLENBRGM7QUFBQSxTQUhXO0FBQUEsT0FBeEMsQ0E3NUNlO0FBQUEsTUF1NkNma25CLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0I4ZCxLQUFsQixHQUEwQixZQUF1QjtBQUFBLFFBQzdDLElBQUluYixPQUFBLEdBQVUsSUFBZCxDQUQ2QztBQUFBLFFBRTdDLElBQUlqUixJQUFBLEdBQU9va0IsV0FBQSxDQUFZdGtCLFNBQVosQ0FBWCxDQUY2QztBQUFBLFFBRzdDLE9BQU8sU0FBU3VzQixNQUFULEdBQWtCO0FBQUEsVUFDckIsT0FBT3BiLE9BQUEsQ0FBUWthLFFBQVIsQ0FBaUIsT0FBakIsRUFBMEI7QUFBQSxZQUM3QixJQUQ2QjtBQUFBLFlBRTdCbnJCLElBQUEsQ0FBS0ssTUFBTCxDQUFZK2pCLFdBQUEsQ0FBWXRrQixTQUFaLENBQVosQ0FGNkI7QUFBQSxXQUExQixDQURjO0FBQUEsU0FIb0I7QUFBQSxPQUFqRCxDQXY2Q2U7QUFBQSxNQXc3Q2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQXFRLENBQUEsQ0FBRTVKLElBQUYsR0FBUyxVQUFVMFQsTUFBVixFQUFrQjtBQUFBLFFBQ3ZCLE9BQU85SixDQUFBLENBQUU4SixNQUFGLEVBQVVrUixRQUFWLENBQW1CLE1BQW5CLEVBQTJCLEVBQTNCLENBRGdCO0FBQUEsT0FBM0IsQ0F4N0NlO0FBQUEsTUE0N0NmbkUsT0FBQSxDQUFRMVksU0FBUixDQUFrQi9ILElBQWxCLEdBQXlCLFlBQVk7QUFBQSxRQUNqQyxPQUFPLEtBQUs0a0IsUUFBTCxDQUFjLE1BQWQsRUFBc0IsRUFBdEIsQ0FEMEI7QUFBQSxPQUFyQyxDQTU3Q2U7QUFBQSxNQXk4Q2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQWhiLENBQUEsQ0FBRTdQLEdBQUYsR0FBUUEsR0FBUixDQXo4Q2U7QUFBQSxNQTA4Q2YsU0FBU0EsR0FBVCxDQUFhZ3NCLFFBQWIsRUFBdUI7QUFBQSxRQUNuQixPQUFPdEMsSUFBQSxDQUFLc0MsUUFBTCxFQUFlLFVBQVVBLFFBQVYsRUFBb0I7QUFBQSxVQUN0QyxJQUFJQyxZQUFBLEdBQWUsQ0FBbkIsQ0FEc0M7QUFBQSxVQUV0QyxJQUFJN0UsUUFBQSxHQUFXM1csS0FBQSxFQUFmLENBRnNDO0FBQUEsVUFHdENzVCxZQUFBLENBQWFpSSxRQUFiLEVBQXVCLFVBQVU1aEIsU0FBVixFQUFxQnVHLE9BQXJCLEVBQThCc0MsS0FBOUIsRUFBcUM7QUFBQSxZQUN4RCxJQUFJaVosUUFBSixDQUR3RDtBQUFBLFlBRXhELElBQ0l4RSxTQUFBLENBQVUvVyxPQUFWLEtBQ0MsQ0FBQXViLFFBQUEsR0FBV3ZiLE9BQUEsQ0FBUWdYLE9BQVIsRUFBWCxDQUFELENBQStCQyxLQUEvQixLQUF5QyxXQUY3QyxFQUdFO0FBQUEsY0FDRW9FLFFBQUEsQ0FBUy9ZLEtBQVQsSUFBa0JpWixRQUFBLENBQVMva0IsS0FEN0I7QUFBQSxhQUhGLE1BS087QUFBQSxjQUNILEVBQUU4a0IsWUFBRixDQURHO0FBQUEsY0FFSHZDLElBQUEsQ0FDSS9ZLE9BREosRUFFSSxVQUFVeEosS0FBVixFQUFpQjtBQUFBLGdCQUNiNmtCLFFBQUEsQ0FBUy9ZLEtBQVQsSUFBa0I5TCxLQUFsQixDQURhO0FBQUEsZ0JBRWIsSUFBSSxFQUFFOGtCLFlBQUYsS0FBbUIsQ0FBdkIsRUFBMEI7QUFBQSxrQkFDdEI3RSxRQUFBLENBQVMxVyxPQUFULENBQWlCc2IsUUFBakIsQ0FEc0I7QUFBQSxpQkFGYjtBQUFBLGVBRnJCLEVBUUk1RSxRQUFBLENBQVNoVyxNQVJiLEVBU0ksVUFBVTRXLFFBQVYsRUFBb0I7QUFBQSxnQkFDaEJaLFFBQUEsQ0FBU3hWLE1BQVQsQ0FBZ0I7QUFBQSxrQkFBRXFCLEtBQUEsRUFBT0EsS0FBVDtBQUFBLGtCQUFnQjlMLEtBQUEsRUFBTzZnQixRQUF2QjtBQUFBLGlCQUFoQixDQURnQjtBQUFBLGVBVHhCLENBRkc7QUFBQSxhQVBpRDtBQUFBLFdBQTVELEVBdUJHLEtBQUssQ0F2QlIsRUFIc0M7QUFBQSxVQTJCdEMsSUFBSWlFLFlBQUEsS0FBaUIsQ0FBckIsRUFBd0I7QUFBQSxZQUNwQjdFLFFBQUEsQ0FBUzFXLE9BQVQsQ0FBaUJzYixRQUFqQixDQURvQjtBQUFBLFdBM0JjO0FBQUEsVUE4QnRDLE9BQU81RSxRQUFBLENBQVN6VyxPQTlCc0I7QUFBQSxTQUFuQyxDQURZO0FBQUEsT0ExOENSO0FBQUEsTUE2K0NmK1YsT0FBQSxDQUFRMVksU0FBUixDQUFrQmhPLEdBQWxCLEdBQXdCLFlBQVk7QUFBQSxRQUNoQyxPQUFPQSxHQUFBLENBQUksSUFBSixDQUR5QjtBQUFBLE9BQXBDLENBNytDZTtBQUFBLE1Bdy9DZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUE2UCxDQUFBLENBQUU0RixHQUFGLEdBQVFBLEdBQVIsQ0F4L0NlO0FBQUEsTUEwL0NmLFNBQVNBLEdBQVQsQ0FBYXVXLFFBQWIsRUFBdUI7QUFBQSxRQUNuQixJQUFJQSxRQUFBLENBQVN0b0IsTUFBVCxLQUFvQixDQUF4QixFQUEyQjtBQUFBLFVBQ3ZCLE9BQU9tTSxDQUFBLENBQUVhLE9BQUYsRUFEZ0I7QUFBQSxTQURSO0FBQUEsUUFLbkIsSUFBSTBXLFFBQUEsR0FBV3ZYLENBQUEsQ0FBRVksS0FBRixFQUFmLENBTG1CO0FBQUEsUUFNbkIsSUFBSXdiLFlBQUEsR0FBZSxDQUFuQixDQU5tQjtBQUFBLFFBT25CbEksWUFBQSxDQUFhaUksUUFBYixFQUF1QixVQUFVbm5CLElBQVYsRUFBZ0JyRSxPQUFoQixFQUF5QnlTLEtBQXpCLEVBQWdDO0FBQUEsVUFDbkQsSUFBSXRDLE9BQUEsR0FBVXFiLFFBQUEsQ0FBUy9ZLEtBQVQsQ0FBZCxDQURtRDtBQUFBLFVBR25EZ1osWUFBQSxHQUhtRDtBQUFBLFVBS25EdkMsSUFBQSxDQUFLL1ksT0FBTCxFQUFjd2IsV0FBZCxFQUEyQkMsVUFBM0IsRUFBdUNDLFVBQXZDLEVBTG1EO0FBQUEsVUFNbkQsU0FBU0YsV0FBVCxDQUFxQnJZLE1BQXJCLEVBQTZCO0FBQUEsWUFDekJzVCxRQUFBLENBQVMxVyxPQUFULENBQWlCb0QsTUFBakIsQ0FEeUI7QUFBQSxXQU5zQjtBQUFBLFVBU25ELFNBQVNzWSxVQUFULEdBQXNCO0FBQUEsWUFDbEJILFlBQUEsR0FEa0I7QUFBQSxZQUVsQixJQUFJQSxZQUFBLEtBQWlCLENBQXJCLEVBQXdCO0FBQUEsY0FDcEI3RSxRQUFBLENBQVNoVyxNQUFULENBQWdCLElBQUkrSixLQUFKLENBQ1osdURBQ0EseUJBRlksQ0FBaEIsQ0FEb0I7QUFBQSxhQUZOO0FBQUEsV0FUNkI7QUFBQSxVQWtCbkQsU0FBU2tSLFVBQVQsQ0FBb0JyRSxRQUFwQixFQUE4QjtBQUFBLFlBQzFCWixRQUFBLENBQVN4VixNQUFULENBQWdCO0FBQUEsY0FDWnFCLEtBQUEsRUFBT0EsS0FESztBQUFBLGNBRVo5TCxLQUFBLEVBQU82Z0IsUUFGSztBQUFBLGFBQWhCLENBRDBCO0FBQUEsV0FsQnFCO0FBQUEsU0FBdkQsRUF3Qkc1ZCxTQXhCSCxFQVBtQjtBQUFBLFFBaUNuQixPQUFPZ2QsUUFBQSxDQUFTelcsT0FqQ0c7QUFBQSxPQTEvQ1I7QUFBQSxNQThoRGYrVixPQUFBLENBQVExWSxTQUFSLENBQWtCeUgsR0FBbEIsR0FBd0IsWUFBWTtBQUFBLFFBQ2hDLE9BQU9BLEdBQUEsQ0FBSSxJQUFKLENBRHlCO0FBQUEsT0FBcEMsQ0E5aERlO0FBQUEsTUEyaURmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUE1RixDQUFBLENBQUV5YyxXQUFGLEdBQWdCaEcsU0FBQSxDQUFVZ0csV0FBVixFQUF1QixhQUF2QixFQUFzQyxZQUF0QyxDQUFoQixDQTNpRGU7QUFBQSxNQTRpRGYsU0FBU0EsV0FBVCxDQUFxQk4sUUFBckIsRUFBK0I7QUFBQSxRQUMzQixPQUFPdEMsSUFBQSxDQUFLc0MsUUFBTCxFQUFlLFVBQVVBLFFBQVYsRUFBb0I7QUFBQSxVQUN0Q0EsUUFBQSxHQUFXN0gsU0FBQSxDQUFVNkgsUUFBVixFQUFvQm5jLENBQXBCLENBQVgsQ0FEc0M7QUFBQSxVQUV0QyxPQUFPNlosSUFBQSxDQUFLMXBCLEdBQUEsQ0FBSW1rQixTQUFBLENBQVU2SCxRQUFWLEVBQW9CLFVBQVVyYixPQUFWLEVBQW1CO0FBQUEsWUFDbkQsT0FBTytZLElBQUEsQ0FBSy9ZLE9BQUwsRUFBYytPLElBQWQsRUFBb0JBLElBQXBCLENBRDRDO0FBQUEsV0FBdkMsQ0FBSixDQUFMLEVBRUYsWUFBWTtBQUFBLFlBQ2IsT0FBT3NNLFFBRE07QUFBQSxXQUZWLENBRitCO0FBQUEsU0FBbkMsQ0FEb0I7QUFBQSxPQTVpRGhCO0FBQUEsTUF1akRmdEYsT0FBQSxDQUFRMVksU0FBUixDQUFrQnNlLFdBQWxCLEdBQWdDLFlBQVk7QUFBQSxRQUN4QyxPQUFPQSxXQUFBLENBQVksSUFBWixDQURpQztBQUFBLE9BQTVDLENBdmpEZTtBQUFBLE1BOGpEZjtBQUFBO0FBQUE7QUFBQSxNQUFBemMsQ0FBQSxDQUFFMGMsVUFBRixHQUFlQSxVQUFmLENBOWpEZTtBQUFBLE1BK2pEZixTQUFTQSxVQUFULENBQW9CUCxRQUFwQixFQUE4QjtBQUFBLFFBQzFCLE9BQU9uYyxDQUFBLENBQUVtYyxRQUFGLEVBQVlPLFVBQVosRUFEbUI7QUFBQSxPQS9qRGY7QUFBQSxNQTBrRGY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBN0YsT0FBQSxDQUFRMVksU0FBUixDQUFrQnVlLFVBQWxCLEdBQStCLFlBQVk7QUFBQSxRQUN2QyxPQUFPLEtBQUt4YSxJQUFMLENBQVUsVUFBVWlhLFFBQVYsRUFBb0I7QUFBQSxVQUNqQyxPQUFPaHNCLEdBQUEsQ0FBSW1rQixTQUFBLENBQVU2SCxRQUFWLEVBQW9CLFVBQVVyYixPQUFWLEVBQW1CO0FBQUEsWUFDOUNBLE9BQUEsR0FBVWQsQ0FBQSxDQUFFYyxPQUFGLENBQVYsQ0FEOEM7QUFBQSxZQUU5QyxTQUFTNmIsVUFBVCxHQUFzQjtBQUFBLGNBQ2xCLE9BQU83YixPQUFBLENBQVFnWCxPQUFSLEVBRFc7QUFBQSxhQUZ3QjtBQUFBLFlBSzlDLE9BQU9oWCxPQUFBLENBQVFvQixJQUFSLENBQWF5YSxVQUFiLEVBQXlCQSxVQUF6QixDQUx1QztBQUFBLFdBQXZDLENBQUosQ0FEMEI7QUFBQSxTQUE5QixDQURnQztBQUFBLE9BQTNDLENBMWtEZTtBQUFBLE1BK2xEZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBM2MsQ0FBQSxDQUFFa0IsSUFBRixHQUNBO0FBQUEsTUFBQWxCLENBQUEsQ0FBRSxPQUFGLElBQWEsVUFBVThKLE1BQVYsRUFBa0JtUCxRQUFsQixFQUE0QjtBQUFBLFFBQ3JDLE9BQU9qWixDQUFBLENBQUU4SixNQUFGLEVBQVU1SCxJQUFWLENBQWUsS0FBSyxDQUFwQixFQUF1QitXLFFBQXZCLENBRDhCO0FBQUEsT0FEekMsQ0EvbERlO0FBQUEsTUFvbURmcEMsT0FBQSxDQUFRMVksU0FBUixDQUFrQitDLElBQWxCLEdBQ0E7QUFBQSxNQUFBMlYsT0FBQSxDQUFRMVksU0FBUixDQUFrQixPQUFsQixJQUE2QixVQUFVOGEsUUFBVixFQUFvQjtBQUFBLFFBQzdDLE9BQU8sS0FBSy9XLElBQUwsQ0FBVSxLQUFLLENBQWYsRUFBa0IrVyxRQUFsQixDQURzQztBQUFBLE9BRGpELENBcG1EZTtBQUFBLE1BaW5EZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQWpaLENBQUEsQ0FBRW1ZLFFBQUYsR0FBYUEsUUFBYixDQWpuRGU7QUFBQSxNQWtuRGYsU0FBU0EsUUFBVCxDQUFrQnJPLE1BQWxCLEVBQTBCb1AsVUFBMUIsRUFBc0M7QUFBQSxRQUNsQyxPQUFPbFosQ0FBQSxDQUFFOEosTUFBRixFQUFVNUgsSUFBVixDQUFlLEtBQUssQ0FBcEIsRUFBdUIsS0FBSyxDQUE1QixFQUErQmdYLFVBQS9CLENBRDJCO0FBQUEsT0FsbkR2QjtBQUFBLE1Bc25EZnJDLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0JnYSxRQUFsQixHQUE2QixVQUFVZSxVQUFWLEVBQXNCO0FBQUEsUUFDL0MsT0FBTyxLQUFLaFgsSUFBTCxDQUFVLEtBQUssQ0FBZixFQUFrQixLQUFLLENBQXZCLEVBQTBCZ1gsVUFBMUIsQ0FEd0M7QUFBQSxPQUFuRCxDQXRuRGU7QUFBQSxNQXFvRGY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFsWixDQUFBLENBQUU0YyxHQUFGLEdBQ0E7QUFBQSxNQUFBNWMsQ0FBQSxDQUFFLFNBQUYsSUFBZSxVQUFVOEosTUFBVixFQUFrQnFLLFFBQWxCLEVBQTRCO0FBQUEsUUFDdkMsT0FBT25VLENBQUEsQ0FBRThKLE1BQUYsRUFBVSxTQUFWLEVBQXFCcUssUUFBckIsQ0FEZ0M7QUFBQSxPQUQzQyxDQXJvRGU7QUFBQSxNQTBvRGYwQyxPQUFBLENBQVExWSxTQUFSLENBQWtCeWUsR0FBbEIsR0FDQTtBQUFBLE1BQUEvRixPQUFBLENBQVExWSxTQUFSLENBQWtCLFNBQWxCLElBQStCLFVBQVVnVyxRQUFWLEVBQW9CO0FBQUEsUUFDL0NBLFFBQUEsR0FBV25VLENBQUEsQ0FBRW1VLFFBQUYsQ0FBWCxDQUQrQztBQUFBLFFBRS9DLE9BQU8sS0FBS2pTLElBQUwsQ0FBVSxVQUFVNUssS0FBVixFQUFpQjtBQUFBLFVBQzlCLE9BQU82YyxRQUFBLENBQVN3RixLQUFULEdBQWlCelgsSUFBakIsQ0FBc0IsWUFBWTtBQUFBLFlBQ3JDLE9BQU81SyxLQUQ4QjtBQUFBLFdBQWxDLENBRHVCO0FBQUEsU0FBM0IsRUFJSixVQUFVNGdCLE1BQVYsRUFBa0I7QUFBQSxVQUVqQjtBQUFBLGlCQUFPL0QsUUFBQSxDQUFTd0YsS0FBVCxHQUFpQnpYLElBQWpCLENBQXNCLFlBQVk7QUFBQSxZQUNyQyxNQUFNZ1csTUFEK0I7QUFBQSxXQUFsQyxDQUZVO0FBQUEsU0FKZCxDQUZ3QztBQUFBLE9BRG5ELENBMW9EZTtBQUFBLE1BK3BEZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBbFksQ0FBQSxDQUFFbVosSUFBRixHQUFTLFVBQVVyUCxNQUFWLEVBQWtCa1AsU0FBbEIsRUFBNkJDLFFBQTdCLEVBQXVDZCxRQUF2QyxFQUFpRDtBQUFBLFFBQ3RELE9BQU9uWSxDQUFBLENBQUU4SixNQUFGLEVBQVVxUCxJQUFWLENBQWVILFNBQWYsRUFBMEJDLFFBQTFCLEVBQW9DZCxRQUFwQyxDQUQrQztBQUFBLE9BQTFELENBL3BEZTtBQUFBLE1BbXFEZnRCLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0JnYixJQUFsQixHQUF5QixVQUFVSCxTQUFWLEVBQXFCQyxRQUFyQixFQUErQmQsUUFBL0IsRUFBeUM7QUFBQSxRQUM5RCxJQUFJMEUsZ0JBQUEsR0FBbUIsVUFBVTFILEtBQVYsRUFBaUI7QUFBQSxVQUdwQztBQUFBO0FBQUEsVUFBQW5WLENBQUEsQ0FBRXlTLFFBQUYsQ0FBVyxZQUFZO0FBQUEsWUFDbkJ5QyxrQkFBQSxDQUFtQkMsS0FBbkIsRUFBMEJyVSxPQUExQixFQURtQjtBQUFBLFlBRW5CLElBQUlkLENBQUEsQ0FBRTBaLE9BQU4sRUFBZTtBQUFBLGNBQ1gxWixDQUFBLENBQUUwWixPQUFGLENBQVV2RSxLQUFWLENBRFc7QUFBQSxhQUFmLE1BRU87QUFBQSxjQUNILE1BQU1BLEtBREg7QUFBQSxhQUpZO0FBQUEsV0FBdkIsQ0FIb0M7QUFBQSxTQUF4QyxDQUQ4RDtBQUFBLFFBZTlEO0FBQUEsWUFBSXJVLE9BQUEsR0FBVWtZLFNBQUEsSUFBYUMsUUFBYixJQUF5QmQsUUFBekIsR0FDVixLQUFLalcsSUFBTCxDQUFVOFcsU0FBVixFQUFxQkMsUUFBckIsRUFBK0JkLFFBQS9CLENBRFUsR0FFVixJQUZKLENBZjhEO0FBQUEsUUFtQjlELElBQUksT0FBTzlFLE9BQVAsS0FBbUIsUUFBbkIsSUFBK0JBLE9BQS9CLElBQTBDQSxPQUFBLENBQVFKLE1BQXRELEVBQThEO0FBQUEsVUFDMUQ0SixnQkFBQSxHQUFtQnhKLE9BQUEsQ0FBUUosTUFBUixDQUFlL1ksSUFBZixDQUFvQjJpQixnQkFBcEIsQ0FEdUM7QUFBQSxTQW5CQTtBQUFBLFFBdUI5RC9iLE9BQUEsQ0FBUW9CLElBQVIsQ0FBYSxLQUFLLENBQWxCLEVBQXFCMmEsZ0JBQXJCLENBdkI4RDtBQUFBLE9BQWxFLENBbnFEZTtBQUFBLE1Bc3NEZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBN2MsQ0FBQSxDQUFFOEwsT0FBRixHQUFZLFVBQVVoQyxNQUFWLEVBQWtCZ1QsRUFBbEIsRUFBc0IzSCxLQUF0QixFQUE2QjtBQUFBLFFBQ3JDLE9BQU9uVixDQUFBLENBQUU4SixNQUFGLEVBQVVnQyxPQUFWLENBQWtCZ1IsRUFBbEIsRUFBc0IzSCxLQUF0QixDQUQ4QjtBQUFBLE9BQXpDLENBdHNEZTtBQUFBLE1BMHNEZjBCLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0IyTixPQUFsQixHQUE0QixVQUFVZ1IsRUFBVixFQUFjM0gsS0FBZCxFQUFxQjtBQUFBLFFBQzdDLElBQUlvQyxRQUFBLEdBQVczVyxLQUFBLEVBQWYsQ0FENkM7QUFBQSxRQUU3QyxJQUFJbWMsU0FBQSxHQUFZblIsVUFBQSxDQUFXLFlBQVk7QUFBQSxVQUNuQyxJQUFJLENBQUN1SixLQUFELElBQVUsYUFBYSxPQUFPQSxLQUFsQyxFQUF5QztBQUFBLFlBQ3JDQSxLQUFBLEdBQVEsSUFBSTdKLEtBQUosQ0FBVTZKLEtBQUEsSUFBUyxxQkFBcUIySCxFQUFyQixHQUEwQixLQUE3QyxDQUFSLENBRHFDO0FBQUEsWUFFckMzSCxLQUFBLENBQU02SCxJQUFOLEdBQWEsV0FGd0I7QUFBQSxXQUROO0FBQUEsVUFLbkN6RixRQUFBLENBQVNoVyxNQUFULENBQWdCNFQsS0FBaEIsQ0FMbUM7QUFBQSxTQUF2QixFQU1iMkgsRUFOYSxDQUFoQixDQUY2QztBQUFBLFFBVTdDLEtBQUs1YSxJQUFMLENBQVUsVUFBVTVLLEtBQVYsRUFBaUI7QUFBQSxVQUN2QjhVLFlBQUEsQ0FBYTJRLFNBQWIsRUFEdUI7QUFBQSxVQUV2QnhGLFFBQUEsQ0FBUzFXLE9BQVQsQ0FBaUJ2SixLQUFqQixDQUZ1QjtBQUFBLFNBQTNCLEVBR0csVUFBVXdkLFNBQVYsRUFBcUI7QUFBQSxVQUNwQjFJLFlBQUEsQ0FBYTJRLFNBQWIsRUFEb0I7QUFBQSxVQUVwQnhGLFFBQUEsQ0FBU2hXLE1BQVQsQ0FBZ0J1VCxTQUFoQixDQUZvQjtBQUFBLFNBSHhCLEVBTUd5QyxRQUFBLENBQVN4VixNQU5aLEVBVjZDO0FBQUEsUUFrQjdDLE9BQU93VixRQUFBLENBQVN6VyxPQWxCNkI7QUFBQSxPQUFqRCxDQTFzRGU7QUFBQSxNQXd1RGY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQWQsQ0FBQSxDQUFFMEwsS0FBRixHQUFVLFVBQVU1QixNQUFWLEVBQWtCZ0MsT0FBbEIsRUFBMkI7QUFBQSxRQUNqQyxJQUFJQSxPQUFBLEtBQVksS0FBSyxDQUFyQixFQUF3QjtBQUFBLFVBQ3BCQSxPQUFBLEdBQVVoQyxNQUFWLENBRG9CO0FBQUEsVUFFcEJBLE1BQUEsR0FBUyxLQUFLLENBRk07QUFBQSxTQURTO0FBQUEsUUFLakMsT0FBTzlKLENBQUEsQ0FBRThKLE1BQUYsRUFBVTRCLEtBQVYsQ0FBZ0JJLE9BQWhCLENBTDBCO0FBQUEsT0FBckMsQ0F4dURlO0FBQUEsTUFndkRmK0ssT0FBQSxDQUFRMVksU0FBUixDQUFrQnVOLEtBQWxCLEdBQTBCLFVBQVVJLE9BQVYsRUFBbUI7QUFBQSxRQUN6QyxPQUFPLEtBQUs1SixJQUFMLENBQVUsVUFBVTVLLEtBQVYsRUFBaUI7QUFBQSxVQUM5QixJQUFJaWdCLFFBQUEsR0FBVzNXLEtBQUEsRUFBZixDQUQ4QjtBQUFBLFVBRTlCZ0wsVUFBQSxDQUFXLFlBQVk7QUFBQSxZQUNuQjJMLFFBQUEsQ0FBUzFXLE9BQVQsQ0FBaUJ2SixLQUFqQixDQURtQjtBQUFBLFdBQXZCLEVBRUd3VSxPQUZILEVBRjhCO0FBQUEsVUFLOUIsT0FBT3lMLFFBQUEsQ0FBU3pXLE9BTGM7QUFBQSxTQUEzQixDQURrQztBQUFBLE9BQTdDLENBaHZEZTtBQUFBLE1BbXdEZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBZCxDQUFBLENBQUVpZCxPQUFGLEdBQVksVUFBVTlJLFFBQVYsRUFBb0J0a0IsSUFBcEIsRUFBMEI7QUFBQSxRQUNsQyxPQUFPbVEsQ0FBQSxDQUFFbVUsUUFBRixFQUFZOEksT0FBWixDQUFvQnB0QixJQUFwQixDQUQyQjtBQUFBLE9BQXRDLENBbndEZTtBQUFBLE1BdXdEZmduQixPQUFBLENBQVExWSxTQUFSLENBQWtCOGUsT0FBbEIsR0FBNEIsVUFBVXB0QixJQUFWLEVBQWdCO0FBQUEsUUFDeEMsSUFBSTBuQixRQUFBLEdBQVczVyxLQUFBLEVBQWYsQ0FEd0M7QUFBQSxRQUV4QyxJQUFJc2MsUUFBQSxHQUFXakosV0FBQSxDQUFZcGtCLElBQVosQ0FBZixDQUZ3QztBQUFBLFFBR3hDcXRCLFFBQUEsQ0FBU2h1QixJQUFULENBQWNxb0IsUUFBQSxDQUFTYyxnQkFBVCxFQUFkLEVBSHdDO0FBQUEsUUFJeEMsS0FBSzJELE1BQUwsQ0FBWWtCLFFBQVosRUFBc0JoYyxJQUF0QixDQUEyQnFXLFFBQUEsQ0FBU2hXLE1BQXBDLEVBSndDO0FBQUEsUUFLeEMsT0FBT2dXLFFBQUEsQ0FBU3pXLE9BTHdCO0FBQUEsT0FBNUMsQ0F2d0RlO0FBQUEsTUF3eERmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFkLENBQUEsQ0FBRW1kLE1BQUYsR0FBVyxVQUFVaEosUUFBVixFQUFnQztBQUFBLFFBQ3ZDLElBQUl0a0IsSUFBQSxHQUFPb2tCLFdBQUEsQ0FBWXRrQixTQUFaLEVBQXVCLENBQXZCLENBQVgsQ0FEdUM7QUFBQSxRQUV2QyxPQUFPcVEsQ0FBQSxDQUFFbVUsUUFBRixFQUFZOEksT0FBWixDQUFvQnB0QixJQUFwQixDQUZnQztBQUFBLE9BQTNDLENBeHhEZTtBQUFBLE1BNnhEZmduQixPQUFBLENBQVExWSxTQUFSLENBQWtCZ2YsTUFBbEIsR0FBMkIsWUFBdUI7QUFBQSxRQUM5QyxJQUFJRCxRQUFBLEdBQVdqSixXQUFBLENBQVl0a0IsU0FBWixDQUFmLENBRDhDO0FBQUEsUUFFOUMsSUFBSTRuQixRQUFBLEdBQVczVyxLQUFBLEVBQWYsQ0FGOEM7QUFBQSxRQUc5Q3NjLFFBQUEsQ0FBU2h1QixJQUFULENBQWNxb0IsUUFBQSxDQUFTYyxnQkFBVCxFQUFkLEVBSDhDO0FBQUEsUUFJOUMsS0FBSzJELE1BQUwsQ0FBWWtCLFFBQVosRUFBc0JoYyxJQUF0QixDQUEyQnFXLFFBQUEsQ0FBU2hXLE1BQXBDLEVBSjhDO0FBQUEsUUFLOUMsT0FBT2dXLFFBQUEsQ0FBU3pXLE9BTDhCO0FBQUEsT0FBbEQsQ0E3eERlO0FBQUEsTUE2eURmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBZCxDQUFBLENBQUVvZCxNQUFGLEdBQ0FwZCxDQUFBLENBQUVxZCxTQUFGLEdBQWMsVUFBVWxKLFFBQVYsRUFBZ0M7QUFBQSxRQUMxQyxJQUFJbUosUUFBQSxHQUFXckosV0FBQSxDQUFZdGtCLFNBQVosRUFBdUIsQ0FBdkIsQ0FBZixDQUQwQztBQUFBLFFBRTFDLE9BQU8sWUFBWTtBQUFBLFVBQ2YsSUFBSXV0QixRQUFBLEdBQVdJLFFBQUEsQ0FBU3B0QixNQUFULENBQWdCK2pCLFdBQUEsQ0FBWXRrQixTQUFaLENBQWhCLENBQWYsQ0FEZTtBQUFBLFVBRWYsSUFBSTRuQixRQUFBLEdBQVczVyxLQUFBLEVBQWYsQ0FGZTtBQUFBLFVBR2ZzYyxRQUFBLENBQVNodUIsSUFBVCxDQUFjcW9CLFFBQUEsQ0FBU2MsZ0JBQVQsRUFBZCxFQUhlO0FBQUEsVUFJZnJZLENBQUEsQ0FBRW1VLFFBQUYsRUFBWTZILE1BQVosQ0FBbUJrQixRQUFuQixFQUE2QmhjLElBQTdCLENBQWtDcVcsUUFBQSxDQUFTaFcsTUFBM0MsRUFKZTtBQUFBLFVBS2YsT0FBT2dXLFFBQUEsQ0FBU3pXLE9BTEQ7QUFBQSxTQUZ1QjtBQUFBLE9BRDlDLENBN3lEZTtBQUFBLE1BeXpEZitWLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0JpZixNQUFsQixHQUNBdkcsT0FBQSxDQUFRMVksU0FBUixDQUFrQmtmLFNBQWxCLEdBQThCLFlBQXVCO0FBQUEsUUFDakQsSUFBSXh0QixJQUFBLEdBQU9va0IsV0FBQSxDQUFZdGtCLFNBQVosQ0FBWCxDQURpRDtBQUFBLFFBRWpERSxJQUFBLENBQUt3bEIsT0FBTCxDQUFhLElBQWIsRUFGaUQ7QUFBQSxRQUdqRCxPQUFPclYsQ0FBQSxDQUFFcWQsU0FBRixDQUFZM3RCLEtBQVosQ0FBa0IsS0FBSyxDQUF2QixFQUEwQkcsSUFBMUIsQ0FIMEM7QUFBQSxPQURyRCxDQXp6RGU7QUFBQSxNQWcwRGZtUSxDQUFBLENBQUV1ZCxLQUFGLEdBQVUsVUFBVXBKLFFBQVYsRUFBb0JJLEtBQXBCLEVBQXVDO0FBQUEsUUFDN0MsSUFBSStJLFFBQUEsR0FBV3JKLFdBQUEsQ0FBWXRrQixTQUFaLEVBQXVCLENBQXZCLENBQWYsQ0FENkM7QUFBQSxRQUU3QyxPQUFPLFlBQVk7QUFBQSxVQUNmLElBQUl1dEIsUUFBQSxHQUFXSSxRQUFBLENBQVNwdEIsTUFBVCxDQUFnQitqQixXQUFBLENBQVl0a0IsU0FBWixDQUFoQixDQUFmLENBRGU7QUFBQSxVQUVmLElBQUk0bkIsUUFBQSxHQUFXM1csS0FBQSxFQUFmLENBRmU7QUFBQSxVQUdmc2MsUUFBQSxDQUFTaHVCLElBQVQsQ0FBY3FvQixRQUFBLENBQVNjLGdCQUFULEVBQWQsRUFIZTtBQUFBLFVBSWYsU0FBU3BOLEtBQVQsR0FBaUI7QUFBQSxZQUNiLE9BQU9rSixRQUFBLENBQVN6a0IsS0FBVCxDQUFlNmtCLEtBQWYsRUFBc0I1a0IsU0FBdEIsQ0FETTtBQUFBLFdBSkY7QUFBQSxVQU9mcVEsQ0FBQSxDQUFFaUwsS0FBRixFQUFTK1EsTUFBVCxDQUFnQmtCLFFBQWhCLEVBQTBCaGMsSUFBMUIsQ0FBK0JxVyxRQUFBLENBQVNoVyxNQUF4QyxFQVBlO0FBQUEsVUFRZixPQUFPZ1csUUFBQSxDQUFTelcsT0FSRDtBQUFBLFNBRjBCO0FBQUEsT0FBakQsQ0FoMERlO0FBQUEsTUE4MERmK1YsT0FBQSxDQUFRMVksU0FBUixDQUFrQm9mLEtBQWxCLEdBQTBCLFlBQThCO0FBQUEsUUFDcEQsSUFBSTF0QixJQUFBLEdBQU9va0IsV0FBQSxDQUFZdGtCLFNBQVosRUFBdUIsQ0FBdkIsQ0FBWCxDQURvRDtBQUFBLFFBRXBERSxJQUFBLENBQUt3bEIsT0FBTCxDQUFhLElBQWIsRUFGb0Q7QUFBQSxRQUdwRCxPQUFPclYsQ0FBQSxDQUFFdWQsS0FBRixDQUFRN3RCLEtBQVIsQ0FBYyxLQUFLLENBQW5CLEVBQXNCRyxJQUF0QixDQUg2QztBQUFBLE9BQXhELENBOTBEZTtBQUFBLE1BNjFEZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBbVEsQ0FBQSxDQUFFd2QsT0FBRixHQUNBO0FBQUEsTUFBQXhkLENBQUEsQ0FBRXlkLEtBQUYsR0FBVSxVQUFVM1QsTUFBVixFQUFrQjlhLElBQWxCLEVBQXdCYSxJQUF4QixFQUE4QjtBQUFBLFFBQ3BDLE9BQU9tUSxDQUFBLENBQUU4SixNQUFGLEVBQVUyVCxLQUFWLENBQWdCenVCLElBQWhCLEVBQXNCYSxJQUF0QixDQUQ2QjtBQUFBLE9BRHhDLENBNzFEZTtBQUFBLE1BazJEZmduQixPQUFBLENBQVExWSxTQUFSLENBQWtCcWYsT0FBbEIsR0FDQTtBQUFBLE1BQUEzRyxPQUFBLENBQVExWSxTQUFSLENBQWtCc2YsS0FBbEIsR0FBMEIsVUFBVXp1QixJQUFWLEVBQWdCYSxJQUFoQixFQUFzQjtBQUFBLFFBQzVDLElBQUlxdEIsUUFBQSxHQUFXakosV0FBQSxDQUFZcGtCLElBQUEsSUFBUSxFQUFwQixDQUFmLENBRDRDO0FBQUEsUUFFNUMsSUFBSTBuQixRQUFBLEdBQVczVyxLQUFBLEVBQWYsQ0FGNEM7QUFBQSxRQUc1Q3NjLFFBQUEsQ0FBU2h1QixJQUFULENBQWNxb0IsUUFBQSxDQUFTYyxnQkFBVCxFQUFkLEVBSDRDO0FBQUEsUUFJNUMsS0FBSzJDLFFBQUwsQ0FBYyxNQUFkLEVBQXNCO0FBQUEsVUFBQ2hzQixJQUFEO0FBQUEsVUFBT2t1QixRQUFQO0FBQUEsU0FBdEIsRUFBd0NoYyxJQUF4QyxDQUE2Q3FXLFFBQUEsQ0FBU2hXLE1BQXRELEVBSjRDO0FBQUEsUUFLNUMsT0FBT2dXLFFBQUEsQ0FBU3pXLE9BTDRCO0FBQUEsT0FEaEQsQ0FsMkRlO0FBQUEsTUFxM0RmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQWQsQ0FBQSxDQUFFMGQsS0FBRixHQUNBO0FBQUEsTUFBQTFkLENBQUEsQ0FBRTJkLE1BQUYsR0FDQTtBQUFBLE1BQUEzZCxDQUFBLENBQUU0ZCxPQUFGLEdBQVksVUFBVTlULE1BQVYsRUFBa0I5YSxJQUFsQixFQUFvQztBQUFBLFFBQzVDLElBQUlrdUIsUUFBQSxHQUFXakosV0FBQSxDQUFZdGtCLFNBQVosRUFBdUIsQ0FBdkIsQ0FBZixDQUQ0QztBQUFBLFFBRTVDLElBQUk0bkIsUUFBQSxHQUFXM1csS0FBQSxFQUFmLENBRjRDO0FBQUEsUUFHNUNzYyxRQUFBLENBQVNodUIsSUFBVCxDQUFjcW9CLFFBQUEsQ0FBU2MsZ0JBQVQsRUFBZCxFQUg0QztBQUFBLFFBSTVDclksQ0FBQSxDQUFFOEosTUFBRixFQUFVa1IsUUFBVixDQUFtQixNQUFuQixFQUEyQjtBQUFBLFVBQUNoc0IsSUFBRDtBQUFBLFVBQU9rdUIsUUFBUDtBQUFBLFNBQTNCLEVBQTZDaGMsSUFBN0MsQ0FBa0RxVyxRQUFBLENBQVNoVyxNQUEzRCxFQUo0QztBQUFBLFFBSzVDLE9BQU9nVyxRQUFBLENBQVN6VyxPQUw0QjtBQUFBLE9BRmhELENBcjNEZTtBQUFBLE1BKzNEZitWLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0J1ZixLQUFsQixHQUNBO0FBQUEsTUFBQTdHLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0J3ZixNQUFsQixHQUNBO0FBQUEsTUFBQTlHLE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0J5ZixPQUFsQixHQUE0QixVQUFVNXVCLElBQVYsRUFBNEI7QUFBQSxRQUNwRCxJQUFJa3VCLFFBQUEsR0FBV2pKLFdBQUEsQ0FBWXRrQixTQUFaLEVBQXVCLENBQXZCLENBQWYsQ0FEb0Q7QUFBQSxRQUVwRCxJQUFJNG5CLFFBQUEsR0FBVzNXLEtBQUEsRUFBZixDQUZvRDtBQUFBLFFBR3BEc2MsUUFBQSxDQUFTaHVCLElBQVQsQ0FBY3FvQixRQUFBLENBQVNjLGdCQUFULEVBQWQsRUFIb0Q7QUFBQSxRQUlwRCxLQUFLMkMsUUFBTCxDQUFjLE1BQWQsRUFBc0I7QUFBQSxVQUFDaHNCLElBQUQ7QUFBQSxVQUFPa3VCLFFBQVA7QUFBQSxTQUF0QixFQUF3Q2hjLElBQXhDLENBQTZDcVcsUUFBQSxDQUFTaFcsTUFBdEQsRUFKb0Q7QUFBQSxRQUtwRCxPQUFPZ1csUUFBQSxDQUFTelcsT0FMb0M7QUFBQSxPQUZ4RCxDQS8zRGU7QUFBQSxNQW01RGY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBZCxDQUFBLENBQUU2ZCxPQUFGLEdBQVlBLE9BQVosQ0FuNURlO0FBQUEsTUFvNURmLFNBQVNBLE9BQVQsQ0FBaUIvVCxNQUFqQixFQUF5QmdVLFFBQXpCLEVBQW1DO0FBQUEsUUFDL0IsT0FBTzlkLENBQUEsQ0FBRThKLE1BQUYsRUFBVStULE9BQVYsQ0FBa0JDLFFBQWxCLENBRHdCO0FBQUEsT0FwNURwQjtBQUFBLE1BdzVEZmpILE9BQUEsQ0FBUTFZLFNBQVIsQ0FBa0IwZixPQUFsQixHQUE0QixVQUFVQyxRQUFWLEVBQW9CO0FBQUEsUUFDNUMsSUFBSUEsUUFBSixFQUFjO0FBQUEsVUFDVixLQUFLNWIsSUFBTCxDQUFVLFVBQVU1SyxLQUFWLEVBQWlCO0FBQUEsWUFDdkIwSSxDQUFBLENBQUV5UyxRQUFGLENBQVcsWUFBWTtBQUFBLGNBQ25CcUwsUUFBQSxDQUFTLElBQVQsRUFBZXhtQixLQUFmLENBRG1CO0FBQUEsYUFBdkIsQ0FEdUI7QUFBQSxXQUEzQixFQUlHLFVBQVU2ZCxLQUFWLEVBQWlCO0FBQUEsWUFDaEJuVixDQUFBLENBQUV5UyxRQUFGLENBQVcsWUFBWTtBQUFBLGNBQ25CcUwsUUFBQSxDQUFTM0ksS0FBVCxDQURtQjtBQUFBLGFBQXZCLENBRGdCO0FBQUEsV0FKcEIsQ0FEVTtBQUFBLFNBQWQsTUFVTztBQUFBLFVBQ0gsT0FBTyxJQURKO0FBQUEsU0FYcUM7QUFBQSxPQUFoRCxDQXg1RGU7QUFBQSxNQXc2RGZuVixDQUFBLENBQUUyUCxVQUFGLEdBQWUsWUFBVztBQUFBLFFBQ3RCLE1BQU0sSUFBSXJFLEtBQUosQ0FBVSxvREFBVixDQURnQjtBQUFBLE9BQTFCLENBeDZEZTtBQUFBLE1BNjZEZjtBQUFBLFVBQUlpTCxXQUFBLEdBQWNoRSxXQUFBLEVBQWxCLENBNzZEZTtBQUFBLE1BKzZEZixPQUFPdlMsQ0EvNkRRO0FBQUEsS0FsRGYsRTs7OztJQzVCQSxJQUFJSixHQUFKLEVBQVNJLENBQVQsRUFBWStkLGFBQVosRUFBMkJDLGlCQUEzQixFQUE4QzdxQixDQUE5QyxFQUFpRDhxQixNQUFqRCxFQUF5REMsR0FBekQsRUFBOERDLHFCQUE5RCxFQUFxRkMsS0FBckYsQztJQUVBanJCLENBQUEsR0FBSXdNLE9BQUEsQ0FBUSx1QkFBUixDQUFKLEM7SUFFQUssQ0FBQSxHQUFJTCxPQUFBLENBQVEsS0FBUixDQUFKLEM7SUFFQXNlLE1BQUEsR0FBU3RlLE9BQUEsQ0FBUSxVQUFSLENBQVQsQztJQUVBeWUsS0FBQSxHQUFRemUsT0FBQSxDQUFRLFNBQVIsQ0FBUixDO0lBRUF1ZSxHQUFBLEdBQU1FLEtBQUEsQ0FBTUYsR0FBWixDO0lBRUFDLHFCQUFBLEdBQXdCQyxLQUFBLENBQU1DLElBQU4sQ0FBV0YscUJBQW5DLEM7SUFFQUgsaUJBQUEsR0FBb0I7QUFBQSxNQUNsQnRZLEtBQUEsRUFBTyxPQURXO0FBQUEsTUFFbEJvSCxJQUFBLEVBQU0sTUFGWTtBQUFBLEtBQXBCLEM7SUFLQWlSLGFBQUEsR0FBaUIsWUFBVztBQUFBLE1BQzFCLFNBQVNBLGFBQVQsQ0FBdUI3c0IsSUFBdkIsRUFBNkJvdEIsR0FBN0IsRUFBa0NDLE9BQWxDLEVBQTJDO0FBQUEsUUFDekMsS0FBS3J0QixJQUFMLEdBQVlBLElBQVosQ0FEeUM7QUFBQSxRQUV6QyxLQUFLcEMsRUFBTCxHQUFVd3ZCLEdBQVYsQ0FGeUM7QUFBQSxRQUd6QyxLQUFLRSxNQUFMLEdBQWNELE9BQWQsQ0FIeUM7QUFBQSxRQUl6QyxLQUFLRSxhQUFMLEdBQXFCdHJCLENBQUEsQ0FBRStZLEdBQUYsS0FBVSxLQUFLc1MsTUFBcEMsQ0FKeUM7QUFBQSxRQUt6QyxLQUFLRSxJQUFMLEdBQVksS0FMNkI7QUFBQSxPQURqQjtBQUFBLE1BUzFCWCxhQUFBLENBQWM1ZixTQUFkLENBQXdCd2dCLE1BQXhCLEdBQWlDLFlBQVc7QUFBQSxRQUMxQyxPQUFPLEtBQUtELElBQUwsR0FBWSxJQUR1QjtBQUFBLE9BQTVDLENBVDBCO0FBQUEsTUFhMUIsT0FBT1gsYUFibUI7QUFBQSxLQUFaLEVBQWhCLEM7SUFpQkFuZSxHQUFBLEdBQU8sWUFBVztBQUFBLE1BQ2hCQSxHQUFBLENBQUl6QixTQUFKLENBQWN5Z0IsY0FBZCxHQUErQixJQUEvQixDQURnQjtBQUFBLE1BR2hCLFNBQVNoZixHQUFULENBQWFpZixHQUFiLEVBQWtCQyxLQUFsQixFQUF5QjtBQUFBLFFBQ3ZCLEtBQUtELEdBQUwsR0FBV0EsR0FBWCxDQUR1QjtBQUFBLFFBRXZCLEtBQUtDLEtBQUwsR0FBYUEsS0FBYixDQUZ1QjtBQUFBLFFBR3ZCLEtBQUtGLGNBQUwsR0FBc0IsRUFBdEIsQ0FIdUI7QUFBQSxRQUl2QixJQUFJWCxNQUFBLENBQU9qYyxHQUFQLElBQWMsSUFBbEIsRUFBd0I7QUFBQSxVQUN0QmljLE1BQUEsQ0FBT2pjLEdBQVAsR0FBYSxJQURTO0FBQUEsU0FKRDtBQUFBLE9BSFQ7QUFBQSxNQVloQnBDLEdBQUEsQ0FBSXpCLFNBQUosQ0FBYzhELEdBQWQsR0FBb0IsVUFBU2pSLElBQVQsRUFBZTtBQUFBLFFBQ2pDLElBQUkyQixDQUFKLENBRGlDO0FBQUEsUUFFakMsSUFBSTNCLElBQUEsQ0FBSyxDQUFMLE1BQVksR0FBaEIsRUFBcUI7QUFBQSxVQUNuQjJCLENBQUEsR0FBSSxNQUFNM0IsSUFEUztBQUFBLFNBRlk7QUFBQSxRQUtqQyxPQUFPZ1AsQ0FBQSxDQUFFK2UsR0FBRixDQUFNOWMsR0FBTixDQUFVLEtBQUs0YyxHQUFMLEdBQVdsc0IsQ0FBckIsQ0FMMEI7QUFBQSxPQUFuQyxDQVpnQjtBQUFBLE1Bb0JoQmlOLEdBQUEsQ0FBSXpCLFNBQUosQ0FBYzBkLElBQWQsR0FBcUIsVUFBUzdxQixJQUFULEVBQWUwQixJQUFmLEVBQXFCO0FBQUEsUUFDeEMsSUFBSUMsQ0FBSixDQUR3QztBQUFBLFFBRXhDLElBQUkzQixJQUFBLENBQUssQ0FBTCxNQUFZLEdBQWhCLEVBQXFCO0FBQUEsVUFDbkIyQixDQUFBLEdBQUksTUFBTTNCLElBRFM7QUFBQSxTQUZtQjtBQUFBLFFBS3hDLE9BQU9nUCxDQUFBLENBQUUrZSxHQUFGLENBQU1sRCxJQUFOLENBQVcsS0FBS2dELEdBQUwsR0FBV2xzQixDQUF0QixFQUF5QkQsSUFBekIsQ0FMaUM7QUFBQSxPQUExQyxDQXBCZ0I7QUFBQSxNQTRCaEJrTixHQUFBLENBQUl6QixTQUFKLENBQWM2Z0IsR0FBZCxHQUFvQixVQUFTaHVCLElBQVQsRUFBZTBCLElBQWYsRUFBcUI7QUFBQSxRQUN2QyxJQUFJQyxDQUFKLENBRHVDO0FBQUEsUUFFdkMsSUFBSTNCLElBQUEsQ0FBSyxDQUFMLE1BQVksR0FBaEIsRUFBcUI7QUFBQSxVQUNuQjJCLENBQUEsR0FBSSxNQUFNM0IsSUFEUztBQUFBLFNBRmtCO0FBQUEsUUFLdkMsT0FBT2dQLENBQUEsQ0FBRStlLEdBQUYsQ0FBTUMsR0FBTixDQUFVLEtBQUtILEdBQUwsR0FBV2xzQixDQUFyQixFQUF3QkQsSUFBeEIsQ0FMZ0M7QUFBQSxPQUF6QyxDQTVCZ0I7QUFBQSxNQW9DaEJrTixHQUFBLENBQUl6QixTQUFKLENBQWM4Z0IsS0FBZCxHQUFzQixVQUFTanVCLElBQVQsRUFBZTBCLElBQWYsRUFBcUI7QUFBQSxRQUN6QyxJQUFJQyxDQUFKLENBRHlDO0FBQUEsUUFFekMsSUFBSTNCLElBQUEsQ0FBSyxDQUFMLE1BQVksR0FBaEIsRUFBcUI7QUFBQSxVQUNuQjJCLENBQUEsR0FBSSxNQUFNM0IsSUFEUztBQUFBLFNBRm9CO0FBQUEsUUFLekMsT0FBT2dQLENBQUEsQ0FBRStlLEdBQUYsQ0FBTUUsS0FBTixDQUFZLEtBQUtKLEdBQUwsR0FBV2xzQixDQUF2QixFQUEwQkQsSUFBMUIsQ0FMa0M7QUFBQSxPQUEzQyxDQXBDZ0I7QUFBQSxNQTRDaEJrTixHQUFBLENBQUl6QixTQUFKLENBQWMsUUFBZCxJQUEwQixVQUFTbk4sSUFBVCxFQUFlO0FBQUEsUUFDdkMsSUFBSTJCLENBQUosQ0FEdUM7QUFBQSxRQUV2QyxJQUFJM0IsSUFBQSxDQUFLLENBQUwsTUFBWSxHQUFoQixFQUFxQjtBQUFBLFVBQ25CMkIsQ0FBQSxHQUFJLE1BQU0zQixJQURTO0FBQUEsU0FGa0I7QUFBQSxRQUt2QyxPQUFPZ1AsQ0FBQSxDQUFFK2UsR0FBRixDQUFNLFFBQU4sRUFBZ0IsS0FBS0YsR0FBTCxHQUFXbHNCLENBQTNCLENBTGdDO0FBQUEsT0FBekMsQ0E1Q2dCO0FBQUEsTUFvRGhCaU4sR0FBQSxDQUFJekIsU0FBSixDQUFjK2dCLFlBQWQsR0FBNkIsVUFBU3B3QixFQUFULEVBQWEwdkIsTUFBYixFQUFxQjtBQUFBLFFBQ2hELElBQUk5TCxJQUFKLENBRGdEO0FBQUEsUUFFaERBLElBQUEsR0FBTyxJQUFJcUwsYUFBSixDQUFrQkMsaUJBQUEsQ0FBa0JsUixJQUFwQyxFQUEwQ2hlLEVBQTFDLEVBQThDMHZCLE1BQTlDLENBQVAsQ0FGZ0Q7QUFBQSxRQUdoRCxLQUFLSSxjQUFMLENBQW9CMXZCLElBQXBCLENBQXlCd2pCLElBQXpCLEVBSGdEO0FBQUEsUUFJaEQsSUFBSSxLQUFLa00sY0FBTCxDQUFvQi9xQixNQUFwQixLQUErQixDQUFuQyxFQUFzQztBQUFBLFVBQ3BDLEtBQUtzckIsSUFBTCxFQURvQztBQUFBLFNBSlU7QUFBQSxRQU9oRCxPQUFPek0sSUFQeUM7QUFBQSxPQUFsRCxDQXBEZ0I7QUFBQSxNQThEaEI5UyxHQUFBLENBQUl6QixTQUFKLENBQWNpaEIsYUFBZCxHQUE4QixVQUFTdHdCLEVBQVQsRUFBYTB2QixNQUFiLEVBQXFCdFMsR0FBckIsRUFBMEI7QUFBQSxRQUN0RCxJQUFJd0csSUFBSixDQURzRDtBQUFBLFFBRXRELElBQUl4RyxHQUFBLElBQU8sSUFBWCxFQUFpQjtBQUFBLFVBQ2ZBLEdBQUEsR0FBTSxLQURTO0FBQUEsU0FGcUM7QUFBQSxRQUt0RHdHLElBQUEsR0FBTyxJQUFJcUwsYUFBSixDQUFrQkMsaUJBQUEsQ0FBa0J0WSxLQUFwQyxFQUEyQzVXLEVBQTNDLEVBQStDMHZCLE1BQS9DLENBQVAsQ0FMc0Q7QUFBQSxRQU10RCxLQUFLSSxjQUFMLENBQW9CMXZCLElBQXBCLENBQXlCd2pCLElBQXpCLEVBTnNEO0FBQUEsUUFPdEQsSUFBSSxLQUFLa00sY0FBTCxDQUFvQi9xQixNQUFwQixLQUErQixDQUFuQyxFQUFzQztBQUFBLFVBQ3BDLEtBQUtzckIsSUFBTCxFQURvQztBQUFBLFNBUGdCO0FBQUEsUUFVdEQsSUFBSWpULEdBQUosRUFBUztBQUFBLFVBQ1BnUyxHQUFBLENBQUkseUNBQUosRUFETztBQUFBLFVBRVB4TCxJQUFBLEdBQU8sSUFBSXFMLGFBQUosQ0FBa0JDLGlCQUFBLENBQWtCbFIsSUFBcEMsRUFBMENoZSxFQUExQyxFQUE4QyxDQUE5QyxDQUFQLENBRk87QUFBQSxVQUdQLEtBQUs4dkIsY0FBTCxDQUFvQjF2QixJQUFwQixDQUF5QndqQixJQUF6QixDQUhPO0FBQUEsU0FWNkM7QUFBQSxRQWV0RCxPQUFPQSxJQWYrQztBQUFBLE9BQXhELENBOURnQjtBQUFBLE1BZ0ZoQjlTLEdBQUEsQ0FBSXpCLFNBQUosQ0FBY2doQixJQUFkLEdBQXFCLFlBQVc7QUFBQSxRQUM5QixJQUFJLEtBQUtQLGNBQUwsQ0FBb0IvcUIsTUFBcEIsR0FBNkIsQ0FBakMsRUFBb0M7QUFBQSxVQUNsQ3FxQixHQUFBLENBQUksb0JBQUosRUFEa0M7QUFBQSxVQUVsQyxPQUFPQyxxQkFBQSxDQUF1QixVQUFTemMsS0FBVCxFQUFnQjtBQUFBLFlBQzVDLE9BQU8sWUFBVztBQUFBLGNBQ2hCLElBQUlwUyxDQUFKLEVBQU91RSxNQUFQLEVBQWVxWSxHQUFmLEVBQW9CbVQsR0FBcEIsQ0FEZ0I7QUFBQSxjQUVoQm5ULEdBQUEsR0FBTS9ZLENBQUEsQ0FBRStZLEdBQUYsRUFBTixDQUZnQjtBQUFBLGNBR2hCNWMsQ0FBQSxHQUFJLENBQUosQ0FIZ0I7QUFBQSxjQUloQnVFLE1BQUEsR0FBUzZOLEtBQUEsQ0FBTWtkLGNBQU4sQ0FBcUIvcUIsTUFBOUIsQ0FKZ0I7QUFBQSxjQUtoQixPQUFPdkUsQ0FBQSxHQUFJdUUsTUFBWCxFQUFtQjtBQUFBLGdCQUNqQndyQixHQUFBLEdBQU0zZCxLQUFBLENBQU1rZCxjQUFOLENBQXFCdHZCLENBQXJCLENBQU4sQ0FEaUI7QUFBQSxnQkFFakIsSUFBSSt2QixHQUFBLENBQUlaLGFBQUosSUFBcUJ2UyxHQUF6QixFQUE4QjtBQUFBLGtCQUM1QixJQUFJLENBQUNtVCxHQUFBLENBQUlYLElBQVQsRUFBZTtBQUFBLG9CQUNiVyxHQUFBLENBQUl2d0IsRUFBSixDQUFPb2QsR0FBUCxDQURhO0FBQUEsbUJBRGE7QUFBQSxrQkFJNUIsSUFBSW1ULEdBQUEsQ0FBSVgsSUFBSixJQUFZVyxHQUFBLENBQUludUIsSUFBSixLQUFhOHNCLGlCQUFBLENBQWtCbFIsSUFBL0MsRUFBcUQ7QUFBQSxvQkFDbkRqWixNQUFBLEdBRG1EO0FBQUEsb0JBRW5ENk4sS0FBQSxDQUFNa2QsY0FBTixDQUFxQnR2QixDQUFyQixJQUEwQm9TLEtBQUEsQ0FBTWtkLGNBQU4sQ0FBcUIvcUIsTUFBckIsQ0FGeUI7QUFBQSxtQkFBckQsTUFHTyxJQUFJd3JCLEdBQUEsQ0FBSW51QixJQUFKLEtBQWE4c0IsaUJBQUEsQ0FBa0J0WSxLQUFuQyxFQUEwQztBQUFBLG9CQUMvQzJaLEdBQUEsQ0FBSVosYUFBSixJQUFxQlksR0FBQSxDQUFJYixNQURzQjtBQUFBLG1CQVByQjtBQUFBLGlCQUE5QixNQVVPO0FBQUEsa0JBQ0xsdkIsQ0FBQSxFQURLO0FBQUEsaUJBWlU7QUFBQSxlQUxIO0FBQUEsY0FxQmhCb1MsS0FBQSxDQUFNa2QsY0FBTixDQUFxQi9xQixNQUFyQixHQUE4QkEsTUFBOUIsQ0FyQmdCO0FBQUEsY0FzQmhCLElBQUlBLE1BQUEsR0FBUyxDQUFiLEVBQWdCO0FBQUEsZ0JBQ2QsT0FBTzZOLEtBQUEsQ0FBTXlkLElBQU4sRUFETztBQUFBLGVBdEJBO0FBQUEsYUFEMEI7QUFBQSxXQUFqQixDQTJCMUIsSUEzQjBCLENBQXRCLENBRjJCO0FBQUEsU0FETjtBQUFBLE9BQWhDLENBaEZnQjtBQUFBLE1Ba0hoQixPQUFPdmYsR0FsSFM7QUFBQSxLQUFaLEVBQU4sQztJQXNIQUwsTUFBQSxDQUFPRCxPQUFQLEdBQWlCTSxHOzs7O0lDMUpqQkwsTUFBQSxDQUFPRCxPQUFQLEdBQWlCLEU7Ozs7SUNBakJDLE1BQUEsQ0FBT0QsT0FBUCxHQUFpQjtBQUFBLE1BQ2YrZSxJQUFBLEVBQU0xZSxPQUFBLENBQVEsY0FBUixDQURTO0FBQUEsTUFFZnVlLEdBQUEsRUFBS3ZlLE9BQUEsQ0FBUSxhQUFSLENBRlU7QUFBQSxNQUdmMmYsUUFBQSxFQUFVM2YsT0FBQSxDQUFRLGtCQUFSLENBSEs7QUFBQSxLOzs7O0lDQWpCLElBQUlLLENBQUosRUFBTzNSLElBQVAsQztJQUVBQSxJQUFBLEdBQU9zUixPQUFBLENBQVEsV0FBUixDQUFQLEM7SUFFQUssQ0FBQSxHQUFJTCxPQUFBLENBQVEsS0FBUixDQUFKLEM7SUFFQSxJQUFJLE9BQU80ZixjQUFQLEtBQTBCLFdBQTFCLElBQXlDQSxjQUFBLEtBQW1CLElBQWhFLEVBQXNFO0FBQUEsTUFDcEU1ZixPQUFBLENBQVEsYUFBUixFQUFpQjRmLGNBQWpCLEVBQWlDdmYsQ0FBakMsQ0FEb0U7QUFBQSxLQUF0RSxNQUVPO0FBQUEsTUFDTEwsT0FBQSxDQUFRLGFBQVIsQ0FESztBQUFBLEs7SUFJUDlNLFFBQUEsQ0FBU3NMLFNBQVQsQ0FBbUJ1RixRQUFuQixHQUE4QixVQUFTMkosSUFBVCxFQUFlbVMsSUFBZixFQUFxQjtBQUFBLE1BQ2pELE9BQU9ycEIsTUFBQSxDQUFPc3BCLGNBQVAsQ0FBc0IsS0FBS3RoQixTQUEzQixFQUFzQ2tQLElBQXRDLEVBQTRDbVMsSUFBNUMsQ0FEMEM7QUFBQSxLQUFuRCxDO0lBSUFqZ0IsTUFBQSxDQUFPRCxPQUFQLEdBQWlCO0FBQUEsTUFDZjlRLFVBQUEsRUFBWSxVQUFTeU4sR0FBVCxFQUFjO0FBQUEsUUFDeEIsT0FBTzVOLElBQUEsQ0FBS0csVUFBTCxDQUFnQnlOLEdBQWhCLENBRGlCO0FBQUEsT0FEWDtBQUFBLE1BSWZraUIscUJBQUEsRUFBdUJ4ZSxPQUFBLENBQVEsS0FBUixDQUpSO0FBQUEsSzs7OztJQ1hqQjtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQUMsVUFBUytmLE9BQVQsRUFBa0I7QUFBQSxNQUNqQixJQUFJLE9BQU9sZ0IsTUFBUCxLQUFrQixVQUFsQixJQUFnQ0EsTUFBQSxDQUFPQyxHQUEzQyxFQUFnRDtBQUFBLFFBQzlDRCxNQUFBLENBQU8sQ0FBQyxHQUFELENBQVAsRUFBYyxVQUFTUSxDQUFULEVBQVk7QUFBQSxVQUN4QixPQUFPMGYsT0FBQSxDQUFRSCxjQUFSLEVBQXdCdmYsQ0FBeEIsQ0FEaUI7QUFBQSxTQUExQixDQUQ4QztBQUFBLE9BQWhELE1BSU8sSUFBSSxPQUFPVixPQUFQLEtBQW1CLFFBQW5CLElBQStCLE9BQU9DLE1BQVAsS0FBa0IsUUFBckQsRUFBK0Q7QUFBQSxRQUVwRTtBQUFBLFFBQUFBLE1BQUEsQ0FBT0QsT0FBUCxHQUFpQm9nQixPQUZtRDtBQUFBLE9BQS9ELE1BR0E7QUFBQSxRQUNMLElBQUksT0FBTzFmLENBQVAsS0FBYSxXQUFqQixFQUE4QjtBQUFBLFVBQzVCMGYsT0FBQSxDQUFRSCxjQUFSLEVBQXdCdmYsQ0FBeEIsQ0FENEI7QUFBQSxTQUR6QjtBQUFBLE9BUlU7QUFBQSxLQUFuQixDQWFHLFVBQVMyZixHQUFULEVBQWMzZixDQUFkLEVBQWlCO0FBQUEsTUFFbEI7QUFBQSxlQUFTekgsTUFBVCxDQUFnQnFuQixHQUFoQixFQUFxQjtBQUFBLFFBQ25CaHFCLEtBQUEsQ0FBTXVJLFNBQU4sQ0FBZ0JtRyxPQUFoQixDQUF3QnZVLElBQXhCLENBQTZCSixTQUE3QixFQUF3QyxVQUFTc00sR0FBVCxFQUFjO0FBQUEsVUFDcEQsSUFBSUEsR0FBQSxJQUFPQSxHQUFBLEtBQVEyakIsR0FBbkIsRUFBd0I7QUFBQSxZQUN0QnpwQixNQUFBLENBQU9DLElBQVAsQ0FBWTZGLEdBQVosRUFBaUJxSSxPQUFqQixDQUF5QixVQUFTL1AsR0FBVCxFQUFjO0FBQUEsY0FDckNxckIsR0FBQSxDQUFJcnJCLEdBQUosSUFBVzBILEdBQUEsQ0FBSTFILEdBQUosQ0FEMEI7QUFBQSxhQUF2QyxDQURzQjtBQUFBLFdBRDRCO0FBQUEsU0FBdEQsRUFEbUI7QUFBQSxRQVNuQixPQUFPcXJCLEdBVFk7QUFBQSxPQUZIO0FBQUEsTUFjbEIsU0FBU0MsU0FBVCxDQUFtQnB0QixHQUFuQixFQUF3QjtBQUFBLFFBQ3RCLE9BQVEsQ0FBQUEsR0FBQSxJQUFPLEVBQVAsQ0FBRCxDQUFZdUcsV0FBWixFQURlO0FBQUEsT0FkTjtBQUFBLE1Ba0JsQixTQUFTOG1CLFlBQVQsQ0FBc0JDLE9BQXRCLEVBQStCO0FBQUEsUUFDN0IsSUFBSUMsTUFBQSxHQUFTLEVBQWIsRUFBaUJ6ckIsR0FBakIsRUFBc0JGLEdBQXRCLEVBQTJCL0UsQ0FBM0IsQ0FENkI7QUFBQSxRQUc3QixJQUFJLENBQUN5d0IsT0FBTDtBQUFBLFVBQWMsT0FBT0MsTUFBUCxDQUhlO0FBQUEsUUFLN0JELE9BQUEsQ0FBUWp2QixLQUFSLENBQWMsSUFBZCxFQUFvQndULE9BQXBCLENBQTRCLFVBQVNxUixJQUFULEVBQWU7QUFBQSxVQUN6Q3JtQixDQUFBLEdBQUlxbUIsSUFBQSxDQUFLL2hCLE9BQUwsQ0FBYSxHQUFiLENBQUosQ0FEeUM7QUFBQSxVQUV6Q1csR0FBQSxHQUFNc3JCLFNBQUEsQ0FBVWxLLElBQUEsQ0FBS3NLLE1BQUwsQ0FBWSxDQUFaLEVBQWUzd0IsQ0FBZixFQUFrQmtFLElBQWxCLEVBQVYsQ0FBTixDQUZ5QztBQUFBLFVBR3pDYSxHQUFBLEdBQU1zaEIsSUFBQSxDQUFLc0ssTUFBTCxDQUFZM3dCLENBQUEsR0FBSSxDQUFoQixFQUFtQmtFLElBQW5CLEVBQU4sQ0FIeUM7QUFBQSxVQUt6QyxJQUFJZSxHQUFKLEVBQVM7QUFBQSxZQUNQLElBQUl5ckIsTUFBQSxDQUFPenJCLEdBQVAsQ0FBSixFQUFpQjtBQUFBLGNBQ2Z5ckIsTUFBQSxDQUFPenJCLEdBQVAsS0FBZSxPQUFPRixHQURQO0FBQUEsYUFBakIsTUFFTztBQUFBLGNBQ0wyckIsTUFBQSxDQUFPenJCLEdBQVAsSUFBY0YsR0FEVDtBQUFBLGFBSEE7QUFBQSxXQUxnQztBQUFBLFNBQTNDLEVBTDZCO0FBQUEsUUFtQjdCLE9BQU8yckIsTUFuQnNCO0FBQUEsT0FsQmI7QUFBQSxNQXdDbEIsU0FBU0UsYUFBVCxDQUF1QkgsT0FBdkIsRUFBZ0M7QUFBQSxRQUM5QixJQUFJSSxVQUFBLEdBQWEsT0FBT0osT0FBUCxLQUFtQixRQUFuQixHQUE4QkEsT0FBOUIsR0FBd0N4bEIsU0FBekQsQ0FEOEI7QUFBQSxRQUc5QixPQUFPLFVBQVN2TCxJQUFULEVBQWU7QUFBQSxVQUNwQixJQUFJLENBQUNteEIsVUFBTDtBQUFBLFlBQWlCQSxVQUFBLEdBQWFMLFlBQUEsQ0FBYUMsT0FBYixDQUFiLENBREc7QUFBQSxVQUdwQixJQUFJL3dCLElBQUosRUFBVTtBQUFBLFlBQ1IsT0FBT214QixVQUFBLENBQVdOLFNBQUEsQ0FBVTd3QixJQUFWLENBQVgsQ0FEQztBQUFBLFdBSFU7QUFBQSxVQU9wQixPQUFPbXhCLFVBUGE7QUFBQSxTQUhRO0FBQUEsT0F4Q2Q7QUFBQSxNQXNEbEIsU0FBU0MsYUFBVCxDQUF1QjF0QixJQUF2QixFQUE2QnF0QixPQUE3QixFQUFzQy92QixHQUF0QyxFQUEyQztBQUFBLFFBQ3pDLElBQUksT0FBT0EsR0FBUCxLQUFlLFVBQW5CLEVBQStCO0FBQUEsVUFDN0IsT0FBT0EsR0FBQSxDQUFJMEMsSUFBSixFQUFVcXRCLE9BQVYsQ0FEc0I7QUFBQSxTQURVO0FBQUEsUUFLekMvdkIsR0FBQSxDQUFJc1UsT0FBSixDQUFZLFVBQVN4VixFQUFULEVBQWE7QUFBQSxVQUN2QjRELElBQUEsR0FBTzVELEVBQUEsQ0FBRzRELElBQUgsRUFBU3F0QixPQUFULENBRGdCO0FBQUEsU0FBekIsRUFMeUM7QUFBQSxRQVN6QyxPQUFPcnRCLElBVGtDO0FBQUEsT0F0RHpCO0FBQUEsTUFrRWxCLFNBQVMydEIsU0FBVCxDQUFtQkMsTUFBbkIsRUFBMkI7QUFBQSxRQUN6QixPQUFPLE9BQU9BLE1BQVAsSUFBaUJBLE1BQUEsR0FBUyxHQURSO0FBQUEsT0FsRVQ7QUFBQSxNQXNFbEIsU0FBU2hjLE9BQVQsQ0FBaUJySSxHQUFqQixFQUFzQjJJLFFBQXRCLEVBQWdDM0IsT0FBaEMsRUFBeUM7QUFBQSxRQUN2QyxJQUFJN00sSUFBQSxHQUFPRCxNQUFBLENBQU9DLElBQVAsQ0FBWTZGLEdBQVosQ0FBWCxDQUR1QztBQUFBLFFBRXZDN0YsSUFBQSxDQUFLa08sT0FBTCxDQUFhLFVBQVMvUCxHQUFULEVBQWM7QUFBQSxVQUN6QnFRLFFBQUEsQ0FBUzdVLElBQVQsQ0FBY2tULE9BQWQsRUFBdUJoSCxHQUFBLENBQUkxSCxHQUFKLENBQXZCLEVBQWlDQSxHQUFqQyxDQUR5QjtBQUFBLFNBQTNCLEVBRnVDO0FBQUEsUUFLdkMsT0FBTzZCLElBTGdDO0FBQUEsT0F0RXZCO0FBQUEsTUE4RWxCLFNBQVNtcUIsYUFBVCxDQUF1QnRrQixHQUF2QixFQUE0QjJJLFFBQTVCLEVBQXNDM0IsT0FBdEMsRUFBK0M7QUFBQSxRQUM3QyxJQUFJN00sSUFBQSxHQUFPRCxNQUFBLENBQU9DLElBQVAsQ0FBWTZGLEdBQVosRUFBaUJtTCxJQUFqQixFQUFYLENBRDZDO0FBQUEsUUFFN0NoUixJQUFBLENBQUtrTyxPQUFMLENBQWEsVUFBUy9QLEdBQVQsRUFBYztBQUFBLFVBQ3pCcVEsUUFBQSxDQUFTN1UsSUFBVCxDQUFja1QsT0FBZCxFQUF1QmhILEdBQUEsQ0FBSTFILEdBQUosQ0FBdkIsRUFBaUNBLEdBQWpDLENBRHlCO0FBQUEsU0FBM0IsRUFGNkM7QUFBQSxRQUs3QyxPQUFPNkIsSUFMc0M7QUFBQSxPQTlFN0I7QUFBQSxNQXNGbEIsU0FBU29xQixRQUFULENBQWtCM0IsR0FBbEIsRUFBdUI0QixNQUF2QixFQUErQjtBQUFBLFFBQzdCLElBQUksQ0FBQ0EsTUFBTDtBQUFBLFVBQWEsT0FBTzVCLEdBQVAsQ0FEZ0I7QUFBQSxRQUU3QixJQUFJbnJCLEtBQUEsR0FBUSxFQUFaLENBRjZCO0FBQUEsUUFHN0I2c0IsYUFBQSxDQUFjRSxNQUFkLEVBQXNCLFVBQVNucEIsS0FBVCxFQUFnQi9DLEdBQWhCLEVBQXFCO0FBQUEsVUFDekMsSUFBSStDLEtBQUEsSUFBUyxJQUFiO0FBQUEsWUFBbUIsT0FEc0I7QUFBQSxVQUV6QyxJQUFJLENBQUMxQixLQUFBLENBQU1DLE9BQU4sQ0FBY3lCLEtBQWQsQ0FBTDtBQUFBLFlBQTJCQSxLQUFBLEdBQVEsQ0FBQ0EsS0FBRCxDQUFSLENBRmM7QUFBQSxVQUl6Q0EsS0FBQSxDQUFNZ04sT0FBTixDQUFjLFVBQVNqUixDQUFULEVBQVk7QUFBQSxZQUN4QixJQUFJLE9BQU9BLENBQVAsS0FBYSxRQUFqQixFQUEyQjtBQUFBLGNBQ3pCQSxDQUFBLEdBQUkwQyxJQUFBLENBQUtDLFNBQUwsQ0FBZTNDLENBQWYsQ0FEcUI7QUFBQSxhQURIO0FBQUEsWUFJeEJLLEtBQUEsQ0FBTXhFLElBQU4sQ0FBV3d4QixrQkFBQSxDQUFtQm5zQixHQUFuQixJQUEwQixHQUExQixHQUNBbXNCLGtCQUFBLENBQW1CcnRCLENBQW5CLENBRFgsQ0FKd0I7QUFBQSxXQUExQixDQUp5QztBQUFBLFNBQTNDLEVBSDZCO0FBQUEsUUFlN0IsT0FBT3dyQixHQUFBLEdBQU8sQ0FBQ0EsR0FBQSxDQUFJanJCLE9BQUosQ0FBWSxHQUFaLEtBQW9CLENBQUMsQ0FBdEIsR0FBMkIsR0FBM0IsR0FBaUMsR0FBakMsQ0FBUCxHQUErQ0YsS0FBQSxDQUFNVixJQUFOLENBQVcsR0FBWCxDQWZ6QjtBQUFBLE9BdEZiO0FBQUEsTUF3R2xCZ04sQ0FBQSxDQUFFK2UsR0FBRixHQUFRLFVBQVU0QixhQUFWLEVBQXlCO0FBQUEsUUFDL0IsSUFBSXhTLFFBQUEsR0FBV25PLENBQUEsQ0FBRStlLEdBQUYsQ0FBTTVRLFFBQXJCLEVBQ0E4UCxNQUFBLEdBQVM7QUFBQSxZQUNQMkMsZ0JBQUEsRUFBa0J6UyxRQUFBLENBQVN5UyxnQkFEcEI7QUFBQSxZQUVQQyxpQkFBQSxFQUFtQjFTLFFBQUEsQ0FBUzBTLGlCQUZyQjtBQUFBLFdBRFQsRUFLQUMsWUFBQSxHQUFlLFVBQVM3QyxNQUFULEVBQWlCO0FBQUEsWUFDOUIsSUFBSThDLFVBQUEsR0FBYTVTLFFBQUEsQ0FBUzRSLE9BQTFCLEVBQ0lpQixVQUFBLEdBQWF6b0IsTUFBQSxDQUFPLEVBQVAsRUFBVzBsQixNQUFBLENBQU84QixPQUFsQixDQURqQixFQUVJa0IsYUFGSixFQUVtQkMsc0JBRm5CLEVBRTJDQyxhQUYzQyxFQUlBQyxXQUFBLEdBQWMsVUFBU3JCLE9BQVQsRUFBa0I7QUFBQSxnQkFDOUJ6YixPQUFBLENBQVF5YixPQUFSLEVBQWlCLFVBQVNzQixRQUFULEVBQW1CQyxNQUFuQixFQUEyQjtBQUFBLGtCQUMxQyxJQUFJLE9BQU9ELFFBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFBQSxvQkFDbEMsSUFBSUUsYUFBQSxHQUFnQkYsUUFBQSxFQUFwQixDQURrQztBQUFBLG9CQUVsQyxJQUFJRSxhQUFBLElBQWlCLElBQXJCLEVBQTJCO0FBQUEsc0JBQ3pCeEIsT0FBQSxDQUFRdUIsTUFBUixJQUFrQkMsYUFETztBQUFBLHFCQUEzQixNQUVPO0FBQUEsc0JBQ0wsT0FBT3hCLE9BQUEsQ0FBUXVCLE1BQVIsQ0FERjtBQUFBLHFCQUoyQjtBQUFBLG1CQURNO0FBQUEsaUJBQTVDLENBRDhCO0FBQUEsZUFKaEMsQ0FEOEI7QUFBQSxZQWtCOUJQLFVBQUEsR0FBYXhvQixNQUFBLENBQU8sRUFBUCxFQUFXd29CLFVBQUEsQ0FBV1MsTUFBdEIsRUFBOEJULFVBQUEsQ0FBV2xCLFNBQUEsQ0FBVTVCLE1BQUEsQ0FBTzdYLE1BQWpCLENBQVgsQ0FBOUIsQ0FBYixDQWxCOEI7QUFBQSxZQXFCOUI7QUFBQSxZQUFBZ2IsV0FBQSxDQUFZTCxVQUFaLEVBckI4QjtBQUFBLFlBc0I5QkssV0FBQSxDQUFZSixVQUFaLEVBdEI4QjtBQUFBLFlBeUI5QjtBQUFBO0FBQUEsY0FDQSxLQUFLQyxhQUFMLElBQXNCRixVQUF0QixFQUFrQztBQUFBLGdCQUNoQ0csc0JBQUEsR0FBeUJyQixTQUFBLENBQVVvQixhQUFWLENBQXpCLENBRGdDO0FBQUEsZ0JBR2hDLEtBQUtFLGFBQUwsSUFBc0JILFVBQXRCLEVBQWtDO0FBQUEsa0JBQ2hDLElBQUluQixTQUFBLENBQVVzQixhQUFWLE1BQTZCRCxzQkFBakMsRUFBeUQ7QUFBQSxvQkFDdkQsZ0NBRHVEO0FBQUEsbUJBRHpCO0FBQUEsaUJBSEY7QUFBQSxnQkFTaENGLFVBQUEsQ0FBV0MsYUFBWCxJQUE0QkYsVUFBQSxDQUFXRSxhQUFYLENBVEk7QUFBQSxlQTFCSjtBQUFBLFlBc0M5QixPQUFPRCxVQXRDdUI7QUFBQSxXQUxoQyxFQTZDQWpCLE9BQUEsR0FBVWUsWUFBQSxDQUFhSCxhQUFiLENBN0NWLENBRCtCO0FBQUEsUUFnRC9CcG9CLE1BQUEsQ0FBTzBsQixNQUFQLEVBQWUwQyxhQUFmLEVBaEQrQjtBQUFBLFFBaUQvQjFDLE1BQUEsQ0FBTzhCLE9BQVAsR0FBaUJBLE9BQWpCLENBakQrQjtBQUFBLFFBa0QvQjlCLE1BQUEsQ0FBTzdYLE1BQVAsR0FBaUIsQ0FBQTZYLE1BQUEsQ0FBTzdYLE1BQVAsSUFBaUIsS0FBakIsQ0FBRCxDQUF5QnFiLFdBQXpCLEVBQWhCLENBbEQrQjtBQUFBLFFBb0QvQixJQUFJQyxhQUFBLEdBQWdCLFVBQVN6RCxNQUFULEVBQWlCO0FBQUEsWUFDbkM4QixPQUFBLEdBQVU5QixNQUFBLENBQU84QixPQUFqQixDQURtQztBQUFBLFlBRW5DLElBQUk0QixPQUFBLEdBQVV2QixhQUFBLENBQWNuQyxNQUFBLENBQU92ckIsSUFBckIsRUFBMkJ3dEIsYUFBQSxDQUFjSCxPQUFkLENBQTNCLEVBQW1EOUIsTUFBQSxDQUFPMkMsZ0JBQTFELENBQWQsQ0FGbUM7QUFBQSxZQUtuQztBQUFBLGdCQUFJM0MsTUFBQSxDQUFPdnJCLElBQVAsSUFBZSxJQUFuQixFQUF5QjtBQUFBLGNBQ3ZCNFIsT0FBQSxDQUFReWIsT0FBUixFQUFpQixVQUFTem9CLEtBQVQsRUFBZ0JncUIsTUFBaEIsRUFBd0I7QUFBQSxnQkFDdkMsSUFBSXpCLFNBQUEsQ0FBVXlCLE1BQVYsTUFBc0IsY0FBMUIsRUFBMEM7QUFBQSxrQkFDdEMsT0FBT3ZCLE9BQUEsQ0FBUXVCLE1BQVIsQ0FEK0I7QUFBQSxpQkFESDtBQUFBLGVBQXpDLENBRHVCO0FBQUEsYUFMVTtBQUFBLFlBYW5DLElBQUlyRCxNQUFBLENBQU8yRCxlQUFQLElBQTBCLElBQTFCLElBQWtDelQsUUFBQSxDQUFTeVQsZUFBVCxJQUE0QixJQUFsRSxFQUF3RTtBQUFBLGNBQ3RFM0QsTUFBQSxDQUFPMkQsZUFBUCxHQUF5QnpULFFBQUEsQ0FBU3lULGVBRG9DO0FBQUEsYUFickM7QUFBQSxZQWtCbkM7QUFBQSxtQkFBT0MsT0FBQSxDQUFRNUQsTUFBUixFQUFnQjBELE9BQWhCLEVBQXlCNUIsT0FBekIsRUFBa0M3ZCxJQUFsQyxDQUF1QzJlLGlCQUF2QyxFQUEwREEsaUJBQTFELENBbEI0QjtBQUFBLFdBQXJDLEVBcUJBQSxpQkFBQSxHQUFvQixVQUFTaUIsUUFBVCxFQUFtQjtBQUFBLFlBQ3JDQSxRQUFBLENBQVNwdkIsSUFBVCxHQUFnQjB0QixhQUFBLENBQWMwQixRQUFBLENBQVNwdkIsSUFBdkIsRUFBNkJvdkIsUUFBQSxDQUFTL0IsT0FBdEMsRUFBK0M5QixNQUFBLENBQU80QyxpQkFBdEQsQ0FBaEIsQ0FEcUM7QUFBQSxZQUVyQyxPQUFPUixTQUFBLENBQVV5QixRQUFBLENBQVN4QixNQUFuQixJQUE2QndCLFFBQTdCLEdBQXdDOWhCLENBQUEsQ0FBRXVCLE1BQUYsQ0FBU3VnQixRQUFULENBRlY7QUFBQSxXQXJCdkMsRUEwQkFoaEIsT0FBQSxHQUFVZCxDQUFBLENBQUU2WixJQUFGLENBQU9vRSxNQUFQLENBMUJWLENBcEQrQjtBQUFBLFFBaUYvQjtBQUFBLFFBQUFqZSxDQUFBLENBQUUrZSxHQUFGLENBQU1nRCxZQUFOLENBQW1CL2pCLE1BQW5CLENBQTBCLFVBQVN1USxXQUFULEVBQXNCO0FBQUEsVUFDNUMsT0FBTyxDQUFDLENBQUNBLFdBQUEsQ0FBWXlULE9BQWQsSUFBeUIsQ0FBQyxDQUFDelQsV0FBQSxDQUFZMFQsWUFERjtBQUFBLFNBQWhELEVBRUtsdkIsR0FGTCxDQUVTLFVBQVN3YixXQUFULEVBQXNCO0FBQUEsVUFDM0IsT0FBTztBQUFBLFlBQUU1TSxPQUFBLEVBQVM0TSxXQUFBLENBQVl5VCxPQUF2QjtBQUFBLFlBQWdDRSxPQUFBLEVBQVMzVCxXQUFBLENBQVkwVCxZQUFyRDtBQUFBLFdBRG9CO0FBQUEsU0FGL0IsRUFLQy94QixNQUxELENBS1EsRUFBRXlSLE9BQUEsRUFBUytmLGFBQVgsRUFMUixFQU1DeHhCLE1BTkQsQ0FNUThQLENBQUEsQ0FBRStlLEdBQUYsQ0FBTWdELFlBQU4sQ0FBbUIvakIsTUFBbkIsQ0FBMEIsVUFBU3VRLFdBQVQsRUFBc0I7QUFBQSxVQUNwRCxPQUFPLENBQUMsQ0FBQ0EsV0FBQSxDQUFZdVQsUUFBZCxJQUEwQixDQUFDLENBQUN2VCxXQUFBLENBQVk0VCxhQURLO0FBQUEsU0FBaEQsRUFFSHB2QixHQUZHLENBRUMsVUFBU3diLFdBQVQsRUFBc0I7QUFBQSxVQUMzQixPQUFPO0FBQUEsWUFBRTVNLE9BQUEsRUFBUzRNLFdBQUEsQ0FBWXVULFFBQXZCO0FBQUEsWUFBaUNJLE9BQUEsRUFBUzNULFdBQUEsQ0FBWTRULGFBQXREO0FBQUEsV0FEb0I7QUFBQSxTQUZ2QixDQU5SLEVBV0U3ZCxPQVhGLENBV1UsVUFBU3BDLElBQVQsRUFBZTtBQUFBLFVBQ3ZCcEIsT0FBQSxHQUFVQSxPQUFBLENBQVFvQixJQUFSLENBQWFBLElBQUEsQ0FBS1AsT0FBbEIsRUFBMkJPLElBQUEsQ0FBS2dnQixPQUFoQyxDQURhO0FBQUEsU0FYekIsRUFqRitCO0FBQUEsUUFnRy9CLE9BQU9waEIsT0FoR3dCO0FBQUEsT0FBakMsQ0F4R2tCO0FBQUEsTUE0TWxCLElBQUlzaEIsZUFBQSxHQUFrQixFQUFFLGdCQUFnQixnQ0FBbEIsRUFBdEIsQ0E1TWtCO0FBQUEsTUE4TWxCcGlCLENBQUEsQ0FBRStlLEdBQUYsQ0FBTTVRLFFBQU4sR0FBaUI7QUFBQSxRQUNmMFMsaUJBQUEsRUFBbUIsQ0FBQyxVQUFTbnVCLElBQVQsRUFBZXF0QixPQUFmLEVBQXdCO0FBQUEsWUFDMUMsSUFBSSxPQUFPcnRCLElBQVAsS0FBZ0IsUUFBaEIsSUFBNEJBLElBQUEsQ0FBS21CLE1BQWpDLElBQTRDLENBQUFrc0IsT0FBQSxDQUFRLGNBQVIsS0FBMkIsRUFBM0IsQ0FBRCxDQUFnQ25zQixPQUFoQyxDQUF3QyxNQUF4QyxLQUFtRCxDQUFsRyxFQUFxRztBQUFBLGNBQ25HbEIsSUFBQSxHQUFPcUQsSUFBQSxDQUFLc3NCLEtBQUwsQ0FBVzN2QixJQUFYLENBRDRGO0FBQUEsYUFEM0Q7QUFBQSxZQUkxQyxPQUFPQSxJQUptQztBQUFBLFdBQXpCLENBREo7QUFBQSxRQVFma3VCLGdCQUFBLEVBQWtCLENBQUMsVUFBU2x1QixJQUFULEVBQWU7QUFBQSxZQUNoQyxPQUFPLENBQUMsQ0FBQ0EsSUFBRixJQUFVLE9BQU9BLElBQVAsS0FBZ0IsUUFBMUIsSUFBc0NBLElBQUEsQ0FBSytJLFFBQUwsT0FBb0IsZUFBMUQsR0FDTDFGLElBQUEsQ0FBS0MsU0FBTCxDQUFldEQsSUFBZixDQURLLEdBQ2tCQSxJQUZPO0FBQUEsV0FBaEIsQ0FSSDtBQUFBLFFBYWZxdEIsT0FBQSxFQUFTO0FBQUEsVUFDUHlCLE1BQUEsRUFBUSxFQUNOLFVBQVUsbUNBREosRUFERDtBQUFBLFVBSVAzRixJQUFBLEVBQVF1RyxlQUpEO0FBQUEsVUFLUHBELEdBQUEsRUFBUW9ELGVBTEQ7QUFBQSxVQU1QbkQsS0FBQSxFQUFRbUQsZUFORDtBQUFBLFNBYk07QUFBQSxPQUFqQixDQTlNa0I7QUFBQSxNQXFPbEJwaUIsQ0FBQSxDQUFFK2UsR0FBRixDQUFNZ0QsWUFBTixHQUFxQixFQUFyQixDQXJPa0I7QUFBQSxNQXNPbEIvaEIsQ0FBQSxDQUFFK2UsR0FBRixDQUFNdUQsZUFBTixHQUF3QixFQUF4QixDQXRPa0I7QUFBQSxNQXdPbEIsU0FBU1QsT0FBVCxDQUFpQjVELE1BQWpCLEVBQXlCMEQsT0FBekIsRUFBa0NYLFVBQWxDLEVBQThDO0FBQUEsUUFDNUMsSUFBSXpKLFFBQUEsR0FBV3ZYLENBQUEsQ0FBRVksS0FBRixFQUFmLEVBQ0lFLE9BQUEsR0FBVXlXLFFBQUEsQ0FBU3pXLE9BRHZCLEVBRUkrZCxHQUFBLEdBQU0yQixRQUFBLENBQVN2QyxNQUFBLENBQU9ZLEdBQWhCLEVBQXFCWixNQUFBLENBQU93QyxNQUE1QixDQUZWLEVBR0kxQixHQUFBLEdBQU0sSUFBSVksR0FIZCxFQUlJNEMsT0FBQSxHQUFVLENBQUMsQ0FKZixFQUtJakMsTUFMSixFQU1JdkQsU0FOSixDQUQ0QztBQUFBLFFBUzVDL2MsQ0FBQSxDQUFFK2UsR0FBRixDQUFNdUQsZUFBTixDQUFzQnB6QixJQUF0QixDQUEyQit1QixNQUEzQixFQVQ0QztBQUFBLFFBVzVDYyxHQUFBLENBQUlqckIsSUFBSixDQUFTbXFCLE1BQUEsQ0FBTzdYLE1BQWhCLEVBQXdCeVksR0FBeEIsRUFBNkIsSUFBN0IsRUFYNEM7QUFBQSxRQVk1Q3ZhLE9BQUEsQ0FBUTJaLE1BQUEsQ0FBTzhCLE9BQWYsRUFBd0IsVUFBU3pvQixLQUFULEVBQWdCL0MsR0FBaEIsRUFBcUI7QUFBQSxVQUMzQyxJQUFJK0MsS0FBSixFQUFXO0FBQUEsWUFDVHluQixHQUFBLENBQUl5RCxnQkFBSixDQUFxQmp1QixHQUFyQixFQUEwQitDLEtBQTFCLENBRFM7QUFBQSxXQURnQztBQUFBLFNBQTdDLEVBWjRDO0FBQUEsUUFrQjVDeW5CLEdBQUEsQ0FBSTBELGtCQUFKLEdBQXlCLFlBQVc7QUFBQSxVQUNsQyxJQUFJMUQsR0FBQSxDQUFJMkQsVUFBSixJQUFrQixDQUF0QixFQUF5QjtBQUFBLFlBQ3ZCLElBQUlaLFFBQUosRUFBY2EsZUFBZCxDQUR1QjtBQUFBLFlBRXZCLElBQUlyQyxNQUFBLEtBQVdpQyxPQUFmLEVBQXdCO0FBQUEsY0FDdEJJLGVBQUEsR0FBa0I1RCxHQUFBLENBQUk2RCxxQkFBSixFQUFsQixDQURzQjtBQUFBLGNBSXRCO0FBQUE7QUFBQSxjQUFBZCxRQUFBLEdBQVcvQyxHQUFBLENBQUk4RCxZQUFKLEdBQW1COUQsR0FBQSxDQUFJK0MsUUFBdkIsR0FBa0MvQyxHQUFBLENBQUkrRCxZQUozQjtBQUFBLGFBRkQ7QUFBQSxZQVV2QjtBQUFBLFlBQUEvRixTQUFBLElBQWEzUSxZQUFBLENBQWEyUSxTQUFiLENBQWIsQ0FWdUI7QUFBQSxZQVd2QnVELE1BQUEsR0FBU0EsTUFBQSxJQUFVdkIsR0FBQSxDQUFJdUIsTUFBdkIsQ0FYdUI7QUFBQSxZQVl2QnZCLEdBQUEsR0FBTSxJQUFOLENBWnVCO0FBQUEsWUFldkI7QUFBQSxZQUFBdUIsTUFBQSxHQUFTMW1CLElBQUEsQ0FBSzZNLEdBQUwsQ0FBUzZaLE1BQUEsSUFBVSxJQUFWLEdBQWlCLEdBQWpCLEdBQXVCQSxNQUFoQyxFQUF3QyxDQUF4QyxDQUFULENBZnVCO0FBQUEsWUFpQnZCLElBQUl0WCxHQUFBLEdBQU1oSixDQUFBLENBQUUrZSxHQUFGLENBQU11RCxlQUFOLENBQXNCMXVCLE9BQXRCLENBQThCcXFCLE1BQTlCLENBQVYsQ0FqQnVCO0FBQUEsWUFrQnZCLElBQUlqVixHQUFBLEtBQVEsQ0FBQyxDQUFiO0FBQUEsY0FBZ0JoSixDQUFBLENBQUUrZSxHQUFGLENBQU11RCxlQUFOLENBQXNCOXlCLE1BQXRCLENBQTZCd1osR0FBN0IsRUFBa0MsQ0FBbEMsRUFsQk87QUFBQSxZQW9CckIsQ0FBQXFYLFNBQUEsQ0FBVUMsTUFBVixJQUFvQi9JLFFBQUEsQ0FBUzFXLE9BQTdCLEdBQXVDMFcsUUFBQSxDQUFTaFcsTUFBaEQsQ0FBRCxDQUF5RDtBQUFBLGNBQ3hEN08sSUFBQSxFQUFNb3ZCLFFBRGtEO0FBQUEsY0FFeER4QixNQUFBLEVBQVFBLE1BRmdEO0FBQUEsY0FHeERQLE9BQUEsRUFBU0csYUFBQSxDQUFjeUMsZUFBZCxDQUgrQztBQUFBLGNBSXhEMUUsTUFBQSxFQUFRQSxNQUpnRDtBQUFBLGFBQXpELENBcEJzQjtBQUFBLFdBRFM7QUFBQSxTQUFwQyxDQWxCNEM7QUFBQSxRQWdENUNjLEdBQUEsQ0FBSWdFLFVBQUosR0FBaUIsVUFBVTVLLFFBQVYsRUFBb0I7QUFBQSxVQUNuQ1osUUFBQSxDQUFTeFYsTUFBVCxDQUFnQm9XLFFBQWhCLENBRG1DO0FBQUEsU0FBckMsQ0FoRDRDO0FBQUEsUUFvRDVDLElBQUk4RixNQUFBLENBQU8yRCxlQUFYLEVBQTRCO0FBQUEsVUFDMUI3QyxHQUFBLENBQUk2QyxlQUFKLEdBQXNCLElBREk7QUFBQSxTQXBEZ0I7QUFBQSxRQXdENUMsSUFBSTNELE1BQUEsQ0FBTzRFLFlBQVgsRUFBeUI7QUFBQSxVQUN2QjlELEdBQUEsQ0FBSThELFlBQUosR0FBbUI1RSxNQUFBLENBQU80RSxZQURIO0FBQUEsU0F4RG1CO0FBQUEsUUE0RDVDOUQsR0FBQSxDQUFJakQsSUFBSixDQUFTNkYsT0FBQSxJQUFXLElBQXBCLEVBNUQ0QztBQUFBLFFBOEQ1QyxJQUFJMUQsTUFBQSxDQUFPblMsT0FBUCxHQUFpQixDQUFyQixFQUF3QjtBQUFBLFVBQ3RCaVIsU0FBQSxHQUFZblIsVUFBQSxDQUFXLFlBQVc7QUFBQSxZQUNoQzBVLE1BQUEsR0FBU2lDLE9BQVQsQ0FEZ0M7QUFBQSxZQUVoQ3hELEdBQUEsSUFBT0EsR0FBQSxDQUFJaUUsS0FBSixFQUZ5QjtBQUFBLFdBQXRCLEVBR1QvRSxNQUFBLENBQU9uUyxPQUhFLENBRFU7QUFBQSxTQTlEb0I7QUFBQSxRQXFFNUMsT0FBT2hMLE9BckVxQztBQUFBLE9BeE81QjtBQUFBLE1BZ1RsQjtBQUFBLFFBQUMsS0FBRDtBQUFBLFFBQVEsUUFBUjtBQUFBLFFBQWtCLE1BQWxCO0FBQUEsUUFBMEJ3RCxPQUExQixDQUFrQyxVQUFTdFYsSUFBVCxFQUFlO0FBQUEsUUFDL0NnUixDQUFBLENBQUUrZSxHQUFGLENBQU0vdkIsSUFBTixJQUFjLFVBQVM2dkIsR0FBVCxFQUFjWixNQUFkLEVBQXNCO0FBQUEsVUFDbEMsT0FBT2plLENBQUEsQ0FBRStlLEdBQUYsQ0FBTXhtQixNQUFBLENBQU8wbEIsTUFBQSxJQUFVLEVBQWpCLEVBQXFCO0FBQUEsWUFDaEM3WCxNQUFBLEVBQVFwWCxJQUR3QjtBQUFBLFlBRWhDNnZCLEdBQUEsRUFBS0EsR0FGMkI7QUFBQSxXQUFyQixDQUFOLENBRDJCO0FBQUEsU0FEVztBQUFBLE9BQWpELEVBaFRrQjtBQUFBLE1BeVRsQjtBQUFBLFFBQUMsTUFBRDtBQUFBLFFBQVMsS0FBVDtBQUFBLFFBQWdCLE9BQWhCO0FBQUEsUUFBeUJ2YSxPQUF6QixDQUFpQyxVQUFTdFYsSUFBVCxFQUFlO0FBQUEsUUFDOUNnUixDQUFBLENBQUUrZSxHQUFGLENBQU0vdkIsSUFBTixJQUFjLFVBQVM2dkIsR0FBVCxFQUFjbnNCLElBQWQsRUFBb0J1ckIsTUFBcEIsRUFBNEI7QUFBQSxVQUN4QyxPQUFPamUsQ0FBQSxDQUFFK2UsR0FBRixDQUFNeG1CLE1BQUEsQ0FBTzBsQixNQUFBLElBQVUsRUFBakIsRUFBcUI7QUFBQSxZQUNoQzdYLE1BQUEsRUFBUXBYLElBRHdCO0FBQUEsWUFFaEM2dkIsR0FBQSxFQUFLQSxHQUYyQjtBQUFBLFlBR2hDbnNCLElBQUEsRUFBTUEsSUFIMEI7QUFBQSxXQUFyQixDQUFOLENBRGlDO0FBQUEsU0FESTtBQUFBLE9BQWhELEVBelRrQjtBQUFBLE1BbVVsQixPQUFPc04sQ0FuVVc7QUFBQSxLQWJwQixFOzs7O0lDTEEsSUFBSWtNLEdBQUEsR0FBTXZNLE9BQUEsQ0FBUSxzREFBUixDQUFWLEVBQ0l0TixNQUFBLEdBQVMsT0FBT2pFLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0MsRUFBaEMsR0FBcUNBLE1BRGxELEVBRUk2MEIsT0FBQSxHQUFVO0FBQUEsUUFBQyxLQUFEO0FBQUEsUUFBUSxRQUFSO0FBQUEsT0FGZCxFQUdJQyxNQUFBLEdBQVMsZ0JBSGIsRUFJSUMsR0FBQSxHQUFNOXdCLE1BQUEsQ0FBTyxZQUFZNndCLE1BQW5CLENBSlYsRUFLSUUsR0FBQSxHQUFNL3dCLE1BQUEsQ0FBTyxXQUFXNndCLE1BQWxCLEtBQTZCN3dCLE1BQUEsQ0FBTyxrQkFBa0I2d0IsTUFBekIsQ0FMdkMsQztJQU9BLEtBQUksSUFBSTV6QixDQUFBLEdBQUksQ0FBUixDQUFKLENBQWVBLENBQUEsR0FBSTJ6QixPQUFBLENBQVFwdkIsTUFBWixJQUFzQixDQUFDc3ZCLEdBQXRDLEVBQTJDN3pCLENBQUEsRUFBM0MsRUFBZ0Q7QUFBQSxNQUM5QzZ6QixHQUFBLEdBQU05d0IsTUFBQSxDQUFPNHdCLE9BQUEsQ0FBUTN6QixDQUFSLElBQWEsU0FBYixHQUF5QjR6QixNQUFoQyxDQUFOLENBRDhDO0FBQUEsTUFFOUNFLEdBQUEsR0FBTS93QixNQUFBLENBQU80d0IsT0FBQSxDQUFRM3pCLENBQVIsSUFBYSxRQUFiLEdBQXdCNHpCLE1BQS9CLEtBQ0M3d0IsTUFBQSxDQUFPNHdCLE9BQUEsQ0FBUTN6QixDQUFSLElBQWEsZUFBYixHQUErQjR6QixNQUF0QyxDQUh1QztBQUFBLEs7SUFPaEQ7QUFBQSxRQUFHLENBQUNDLEdBQUQsSUFBUSxDQUFDQyxHQUFaLEVBQWlCO0FBQUEsTUFDZixJQUFJL2EsSUFBQSxHQUFPLENBQVgsRUFDSWpILEVBQUEsR0FBSyxDQURULEVBRUlpaUIsS0FBQSxHQUFRLEVBRlosRUFHSUMsYUFBQSxHQUFnQixPQUFPLEVBSDNCLENBRGU7QUFBQSxNQU1mSCxHQUFBLEdBQU0sVUFBU2hQLFFBQVQsRUFBbUI7QUFBQSxRQUN2QixJQUFHa1AsS0FBQSxDQUFNeHZCLE1BQU4sS0FBaUIsQ0FBcEIsRUFBdUI7QUFBQSxVQUNyQixJQUFJMHZCLElBQUEsR0FBT3JYLEdBQUEsRUFBWCxFQUNJeUcsSUFBQSxHQUFPL1ksSUFBQSxDQUFLNk0sR0FBTCxDQUFTLENBQVQsRUFBWTZjLGFBQUEsR0FBaUIsQ0FBQUMsSUFBQSxHQUFPbGIsSUFBUCxDQUE3QixDQURYLENBRHFCO0FBQUEsVUFHckJBLElBQUEsR0FBT3NLLElBQUEsR0FBTzRRLElBQWQsQ0FIcUI7QUFBQSxVQUlyQjNYLFVBQUEsQ0FBVyxZQUFXO0FBQUEsWUFDcEIsSUFBSTRYLEVBQUEsR0FBS0gsS0FBQSxDQUFNdnpCLEtBQU4sQ0FBWSxDQUFaLENBQVQsQ0FEb0I7QUFBQSxZQUtwQjtBQUFBO0FBQUE7QUFBQSxZQUFBdXpCLEtBQUEsQ0FBTXh2QixNQUFOLEdBQWUsQ0FBZixDQUxvQjtBQUFBLFlBTXBCLEtBQUksSUFBSXZFLENBQUEsR0FBSSxDQUFSLENBQUosQ0FBZUEsQ0FBQSxHQUFJazBCLEVBQUEsQ0FBRzN2QixNQUF0QixFQUE4QnZFLENBQUEsRUFBOUIsRUFBbUM7QUFBQSxjQUNqQyxJQUFHLENBQUNrMEIsRUFBQSxDQUFHbDBCLENBQUgsRUFBTW0wQixTQUFWLEVBQXFCO0FBQUEsZ0JBQ25CLElBQUc7QUFBQSxrQkFDREQsRUFBQSxDQUFHbDBCLENBQUgsRUFBTTZrQixRQUFOLENBQWU5TCxJQUFmLENBREM7QUFBQSxpQkFBSCxDQUVFLE9BQU0xTixDQUFOLEVBQVM7QUFBQSxrQkFDVGlSLFVBQUEsQ0FBVyxZQUFXO0FBQUEsb0JBQUUsTUFBTWpSLENBQVI7QUFBQSxtQkFBdEIsRUFBbUMsQ0FBbkMsQ0FEUztBQUFBLGlCQUhRO0FBQUEsZUFEWTtBQUFBLGFBTmY7QUFBQSxXQUF0QixFQWVHZixJQUFBLENBQUs4cEIsS0FBTCxDQUFXL1EsSUFBWCxDQWZILENBSnFCO0FBQUEsU0FEQTtBQUFBLFFBc0J2QjBRLEtBQUEsQ0FBTW4wQixJQUFOLENBQVc7QUFBQSxVQUNUeTBCLE1BQUEsRUFBUSxFQUFFdmlCLEVBREQ7QUFBQSxVQUVUK1MsUUFBQSxFQUFVQSxRQUZEO0FBQUEsVUFHVHNQLFNBQUEsRUFBVyxLQUhGO0FBQUEsU0FBWCxFQXRCdUI7QUFBQSxRQTJCdkIsT0FBT3JpQixFQTNCZ0I7QUFBQSxPQUF6QixDQU5lO0FBQUEsTUFvQ2ZnaUIsR0FBQSxHQUFNLFVBQVNPLE1BQVQsRUFBaUI7QUFBQSxRQUNyQixLQUFJLElBQUlyMEIsQ0FBQSxHQUFJLENBQVIsQ0FBSixDQUFlQSxDQUFBLEdBQUkrekIsS0FBQSxDQUFNeHZCLE1BQXpCLEVBQWlDdkUsQ0FBQSxFQUFqQyxFQUFzQztBQUFBLFVBQ3BDLElBQUcrekIsS0FBQSxDQUFNL3pCLENBQU4sRUFBU3EwQixNQUFULEtBQW9CQSxNQUF2QixFQUErQjtBQUFBLFlBQzdCTixLQUFBLENBQU0vekIsQ0FBTixFQUFTbTBCLFNBQVQsR0FBcUIsSUFEUTtBQUFBLFdBREs7QUFBQSxTQURqQjtBQUFBLE9BcENSO0FBQUEsSztJQTZDakJsa0IsTUFBQSxDQUFPRCxPQUFQLEdBQWlCLFVBQVN4USxFQUFULEVBQWE7QUFBQSxNQUk1QjtBQUFBO0FBQUE7QUFBQSxhQUFPcTBCLEdBQUEsQ0FBSXB6QixJQUFKLENBQVNzQyxNQUFULEVBQWlCdkQsRUFBakIsQ0FKcUI7QUFBQSxLQUE5QixDO0lBTUF5USxNQUFBLENBQU9ELE9BQVAsQ0FBZXFmLE1BQWYsR0FBd0IsWUFBVztBQUFBLE1BQ2pDeUUsR0FBQSxDQUFJMXpCLEtBQUosQ0FBVTJDLE1BQVYsRUFBa0IxQyxTQUFsQixDQURpQztBQUFBLEs7Ozs7SUNoRW5DO0FBQUEsS0FBQyxZQUFXO0FBQUEsTUFDVixJQUFJaTBCLGNBQUosRUFBb0JDLE1BQXBCLEVBQTRCQyxRQUE1QixDQURVO0FBQUEsTUFHVixJQUFLLE9BQU9DLFdBQVAsS0FBdUIsV0FBdkIsSUFBc0NBLFdBQUEsS0FBZ0IsSUFBdkQsSUFBZ0VBLFdBQUEsQ0FBWTdYLEdBQWhGLEVBQXFGO0FBQUEsUUFDbkYzTSxNQUFBLENBQU9ELE9BQVAsR0FBaUIsWUFBVztBQUFBLFVBQzFCLE9BQU95a0IsV0FBQSxDQUFZN1gsR0FBWixFQURtQjtBQUFBLFNBRHVEO0FBQUEsT0FBckYsTUFJTyxJQUFLLE9BQU9tSCxPQUFQLEtBQW1CLFdBQW5CLElBQWtDQSxPQUFBLEtBQVksSUFBL0MsSUFBd0RBLE9BQUEsQ0FBUXdRLE1BQXBFLEVBQTRFO0FBQUEsUUFDakZ0a0IsTUFBQSxDQUFPRCxPQUFQLEdBQWlCLFlBQVc7QUFBQSxVQUMxQixPQUFRLENBQUFza0IsY0FBQSxLQUFtQkUsUUFBbkIsQ0FBRCxHQUFnQyxPQURiO0FBQUEsU0FBNUIsQ0FEaUY7QUFBQSxRQUlqRkQsTUFBQSxHQUFTeFEsT0FBQSxDQUFRd1EsTUFBakIsQ0FKaUY7QUFBQSxRQUtqRkQsY0FBQSxHQUFpQixZQUFXO0FBQUEsVUFDMUIsSUFBSUksRUFBSixDQUQwQjtBQUFBLFVBRTFCQSxFQUFBLEdBQUtILE1BQUEsRUFBTCxDQUYwQjtBQUFBLFVBRzFCLE9BQU9HLEVBQUEsQ0FBRyxDQUFILElBQVEsVUFBUixHQUFjQSxFQUFBLENBQUcsQ0FBSCxDQUhLO0FBQUEsU0FBNUIsQ0FMaUY7QUFBQSxRQVVqRkYsUUFBQSxHQUFXRixjQUFBLEVBVnNFO0FBQUEsT0FBNUUsTUFXQSxJQUFJbHFCLElBQUEsQ0FBS3dTLEdBQVQsRUFBYztBQUFBLFFBQ25CM00sTUFBQSxDQUFPRCxPQUFQLEdBQWlCLFlBQVc7QUFBQSxVQUMxQixPQUFPNUYsSUFBQSxDQUFLd1MsR0FBTCxLQUFhNFgsUUFETTtBQUFBLFNBQTVCLENBRG1CO0FBQUEsUUFJbkJBLFFBQUEsR0FBV3BxQixJQUFBLENBQUt3UyxHQUFMLEVBSlE7QUFBQSxPQUFkLE1BS0E7QUFBQSxRQUNMM00sTUFBQSxDQUFPRCxPQUFQLEdBQWlCLFlBQVc7QUFBQSxVQUMxQixPQUFPLElBQUk1RixJQUFKLEdBQVdDLE9BQVgsS0FBdUJtcUIsUUFESjtBQUFBLFNBQTVCLENBREs7QUFBQSxRQUlMQSxRQUFBLEdBQVcsSUFBSXBxQixJQUFKLEdBQVdDLE9BQVgsRUFKTjtBQUFBLE9BdkJHO0FBQUEsS0FBWixDQThCRzVKLElBOUJILENBOEJRLElBOUJSO0FBQUE7QUFBQSxFOzs7O0lDREEsSUFBSW11QixHQUFKLEM7SUFFQUEsR0FBQSxHQUFNLFlBQVc7QUFBQSxNQUNmLElBQUlBLEdBQUEsQ0FBSStGLEtBQVIsRUFBZTtBQUFBLFFBQ2IsT0FBT3ROLE9BQUEsQ0FBUXVILEdBQVIsQ0FBWXh1QixLQUFaLENBQWtCaW5CLE9BQUEsQ0FBUXVILEdBQTFCLEVBQStCdnVCLFNBQS9CLENBRE07QUFBQSxPQURBO0FBQUEsS0FBakIsQztJQU1BdXVCLEdBQUEsQ0FBSStGLEtBQUosR0FBWSxLQUFaLEM7SUFFQS9GLEdBQUEsQ0FBSWdHLEtBQUosR0FBWWhHLEdBQVosQztJQUVBQSxHQUFBLENBQUlpRyxJQUFKLEdBQVcsWUFBVztBQUFBLE1BQ3BCLE9BQU94TixPQUFBLENBQVF1SCxHQUFSLENBQVl4dUIsS0FBWixDQUFrQmluQixPQUFBLENBQVF1SCxHQUExQixFQUErQnZ1QixTQUEvQixDQURhO0FBQUEsS0FBdEIsQztJQUlBdXVCLEdBQUEsQ0FBSXRILElBQUosR0FBVyxZQUFXO0FBQUEsTUFDcEJELE9BQUEsQ0FBUXVILEdBQVIsQ0FBWSxPQUFaLEVBRG9CO0FBQUEsTUFFcEIsT0FBT3ZILE9BQUEsQ0FBUXVILEdBQVIsQ0FBWXh1QixLQUFaLENBQWtCaW5CLE9BQUEsQ0FBUXVILEdBQTFCLEVBQStCdnVCLFNBQS9CLENBRmE7QUFBQSxLQUF0QixDO0lBS0F1dUIsR0FBQSxDQUFJL0ksS0FBSixHQUFZLFlBQVc7QUFBQSxNQUNyQndCLE9BQUEsQ0FBUXVILEdBQVIsQ0FBWSxRQUFaLEVBRHFCO0FBQUEsTUFFckJ2SCxPQUFBLENBQVF1SCxHQUFSLENBQVl4dUIsS0FBWixDQUFrQmluQixPQUFBLENBQVF1SCxHQUExQixFQUErQnZ1QixTQUEvQixFQUZxQjtBQUFBLE1BR3JCLE1BQU0sSUFBSUEsU0FBQSxDQUFVLENBQVYsQ0FIVztBQUFBLEtBQXZCLEM7SUFNQTRQLE1BQUEsQ0FBT0QsT0FBUCxHQUFpQjRlLEc7Ozs7SUMzQmpCLElBQUlvQixRQUFKLEVBQWNqeEIsSUFBZCxDO0lBRUFBLElBQUEsR0FBT3NSLE9BQUEsQ0FBUSxXQUFSLENBQVAsQztJQUVBMmYsUUFBQSxHQUFXLEVBQVgsQztJQUVBanhCLElBQUEsQ0FBS0csVUFBTCxDQUFnQjh3QixRQUFoQixFO0lBRUEvZixNQUFBLENBQU9ELE9BQVAsR0FBaUJnZ0IsUTs7OztJQ1JqQixJQUFJOEUsTUFBSixFQUFZdGtCLE1BQVosRUFBb0JFLENBQXBCLEVBQXVCSCxNQUF2QixFQUErQjFNLENBQS9CLEVBQWtDOHFCLE1BQWxDLEVBQTBDQyxHQUExQyxFQUErQ0MscUJBQS9DLEVBQXNFQyxLQUF0RSxDO0lBRUFqckIsQ0FBQSxHQUFJd00sT0FBQSxDQUFRLHVCQUFSLENBQUosQztJQUVBSyxDQUFBLEdBQUlMLE9BQUEsQ0FBUSxLQUFSLENBQUosQztJQUVBc2UsTUFBQSxHQUFTLFdBQVQsQztJQUVBRyxLQUFBLEdBQVF6ZSxPQUFBLENBQVEsU0FBUixDQUFSLEM7SUFFQXdlLHFCQUFBLEdBQXdCQyxLQUFBLENBQU1DLElBQU4sQ0FBV0YscUJBQW5DLEM7SUFFQUQsR0FBQSxHQUFNRSxLQUFBLENBQU1GLEdBQVosQztJQUVBcGUsTUFBQSxHQUFTSCxPQUFBLENBQVEsZUFBUixFQUFvQkcsTUFBN0IsQztJQUVBc2tCLE1BQUEsR0FBUztBQUFBLE1BQ1BDLE9BQUEsRUFBUyxTQURGO0FBQUEsTUFFUEMsUUFBQSxFQUFVLFVBRkg7QUFBQSxNQUdQQyxTQUFBLEVBQVcsV0FISjtBQUFBLE1BSVBDLGVBQUEsRUFBaUIsaUJBSlY7QUFBQSxLQUFULEM7SUFPQTNrQixNQUFBLEdBQVUsWUFBVztBQUFBLE1BQ25CQSxNQUFBLENBQU91a0IsTUFBUCxHQUFnQkEsTUFBaEIsQ0FEbUI7QUFBQSxNQU1uQjtBQUFBLE1BQUF2a0IsTUFBQSxDQUFPMUIsU0FBUCxDQUFpQm5QLElBQWpCLEdBQXdCLEVBQXhCLENBTm1CO0FBQUEsTUFXbkI7QUFBQSxNQUFBNlEsTUFBQSxDQUFPMUIsU0FBUCxDQUFpQnpMLElBQWpCLEdBQXdCLElBQXhCLENBWG1CO0FBQUEsTUFnQm5CO0FBQUEsTUFBQW1OLE1BQUEsQ0FBTzFCLFNBQVAsQ0FBaUI2RCxHQUFqQixHQUF1QixJQUF2QixDQWhCbUI7QUFBQSxNQWtCbkJuQyxNQUFBLENBQU8xQixTQUFQLENBQWlCbk4sSUFBakIsR0FBd0IsRUFBeEIsQ0FsQm1CO0FBQUEsTUFvQm5CNk8sTUFBQSxDQUFPMUIsU0FBUCxDQUFpQnNtQixPQUFqQixHQUEyQixJQUEzQixDQXBCbUI7QUFBQSxNQXNCbkI1a0IsTUFBQSxDQUFPNkQsUUFBUCxDQUFnQixRQUFoQixFQUEwQjtBQUFBLFFBQ3hCekIsR0FBQSxFQUFLLFlBQVc7QUFBQSxVQUNkLE9BQU8sS0FBS3dpQixPQURFO0FBQUEsU0FEUTtBQUFBLFFBSXhCM2QsR0FBQSxFQUFLLFVBQVN4UCxLQUFULEVBQWdCO0FBQUEsVUFDbkI0bUIsR0FBQSxDQUFJLFlBQUosRUFBa0IsS0FBS3hlLE1BQXZCLEVBRG1CO0FBQUEsVUFFbkIsSUFBSSxLQUFLK2tCLE9BQUwsSUFBZ0IsSUFBcEIsRUFBMEI7QUFBQSxZQUN4QixLQUFLQSxPQUFMLENBQWFyeUIsTUFBYixHQUFzQixJQURFO0FBQUEsV0FGUDtBQUFBLFVBS25CLEtBQUtiLElBQUwsR0FMbUI7QUFBQSxVQU1uQixLQUFLa3pCLE9BQUwsR0FBZW50QixLQUFBLElBQVN3SSxNQUFBLENBQU9rQixJQUEvQixDQU5tQjtBQUFBLFVBT25CLElBQUksS0FBS3lqQixPQUFMLElBQWdCLElBQXBCLEVBQTBCO0FBQUEsWUFDeEIsS0FBS0EsT0FBTCxDQUFhcnlCLE1BQWIsR0FBc0IsSUFERTtBQUFBLFdBUFA7QUFBQSxVQVVuQixPQUFPLEtBQUtWLEtBQUwsRUFWWTtBQUFBLFNBSkc7QUFBQSxPQUExQixFQXRCbUI7QUFBQSxNQXdDbkJtTyxNQUFBLENBQU8xQixTQUFQLENBQWlCdW1CLEtBQWpCLEdBQXlCLElBQXpCLENBeENtQjtBQUFBLE1BMENuQjdrQixNQUFBLENBQU8xQixTQUFQLENBQWlCd21CLFNBQWpCLEdBQTZCdkcsS0FBQSxDQUFNa0IsUUFBbkMsQ0ExQ21CO0FBQUEsTUE0Q25CLFNBQVN6ZixNQUFULENBQWdCa0IsT0FBaEIsRUFBeUI7QUFBQSxRQUN2QixJQUFJckIsTUFBSixDQUR1QjtBQUFBLFFBRXZCLEtBQUtxQixPQUFMLEdBQWVBLE9BQWYsQ0FGdUI7QUFBQSxRQUd2QnJCLE1BQUEsR0FBUyxLQUFLcUIsT0FBTCxDQUFhckIsTUFBYixJQUF1QkksTUFBQSxDQUFPa0IsSUFBdkMsQ0FIdUI7QUFBQSxRQUl2QixPQUFPLEtBQUtELE9BQUwsQ0FBYXJCLE1BQXBCLENBSnVCO0FBQUEsUUFLdkJ2TSxDQUFBLENBQUVvRixNQUFGLENBQVMsSUFBVCxFQUFlLEtBQUt3SSxPQUFwQixFQUx1QjtBQUFBLFFBTXZCLElBQUksS0FBS2lCLEdBQUwsSUFBWSxJQUFoQixFQUFzQjtBQUFBLFVBQ3BCLEtBQUtBLEdBQUwsR0FBV2ljLE1BQUEsQ0FBT2pjLEdBREU7QUFBQSxTQU5DO0FBQUEsUUFTdkIsS0FBS3RDLE1BQUwsR0FBY0EsTUFUUztBQUFBLE9BNUNOO0FBQUEsTUF3RG5CRyxNQUFBLENBQU8xQixTQUFQLENBQWlCek0sS0FBakIsR0FBeUIsWUFBVztBQUFBLFFBQ2xDLElBQUlnTyxNQUFKLENBRGtDO0FBQUEsUUFFbEMsSUFBSSxLQUFLc0MsR0FBTCxJQUFZLElBQWhCLEVBQXNCO0FBQUEsVUFDcEJ0QyxNQUFBLEdBQVMsS0FBS0EsTUFBZCxDQURvQjtBQUFBLFVBRXBCLElBQUlBLE1BQUEsQ0FBT1ksWUFBUCxLQUF3QkMsUUFBNUIsRUFBc0M7QUFBQSxZQUNwQyxPQUFPLEtBQUtta0IsS0FBTCxHQUFhLEtBQUsxaUIsR0FBTCxDQUFTa2QsWUFBVCxDQUF3QixVQUFTeGQsS0FBVCxFQUFnQjtBQUFBLGNBQzFELE9BQU8sWUFBVztBQUFBLGdCQUNoQixPQUFPQSxLQUFBLENBQU1rakIsS0FBTixFQURTO0FBQUEsZUFEd0M7QUFBQSxhQUFqQixDQUl4QyxJQUp3QyxDQUF2QixFQUlULENBSlMsQ0FEZ0I7QUFBQSxXQUF0QyxNQU1PO0FBQUEsWUFDTCxPQUFPLEtBQUtGLEtBQUwsR0FBYSxLQUFLMWlCLEdBQUwsQ0FBU29kLGFBQVQsQ0FBeUIsVUFBUzFkLEtBQVQsRUFBZ0I7QUFBQSxjQUMzRCxPQUFPLFlBQVc7QUFBQSxnQkFDaEIsT0FBT0EsS0FBQSxDQUFNa2pCLEtBQU4sRUFEUztBQUFBLGVBRHlDO0FBQUEsYUFBakIsQ0FJekMsSUFKeUMsQ0FBeEIsRUFJVGxsQixNQUFBLENBQU9ZLFlBSkUsRUFJWSxJQUpaLENBRGY7QUFBQSxXQVJhO0FBQUEsU0FBdEIsTUFlTztBQUFBLFVBQ0wsT0FBTzZkLHFCQUFBLENBQXVCLFVBQVN6YyxLQUFULEVBQWdCO0FBQUEsWUFDNUMsT0FBTyxZQUFXO0FBQUEsY0FDaEIsT0FBT0EsS0FBQSxDQUFNa2pCLEtBQU4sRUFEUztBQUFBLGFBRDBCO0FBQUEsV0FBakIsQ0FJMUIsSUFKMEIsQ0FBdEIsQ0FERjtBQUFBLFNBakIyQjtBQUFBLE9BQXBDLENBeERtQjtBQUFBLE1Ba0ZuQi9rQixNQUFBLENBQU8xQixTQUFQLENBQWlCNU0sSUFBakIsR0FBd0IsWUFBVztBQUFBLFFBQ2pDLElBQUksS0FBS216QixLQUFMLElBQWMsSUFBbEIsRUFBd0I7QUFBQSxVQUN0QixLQUFLQSxLQUFMLENBQVcvRixNQUFYLEVBRHNCO0FBQUEsU0FEUztBQUFBLFFBSWpDLE9BQU8sS0FBSytGLEtBQUwsR0FBYSxJQUphO0FBQUEsT0FBbkMsQ0FsRm1CO0FBQUEsTUF5Rm5CN2tCLE1BQUEsQ0FBTzFCLFNBQVAsQ0FBaUJ5bUIsS0FBakIsR0FBeUIsWUFBVztBQUFBLFFBQ2xDLElBQUlqa0IsQ0FBSixFQUFPd1UsS0FBUCxFQUFjalUsSUFBZCxFQUFvQlQsSUFBcEIsRUFBMEIwWCxRQUExQixFQUFvQ3hXLE9BQXBDLENBRGtDO0FBQUEsUUFFbEMsS0FBS2pDLE1BQUwsQ0FBWWMsTUFBWixHQUZrQztBQUFBLFFBR2xDLElBQUksS0FBS3dCLEdBQUwsSUFBWSxJQUFoQixFQUFzQjtBQUFBLFVBQ3BCLEtBQUtwUyxPQUFMLENBQWF3MEIsTUFBQSxDQUFPQyxPQUFwQixFQURvQjtBQUFBLFVBRXBCMWlCLE9BQUEsR0FBVyxVQUFTRCxLQUFULEVBQWdCO0FBQUEsWUFDekIsT0FBTyxVQUFTaFAsSUFBVCxFQUFlO0FBQUEsY0FDcEJnUCxLQUFBLENBQU05UixPQUFOLENBQWN3MEIsTUFBQSxDQUFPRSxRQUFyQixFQUErQjV4QixJQUEvQixFQURvQjtBQUFBLGNBRXBCLE9BQU9nUCxLQUFBLENBQU1oUCxJQUFOLEdBQWFBLElBRkE7QUFBQSxhQURHO0FBQUEsV0FBakIsQ0FLUCxJQUxPLENBQVYsQ0FGb0I7QUFBQSxVQVFwQnlpQixLQUFBLEdBQVMsVUFBU3pULEtBQVQsRUFBZ0I7QUFBQSxZQUN2QixPQUFPLFVBQVNtakIsR0FBVCxFQUFjO0FBQUEsY0FDbkIsT0FBT25qQixLQUFBLENBQU05UixPQUFOLENBQWN3MEIsTUFBQSxDQUFPRyxTQUFyQixFQUFnQ00sR0FBaEMsQ0FEWTtBQUFBLGFBREU7QUFBQSxXQUFqQixDQUlMLElBSkssQ0FBUixDQVJvQjtBQUFBLFVBYXBCMU0sUUFBQSxHQUFZLFVBQVN6VyxLQUFULEVBQWdCO0FBQUEsWUFDMUIsT0FBTyxVQUFTaFAsSUFBVCxFQUFlO0FBQUEsY0FDcEJnUCxLQUFBLENBQU05UixPQUFOLENBQWN3MEIsTUFBQSxDQUFPSSxlQUFyQixFQUFzQzl4QixJQUF0QyxFQURvQjtBQUFBLGNBRXBCLE9BQU9nUCxLQUFBLENBQU1oUCxJQUFOLEdBQWFBLElBRkE7QUFBQSxhQURJO0FBQUEsV0FBakIsQ0FLUixJQUxRLENBQVgsQ0Fib0I7QUFBQSxVQW1CcEIrTixJQUFBLEdBQVEsVUFBU2lCLEtBQVQsRUFBZ0I7QUFBQSxZQUN0QixPQUFPLFVBQVNoQixHQUFULEVBQWM7QUFBQSxjQUNuQixPQUFPZ0IsS0FBQSxDQUFNaEMsTUFBTixDQUFhZSxJQUFiLENBQWtCQyxHQUFsQixFQUF1QnlZLElBQXZCLENBQTRCeFgsT0FBNUIsRUFBcUN3VCxLQUFyQyxFQUE0Q2dELFFBQTVDLENBRFk7QUFBQSxhQURDO0FBQUEsV0FBakIsQ0FJSixJQUpJLENBQVAsQ0FuQm9CO0FBQUEsVUF3QnBCalgsSUFBQSxHQUFRLFVBQVNRLEtBQVQsRUFBZ0I7QUFBQSxZQUN0QixPQUFPLFVBQVNoQixHQUFULEVBQWM7QUFBQSxjQUNuQixPQUFPZ0IsS0FBQSxDQUFNOVIsT0FBTixDQUFjdzBCLE1BQUEsQ0FBT0csU0FBckIsRUFBZ0M3akIsR0FBQSxDQUFJYyxPQUFwQyxDQURZO0FBQUEsYUFEQztBQUFBLFdBQWpCLENBSUosSUFKSSxDQUFQLENBeEJvQjtBQUFBLFVBNkJwQixPQUFPLEtBQUtRLEdBQUwsQ0FBU0MsR0FBVCxDQUFhLEtBQUtqUixJQUFsQixFQUF3QmtSLElBQXhCLENBQTZCekIsSUFBN0IsRUFBbUNTLElBQW5DLENBN0JhO0FBQUEsU0FBdEIsTUE4Qk87QUFBQSxVQUNMUCxDQUFBLEdBQUlYLENBQUEsQ0FBRVksS0FBRixFQUFKLENBREs7QUFBQSxVQUVMdWQscUJBQUEsQ0FBdUIsVUFBU3pjLEtBQVQsRUFBZ0I7QUFBQSxZQUNyQyxPQUFPLFlBQVc7QUFBQSxjQUNoQkEsS0FBQSxDQUFNOVIsT0FBTixDQUFjdzBCLE1BQUEsQ0FBT0UsUUFBckIsRUFBK0I1aUIsS0FBQSxDQUFNaFAsSUFBckMsRUFEZ0I7QUFBQSxjQUVoQixPQUFPaU8sQ0FBQSxDQUFFRSxPQUFGLENBQVVhLEtBQUEsQ0FBTWhQLElBQWhCLENBRlM7QUFBQSxhQURtQjtBQUFBLFdBQWpCLENBS25CLElBTG1CLENBQXRCLEVBRks7QUFBQSxVQVFMLE9BQU9pTyxDQUFBLENBQUVHLE9BUko7QUFBQSxTQWpDMkI7QUFBQSxPQUFwQyxDQXpGbUI7QUFBQSxNQXNJbkJqQixNQUFBLENBQU8xQixTQUFQLENBQWlCMm1CLFNBQWpCLEdBQTZCLFVBQVNscUIsS0FBVCxFQUFnQjtBQUFBLFFBQzNDLE9BQU8sS0FBSzVMLElBQUwsR0FBWSxHQUFaLEdBQWtCNEwsS0FBQSxDQUFNcEgsSUFBTixHQUFhekUsT0FBYixDQUFxQixHQUFyQixFQUEwQixNQUFNLEtBQUtDLElBQVgsR0FBa0IsR0FBNUMsQ0FEa0I7QUFBQSxPQUE3QyxDQXRJbUI7QUFBQSxNQTBJbkI2USxNQUFBLENBQU8xQixTQUFQLENBQWlCdlAsRUFBakIsR0FBc0IsVUFBU2dNLEtBQVQsRUFBZ0I5TCxFQUFoQixFQUFvQjtBQUFBLFFBQ3hDLE9BQU8sS0FBSzYxQixTQUFMLENBQWUvMUIsRUFBZixDQUFrQixLQUFLazJCLFNBQUwsQ0FBZWxxQixLQUFmLENBQWxCLEVBQXlDOUwsRUFBekMsQ0FEaUM7QUFBQSxPQUExQyxDQTFJbUI7QUFBQSxNQThJbkIrUSxNQUFBLENBQU8xQixTQUFQLENBQWlCMk8sSUFBakIsR0FBd0IsVUFBU2xTLEtBQVQsRUFBZ0I5TCxFQUFoQixFQUFvQjtBQUFBLFFBQzFDLE9BQU8sS0FBSzYxQixTQUFMLENBQWVsMUIsR0FBZixDQUFtQixLQUFLcTFCLFNBQUwsQ0FBZWxxQixLQUFmLENBQW5CLEVBQTBDOUwsRUFBMUMsQ0FEbUM7QUFBQSxPQUE1QyxDQTlJbUI7QUFBQSxNQWtKbkIrUSxNQUFBLENBQU8xQixTQUFQLENBQWlCL08sR0FBakIsR0FBdUIsVUFBU3dMLEtBQVQsRUFBZ0I5TCxFQUFoQixFQUFvQjtBQUFBLFFBQ3pDLE9BQU8sS0FBSzYxQixTQUFMLENBQWV2MUIsR0FBZixDQUFtQixLQUFLMDFCLFNBQUwsQ0FBZWxxQixLQUFmLENBQW5CLEVBQTBDOUwsRUFBMUMsQ0FEa0M7QUFBQSxPQUEzQyxDQWxKbUI7QUFBQSxNQXNKbkIrUSxNQUFBLENBQU8xQixTQUFQLENBQWlCdk8sT0FBakIsR0FBMkIsVUFBU2dMLEtBQVQsRUFBZ0I7QUFBQSxRQUN6QyxJQUFJL0ssSUFBSixDQUR5QztBQUFBLFFBRXpDQSxJQUFBLEdBQU8rRixLQUFBLENBQU11SSxTQUFOLENBQWdCck8sS0FBaEIsQ0FBc0JDLElBQXRCLENBQTJCSixTQUEzQixDQUFQLENBRnlDO0FBQUEsUUFHekNFLElBQUEsQ0FBS2sxQixLQUFMLEdBSHlDO0FBQUEsUUFJekNsMUIsSUFBQSxDQUFLd2xCLE9BQUwsQ0FBYSxLQUFLeVAsU0FBTCxDQUFlbHFCLEtBQWYsQ0FBYixFQUp5QztBQUFBLFFBS3pDLE9BQU8sS0FBSytwQixTQUFMLENBQWUvMEIsT0FBZixDQUF1QkYsS0FBdkIsQ0FBNkIsSUFBN0IsRUFBbUNHLElBQW5DLENBTGtDO0FBQUEsT0FBM0MsQ0F0Sm1CO0FBQUEsTUE4Sm5CLE9BQU9nUSxNQTlKWTtBQUFBLEtBQVosRUFBVCxDO0lBa0tBTixNQUFBLENBQU9ELE9BQVAsR0FBaUJPLE07Ozs7SUN6TGpCTixNQUFBLENBQU9ELE9BQVAsR0FBaUI7QUFBQSxNQUNmMGxCLElBQUEsRUFBTXJsQixPQUFBLENBQVEsYUFBUixDQURTO0FBQUEsTUFFZnNsQixJQUFBLEVBQU10bEIsT0FBQSxDQUFRLGFBQVIsQ0FGUztBQUFBLEs7Ozs7SUNBakIsSUFBSXVsQixRQUFKLEVBQWNDLEtBQWQsRUFBcUJDLGNBQXJCLEVBQXFDQyxXQUFyQyxFQUFrREMsU0FBbEQsRUFBNkRDLGVBQTdELEVBQThFdmxCLENBQTlFLEVBQWlGd2xCLGtCQUFqRixFQUFxR1AsSUFBckcsRUFBMkc5eEIsQ0FBM0csRUFBOEdzeUIsT0FBOUcsRUFBdUhwM0IsSUFBdkgsRUFDRWtLLE1BQUEsR0FBUyxVQUFTWCxLQUFULEVBQWdCaEQsTUFBaEIsRUFBd0I7QUFBQSxRQUFFLFNBQVNMLEdBQVQsSUFBZ0JLLE1BQWhCLEVBQXdCO0FBQUEsVUFBRSxJQUFJcUwsT0FBQSxDQUFRbFEsSUFBUixDQUFhNkUsTUFBYixFQUFxQkwsR0FBckIsQ0FBSjtBQUFBLFlBQStCcUQsS0FBQSxDQUFNckQsR0FBTixJQUFhSyxNQUFBLENBQU9MLEdBQVAsQ0FBOUM7QUFBQSxTQUExQjtBQUFBLFFBQXVGLFNBQVMyTCxJQUFULEdBQWdCO0FBQUEsVUFBRSxLQUFLQyxXQUFMLEdBQW1CdkksS0FBckI7QUFBQSxTQUF2RztBQUFBLFFBQXFJc0ksSUFBQSxDQUFLL0IsU0FBTCxHQUFpQnZKLE1BQUEsQ0FBT3VKLFNBQXhCLENBQXJJO0FBQUEsUUFBd0t2RyxLQUFBLENBQU11RyxTQUFOLEdBQWtCLElBQUkrQixJQUF0QixDQUF4SztBQUFBLFFBQXNNdEksS0FBQSxDQUFNd0ksU0FBTixHQUFrQnhMLE1BQUEsQ0FBT3VKLFNBQXpCLENBQXRNO0FBQUEsUUFBME8sT0FBT3ZHLEtBQWpQO0FBQUEsT0FEbkMsRUFFRXFJLE9BQUEsR0FBVSxHQUFHSSxjQUZmLEM7SUFJQWhTLElBQUEsR0FBT3NSLE9BQUEsQ0FBUSxXQUFSLENBQVAsQztJQUVBeE0sQ0FBQSxHQUFJd00sT0FBQSxDQUFRLHVCQUFSLENBQUosQztJQUVBSyxDQUFBLEdBQUlMLE9BQUEsQ0FBUSxLQUFSLENBQUosQztJQUVBc2xCLElBQUEsR0FBT3RsQixPQUFBLENBQVEsYUFBUixDQUFQLEM7SUFFQTBsQixXQUFBLEdBQWUsWUFBVztBQUFBLE1BQ3hCQSxXQUFBLENBQVlsbkIsU0FBWixDQUFzQjNJLEdBQXRCLEdBQTRCLEVBQTVCLENBRHdCO0FBQUEsTUFHeEI2dkIsV0FBQSxDQUFZbG5CLFNBQVosQ0FBc0IsU0FBdEIsSUFBbUMsRUFBbkMsQ0FId0I7QUFBQSxNQUt4QmtuQixXQUFBLENBQVlsbkIsU0FBWixDQUFzQnVuQixXQUF0QixHQUFvQyxFQUFwQyxDQUx3QjtBQUFBLE1BT3hCTCxXQUFBLENBQVlsbkIsU0FBWixDQUFzQnduQixLQUF0QixHQUE4QixFQUE5QixDQVB3QjtBQUFBLE1BU3hCLFNBQVNOLFdBQVQsQ0FBcUJPLElBQXJCLEVBQTJCQyxRQUEzQixFQUFxQ0gsV0FBckMsRUFBa0RDLEtBQWxELEVBQXlEO0FBQUEsUUFDdkQsS0FBS253QixHQUFMLEdBQVdvd0IsSUFBWCxDQUR1RDtBQUFBLFFBRXZELEtBQUssU0FBTCxJQUFrQkMsUUFBbEIsQ0FGdUQ7QUFBQSxRQUd2RCxLQUFLSCxXQUFMLEdBQW1CQSxXQUFuQixDQUh1RDtBQUFBLFFBSXZELEtBQUtDLEtBQUwsR0FBYUEsS0FKMEM7QUFBQSxPQVRqQztBQUFBLE1BZ0J4QixPQUFPTixXQWhCaUI7QUFBQSxLQUFaLEVBQWQsQztJQW9CQUYsS0FBQSxHQUFTLFlBQVc7QUFBQSxNQUNsQkEsS0FBQSxDQUFNaG5CLFNBQU4sQ0FBZ0IzSSxHQUFoQixHQUFzQixFQUF0QixDQURrQjtBQUFBLE1BR2xCMnZCLEtBQUEsQ0FBTWhuQixTQUFOLENBQWdCMm5CLEtBQWhCLEdBQXdCLEVBQXhCLENBSGtCO0FBQUEsTUFLbEJYLEtBQUEsQ0FBTWhuQixTQUFOLENBQWdCNG5CLFNBQWhCLEdBQTRCLFlBQVc7QUFBQSxPQUF2QyxDQUxrQjtBQUFBLE1BT2xCLFNBQVNaLEtBQVQsQ0FBZVMsSUFBZixFQUFxQkksTUFBckIsRUFBNkJDLFVBQTdCLEVBQXlDO0FBQUEsUUFDdkMsS0FBS3p3QixHQUFMLEdBQVdvd0IsSUFBWCxDQUR1QztBQUFBLFFBRXZDLEtBQUtFLEtBQUwsR0FBYUUsTUFBYixDQUZ1QztBQUFBLFFBR3ZDLEtBQUtELFNBQUwsR0FBaUJFLFVBSHNCO0FBQUEsT0FQdkI7QUFBQSxNQWFsQixPQUFPZCxLQWJXO0FBQUEsS0FBWixFQUFSLEM7SUFpQkFLLGtCQUFBLEdBQXNCLFlBQVc7QUFBQSxNQUMvQixTQUFTQSxrQkFBVCxDQUE0QlUsVUFBNUIsRUFBd0NDLFlBQXhDLEVBQXNEO0FBQUEsUUFDcEQsS0FBSzlnQixTQUFMLEdBQWlCNmdCLFVBQWpCLENBRG9EO0FBQUEsUUFFcEQsS0FBS0UsV0FBTCxHQUFtQkQsWUFGaUM7QUFBQSxPQUR2QjtBQUFBLE1BTS9CLE9BQU9YLGtCQU53QjtBQUFBLEtBQVosRUFBckIsQztJQVVBSixjQUFBLEdBQWtCLFlBQVc7QUFBQSxNQUMzQixTQUFTQSxjQUFULENBQXdCYyxVQUF4QixFQUFvQ0csUUFBcEMsRUFBOEM7QUFBQSxRQUM1QyxLQUFLaGhCLFNBQUwsR0FBaUI2Z0IsVUFBakIsQ0FENEM7QUFBQSxRQUU1QyxLQUFLbHVCLE9BQUwsR0FBZXF1QixRQUY2QjtBQUFBLE9BRG5CO0FBQUEsTUFNM0IsT0FBT2pCLGNBTm9CO0FBQUEsS0FBWixFQUFqQixDO0lBVUFLLE9BQUEsR0FBVTtBQUFBLE1BQ1JhLFNBQUEsRUFBVyxFQURIO0FBQUEsTUFFUkMsZUFBQSxFQUFpQixFQUZUO0FBQUEsTUFHUkMsY0FBQSxFQUFnQixZQUhSO0FBQUEsTUFJUkMsUUFBQSxFQUFVLFlBSkY7QUFBQSxNQUtSQyxpQkFBQSxFQUFtQixVQUFTcmhCLFNBQVQsRUFBb0IrZ0IsV0FBcEIsRUFBaUM7QUFBQSxRQUNsRCxJQUFJanpCLENBQUEsQ0FBRXFRLFVBQUYsQ0FBYTRpQixXQUFiLENBQUosRUFBK0I7QUFBQSxVQUM3QixPQUFPLEtBQUtFLFNBQUwsQ0FBZXAzQixJQUFmLENBQW9CLElBQUlzMkIsa0JBQUosQ0FBdUJuZ0IsU0FBdkIsRUFBa0MrZ0IsV0FBbEMsQ0FBcEIsQ0FEc0I7QUFBQSxTQURtQjtBQUFBLE9BTDVDO0FBQUEsTUFVUk8sV0FBQSxFQUFhLFVBQVN0aEIsU0FBVCxFQUFvQnJOLE9BQXBCLEVBQTZCO0FBQUEsUUFDeEMsT0FBTyxLQUFLc3VCLFNBQUwsQ0FBZXAzQixJQUFmLENBQW9CLElBQUlrMkIsY0FBSixDQUFtQi9mLFNBQW5CLEVBQThCck4sT0FBOUIsQ0FBcEIsQ0FEaUM7QUFBQSxPQVZsQztBQUFBLE1BYVI0dUIsU0FBQSxFQUFXLFVBQVM1dUIsT0FBVCxFQUFrQjtBQUFBLFFBQzNCLElBQUkxSSxDQUFKLEVBQU8rUixDQUFQLEVBQVV2RixHQUFWLEVBQWUrcUIsTUFBZixFQUF1QkMsR0FBdkIsRUFBNEJ0aUIsT0FBNUIsQ0FEMkI7QUFBQSxRQUUzQnNpQixHQUFBLEdBQU0sS0FBS1IsU0FBWCxDQUYyQjtBQUFBLFFBRzNCOWhCLE9BQUEsR0FBVSxFQUFWLENBSDJCO0FBQUEsUUFJM0IsS0FBS2xWLENBQUEsR0FBSStSLENBQUEsR0FBSSxDQUFSLEVBQVd2RixHQUFBLEdBQU1nckIsR0FBQSxDQUFJanpCLE1BQTFCLEVBQWtDd04sQ0FBQSxHQUFJdkYsR0FBdEMsRUFBMkN4TSxDQUFBLEdBQUksRUFBRStSLENBQWpELEVBQW9EO0FBQUEsVUFDbER3bEIsTUFBQSxHQUFTQyxHQUFBLENBQUl4M0IsQ0FBSixDQUFULENBRGtEO0FBQUEsVUFFbEQsSUFBSXUzQixNQUFBLENBQU83dUIsT0FBUCxLQUFtQkEsT0FBdkIsRUFBZ0M7QUFBQSxZQUM5QndNLE9BQUEsQ0FBUXRWLElBQVIsQ0FBYSxLQUFLbzNCLFNBQUwsQ0FBZWgzQixDQUFmLElBQW9CLElBQWpDLENBRDhCO0FBQUEsV0FBaEMsTUFFTztBQUFBLFlBQ0xrVixPQUFBLENBQVF0VixJQUFSLENBQWEsS0FBSyxDQUFsQixDQURLO0FBQUEsV0FKMkM7QUFBQSxTQUp6QjtBQUFBLFFBWTNCLE9BQU9zVixPQVpvQjtBQUFBLE9BYnJCO0FBQUEsTUEyQlJ1aUIsZUFBQSxFQUFpQixVQUFTMWhCLFNBQVQsRUFBb0IrZ0IsV0FBcEIsRUFBaUM7QUFBQSxRQUNoRCxJQUFJOTJCLENBQUosRUFBTytSLENBQVAsRUFBVXZGLEdBQVYsRUFBZStxQixNQUFmLEVBQXVCQyxHQUF2QixFQUE0QnRpQixPQUE1QixDQURnRDtBQUFBLFFBRWhEc2lCLEdBQUEsR0FBTSxLQUFLUCxlQUFYLENBRmdEO0FBQUEsUUFHaEQvaEIsT0FBQSxHQUFVLEVBQVYsQ0FIZ0Q7QUFBQSxRQUloRCxLQUFLbFYsQ0FBQSxHQUFJK1IsQ0FBQSxHQUFJLENBQVIsRUFBV3ZGLEdBQUEsR0FBTWdyQixHQUFBLENBQUlqekIsTUFBMUIsRUFBa0N3TixDQUFBLEdBQUl2RixHQUF0QyxFQUEyQ3hNLENBQUEsR0FBSSxFQUFFK1IsQ0FBakQsRUFBb0Q7QUFBQSxVQUNsRHdsQixNQUFBLEdBQVNDLEdBQUEsQ0FBSXgzQixDQUFKLENBQVQsQ0FEa0Q7QUFBQSxVQUVsRCxJQUFJdTNCLE1BQUEsQ0FBT1QsV0FBUCxLQUF1QkEsV0FBM0IsRUFBd0M7QUFBQSxZQUN0QzVoQixPQUFBLENBQVF0VixJQUFSLENBQWEsS0FBS3EzQixlQUFMLENBQXFCajNCLENBQXJCLElBQTBCLElBQXZDLENBRHNDO0FBQUEsV0FBeEMsTUFFTztBQUFBLFlBQ0xrVixPQUFBLENBQVF0VixJQUFSLENBQWEsS0FBSyxDQUFsQixDQURLO0FBQUEsV0FKMkM7QUFBQSxTQUpKO0FBQUEsUUFZaEQsT0FBT3NWLE9BWnlDO0FBQUEsT0EzQjFDO0FBQUEsTUF5Q1IrTSxNQUFBLEVBQVEsVUFBU3lWLFNBQVQsRUFBb0I7QUFBQSxRQUMxQixJQUFJQyxLQUFKLEVBQVczM0IsQ0FBWCxFQUFjNDNCLFFBQWQsRUFBd0JDLE1BQXhCLEVBQWdDOWxCLENBQWhDLEVBQW1Dak8sQ0FBbkMsRUFBc0MyUSxDQUF0QyxFQUF5Q2pJLEdBQXpDLEVBQThDK0YsSUFBOUMsRUFBb0R1bEIsSUFBcEQsRUFBMERQLE1BQTFELEVBQWtFZixLQUFsRSxFQUF5RWdCLEdBQXpFLEVBQThFTyxJQUE5RSxFQUFvRjd4QixHQUFwRixFQUF5RnV3QixTQUF6RixFQUFvR3VCLFVBQXBHLENBRDBCO0FBQUEsUUFFMUJILE1BQUEsR0FBUyxFQUFULENBRjBCO0FBQUEsUUFHMUIsS0FBSzczQixDQUFBLEdBQUkrUixDQUFBLEdBQUksQ0FBUixFQUFXdkYsR0FBQSxHQUFNa3JCLFNBQUEsQ0FBVW56QixNQUFoQyxFQUF3Q3dOLENBQUEsR0FBSXZGLEdBQTVDLEVBQWlEeE0sQ0FBQSxHQUFJLEVBQUUrUixDQUF2RCxFQUEwRDtBQUFBLFVBQ3hENmxCLFFBQUEsR0FBV0YsU0FBQSxDQUFVMTNCLENBQVYsQ0FBWCxDQUR3RDtBQUFBLFVBRXhELElBQUk0M0IsUUFBQSxJQUFZLElBQWhCLEVBQXNCO0FBQUEsWUFDcEIsUUFEb0I7QUFBQSxXQUZrQztBQUFBLFVBS3hESSxVQUFBLEdBQWEsQ0FDWCxVQUFTcDBCLElBQVQsRUFBZTtBQUFBLGNBQ2IsSUFBSTR5QixLQUFKLEVBQVc5MkIsSUFBWCxDQURhO0FBQUEsY0FFYjgyQixLQUFBLEdBQVE1eUIsSUFBQSxDQUFLLENBQUwsQ0FBUixFQUFpQmxFLElBQUEsR0FBT2tFLElBQUEsQ0FBSyxDQUFMLENBQXhCLENBRmE7QUFBQSxjQUdieU4sQ0FBQSxDQUFFRSxPQUFGLENBQVVpbEIsS0FBQSxDQUFNOTJCLElBQU4sQ0FBVixFQUhhO0FBQUEsY0FJYixPQUFPMlIsQ0FBQSxDQUFFRyxPQUpJO0FBQUEsYUFESixDQUFiLENBTHdEO0FBQUEsVUFheERnbUIsR0FBQSxHQUFNLEtBQUtQLGVBQVgsQ0Fid0Q7QUFBQSxVQWN4RCxLQUFLbnpCLENBQUEsR0FBSSxDQUFKLEVBQU95TyxJQUFBLEdBQU9pbEIsR0FBQSxDQUFJanpCLE1BQXZCLEVBQStCVCxDQUFBLEdBQUl5TyxJQUFuQyxFQUF5Q3pPLENBQUEsRUFBekMsRUFBOEM7QUFBQSxZQUM1Q3l6QixNQUFBLEdBQVNDLEdBQUEsQ0FBSTF6QixDQUFKLENBQVQsQ0FENEM7QUFBQSxZQUU1QyxJQUFJeXpCLE1BQUEsQ0FBT3hoQixTQUFQLENBQWlCNmhCLFFBQWpCLENBQUosRUFBZ0M7QUFBQSxjQUM5QkksVUFBQSxDQUFXalMsT0FBWCxDQUFtQixVQUFTbmlCLElBQVQsRUFBZTtBQUFBLGdCQUNoQyxJQUFJNHlCLEtBQUosRUFBVzkyQixJQUFYLENBRGdDO0FBQUEsZ0JBRWhDODJCLEtBQUEsR0FBUTV5QixJQUFBLENBQUssQ0FBTCxDQUFSLEVBQWlCbEUsSUFBQSxHQUFPa0UsSUFBQSxDQUFLLENBQUwsQ0FBeEIsQ0FGZ0M7QUFBQSxnQkFHaEMsT0FBT2t6QixXQUFBLENBQVlOLEtBQVosRUFBbUI5MkIsSUFBbkIsRUFBeUJrVCxJQUF6QixDQUE4QixVQUFTN08sQ0FBVCxFQUFZO0FBQUEsa0JBQy9DLElBQUlzTixDQUFKLENBRCtDO0FBQUEsa0JBRS9DbWxCLEtBQUEsQ0FBTTkyQixJQUFOLElBQWNxRSxDQUFkLENBRitDO0FBQUEsa0JBRy9Dc04sQ0FBQSxHQUFJWCxDQUFBLENBQUVZLEtBQUYsRUFBSixDQUgrQztBQUFBLGtCQUkvQ0QsQ0FBQSxDQUFFRSxPQUFGLENBQVUzTixJQUFWLEVBSitDO0FBQUEsa0JBSy9DLE9BQU95TixDQUx3QztBQUFBLGlCQUExQyxDQUh5QjtBQUFBLGVBQWxDLENBRDhCO0FBQUEsYUFGWTtBQUFBLFdBZFU7QUFBQSxVQThCeERvbEIsU0FBQSxHQUFZLFVBQVNELEtBQVQsRUFBZ0I5MkIsSUFBaEIsRUFBc0I7QUFBQSxZQUNoQyxJQUFJK1UsQ0FBSixFQUFPcWpCLElBQVAsRUFBYW5qQixNQUFiLEVBQXFCbWlCLFdBQXJCLENBRGdDO0FBQUEsWUFFaENuaUIsTUFBQSxHQUFTakUsQ0FBQSxDQUFFO0FBQUEsY0FBQzhsQixLQUFEO0FBQUEsY0FBUTkyQixJQUFSO0FBQUEsYUFBRixDQUFULENBRmdDO0FBQUEsWUFHaEMsS0FBSytVLENBQUEsR0FBSSxDQUFKLEVBQU9xakIsSUFBQSxHQUFPRSxVQUFBLENBQVd6ekIsTUFBOUIsRUFBc0NrUSxDQUFBLEdBQUlxakIsSUFBMUMsRUFBZ0RyakIsQ0FBQSxFQUFoRCxFQUFxRDtBQUFBLGNBQ25EcWlCLFdBQUEsR0FBY2tCLFVBQUEsQ0FBV3ZqQixDQUFYLENBQWQsQ0FEbUQ7QUFBQSxjQUVuREUsTUFBQSxHQUFTQSxNQUFBLENBQU8vQixJQUFQLENBQVlra0IsV0FBWixDQUYwQztBQUFBLGFBSHJCO0FBQUEsWUFPaEMsT0FBT25pQixNQVB5QjtBQUFBLFdBQWxDLENBOUJ3RDtBQUFBLFVBdUN4RGdqQixLQUFBLEdBQVEsS0FBUixDQXZDd0Q7QUFBQSxVQXdDeERJLElBQUEsR0FBTyxLQUFLZixTQUFaLENBeEN3RDtBQUFBLFVBeUN4RCxLQUFLdmlCLENBQUEsR0FBSSxDQUFKLEVBQU9xakIsSUFBQSxHQUFPQyxJQUFBLENBQUt4ekIsTUFBeEIsRUFBZ0NrUSxDQUFBLEdBQUlxakIsSUFBcEMsRUFBMENyakIsQ0FBQSxFQUExQyxFQUErQztBQUFBLFlBQzdDOGlCLE1BQUEsR0FBU1EsSUFBQSxDQUFLdGpCLENBQUwsQ0FBVCxDQUQ2QztBQUFBLFlBRTdDLElBQUk4aUIsTUFBQSxJQUFVLElBQWQsRUFBb0I7QUFBQSxjQUNsQixRQURrQjtBQUFBLGFBRnlCO0FBQUEsWUFLN0MsSUFBSUEsTUFBQSxDQUFPeGhCLFNBQVAsQ0FBaUI2aEIsUUFBakIsQ0FBSixFQUFnQztBQUFBLGNBQzlCMXhCLEdBQUEsR0FBTXF4QixNQUFBLENBQU83dUIsT0FBYixDQUQ4QjtBQUFBLGNBRTlCaXZCLEtBQUEsR0FBUSxJQUFSLENBRjhCO0FBQUEsY0FHOUIsS0FIOEI7QUFBQSxhQUxhO0FBQUEsV0F6Q1M7QUFBQSxVQW9EeEQsSUFBSUEsS0FBSixFQUFXO0FBQUEsWUFDVHp4QixHQUFBLEdBQU0sS0FBS2d4QixjQURGO0FBQUEsV0FwRDZDO0FBQUEsVUF1RHhEVixLQUFBLEdBQVE7QUFBQSxZQUNOOTJCLElBQUEsRUFBTWs0QixRQUFBLENBQVNsNEIsSUFEVDtBQUFBLFlBRU5zSSxLQUFBLEVBQU80dkIsUUFBQSxDQUFTLFNBQVQsQ0FGRDtBQUFBLFlBR054QixXQUFBLEVBQWF3QixRQUFBLENBQVN4QixXQUhoQjtBQUFBLFdBQVIsQ0F2RHdEO0FBQUEsVUE0RHhEeUIsTUFBQSxDQUFPRCxRQUFBLENBQVNsNEIsSUFBaEIsSUFBd0IsSUFBSXU0QixhQUFKLENBQWtCL3hCLEdBQWxCLEVBQXVCc3dCLEtBQXZCLEVBQThCQyxTQUE5QixDQTVEZ0M7QUFBQSxTQUhoQztBQUFBLFFBaUUxQixPQUFPb0IsTUFqRW1CO0FBQUEsT0F6Q3BCO0FBQUEsS0FBVixDO0lBOEdBNUIsZUFBQSxHQUFrQjtBQUFBLE1BQ2hCaUMsR0FBQSxFQUFLLEtBRFc7QUFBQSxNQUVoQkMsTUFBQSxFQUFRLFFBRlE7QUFBQSxNQUdoQm5jLEtBQUEsRUFBTyxPQUhTO0FBQUEsTUFJaEJvYyxVQUFBLEVBQVksYUFKSTtBQUFBLEtBQWxCLEM7SUFPQXBDLFNBQUEsR0FBYSxVQUFTcmtCLFVBQVQsRUFBcUI7QUFBQSxNQUNoQyxJQUFJaEYsR0FBSixDQURnQztBQUFBLE1BR2hDMUQsTUFBQSxDQUFPK3NCLFNBQVAsRUFBa0Jya0IsVUFBbEIsRUFIZ0M7QUFBQSxNQUtoQyxTQUFTcWtCLFNBQVQsR0FBcUI7QUFBQSxRQUNuQixPQUFPQSxTQUFBLENBQVVsbEIsU0FBVixDQUFvQkQsV0FBcEIsQ0FBZ0N6USxLQUFoQyxDQUFzQyxJQUF0QyxFQUE0Q0MsU0FBNUMsQ0FEWTtBQUFBLE9BTFc7QUFBQSxNQVNoQzIxQixTQUFBLENBQVVsQixNQUFWLEdBQW1CbUIsZUFBbkIsQ0FUZ0M7QUFBQSxNQVdoQ0QsU0FBQSxDQUFVbm5CLFNBQVYsQ0FBb0J3cEIsU0FBcEIsR0FBZ0MsZ0VBQWhDLENBWGdDO0FBQUEsTUFhaENyQyxTQUFBLENBQVVubkIsU0FBVixDQUFvQm5FLElBQXBCLEdBQTJCLFlBQVc7QUFBQSxRQUNwQyxPQUFPLEtBQUs0QyxJQUFMLElBQWEsS0FBSytxQixTQURXO0FBQUEsT0FBdEMsQ0FiZ0M7QUFBQSxNQWlCaENyQyxTQUFBLENBQVVubkIsU0FBVixDQUFvQnRQLE1BQXBCLEdBQ0UsQ0FBQW9OLEdBQUEsR0FBTSxFQUFOLEVBQ0FBLEdBQUEsQ0FBSSxLQUFLc3BCLGVBQUEsQ0FBZ0JpQyxHQUF6QixJQUFnQyxVQUFTeDRCLElBQVQsRUFBZXNJLEtBQWYsRUFBc0I7QUFBQSxRQUNwRCxJQUFJdEksSUFBQSxLQUFTLEtBQUs4MkIsS0FBTCxDQUFXOTJCLElBQXhCLEVBQThCO0FBQUEsVUFDNUIsT0FBTzgyQixLQUFBLENBQU14dUIsS0FBTixHQUFjQSxLQURPO0FBQUEsU0FEc0I7QUFBQSxPQUR0RCxFQU1BMkUsR0FBQSxDQUFJLEtBQUtzcEIsZUFBQSxDQUFnQmphLEtBQXpCLElBQWtDLFVBQVN0YyxJQUFULEVBQWV3UyxPQUFmLEVBQXdCO0FBQUEsUUFDeEQsSUFBSXhTLElBQUEsS0FBUyxLQUFLODJCLEtBQUwsQ0FBVzkyQixJQUF4QixFQUE4QjtBQUFBLFVBQzVCLE9BQU8sS0FBSzQ0QixRQUFMLENBQWNwbUIsT0FBZCxDQURxQjtBQUFBLFNBRDBCO0FBQUEsT0FOMUQsRUFXQXZGLEdBQUEsQ0FBSSxLQUFLc3BCLGVBQUEsQ0FBZ0JtQyxVQUF6QixJQUF1QyxVQUFTMTRCLElBQVQsRUFBZTtBQUFBLFFBQ3BELElBQUlBLElBQUEsS0FBUyxLQUFLODJCLEtBQUwsQ0FBVzkyQixJQUF4QixFQUE4QjtBQUFBLFVBQzVCLE9BQU8sS0FBSzY0QixVQUFMLEVBRHFCO0FBQUEsU0FEc0I7QUFBQSxPQVh0RCxFQWdCQTVyQixHQWhCQSxDQURGLENBakJnQztBQUFBLE1BcUNoQ3FwQixTQUFBLENBQVVubkIsU0FBVixDQUFvQjJwQixNQUFwQixHQUE2QjtBQUFBLFFBQzNCQyxNQUFBLEVBQVEsVUFBU250QixLQUFULEVBQWdCO0FBQUEsVUFDdEIsT0FBTzBxQixTQUFBLENBQVUwQyxHQUFWLENBQWNwNEIsT0FBZCxDQUFzQjIxQixlQUFBLENBQWdCa0MsTUFBdEMsRUFBOENuQyxTQUFBLENBQVVRLEtBQVYsQ0FBZ0I5MkIsSUFBOUQsRUFBb0U0TCxLQUFBLENBQU1JLE1BQTFFLENBRGU7QUFBQSxTQURHO0FBQUEsUUFJM0JpdEIsUUFBQSxFQUFVLFlBQVc7QUFBQSxVQUNuQixPQUFPLEtBQUs5UyxLQUFMLEtBQWUsSUFBZixJQUF1QixLQUFLQSxLQUFMLENBQVd0aEIsTUFBWCxHQUFvQixDQUQvQjtBQUFBLFNBSk07QUFBQSxRQU8zQit6QixRQUFBLEVBQVUsVUFBU3BtQixPQUFULEVBQWtCO0FBQUEsVUFDMUIsT0FBTyxLQUFLMlQsS0FBTCxHQUFhM1QsT0FETTtBQUFBLFNBUEQ7QUFBQSxRQVUzQnFtQixVQUFBLEVBQVksWUFBVztBQUFBLFVBQ3JCLE9BQU8sS0FBS0QsUUFBTCxDQUFjLElBQWQsQ0FEYztBQUFBLFNBVkk7QUFBQSxPQUE3QixDQXJDZ0M7QUFBQSxNQW9EaEN0QyxTQUFBLENBQVVubkIsU0FBVixDQUFvQitwQixFQUFwQixHQUF5QixZQUFXO0FBQUEsT0FBcEMsQ0FwRGdDO0FBQUEsTUFzRGhDLE9BQU81QyxTQXREeUI7QUFBQSxLQUF0QixDQXdEVEwsSUF4RFMsQ0FBWixDO0lBMERBNTJCLElBQUEsQ0FBS21ILEdBQUwsQ0FBUyxvQkFBVCxFQUErQixFQUEvQixFQUFtQyxVQUFTcUQsSUFBVCxFQUFlO0FBQUEsTUFDaEQsSUFBSThQLEtBQUosRUFBV3FmLEdBQVgsQ0FEZ0Q7QUFBQSxNQUVoRHJmLEtBQUEsR0FBUTlQLElBQUEsQ0FBSzhQLEtBQWIsQ0FGZ0Q7QUFBQSxNQUdoRCxPQUFPcWYsR0FBQSxHQUFNbnZCLElBQUEsQ0FBS212QixHQUg4QjtBQUFBLEtBQWxELEU7SUFNQTlDLFFBQUEsR0FBWSxVQUFTamtCLFVBQVQsRUFBcUI7QUFBQSxNQUMvQjFJLE1BQUEsQ0FBTzJzQixRQUFQLEVBQWlCamtCLFVBQWpCLEVBRCtCO0FBQUEsTUFHL0IsU0FBU2lrQixRQUFULEdBQW9CO0FBQUEsUUFDbEIsT0FBT0EsUUFBQSxDQUFTOWtCLFNBQVQsQ0FBbUJELFdBQW5CLENBQStCelEsS0FBL0IsQ0FBcUMsSUFBckMsRUFBMkNDLFNBQTNDLENBRFc7QUFBQSxPQUhXO0FBQUEsTUFPL0J1MUIsUUFBQSxDQUFTL21CLFNBQVQsQ0FBbUJncUIsWUFBbkIsR0FBa0MsSUFBbEMsQ0FQK0I7QUFBQSxNQVMvQmpELFFBQUEsQ0FBUy9tQixTQUFULENBQW1CZ3BCLE1BQW5CLEdBQTRCLEVBQTVCLENBVCtCO0FBQUEsTUFXL0JqQyxRQUFBLENBQVMvbUIsU0FBVCxDQUFtQmlxQixRQUFuQixHQUE4QixVQUFTMzVCLEVBQVQsRUFBYTtBQUFBLFFBQ3pDLE9BQU9BLEVBQUEsQ0FBRzZJLEtBRCtCO0FBQUEsT0FBM0MsQ0FYK0I7QUFBQSxNQWUvQjR0QixRQUFBLENBQVMvbUIsU0FBVCxDQUFtQm5FLElBQW5CLEdBQTBCLFlBQVc7QUFBQSxRQUNuQyxJQUFJLEtBQUttdUIsWUFBTCxJQUFxQixJQUF6QixFQUErQjtBQUFBLFVBQzdCLE9BQU8sS0FBS2hCLE1BQUwsR0FBY2tCLE1BQUEsQ0FBTzlXLE1BQVAsQ0FBYyxLQUFLNFcsWUFBbkIsQ0FEUTtBQUFBLFNBREk7QUFBQSxPQUFyQyxDQWYrQjtBQUFBLE1BcUIvQmpELFFBQUEsQ0FBUy9tQixTQUFULENBQW1CdFAsTUFBbkIsR0FBNEIsWUFBVztBQUFBLFFBQ3JDLElBQUlvTixHQUFKLENBRHFDO0FBQUEsUUFFckMsT0FDRUEsR0FBQSxHQUFNLEVBQU4sRUFDQUEsR0FBQSxDQUFJLEtBQUtzcEIsZUFBQSxDQUFnQmtDLE1BQXpCLElBQW1DLFVBQVN6NEIsSUFBVCxFQUFlZ00sTUFBZixFQUF1QjtBQUFBLFVBQ3hELElBQUkyTixLQUFKLENBRHdEO0FBQUEsVUFFeERBLEtBQUEsR0FBUSxLQUFLd2UsTUFBTCxDQUFZbjRCLElBQVosQ0FBUixDQUZ3RDtBQUFBLFVBR3hELE9BQU8yWixLQUFBLENBQU1vZCxTQUFOLEdBQWtCNU0sSUFBbEIsQ0FBd0IsVUFBU3pYLEtBQVQsRUFBZ0I7QUFBQSxZQUM3QyxPQUFPLFlBQVc7QUFBQSxjQUNoQixPQUFPQSxLQUFBLENBQU1zbUIsR0FBTixDQUFVcDRCLE9BQVYsQ0FBa0IyMUIsZUFBQSxDQUFnQmlDLEdBQWhCLENBQW9CeDRCLElBQXBCLEVBQTBCMFMsS0FBQSxDQUFNb2tCLEtBQU4sQ0FBWTkyQixJQUFaLENBQTFCLENBQWxCLENBRFM7QUFBQSxhQUQyQjtBQUFBLFdBQWpCLENBSTNCLElBSjJCLENBQXZCLEVBSUksVUFBUzBTLEtBQVQsRUFBZ0I7QUFBQSxZQUN6QixPQUFPLFVBQVNtakIsR0FBVCxFQUFjO0FBQUEsY0FDbkIsT0FBT25qQixLQUFBLENBQU1zbUIsR0FBTixDQUFVcDRCLE9BQVYsQ0FBa0IyMUIsZUFBQSxDQUFnQmphLEtBQWhCLENBQXNCdVosR0FBdEIsQ0FBbEIsQ0FEWTtBQUFBLGFBREk7QUFBQSxXQUFqQixDQUlQLElBSk8sQ0FKSCxDQUhpRDtBQUFBLFNBRDFELEVBY0E1b0IsR0FqQm1DO0FBQUEsT0FBdkMsQ0FyQitCO0FBQUEsTUEwQy9CaXBCLFFBQUEsQ0FBUy9tQixTQUFULENBQW1CK3BCLEVBQW5CLEdBQXdCLFlBQVc7QUFBQSxRQUNqQyxPQUFPLEtBQUtJLElBQUwsQ0FBVUMsYUFBVixDQUF3Qjc0QixLQUF4QixDQUE4QixJQUE5QixDQUQwQjtBQUFBLE9BQW5DLENBMUMrQjtBQUFBLE1BOEMvQncxQixRQUFBLENBQVMvbUIsU0FBVCxDQUFtQm9xQixhQUFuQixHQUFtQyxZQUFXO0FBQUEsUUFDNUMsT0FBTyxLQUFLcEIsTUFBTCxHQUFjLEtBQUttQixJQUFMLENBQVVuQixNQURhO0FBQUEsT0FBOUMsQ0E5QytCO0FBQUEsTUFrRC9CLE9BQU9qQyxRQWxEd0I7QUFBQSxLQUF0QixDQW9EUkQsSUFwRFEsQ0FBWCxDO0lBc0RBMWxCLE1BQUEsQ0FBT0QsT0FBUCxHQUFpQjtBQUFBLE1BQ2ZtbUIsT0FBQSxFQUFTQSxPQURNO0FBQUEsTUFFZlAsUUFBQSxFQUFVQSxRQUZLO0FBQUEsTUFHZkksU0FBQSxFQUFXQSxTQUhJO0FBQUEsTUFJZkQsV0FBQSxFQUFhQSxXQUpFO0FBQUEsSzs7OztJQ2hUakIsSUFBSUosSUFBSixFQUFVOXhCLENBQVYsRUFBYTlFLElBQWIsRUFBbUIrdkIsS0FBbkIsQztJQUVBL3ZCLElBQUEsR0FBT3NSLE9BQUEsQ0FBUSxXQUFSLENBQVAsQztJQUVBeE0sQ0FBQSxHQUFJd00sT0FBQSxDQUFRLHVCQUFSLENBQUosQztJQUVBeWUsS0FBQSxHQUFRemUsT0FBQSxDQUFRLFNBQVIsQ0FBUixDO0lBRUFzbEIsSUFBQSxHQUFRLFlBQVc7QUFBQSxNQUNqQkEsSUFBQSxDQUFLOW1CLFNBQUwsQ0FBZW5QLElBQWYsR0FBc0IsRUFBdEIsQ0FEaUI7QUFBQSxNQUdqQmkyQixJQUFBLENBQUs5bUIsU0FBTCxDQUFldkIsSUFBZixHQUFzQixFQUF0QixDQUhpQjtBQUFBLE1BS2pCcW9CLElBQUEsQ0FBSzltQixTQUFMLENBQWVNLEdBQWYsR0FBcUIsRUFBckIsQ0FMaUI7QUFBQSxNQU9qQndtQixJQUFBLENBQUs5bUIsU0FBTCxDQUFlL0UsS0FBZixHQUF1QixFQUF2QixDQVBpQjtBQUFBLE1BU2pCNnJCLElBQUEsQ0FBSzltQixTQUFMLENBQWV0UCxNQUFmLEdBQXdCLElBQXhCLENBVGlCO0FBQUEsTUFXakJvMkIsSUFBQSxDQUFLOW1CLFNBQUwsQ0FBZTJwQixNQUFmLEdBQXdCLElBQXhCLENBWGlCO0FBQUEsTUFhakI3QyxJQUFBLENBQUs5bUIsU0FBTCxDQUFlK3BCLEVBQWYsR0FBb0IsWUFBVztBQUFBLE9BQS9CLENBYmlCO0FBQUEsTUFlakIsU0FBU2pELElBQVQsQ0FBY2xrQixPQUFkLEVBQXVCO0FBQUEsUUFDckIsSUFBSXVuQixJQUFKLENBRHFCO0FBQUEsUUFFckIsS0FBS3ZuQixPQUFMLEdBQWVBLE9BQWYsQ0FGcUI7QUFBQSxRQUdyQjVOLENBQUEsQ0FBRW9GLE1BQUYsQ0FBUyxJQUFULEVBQWUsS0FBS3dJLE9BQXBCLEVBSHFCO0FBQUEsUUFJckJ1bkIsSUFBQSxHQUFPLElBQVAsQ0FKcUI7QUFBQSxRQUtyQixLQUFLdHVCLElBQUwsR0FMcUI7QUFBQSxRQU1yQjNMLElBQUEsQ0FBS21ILEdBQUwsQ0FBUyxLQUFLeEcsSUFBZCxFQUFvQixLQUFLNE4sSUFBekIsRUFBK0IsS0FBSzZCLEdBQXBDLEVBQXlDLEtBQUtyRixLQUE5QyxFQUFxRCxVQUFTUCxJQUFULEVBQWU7QUFBQSxVQUNsRSxJQUFJNkIsT0FBSixFQUFhMUwsSUFBYixFQUFtQmc1QixHQUFuQixFQUF3QmxCLEdBQXhCLENBRGtFO0FBQUEsVUFFbEUsS0FBS3dCLElBQUwsR0FBWUEsSUFBWixDQUZrRTtBQUFBLFVBR2xFQSxJQUFBLENBQUszcUIsR0FBTCxHQUFXLElBQVgsQ0FIa0U7QUFBQSxVQUlsRSxLQUFLbW9CLEtBQUwsR0FBYWp0QixJQUFBLENBQUtpdEIsS0FBbEIsQ0FKa0U7QUFBQSxVQUtsRSxJQUFJLEtBQUtBLEtBQUwsSUFBYyxJQUFsQixFQUF3QjtBQUFBLFlBQ3RCLEtBQUtBLEtBQUwsR0FBYSxFQURTO0FBQUEsV0FMMEM7QUFBQSxVQVFsRWtDLEdBQUEsR0FBTSxLQUFLQSxHQUFMLEdBQVdudkIsSUFBQSxDQUFLbXZCLEdBQXRCLENBUmtFO0FBQUEsVUFTbEUsSUFBSSxLQUFLQSxHQUFMLElBQVksSUFBaEIsRUFBc0I7QUFBQSxZQUNwQkEsR0FBQSxHQUFNLEtBQUtBLEdBQUwsR0FBVyxFQUFqQixDQURvQjtBQUFBLFlBRXBCNUosS0FBQSxDQUFNQyxJQUFOLENBQVc3dkIsVUFBWCxDQUFzQnc1QixHQUF0QixDQUZvQjtBQUFBLFdBVDRDO0FBQUEsVUFhbEUsSUFBSU0sSUFBQSxDQUFLejVCLE1BQVQsRUFBaUI7QUFBQSxZQUNmaTRCLEdBQUEsR0FBTXdCLElBQUEsQ0FBS3o1QixNQUFYLENBRGU7QUFBQSxZQUVmLEtBQUtHLElBQUwsSUFBYTgzQixHQUFiLEVBQWtCO0FBQUEsY0FDaEJwc0IsT0FBQSxHQUFVb3NCLEdBQUEsQ0FBSTkzQixJQUFKLENBQVYsQ0FEZ0I7QUFBQSxjQUVoQmc1QixHQUFBLENBQUlwNUIsRUFBSixDQUFPSSxJQUFQLEVBQWMsVUFBUzBTLEtBQVQsRUFBZ0I7QUFBQSxnQkFDNUIsT0FBTyxZQUFXO0FBQUEsa0JBQ2hCLE9BQU9oSCxPQUFBLENBQVFoTCxLQUFSLENBQWNnUyxLQUFkLEVBQXFCL1IsU0FBckIsQ0FEUztBQUFBLGlCQURVO0FBQUEsZUFBakIsQ0FJVixJQUpVLENBQWIsQ0FGZ0I7QUFBQSxhQUZIO0FBQUEsV0FiaUQ7QUFBQSxVQXdCbEUsSUFBSTI0QixJQUFBLENBQUtSLE1BQVQsRUFBaUI7QUFBQSxZQUNmMzBCLENBQUEsQ0FBRW9GLE1BQUYsQ0FBUyxJQUFULEVBQWUrdkIsSUFBQSxDQUFLUixNQUFwQixDQURlO0FBQUEsV0F4QmlEO0FBQUEsVUEyQmxFLE9BQU8sS0FBS1EsSUFBTCxDQUFVSixFQUFWLENBQWFuNEIsSUFBYixDQUFrQixJQUFsQixFQUF3QjhJLElBQXhCLENBM0IyRDtBQUFBLFNBQXBFLENBTnFCO0FBQUEsT0FmTjtBQUFBLE1Bb0RqQm9zQixJQUFBLENBQUs5bUIsU0FBTCxDQUFlbkUsSUFBZixHQUFzQixZQUFXO0FBQUEsT0FBakMsQ0FwRGlCO0FBQUEsTUFzRGpCLE9BQU9pckIsSUF0RFU7QUFBQSxLQUFaLEVBQVAsQztJQTBEQTFsQixNQUFBLENBQU9ELE9BQVAsR0FBaUIybEIsSTs7OztJQ2xFakIsSUFBQTUyQixJQUFBLEM7SUFBQUEsSUFBQSxHQUFPc1IsT0FBQSxDQUFRLFdBQVIsQ0FBUCxDO0lBRUFKLE1BQUEsQ0FBT0QsTztNQUNMNU0sSUFBQSxFQUFNaU4sT0FBQSxDQUFRLFFBQVIsQztNQUNOeWUsS0FBQSxFQUFPemUsT0FBQSxDQUFRLFNBQVIsQztNQUNQMm9CLElBQUEsRUFBTTNvQixPQUFBLENBQVEsUUFBUixDO01BQ05qTyxLQUFBLEVBQU87QUFBQSxRLE9BQ0xyRCxJQUFBLENBQUsySSxLQUFMLENBQVcsR0FBWCxDQURLO0FBQUEsTzs7UUFHK0IsT0FBQTVJLE1BQUEsb0JBQUFBLE1BQUEsUztNQUF4Q0EsTUFBQSxDQUFPbzZCLFlBQVAsR0FBc0JqcEIsTUFBQSxDQUFPRCxPIiwic291cmNlUm9vdCI6Ii9zcmMifQ==