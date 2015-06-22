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
    new BasicInputView;
    EmailInputView = function (superClass) {
      extend(EmailInputView, superClass);
      function EmailInputView() {
        return EmailInputView.__super__.constructor.apply(this, arguments)
      }
      EmailInputView.prototype.tag = 'email-input';
      return EmailInputView
    }(BasicInputView);
    new EmailInputView;
    ExampleFormView = function (superClass) {
      extend(ExampleFormView, superClass);
      function ExampleFormView() {
        return ExampleFormView.__super__.constructor.apply(this, arguments)
      }
      ExampleFormView.prototype.inputConfigs = [
        new InputConfig('email', '', 'Anything but your@email.com', 'email'),
        new InputConfig('basic', '', 'No Validation On This One')
      ];
      ExampleFormView.prototype.tag = 'example-form';
      ExampleFormView.prototype.html = '<form onsubmit="{ submit }">\n  <control input="{ inputs.email }" obs="{ obs }"></control>\n  <control input="{ inputs.basic }" obs="{ obs }"></control>\n  <button type="submit">Submit</button>\n</form>';
      ExampleFormView.prototype.submit = function () {
        return $(this.ctx.root).find('form').submit()
      };
      return ExampleFormView
    }(FormView);
    new ExampleFormView
  });
  require('./form')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0uY29mZmVlIl0sIm5hbWVzIjpbIkJhc2ljSW5wdXRWaWV3IiwiRW1haWxJbnB1dFZpZXciLCJFeGFtcGxlRm9ybVZpZXciLCJGb3JtVmlldyIsIklucHV0Q29uZmlnIiwiSW5wdXRWaWV3IiwiU291cmNlIiwiVmlldyIsImFwaSIsImhlbHBlcnMiLCJleHRlbmQiLCJjaGlsZCIsInBhcmVudCIsImtleSIsImhhc1Byb3AiLCJjYWxsIiwiY3RvciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwiX19zdXBlcl9fIiwiY3Jvd2Rjb250cm9sIiwidmlldyIsImRhdGEiLCJmb3JtIiwidXRpbHMiLCJsb2ciLCJERUJVRyIsIkFwaSIsImRlZmF1bHRUYWdOYW1lIiwicmVnaXN0ZXJUYWciLCJpbnB1dENmZyIsImhpbnRzIiwiaW5kZXhPZiIsInJlZ2lzdGVyVmFsaWRhdG9yIiwibW9kZWwiLCJuYW1lIiwicmUiLCJ2YWx1ZSIsIkVycm9yIiwidHJpbSIsInRvTG93ZXJDYXNlIiwibWF0Y2giLCJsZW5ndGgiLCJnZXQiLCJ0aGVuIiwic3VwZXJDbGFzcyIsInRhZyIsImh0bWwiLCJpbnB1dENvbmZpZ3MiLCJzdWJtaXQiLCIkIiwiY3R4Iiwicm9vdCIsImZpbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUFBQSxjLEVBQUFDLGMsRUFBQUMsZSxFQUFBQyxRLEVBQUFDLFcsRUFBQUMsUyxFQUFBQyxNLEVBQUFDLEksRUFBQUMsRyxFQUFBQyxPLEVBQUFDLE1BQUEsYUFBQUMsS0FBQSxFQUFBQyxNQUFBO0FBQUEsaUJBQUFDLEdBQUEsSUFBQUQsTUFBQTtBQUFBLGNBQUFFLE9BQUEsQ0FBQUMsSUFBQSxDQUFBSCxNQUFBLEVBQUFDLEdBQUE7QUFBQSxZQUFBRixLQUFBLENBQUFFLEdBQUEsSUFBQUQsTUFBQSxDQUFBQyxHQUFBO0FBQUE7QUFBQSxpQkFBQUcsSUFBQTtBQUFB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