'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isFunction = _interopDefault(require('es-is/function'));
var riot = _interopDefault(require('riot/lib/riot'));
var objectAssign = _interopDefault(require('es-object-assign'));
var Promise$1 = _interopDefault(require('broken'));
var esRaf = require('es-raf');
var refer = _interopDefault(require('referential'));
var observable = _interopDefault(require('riot-observable'));

// src/schedule.coffee
var id;
var p;
var rafId;
var scheduleUpdate;
var todos;

todos = {};

rafId = -1;

p = null;

id = 0;

scheduleUpdate = function(tag) {
  var currentTag, parentTag;
  if (!p) {
    p = new Promise$1;
    p.then(function() {
      var _, todo;
      for (_ in todos) {
        todo = todos[_];
        todo.update();
      }
      p = null;
      todos = {};
      return rafId = -1;
    });
  }
  if (todos['*']) {
    return p;
  }
  if (!tag) {
    todos = {
      '*': riot
    };
  } else if (tag.update == null) {
    throw new Error('tag has no update routine');
  } else {
    currentTag = tag;
    while (currentTag != null) {
      parentTag = currentTag.parent;
      if (!currentTag._schedulingId) {
        currentTag._schedulingId = id++;
      } else if (todos[currentTag.schedulingId] != null) {
        return p;
      }
      currentTag = parentTag;
    }
    todos[tag._schedulingId] = tag;
  }
  if (rafId === -1) {
    rafId = esRaf.raf(function() {
      return p.resolve();
    });
  }
  return p;
};

// src/views/view.coffee
var View;
var collapsePrototype;
var setPrototypeOf;

