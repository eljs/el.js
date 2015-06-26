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
  // source: /Users/dtai/work/verus/crowdcontrol/examples/form/form.coffee
  require.define('./form', function (module, exports, __dirname, __filename) {
    var BasicInputView, EmailInputView, ExampleFormView, FormView, InputConfig, InputView, Source, View, api, helpers, extend = function (child, parent) {
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
    View = crowdcontrol.view.View;
    Source = crowdcontrol.data.Source;
    helpers = crowdcontrol.view.form.helpers;
    FormView = crowdcontrol.view.form.FormView;
    InputView = crowdcontrol.view.form.InputView;
    InputConfig = crowdcontrol.view.form.InputConfig;
    crowdcontrol.utils.log.DEBUG = true;
    api = new crowdcontrol.data.Api('http://localhost:12345', '');
    helpers.defaultTagName = 'basic-input';
    helpers.registerTag(function (inputCfg) {
      return inputCfg.hints.indexOf('email') >= 0
    }, 'email-input');
    helpers.registerValidator(function (inputCfg) {
      return inputCfg.hints.indexOf('email') >= 0
    }, function (model, name) {
      var re, value;
      value = model[name];
      if (value == null) {
        throw new Error('Enter a valid email')
      }
      value = value.trim().toLowerCase();
      re = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      if (value.match(re)) {
        return value
      }
      throw new Error('Enter a valid email')
    });
    helpers.registerValidator(function (inputCfg) {
      return inputCfg.hints.indexOf('email') >= 0
    }, function (model, name) {
      var value;
      value = model[name];
      if (value.length > 0) {
        return api.get('email/' + value).then(function (data) {
          throw new Error('Email already exists')
        }, function () {
          return value
        })
      }
      throw new Error('Email cannot be empty')
    });
    BasicInputView = function (superClass) {
      extend(BasicInputView, superClass);
      function BasicInputView() {
        return BasicInputView.__super__.constructor.apply(this, arguments)
      }
      BasicInputView.prototype.tag = 'basic-input';
      BasicInputView.prototype.html = '<label __for="{ model.name }">{ model.name }</label>\n<input id="{ model.name }" name="{ model.name }" type="text" onchange="{ change }" onblur="{ change }" value="{ model.value }" placeholder="{ model.placeholder }"></input>';
      return BasicInputView
    }(InputView);
    BasicInputView.register();
    EmailInputView = function (superClass) {
      extend(EmailInputView, superClass);
      function EmailInputView() {
        return EmailInputView.__super__.constructor.apply(this, arguments)
      }
      EmailInputView.prototype.tag = 'email-input';
      return EmailInputView
    }(BasicInputView);
    EmailInputView.register();
    ExampleFormView = function (superClass) {
      extend(ExampleFormView, superClass);
      function ExampleFormView() {
        return ExampleFormView.__super__.constructor.apply(this, arguments)
      }
      ExampleFormView.prototype.inputConfigs = [
        new InputConfig('email', '', 'Anything but your@email.com', 'email'),
        new InputConfig('basic', '', 'No Validation On This One'),
        new InputConfig('example.nested.structure.1', '', 'Example Nested Object')
      ];
      ExampleFormView.prototype.model = {
        basic: 'This is prefilled!',
        example: {
          nested: {
            structure: [
              'Should not see',
              'This is also prefilled!'
            ]
          }
        }
      };
      ExampleFormView.prototype.tag = 'example-form';
      ExampleFormView.prototype.html = '<form onsubmit="{ submit }">\n  <control input="{ inputs.email }"></control>\n  <control input="{ inputs.basic }"></control>\n  <control input="{ inputs[\'example.nested.structure.1\'] }"></control>\n  <button type="submit">Submit</button>\n</form>';
      ExampleFormView.prototype.submit = function () {
        console.log(this.model);
        return alert('Success!')
      };
      return ExampleFormView
    }(FormView);
    ExampleFormView.register()
  });
  require('./form')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0uY29mZmVlIl0sIm5hbWVzIjpbIkJhc2ljSW5wdXRWaWV3IiwiRW1haWxJbnB1dFZpZXciLCJFeGFtcGxlRm9ybVZpZXciLCJGb3JtVmlldyIsIklucHV0Q29uZmlnIiwiSW5wdXRWaWV3IiwiU291cmNlIiwiVmlldyIsImFwaSIsImhlbHBlcnMiLCJleHRlbmQiLCJjaGlsZCIsInBhcmVudCIsImtleSIsImhhc1Byb3AiLCJjYWxsIiwiY3RvciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwiX19zdXBlcl9fIiwiY3Jvd2Rjb250cm9sIiwidmlldyIsImRhdGEiLCJmb3JtIiwidXRpbHMiLCJsb2ciLCJERUJVRyIsIkFwaSIsImRlZmF1bHRUYWdOYW1lIiwicmVnaXN0ZXJUYWciLCJpbnB1dENmZyIsImhpbnRzIiwiaW5kZXhPZiIsInJlZ2lzdGVyVmFsaWRhdG9yIiwibW9kZWwiLCJuYW1lIiwicmUiLCJ2YWx1ZSIsIkVycm9yIiwidHJpbSIsInRvTG93ZXJDYXNlIiwibWF0Y2giLCJsZW5ndGgiLCJnZXQiLCJ0aGVuIiwic3VwZXJDbGFzcyIsInRhZyIsImh0bWwiLCJyZWdpc3RlciIsImlucHV0Q29uZmlncyIsImJhc2ljIiwiZXhhbXBsZSIsIm5lc3RlZCIsInN0cnVjdHVyZSIsInN1Ym1pdCIsImNvbnNvbGUiLCJhbGVydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBQUFBLGMsRUFBQUMsYyxFQUFBQyxlLEVBQUFDLFEsRUFBQUMsVyxFQUFBQyxTLEVBQUFDLE0sRUFBQUMsSSxFQUFBQyxHLEVBQUFDLE8sRUFBQUMsTUFBQSxhQUFBQyxLQUFBLEVBQUFDLE1BQUE7QUFBQSxpQkFBQUMsR0FBQSxJQUFBRCxNQUFBO0FBQUEsY0FBQUUsT0FBQSxDQUFBQyxJQUFBLENBQUFILE1BQUEsRUFBQUMsR0FBQTtBQUFBLFlBQUFGLEtBQUEsQ0FBQUUsR0FBQSxJQUFB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