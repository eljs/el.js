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
  // source: /Users/zk/work/crowdstart/crowdcontrol/examples/form/form.coffee
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
      return inputCfg.hints['email']
    }, 'email-input');
    helpers.registerValidator(function (inputCfg) {
      return inputCfg.hints['email']
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
      return inputCfg.hints['email']
    }, function (model, name) {
      var value;
      value = model[name];
      if (value.length > 0) {
        return api.get('email/' + value).then(function (res) {
          if (res.status === 200) {
            throw new Error('Email already exists')
          }
          return value
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
        new InputConfig('email', '', 'Anything but your@email.com', 'email test:test'),
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
      ExampleFormView.prototype._submit = function (event) {
        console.log(this.model);
        return alert('Success!')
      };
      return ExampleFormView
    }(FormView);
    ExampleFormView.register()
  });
  require('./form')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0uY29mZmVlIl0sIm5hbWVzIjpbIkJhc2ljSW5wdXRWaWV3IiwiRW1haWxJbnB1dFZpZXciLCJFeGFtcGxlRm9ybVZpZXciLCJGb3JtVmlldyIsIklucHV0Q29uZmlnIiwiSW5wdXRWaWV3IiwiU291cmNlIiwiVmlldyIsImFwaSIsImhlbHBlcnMiLCJleHRlbmQiLCJjaGlsZCIsInBhcmVudCIsImtleSIsImhhc1Byb3AiLCJjYWxsIiwiY3RvciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwiX19zdXBlcl9fIiwiY3Jvd2Rjb250cm9sIiwidmlldyIsImRhdGEiLCJmb3JtIiwidXRpbHMiLCJsb2ciLCJERUJVRyIsIkFwaSIsImRlZmF1bHRUYWdOYW1lIiwicmVnaXN0ZXJUYWciLCJpbnB1dENmZyIsImhpbnRzIiwicmVnaXN0ZXJWYWxpZGF0b3IiLCJtb2RlbCIsIm5hbWUiLCJyZSIsInZhbHVlIiwiRXJyb3IiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJtYXRjaCIsImxlbmd0aCIsImdldCIsInRoZW4iLCJyZXMiLCJzdGF0dXMiLCJzdXBlckNsYXNzIiwidGFnIiwiaHRtbCIsInJlZ2lzdGVyIiwiaW5wdXRDb25maWdzIiwiYmFzaWMiLCJleGFtcGxlIiwibmVzdGVkIiwic3RydWN0dXJlIiwiX3N1Ym1pdCIsImV2ZW50IiwiY29uc29sZSIsImFsZXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQUEsYyxFQUFBQyxjLEVBQUFDLGUsRUFBQUMsUSxFQUFBQyxXLEVBQUFDLFMsRUFBQUMsTSxFQUFBQyxJLEVBQUFDLEcsRUFBQUMsTyxFQUFBQyxNQUFBLGFBQUFDLEtBQUEsRUFBQUMsTUFBQTtBQUFBLGlCQUFBQyxHQUFBLElBQUFELE1BQUE7QUFBQSxjQUFBRSxPQUFBLENBQUFDLElBQUEsQ0FBQUgsTUFBQSxFQUFBQyxHQUFBO0FBQUEsWUFBQUYsS0FBQSxD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