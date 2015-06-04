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
    var EmailInputView, ExampleFormView, FormView, InputConfig, InputView, Source, View, api, helpers, extend = function (child, parent) {
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
    api = new crowdcontrol.data.Api('http://localhost:12345');
    helpers.registerTag(function (inputCfg) {
      return inputCfg.hints.indexOf('email') >= 0
    }, 'email-input');
    helpers.registerValidator(function (inputCfg) {
      return inputCfg.hints.indexOf('email') >= 0
    }, function (model, name) {
      var re, value;
      value = model[name].trim().toLowerCase();
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
    EmailInputView = function (superClass) {
      extend(EmailInputView, superClass);
      function EmailInputView() {
        return EmailInputView.__super__.constructor.apply(this, arguments)
      }
      EmailInputView.prototype.tag = 'email-input';
      EmailInputView.prototype.html = '<label __for="{ model.name }">{ model.name }</label>\n<input id="{ model.name }" name="{ model.name }" type="text" onchange="{ change }" onblur="{ change }" value="{ model.value }" placeholder="{ model.placeholder }"></input>';
      return EmailInputView
    }(InputView);
    new EmailInputView;
    ExampleFormView = function (superClass) {
      extend(ExampleFormView, superClass);
      function ExampleFormView() {
        return ExampleFormView.__super__.constructor.apply(this, arguments)
      }
      ExampleFormView.prototype.inputConfigs = [new InputConfig('email', 'email-input', '', 'Anything but your@email.com', 'email')];
      ExampleFormView.prototype.tag = 'example-form';
      ExampleFormView.prototype.html = '<form>\n  <control input="{ inputs.email }" obs="{ obs }">\n</form>';
      return ExampleFormView
    }(FormView);
    new ExampleFormView
  });
  require('./form')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0uY29mZmVlIl0sIm5hbWVzIjpbIkVtYWlsSW5wdXRWaWV3IiwiRXhhbXBsZUZvcm1WaWV3IiwiRm9ybVZpZXciLCJJbnB1dENvbmZpZyIsIklucHV0VmlldyIsIlNvdXJjZSIsIlZpZXciLCJhcGkiLCJoZWxwZXJzIiwiZXh0ZW5kIiwiY2hpbGQiLCJwYXJlbnQiLCJrZXkiLCJoYXNQcm9wIiwiY2FsbCIsImN0b3IiLCJjb25zdHJ1Y3RvciIsInByb3RvdHlwZSIsIl9fc3VwZXJfXyIsImNyb3dkY29udHJvbCIsInZpZXciLCJkYXRhIiwiZm9ybSIsInV0aWxzIiwibG9nIiwiREVCVUciLCJBcGkiLCJyZWdpc3RlclRhZyIsImlucHV0Q2ZnIiwiaGludHMiLCJpbmRleE9mIiwicmVnaXN0ZXJWYWxpZGF0b3IiLCJtb2RlbCIsIm5hbWUiLCJyZSIsInZhbHVlIiwidHJpbSIsInRvTG93ZXJDYXNlIiwibWF0Y2giLCJFcnJvciIsImxlbmd0aCIsImdldCIsInRoZW4iLCJzdXBlckNsYXNzIiwidGFnIiwiaHRtbCIsImlucHV0Q29uZmlncyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBQUFBLGMsRUFBQUMsZSxFQUFBQyxRLEVBQUFDLFcsRUFBQUMsUyxFQUFBQyxNLEVBQUFDLEksRUFBQUMsRyxFQUFBQyxPLEVBQUFDLE1BQUEsYUFBQUMsS0FBQSxFQUFBQyxNQUFBO0FBQUEsaUJBQUFDLEdBQUEsSUFBQUQsTUFBQTtBQUFBLGNBQUFFLE9BQUEsQ0FBQUMsSUFBQSxDQUFBSCxNQUFBLEVBQUFDLEdBQUE7QUFBQSxZQUFBRixLQUFBLENBQUFFLEdBQUEsSUFBQUQsTUFBQSxDQUFBQyxHQUFBO0FBQUE7QUFBQSxpQkFBQUcsSUFBQTtBQUFBLGVBQUFDLFdBQUEsR0FBQU4sS0FBQTtBQUFBO0FBQUEsUUFBQUssSUFBQSxDQUFBRSxTQUFBLEdBQUFOLE1BQUEsQ0FBQU0sU0FBQTtBQUFBLFFBQUFQLEtBQUEsQ0FBQU8sU0FBQSxPQUFBRixJQUFBO0FBQUEsUUFBQUwsS0FBQSxDQUFBUSxTQUFBLEdBQUFQLE1BQUEsQ0FBQU0sU0FBQTtBQUFBLGVBQUFQLEtBQUE7QUFBQSxPO0lBQUFKLElBQUEsR0FBT2EsWUFBQSxDQUFhQyxJQUFiLENBQWtCZCxJQUF6QixDO0lBQ0FELE1BQUEsR0FBU2MsWUFBQSxDQUFhRSxJQUFiLENBQWtCaEIsTUFBM0IsQztJQUVBRyxPQUFBLEdBQVVXLFlBQUEsQ0FBYUMsSUFBYixDQUFrQkUsSUFBbEIsQ0FBdUJkLE9BQWpDLEM7SUFDQU4sUUFBQSxHQUFXaUIsWUFBQSxDQUFhQyxJQUFiLENBQWtCRSxJQUFsQixDQUF1QnBCLFFBQWxDLEM7SUFDQUUsU0FBQSxHQUFZZSxZQUFBLENBQWFDLElBQWIsQ0FBa0JFLElBQWxCLENBQXVCbEIsU0FBbkMsQztJQUNBRCxXQUFBLEdBQWNnQixZQUFBLENBQWFDLElBQWIsQ0FBa0JFLElBQWxCLENBQXVCbkIsV0FBckMsQztJQUVBZ0IsWUFBQSxDQUFhSSxLQUFiLENBQW1CQyxHQUFuQixDQUF1QkMsS0FBdkIsR0FBK0IsSUFBL0IsQztJQUVBbEIsR0FBQSxHQUFVLElBQUFZLFlBQUEsQ0FBYUUsSUFBYixDQUFrQkssR0FBbEIsQ0FBc0Isd0JBQXRCLENBQVYsQztJQUVBbEIsT0FBQSxDQUFRbUIsV0FBUixDQUFxQixVQUFDQyxRQUFEO0FBQUEsTUFBYSxPQUFPQSxRQUFBLENBQVNDLEtBQVQsQ0FBZUMsT0FBZixDQUF1QixPQUF2QixLQUFtQyxDQUF2RDtBQUFBLEtBQXJCLEVBQWdGLGFBQWhGLEU7SUFDQXRCLE9BQUEsQ0FBUXVCLGlCQUFSLENBQTJCLFVBQUNILFFBQUQ7QUFBQSxNQUFjLE9BQU9BLFFBQUEsQ0FBU0MsS0FBVCxDQUFlQyxPQUFmLENBQXVCLE9BQXZCLEtBQW1DLENBQXhEO0FBQUEsS0FBM0IsRUFBdUYsVUFBQ0UsS0FBRCxFQUFRQyxJQUFSO0FBQUEsTUFDckYsSUFBQUMsRUFBQSxFQUFBQyxLQUFBLENBRHFGO0FBQUEsTUFDckZBLEtBQUEsR0FBUUgsS0FBQSxDQUFNQyxJQUFOLEVBQVlHLElBQVosR0FBbUJDLFdBQW5CLEVBQVIsQ0FEcUY7QUFBQSxNQUVyRkgsRUFBQSxHQUFLLHlJQUFMLENBRnFGO0FBQUEsTSxJQUdsRkMsS0FBQSxDQUFNRyxLQUFOLENBQVlKLEVBQVosQztRQUNELE9BQU9DLEs7T0FKNEU7QUFBQSxNQUtyRixNQUFVLElBQUFJLEtBQUEsQ0FBTSxxQkFBTixDQUwyRTtBQUFBLEtBQXZGLEU7SUFPQS9CLE9BQUEsQ0FBUXVCLGlCQUFSLENBQTJCLFVBQUNILFFBQUQ7QUFBQSxNQUFjLE9BQU9BLFFBQUEsQ0FBU0MsS0FBVCxDQUFlQyxPQUFmLENBQXVCLE9BQXZCLEtBQW1DLENBQXhEO0FBQUEsS0FBM0IsRUFBdUYsVUFBQ0UsS0FBRCxFQUFRQyxJQUFSO0FBQUEsTUFDckYsSUFBQUUsS0FBQSxDQURxRjtBQUFBLE1BQ3JGQSxLQUFBLEdBQVFILEtBQUEsQ0FBTUMsSUFBTixDQUFSLENBRHFGO0FBQUEsTSxJQUVsRkUsS0FBQSxDQUFNSyxNQUFOLEdBQWUsQztRQUNoQixPQUFPakMsR0FBQSxDQUFJa0MsR0FBSixDQUFRLFdBQVdOLEtBQW5CLEVBQTBCTyxJQUExQixDQUErQixVQUFDckIsSUFBRDtBQUFBLFVBQ3BDLE1BQVUsSUFBQWtCLEtBQUEsQ0FBTSxzQkFBTixDQUQwQjtBQUFBLFNBQS9CLEVBRUw7QUFBQSxVQUNBLE9BQU9KLEtBRFA7QUFBQSxTQUZLLEM7T0FINEU7QUFBQSxNQU9yRixNQUFVLElBQUFJLEtBQUEsQ0FBTSx1QkFBTixDQVAyRTtBQUFBLEtBQXZGLEU7SUFTTXZDLGNBQUEsRyxVQUFBMkMsVTs7Ozs7K0JBQ0pDLEcsR0FBSyxhOytCQUNMQyxJLEdBQU0sbU87O0tBRkYsQ0FBdUJ6QyxTQUF2QixFO0lBT04sSUFBSUosY0FBSixDO0lBRU1DLGVBQUEsRyxVQUFBMEMsVTs7Ozs7Z0NBQ0pHLFksR0FBYSxDQUNQLElBQUEzQyxXQUFBLENBQVksT0FBWixFQUFxQixhQUFyQixFQUFvQyxFQUFwQyxFQUF3Qyw2QkFBeEMsRUFBdUUsT0FBdkUsQ0FETyxDO2dDQUdieUMsRyxHQUFLLGM7Z0NBQ0xDLEksR0FBTSxxRTs7S0FMRixDQUF3QjNDLFFBQXhCLEU7SUFXTixJQUFJRCxlIiwic291cmNlUm9vdCI6Ii9leGFtcGxlcy9mb3JtIn0=