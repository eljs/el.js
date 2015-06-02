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
        this.options = options;
        this.policy = this.options.policy || Policy.Once;
        delete this.options.policy;
        _.extend(this, this.options);
        if (this.api == null) {
          this.api = config.api
        }
        this.start()
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yaW90L3Jpb3QuanMiLCJkYXRhL2luZGV4LmNvZmZlZSIsImRhdGEvcG9saWN5LmNvZmZlZSIsIm5vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiLCJub2RlX21vZHVsZXMvcS9xLmpzIiwiZGF0YS9hcGkuY29mZmVlIiwiY29uZmlnLmNvZmZlZSIsInV0aWxzL2luZGV4LmNvZmZlZSIsInV0aWxzL3NoaW0uY29mZmVlIiwibm9kZV9tb2R1bGVzL3EteGhyL3EteGhyLmpzIiwibm9kZV9tb2R1bGVzL3JhZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yYWYvbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwidXRpbHMvbG9nLmNvZmZlZSIsInV0aWxzL21lZGlhdG9yLmNvZmZlZSIsImRhdGEvc291cmNlLmNvZmZlZSIsInZpZXcvaW5kZXguY29mZmVlIiwidmlldy9mb3JtLmNvZmZlZSIsInZpZXcvdmlldy5jb2ZmZWUiLCJjcm93ZGNvbnRyb2wuY29mZmVlIl0sIm5hbWVzIjpbIndpbmRvdyIsInJpb3QiLCJ2ZXJzaW9uIiwic2V0dGluZ3MiLCJvYnNlcnZhYmxlIiwiZWwiLCJjYWxsYmFja3MiLCJfaWQiLCJvbiIsImV2ZW50cyIsImZuIiwicmVwbGFjZSIsIm5hbWUiLCJwb3MiLCJwdXNoIiwidHlwZWQiLCJvZmYiLCJhcnIiLCJpIiwiY2IiLCJzcGxpY2UiLCJvbmUiLCJhcHBseSIsImFyZ3VtZW50cyIsInRyaWdnZXIiLCJhcmdzIiwic2xpY2UiLCJjYWxsIiwiZm5zIiwiYnVzeSIsImNvbmNhdCIsImFsbCIsIm1peGluIiwicmVnaXN0ZXJlZE1peGlucyIsImV2dCIsImxvYyIsImxvY2F0aW9uIiwid2luIiwic3RhcnRlZCIsImN1cnJlbnQiLCJoYXNoIiwiaHJlZiIsInNwbGl0IiwicGFyc2VyIiwicGF0aCIsImVtaXQiLCJ0eXBlIiwiciIsInJvdXRlIiwiYXJnIiwiZXhlYyIsInN0b3AiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJzdGFydCIsImFkZEV2ZW50TGlzdGVuZXIiLCJhdHRhY2hFdmVudCIsImJyYWNrZXRzIiwib3JpZyIsInMiLCJiIiwieCIsInRlc3QiLCJSZWdFeHAiLCJzb3VyY2UiLCJnbG9iYWwiLCJ0bXBsIiwiY2FjaGUiLCJyZVZhcnMiLCJzdHIiLCJkYXRhIiwicCIsImV4dHJhY3QiLCJGdW5jdGlvbiIsImV4cHIiLCJtYXAiLCJqb2luIiwibiIsInBhaXIiLCJfIiwiayIsInYiLCJ3cmFwIiwibm9udWxsIiwidHJpbSIsInN1YnN0cmluZ3MiLCJwYXJ0cyIsInN1YiIsImluZGV4T2YiLCJsZW5ndGgiLCJvcGVuIiwiY2xvc2UiLCJsZXZlbCIsIm1hdGNoZXMiLCJyZSIsImxvb3BLZXlzIiwicmV0IiwidmFsIiwiZWxzIiwia2V5IiwibWtpdGVtIiwiaXRlbSIsIl9lYWNoIiwiZG9tIiwicGFyZW50IiwicmVtQXR0ciIsInRlbXBsYXRlIiwib3V0ZXJIVE1MIiwicHJldiIsInByZXZpb3VzU2libGluZyIsInJvb3QiLCJwYXJlbnROb2RlIiwicmVuZGVyZWQiLCJ0YWdzIiwiY2hlY2tzdW0iLCJhZGQiLCJ0YWciLCJyZW1vdmVDaGlsZCIsInN0dWIiLCJpdGVtcyIsIkFycmF5IiwiaXNBcnJheSIsInRlc3RzdW0iLCJKU09OIiwic3RyaW5naWZ5IiwiZWFjaCIsInVubW91bnQiLCJPYmplY3QiLCJrZXlzIiwibmV3SXRlbXMiLCJhcnJGaW5kRXF1YWxzIiwib2xkSXRlbXMiLCJwcmV2QmFzZSIsImNoaWxkTm9kZXMiLCJvbGRQb3MiLCJsYXN0SW5kZXhPZiIsIm5vZGVzIiwiX2l0ZW0iLCJUYWciLCJiZWZvcmUiLCJtb3VudCIsInVwZGF0ZSIsImluc2VydEJlZm9yZSIsIndhbGsiLCJhdHRyaWJ1dGVzIiwiYXR0ciIsInZhbHVlIiwicGFyc2VOYW1lZEVsZW1lbnRzIiwiY2hpbGRUYWdzIiwibm9kZVR5cGUiLCJpc0xvb3AiLCJnZXRBdHRyaWJ1dGUiLCJjaGlsZCIsImdldFRhZyIsImlubmVySFRNTCIsIm5hbWVkVGFnIiwidGFnTmFtZSIsInB0YWciLCJjYWNoZWRUYWciLCJwYXJzZUV4cHJlc3Npb25zIiwiZXhwcmVzc2lvbnMiLCJhZGRFeHByIiwiZXh0cmEiLCJleHRlbmQiLCJub2RlVmFsdWUiLCJib29sIiwiaW1wbCIsImNvbmYiLCJzZWxmIiwib3B0cyIsImluaGVyaXQiLCJta2RvbSIsInRvTG93ZXJDYXNlIiwibG9vcERvbSIsIlRBR19BVFRSSUJVVEVTIiwiX3RhZyIsImF0dHJzIiwibWF0Y2giLCJhIiwia3YiLCJzZXRBdHRyaWJ1dGUiLCJmYXN0QWJzIiwiRGF0ZSIsImdldFRpbWUiLCJNYXRoIiwicmFuZG9tIiwicmVwbGFjZVlpZWxkIiwidXBkYXRlT3B0cyIsImluaXQiLCJtaXgiLCJiaW5kIiwidG9nZ2xlIiwiZmlyc3RDaGlsZCIsImFwcGVuZENoaWxkIiwia2VlcFJvb3RUYWciLCJ1bmRlZmluZWQiLCJpc01vdW50Iiwic2V0RXZlbnRIYW5kbGVyIiwiaGFuZGxlciIsImUiLCJldmVudCIsIndoaWNoIiwiY2hhckNvZGUiLCJrZXlDb2RlIiwidGFyZ2V0Iiwic3JjRWxlbWVudCIsImN1cnJlbnRUYXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsInJldHVyblZhbHVlIiwicHJldmVudFVwZGF0ZSIsImluc2VydFRvIiwibm9kZSIsImF0dHJOYW1lIiwidG9TdHJpbmciLCJkb2N1bWVudCIsImNyZWF0ZVRleHROb2RlIiwic3R5bGUiLCJkaXNwbGF5IiwibGVuIiwicmVtb3ZlQXR0cmlidXRlIiwibnIiLCJvYmoiLCJmcm9tIiwiZnJvbTIiLCJjaGVja0lFIiwidWEiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJtc2llIiwicGFyc2VJbnQiLCJzdWJzdHJpbmciLCJvcHRpb25Jbm5lckhUTUwiLCJodG1sIiwib3B0IiwiY3JlYXRlRWxlbWVudCIsInZhbFJlZ3giLCJzZWxSZWd4IiwidmFsdWVzTWF0Y2giLCJzZWxlY3RlZE1hdGNoIiwidGJvZHlJbm5lckhUTUwiLCJkaXYiLCJyb290VGFnIiwibWtFbCIsImllVmVyc2lvbiIsIm5leHRTaWJsaW5nIiwiJCQiLCJzZWxlY3RvciIsImN0eCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJhcnJEaWZmIiwiYXJyMSIsImFycjIiLCJmaWx0ZXIiLCJfZWwiLCJDaGlsZCIsInByb3RvdHlwZSIsImxvb3BzIiwidmlydHVhbERvbSIsInRhZ0ltcGwiLCJzdHlsZU5vZGUiLCJpbmplY3RTdHlsZSIsImNzcyIsImhlYWQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsIl9yZW5kZXJlZCIsImJvZHkiLCJtb3VudFRvIiwic2VsY3RBbGxUYWdzIiwibGlzdCIsInQiLCJhbGxUYWdzIiwibm9kZUxpc3QiLCJ1dGlsIiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsInBvbGljeSIsInJlcXVpcmUiLCJBcGkiLCJTb3VyY2UiLCJQb2xpY3kiLCJUYWJ1bGFyUmVzdGZ1bFN0cmVhbWluZ1BvbGljeSIsIlEiLCJoYXNQcm9wIiwiY3RvciIsImNvbnN0cnVjdG9yIiwiX19zdXBlcl9fIiwiaGFzT3duUHJvcGVydHkiLCJpbnRlcnZhbFRpbWUiLCJJbmZpbml0eSIsInVubG9hZCIsImxvYWQiLCJyZXMiLCJkIiwiZGVmZXIiLCJyZXNvbHZlIiwicHJvbWlzZSIsIm9wdGlvbnMiLCJPbmNlIiwic3VwZXJDbGFzcyIsImZhaWwiLCJmYWlsZWQiLCJpZCIsImoiLCJ0b2dvIiwicmVqZWN0IiwibWVzc2FnZSIsImlzT2JqZWN0IiwiX3RoaXMiLCJzdWNjZXNzIiwiZGF0dW0iLCJsZW4xIiwicGFydGlhbERhdGEiLCJub3RpZnkiLCJhcGkiLCJnZXQiLCJ0aGVuIiwicHJldmlvdXNVbmRlcnNjb3JlIiwiQXJyYXlQcm90byIsIk9ialByb3RvIiwiRnVuY1Byb3RvIiwibmF0aXZlSXNBcnJheSIsIm5hdGl2ZUtleXMiLCJuYXRpdmVCaW5kIiwibmF0aXZlQ3JlYXRlIiwiY3JlYXRlIiwiQ3RvciIsIl93cmFwcGVkIiwiVkVSU0lPTiIsIm9wdGltaXplQ2IiLCJmdW5jIiwiY29udGV4dCIsImFyZ0NvdW50Iiwib3RoZXIiLCJpbmRleCIsImNvbGxlY3Rpb24iLCJhY2N1bXVsYXRvciIsImlkZW50aXR5IiwiaXNGdW5jdGlvbiIsIm1hdGNoZXIiLCJwcm9wZXJ0eSIsIml0ZXJhdGVlIiwiY3JlYXRlQXNzaWduZXIiLCJrZXlzRnVuYyIsInVuZGVmaW5lZE9ubHkiLCJsIiwiYmFzZUNyZWF0ZSIsInJlc3VsdCIsIk1BWF9BUlJBWV9JTkRFWCIsInBvdyIsImdldExlbmd0aCIsImlzQXJyYXlMaWtlIiwiZm9yRWFjaCIsImNvbGxlY3QiLCJyZXN1bHRzIiwiY3VycmVudEtleSIsImNyZWF0ZVJlZHVjZSIsImRpciIsIml0ZXJhdG9yIiwibWVtbyIsInJlZHVjZSIsImZvbGRsIiwiaW5qZWN0IiwicmVkdWNlUmlnaHQiLCJmb2xkciIsImZpbmQiLCJkZXRlY3QiLCJwcmVkaWNhdGUiLCJmaW5kSW5kZXgiLCJmaW5kS2V5Iiwic2VsZWN0IiwibmVnYXRlIiwiZXZlcnkiLCJzb21lIiwiYW55IiwiY29udGFpbnMiLCJpbmNsdWRlcyIsImluY2x1ZGUiLCJmcm9tSW5kZXgiLCJndWFyZCIsInZhbHVlcyIsImludm9rZSIsIm1ldGhvZCIsImlzRnVuYyIsInBsdWNrIiwid2hlcmUiLCJmaW5kV2hlcmUiLCJtYXgiLCJsYXN0Q29tcHV0ZWQiLCJjb21wdXRlZCIsIm1pbiIsInNodWZmbGUiLCJzZXQiLCJzaHVmZmxlZCIsInJhbmQiLCJzYW1wbGUiLCJzb3J0QnkiLCJjcml0ZXJpYSIsInNvcnQiLCJsZWZ0IiwicmlnaHQiLCJncm91cCIsImJlaGF2aW9yIiwiZ3JvdXBCeSIsImhhcyIsImluZGV4QnkiLCJjb3VudEJ5IiwidG9BcnJheSIsInNpemUiLCJwYXJ0aXRpb24iLCJwYXNzIiwiZmlyc3QiLCJ0YWtlIiwiYXJyYXkiLCJpbml0aWFsIiwibGFzdCIsInJlc3QiLCJ0YWlsIiwiZHJvcCIsImNvbXBhY3QiLCJmbGF0dGVuIiwiaW5wdXQiLCJzaGFsbG93Iiwic3RyaWN0Iiwic3RhcnRJbmRleCIsIm91dHB1dCIsImlkeCIsImlzQXJndW1lbnRzIiwid2l0aG91dCIsImRpZmZlcmVuY2UiLCJ1bmlxIiwidW5pcXVlIiwiaXNTb3J0ZWQiLCJpc0Jvb2xlYW4iLCJzZWVuIiwidW5pb24iLCJpbnRlcnNlY3Rpb24iLCJhcmdzTGVuZ3RoIiwiemlwIiwidW56aXAiLCJvYmplY3QiLCJjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlciIsImZpbmRMYXN0SW5kZXgiLCJzb3J0ZWRJbmRleCIsImxvdyIsImhpZ2giLCJtaWQiLCJmbG9vciIsImNyZWF0ZUluZGV4RmluZGVyIiwicHJlZGljYXRlRmluZCIsImlzTmFOIiwicmFuZ2UiLCJzdGVwIiwiY2VpbCIsImV4ZWN1dGVCb3VuZCIsInNvdXJjZUZ1bmMiLCJib3VuZEZ1bmMiLCJjYWxsaW5nQ29udGV4dCIsIlR5cGVFcnJvciIsImJvdW5kIiwicGFydGlhbCIsImJvdW5kQXJncyIsInBvc2l0aW9uIiwiYmluZEFsbCIsIkVycm9yIiwibWVtb2l6ZSIsImhhc2hlciIsImFkZHJlc3MiLCJkZWxheSIsIndhaXQiLCJzZXRUaW1lb3V0IiwidGhyb3R0bGUiLCJ0aW1lb3V0IiwicHJldmlvdXMiLCJsYXRlciIsImxlYWRpbmciLCJub3ciLCJyZW1haW5pbmciLCJjbGVhclRpbWVvdXQiLCJ0cmFpbGluZyIsImRlYm91bmNlIiwiaW1tZWRpYXRlIiwidGltZXN0YW1wIiwiY2FsbE5vdyIsIndyYXBwZXIiLCJjb21wb3NlIiwiYWZ0ZXIiLCJ0aW1lcyIsIm9uY2UiLCJoYXNFbnVtQnVnIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJub25FbnVtZXJhYmxlUHJvcHMiLCJjb2xsZWN0Tm9uRW51bVByb3BzIiwibm9uRW51bUlkeCIsInByb3RvIiwicHJvcCIsImFsbEtleXMiLCJtYXBPYmplY3QiLCJwYWlycyIsImludmVydCIsImZ1bmN0aW9ucyIsIm1ldGhvZHMiLCJuYW1lcyIsImV4dGVuZE93biIsImFzc2lnbiIsInBpY2siLCJvaXRlcmF0ZWUiLCJvbWl0IiwiU3RyaW5nIiwiZGVmYXVsdHMiLCJwcm9wcyIsImNsb25lIiwidGFwIiwiaW50ZXJjZXB0b3IiLCJpc01hdGNoIiwiZXEiLCJhU3RhY2siLCJiU3RhY2siLCJjbGFzc05hbWUiLCJhcmVBcnJheXMiLCJhQ3RvciIsImJDdG9yIiwicG9wIiwiaXNFcXVhbCIsImlzRW1wdHkiLCJpc1N0cmluZyIsImlzRWxlbWVudCIsIkludDhBcnJheSIsImlzRmluaXRlIiwicGFyc2VGbG9hdCIsImlzTnVtYmVyIiwiaXNOdWxsIiwiaXNVbmRlZmluZWQiLCJub0NvbmZsaWN0IiwiY29uc3RhbnQiLCJub29wIiwicHJvcGVydHlPZiIsImFjY3VtIiwiZXNjYXBlTWFwIiwidW5lc2NhcGVNYXAiLCJjcmVhdGVFc2NhcGVyIiwiZXNjYXBlciIsInRlc3RSZWdleHAiLCJyZXBsYWNlUmVnZXhwIiwic3RyaW5nIiwiZXNjYXBlIiwidW5lc2NhcGUiLCJmYWxsYmFjayIsImlkQ291bnRlciIsInVuaXF1ZUlkIiwicHJlZml4IiwidGVtcGxhdGVTZXR0aW5ncyIsImV2YWx1YXRlIiwiaW50ZXJwb2xhdGUiLCJub01hdGNoIiwiZXNjYXBlcyIsImVzY2FwZUNoYXIiLCJ0ZXh0Iiwib2xkU2V0dGluZ3MiLCJvZmZzZXQiLCJ2YXJpYWJsZSIsInJlbmRlciIsImFyZ3VtZW50IiwiY2hhaW4iLCJpbnN0YW5jZSIsIl9jaGFpbiIsInZhbHVlT2YiLCJ0b0pTT04iLCJkZWZpbml0aW9uIiwiYm9vdHN0cmFwIiwic2VzIiwib2siLCJtYWtlUSIsInByZXZpb3VzUSIsImhhc1N0YWNrcyIsInN0YWNrIiwicVN0YXJ0aW5nTGluZSIsImNhcHR1cmVMaW5lIiwicUZpbGVOYW1lIiwibmV4dFRpY2siLCJ0YXNrIiwibmV4dCIsImZsdXNoaW5nIiwicmVxdWVzdFRpY2siLCJpc05vZGVKUyIsImxhdGVyUXVldWUiLCJmbHVzaCIsImRvbWFpbiIsImVudGVyIiwicnVuU2luZ2xlIiwiZXhpdCIsInByb2Nlc3MiLCJzZXRJbW1lZGlhdGUiLCJNZXNzYWdlQ2hhbm5lbCIsImNoYW5uZWwiLCJwb3J0MSIsIm9ubWVzc2FnZSIsInJlcXVlc3RQb3J0VGljayIsInBvcnQyIiwicG9zdE1lc3NhZ2UiLCJydW5BZnRlciIsInVuY3VycnlUaGlzIiwiZiIsImFycmF5X3NsaWNlIiwiYXJyYXlfcmVkdWNlIiwiY2FsbGJhY2siLCJiYXNpcyIsImFycmF5X2luZGV4T2YiLCJhcnJheV9tYXAiLCJ0aGlzcCIsIm9iamVjdF9jcmVhdGUiLCJUeXBlIiwib2JqZWN0X2hhc093blByb3BlcnR5Iiwib2JqZWN0X2tleXMiLCJvYmplY3RfdG9TdHJpbmciLCJpc1N0b3BJdGVyYXRpb24iLCJleGNlcHRpb24iLCJRUmV0dXJuVmFsdWUiLCJSZXR1cm5WYWx1ZSIsIlNUQUNLX0pVTVBfU0VQQVJBVE9SIiwibWFrZVN0YWNrVHJhY2VMb25nIiwiZXJyb3IiLCJzdGFja3MiLCJ1bnNoaWZ0IiwiY29uY2F0ZWRTdGFja3MiLCJmaWx0ZXJTdGFja1N0cmluZyIsInN0YWNrU3RyaW5nIiwibGluZXMiLCJkZXNpcmVkTGluZXMiLCJsaW5lIiwiaXNJbnRlcm5hbEZyYW1lIiwiaXNOb2RlRnJhbWUiLCJzdGFja0xpbmUiLCJnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIiLCJhdHRlbXB0MSIsIk51bWJlciIsImF0dGVtcHQyIiwiYXR0ZW1wdDMiLCJmaWxlTmFtZUFuZExpbmVOdW1iZXIiLCJmaWxlTmFtZSIsImxpbmVOdW1iZXIiLCJxRW5kaW5nTGluZSIsImZpcnN0TGluZSIsImRlcHJlY2F0ZSIsImFsdGVybmF0aXZlIiwiY29uc29sZSIsIndhcm4iLCJQcm9taXNlIiwiaXNQcm9taXNlQWxpa2UiLCJjb2VyY2UiLCJmdWxmaWxsIiwibG9uZ1N0YWNrU3VwcG9ydCIsImVudiIsIlFfREVCVUciLCJtZXNzYWdlcyIsInByb2dyZXNzTGlzdGVuZXJzIiwicmVzb2x2ZWRQcm9taXNlIiwiZGVmZXJyZWQiLCJwcm9taXNlRGlzcGF0Y2giLCJvcCIsIm9wZXJhbmRzIiwibmVhcmVyVmFsdWUiLCJuZWFyZXIiLCJpc1Byb21pc2UiLCJpbnNwZWN0Iiwic3RhdGUiLCJiZWNvbWUiLCJuZXdQcm9taXNlIiwicmVhc29uIiwicHJvZ3Jlc3MiLCJwcm9ncmVzc0xpc3RlbmVyIiwibWFrZU5vZGVSZXNvbHZlciIsInJlc29sdmVyIiwicmFjZSIsInBhc3NCeUNvcHkiLCJ5IiwidGhhdCIsInNwcmVhZCIsImFuc3dlclBzIiwibWFrZVByb21pc2UiLCJkZXNjcmlwdG9yIiwiaW5zcGVjdGVkIiwiZnVsZmlsbGVkIiwicmVqZWN0ZWQiLCJwcm9ncmVzc2VkIiwiZG9uZSIsIl9mdWxmaWxsZWQiLCJfcmVqZWN0ZWQiLCJuZXdFeGNlcHRpb24iLCJfcHJvZ3Jlc3NlZCIsIm5ld1ZhbHVlIiwidGhyZXciLCJvbmVycm9yIiwiZmNhbGwiLCJ0aGVuUmVzb2x2ZSIsIndoZW4iLCJ0aGVuUmVqZWN0IiwiaXNQZW5kaW5nIiwiaXNGdWxmaWxsZWQiLCJpc1JlamVjdGVkIiwidW5oYW5kbGVkUmVhc29ucyIsInVuaGFuZGxlZFJlamVjdGlvbnMiLCJyZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMiLCJ0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMiLCJyZXNldFVuaGFuZGxlZFJlamVjdGlvbnMiLCJ0cmFja1JlamVjdGlvbiIsInVudHJhY2tSZWplY3Rpb24iLCJhdCIsImF0UmVwb3J0IiwiZ2V0VW5oYW5kbGVkUmVhc29ucyIsInN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyIsInJlamVjdGlvbiIsInJocyIsIm1hc3RlciIsImRpc3BhdGNoIiwiYXN5bmMiLCJtYWtlR2VuZXJhdG9yIiwiY29udGludWVyIiwidmVyYiIsIlN0b3BJdGVyYXRpb24iLCJnZW5lcmF0b3IiLCJlcnJiYWNrIiwic3Bhd24iLCJfcmV0dXJuIiwicHJvbWlzZWQiLCJkZWwiLCJtYXBwbHkiLCJwb3N0Iiwic2VuZCIsIm1jYWxsIiwiZmFwcGx5IiwiZmJpbmQiLCJmYm91bmQiLCJwcm9taXNlcyIsInBlbmRpbmdDb3VudCIsInNuYXBzaG90Iiwib25GdWxmaWxsZWQiLCJvblJlamVjdGVkIiwib25Qcm9ncmVzcyIsImFsbFJlc29sdmVkIiwiYWxsU2V0dGxlZCIsInJlZ2FyZGxlc3MiLCJmaW4iLCJvblVuaGFuZGxlZEVycm9yIiwibXMiLCJ0aW1lb3V0SWQiLCJjb2RlIiwibmZhcHBseSIsIm5vZGVBcmdzIiwibmZjYWxsIiwibmZiaW5kIiwiZGVub2RlaWZ5IiwiYmFzZUFyZ3MiLCJuYmluZCIsIm5tYXBwbHkiLCJucG9zdCIsIm5zZW5kIiwibm1jYWxsIiwibmludm9rZSIsIm5vZGVpZnkiLCJub2RlYmFjayIsIlNjaGVkdWxlZFRhc2siLCJTY2hlZHVsZWRUYXNrVHlwZSIsImNvbmZpZyIsImxvZyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInV0aWxzIiwic2hpbSIsImZuMSIsIm1pbGxpczEiLCJtaWxsaXMiLCJzY2hlZHVsZWRUaW1lIiwia2lsbCIsImNhbmNlbCIsInNjaGVkdWxlZFRhc2tzIiwidXJsIiwidG9rZW4iLCJ4aHIiLCJwdXQiLCJwYXRjaCIsInNjaGVkdWxlT25jZSIsImxvb3AiLCJzY2hlZHVsZUV2ZXJ5Iiwic2ZuIiwibWVkaWF0b3IiLCJYTUxIdHRwUmVxdWVzdCIsImRlc2MiLCJkZWZpbmVQcm9wZXJ0eSIsImZhY3RvcnkiLCJYSFIiLCJkc3QiLCJsb3dlcmNhc2UiLCJwYXJzZUhlYWRlcnMiLCJoZWFkZXJzIiwicGFyc2VkIiwic3Vic3RyIiwiaGVhZGVyc0dldHRlciIsImhlYWRlcnNPYmoiLCJ0cmFuc2Zvcm1EYXRhIiwiaXNTdWNjZXNzIiwic3RhdHVzIiwiZm9yRWFjaFNvcnRlZCIsImJ1aWxkVXJsIiwicGFyYW1zIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicmVxdWVzdENvbmZpZyIsInRyYW5zZm9ybVJlcXVlc3QiLCJ0cmFuc2Zvcm1SZXNwb25zZSIsIm1lcmdlSGVhZGVycyIsImRlZkhlYWRlcnMiLCJyZXFIZWFkZXJzIiwiZGVmSGVhZGVyTmFtZSIsImxvd2VyY2FzZURlZkhlYWRlck5hbWUiLCJyZXFIZWFkZXJOYW1lIiwiZXhlY0hlYWRlcnMiLCJoZWFkZXJGbiIsImhlYWRlciIsImhlYWRlckNvbnRlbnQiLCJjb21tb24iLCJ0b1VwcGVyQ2FzZSIsInNlcnZlclJlcXVlc3QiLCJyZXFEYXRhIiwid2l0aENyZWRlbnRpYWxzIiwic2VuZFJlcSIsInJlc3BvbnNlIiwiaW50ZXJjZXB0b3JzIiwicmVxdWVzdCIsInJlcXVlc3RFcnJvciIsImZhaWx1cmUiLCJyZXNwb25zZUVycm9yIiwiY29udGVudFR5cGVKc29uIiwicGFyc2UiLCJwZW5kaW5nUmVxdWVzdHMiLCJhYm9ydGVkIiwic2V0UmVxdWVzdEhlYWRlciIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJyZXNwb25zZUhlYWRlcnMiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJvbnByb2dyZXNzIiwiYWJvcnQiLCJ2ZW5kb3JzIiwic3VmZml4IiwicmFmIiwiY2FmIiwicXVldWUiLCJmcmFtZUR1cmF0aW9uIiwiX25vdyIsImNwIiwiY2FuY2VsbGVkIiwicm91bmQiLCJoYW5kbGUiLCJnZXROYW5vU2Vjb25kcyIsImhydGltZSIsImxvYWRUaW1lIiwicGVyZm9ybWFuY2UiLCJociIsIkRFQlVHIiwiZGVidWciLCJpbmZvIiwiRXZlbnRzIiwiTG9hZGluZyIsIkxvYWREYXRhIiwiTG9hZEVycm9yIiwiTG9hZERhdGFQYXJ0aWFsIiwiX3BvbGljeSIsIl90YXNrIiwiX21lZGlhdG9yIiwiX2xvYWQiLCJlcnIiLCJldmVudE5hbWUiLCJzaGlmdCIsIkZvcm0iLCJWaWV3IiwiSW5wdXQiLCJJbnB1dENvbmRpdGlvbiIsInByZWRpY2F0ZTEiLCJ0YWdOYW1lMSIsImxvb2t1cCIsImRlZmF1bHRUYWdOYW1lIiwicmVnaXN0ZXIiLCJy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