setPrototypeOf = (function() {
  var mixinProperties, setProtoOf;
  setProtoOf = function(obj, proto) {
    return obj.__proto__ = proto;
  };
  mixinProperties = function(obj, proto) {
    var prop, results;
    results = [];
    for (prop in proto) {
      if (obj[prop] == null) {
        results.push(obj[prop] = proto[prop]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  if (Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array) {
    return setProtoOf;
  } else {
    return mixinProperties;
  }
})();

collapsePrototype = function(collapse, proto) {
  var parentProto;
  if (proto === View.prototype) {
    return;
  }
  parentProto = Object.getPrototypeOf(proto);
  collapsePrototype(collapse, parentProto);
  return objectAssign(collapse, parentProto);
};

View = (function() {
  View.register = function() {
    return new this;
  };

  View.prototype.tag = '';

  View.prototype.html = '';

  View.prototype.css = '';

  View.prototype.attrs = '';

  View.prototype.events = null;

  function View() {
    var newProto;
    newProto = collapsePrototype({}, this);
    this.beforeInit();
    riot.tag(this.tag, this.html, this.css, this.attrs, function(opts) {
      var fn, handler, k, name, parent, proto, ref, ref1, self, v;
      if (newProto != null) {
        for (k in newProto) {
          v = newProto[k];
          if (isFunction(v)) {
            (function(_this) {
              return (function(v) {
                var oldFn;
                if (_this[k] != null) {
                  oldFn = _this[k];
                  return _this[k] = function() {
                    oldFn.apply(_this, arguments);
                    return v.apply(_this, arguments);
                  };
                } else {
                  return _this[k] = function() {
                    return v.apply(_this, arguments);
                  };
                }
              });
            })(this)(v);
          } else {
            this[k] = v;
          }
        }
      }
      self = this;
      parent = (ref = self.parent) != null ? ref : opts.parent;
      proto = Object.getPrototypeOf(self);
      while (parent && parent !== proto) {
        setPrototypeOf(self, parent);
        self = parent;
        parent = self.parent;
        proto = Object.getPrototypeOf(self);
      }
      if (opts != null) {
        for (k in opts) {
          v = opts[k];
          this[k] = v;
        }
      }
      if (this.events != null) {
        ref1 = this.events;
        fn = (function(_this) {
          return function(name, handler) {
            if (typeof handler === 'string') {
              return _this.on(name, function() {
                return _this[handler].apply(_this, arguments);
              });
            } else {
              return _this.on(name, function() {
                return handler.apply(_this, arguments);
              });
            }
          };
        })(this);
        for (name in ref1) {
          handler = ref1[name];
          fn(name, handler);
        }
      }
      return this.init(opts);
    });
  }

  View.prototype.beforeInit = function() {};

  View.prototype.init = function() {};

  View.prototype.scheduleUpdate = function() {
    return scheduleUpdate(this);
  };

  return View;

})();

var View$1 = View;

// src/views/inputify.coffee
var inputify;
var isRef;

isRef = function(o) {
  return (o != null) && isFunction(o.ref);
};

inputify = function(data, configs) {
  var config, fn, inputs, name, ref;
  ref = data;
  if (!isRef(ref)) {
    ref = refer(data);
  }
  inputs = {};
  fn = function(name, config) {
    var fn1, i, input, len, middleware, middlewareFn, validate;
    middleware = [];
    if (config && config.length > 0) {
      fn1 = function(name, middlewareFn) {
        return middleware.push(function(pair) {
          ref = pair[0], name = pair[1];
          return Promise$1.resolve(pair).then(function(pair) {
            return middlewareFn.call(pair[0], pair[0].get(pair[1]), pair[1], pair[0]);
          }).then(function(v) {
            ref.set(name, v);
            return pair;
          });
        });
      };
      for (i = 0, len = config.length; i < len; i++) {
        middlewareFn = config[i];
        fn1(name, middlewareFn);
      }
    }
    middleware.push(function(pair) {
      ref = pair[0], name = pair[1];
      return Promise$1.resolve(ref.get(name));
    });
    validate = function(ref, name) {
      var j, len1, p;
      p = Promise$1.resolve([ref, name]);
      for (j = 0, len1 = middleware.length; j < len1; j++) {
        middlewareFn = middleware[j];
        p = p.then(middlewareFn);
      }
      return p;
    };
    input = {
      name: name,
      ref: ref,
      config: config,
      validate: validate
    };
    observable(input);
    return inputs[name] = input;
  };
  for (name in configs) {
    config = configs[name];
    fn(name, config);
  }
  return inputs;
};

var inputify$1 = inputify;

// src/views/form.coffee
var Form;
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp = {}.hasOwnProperty;

Form = (function(superClass) {
  extend(Form, superClass);

  function Form() {
    return Form.__super__.constructor.apply(this, arguments);
  }

  Form.prototype.initInputs = function() {
    this.inputs = {};
    if (this.configs != null) {
      return this.inputs = inputify$1(this.data, this.configs);
    }
  };

  Form.prototype.init = function() {
    return this.initInputs();
  };

  Form.prototype.submit = function(e) {
    var input, name, p, pRef, ps, ref;
    ps = [];
    ref = this.inputs;
    for (name in ref) {
      input = ref[name];
      pRef = {};
      input.trigger('validate', pRef);
      if (pRef.p != null) {
        ps.push(pRef.p);
      }
    }
    p = Promise$1.settle(ps).then((function(_this) {
      return function(results) {
        var i, len, result;
        for (i = 0, len = results.length; i < len; i++) {
          result = results[i];
          if (!result.isFulfilled()) {
            return;
          }
        }
        return _this._submit.apply(_this, arguments);
      };
    })(this));
    if (e != null) {
      e.preventDefault();
      e.stopPropagation();
    }
    return p;
  };

  Form.prototype._submit = function() {};

  return Form;

})(View$1);

var Form$1 = Form;

// src/views/input.coffee
var Input;
var extend$1 = function(child, parent) { for (var key in parent) { if (hasProp$1.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp$1 = {}.hasOwnProperty;

Input = (function(superClass) {
  extend$1(Input, superClass);

  function Input() {
    return Input.__super__.constructor.apply(this, arguments);
  }

  Input.prototype.input = null;

  Input.prototype.valid = false;

  Input.prototype.errorMessage = '';

  Input.prototype.errorHtml = '<div class="error-container" if="{ errorMessage }">\n  <div class="error-message">{ errorMessage }</div>\n</div>';

  Input.prototype.beforeInit = function() {
    return this.html += this.errorHtml;
  };

  Input.prototype.init = function() {
    var ref1, ref2;
    if ((this.input == null) && (this.lookup == null) && (this.bind == null)) {
      throw new Error('No input or bind provided');
    }
    if ((this.input == null) && (this.inputs != null)) {
      this.input = this.inputs[(ref1 = this.lookup) != null ? ref1 : this.bind];
    }
    if (this.input == null) {
      this.input = {
        name: (ref2 = this.lookup) != null ? ref2 : this.bind,
        ref: this.data,
        validate: function(ref, name) {
          return Promise.resolve([ref, name]);
        }
      };
      observable(this.input);
    }
    this.input.on('validate', (function(_this) {
      return function(pRef) {
        return _this.validate(pRef);
      };
    })(this));
    return this.input.ref.on('set', (function(_this) {
      return function(n, v1, v2) {
        if (n === _this.input.name && v1 !== v2) {
          return _this.scheduleUpdate();
        }
      };
    })(this));
  };

  Input.prototype.getValue = function(event) {
    return event.target.value;
  };

  Input.prototype.change = function(event) {
    var name, ref, ref1, value;
    ref1 = this.input, ref = ref1.ref, name = ref1.name;
    value = this.getValue(event);
    if (value === ref.get(name)) {
      return;
    }
    this.input.ref.set(name, value);
    this.clearError();
    return this.validate();
  };

  Input.prototype.error = function(err) {
    var ref1;
    return this.errorMessage = (ref1 = err != null ? err.message : void 0) != null ? ref1 : err;
  };

  Input.prototype.changed = function() {};

  Input.prototype.clearError = function() {
    return this.errorMessage = '';
  };

  Input.prototype.validate = function(pRef) {
    var p;
    p = this.input.validate(this.input.ref, this.input.name).then((function(_this) {
      return function(value) {
        _this.changed(value);
        _this.valid = true;
        return _this.scheduleUpdate();
      };
    })(this))["catch"]((function(_this) {
      return function(err) {
        _this.error(err);
        _this.valid = false;
        _this.scheduleUpdate();
        throw err;
      };
    })(this));
    if (pRef != null) {
      pRef.p = p;
    }
    return p;
  };

  return Input;

})(View$1);

var Input$1 = Input;

// src/views/index.coffee
var Views;

var Views$1 = Views = {
  Form: Form$1,
  Input: Input$1,
  View: View$1,
  inputify: inputify$1
};

// src/index.coffee
var El;
var fn;
var k;
var v;

El = {
  Views: Views$1,
  View: Views$1.View,
  Form: Views$1.Form,
  Input: Views$1.Input,
  riot: riot,
  scheduleUpdate: function() {
    return scheduleUpdate();
  }
};

fn = function(k, v) {
  if (isFunction(v)) {
    return El[k] = function() {
      return v.apply(riot, arguments);
    };
  }
};
for (k in riot) {
  v = riot[k];
  fn(k, v);
}

var El$1 = El;

module.exports = El$1;
//# sourceMappingURL=el.js.map
