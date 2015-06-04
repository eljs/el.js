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
    api = new crowdcontrol.data.Api('http://localhost:12345');
    helpers.registerTag(function (inputCfg) {
      return inputCfg.tag.indexOf('email') >= 0
    }, 'email-input');
    EmailInputView = function (superClass) {
      extend(EmailInputView, superClass);
      function EmailInputView() {
        return EmailInputView.__super__.constructor.apply(this, arguments)
      }
      EmailInputView.prototype.tag = 'email-input';
      EmailInputView.prototype.html = '<label __for="{ model.name }">{ model.name }</label>\n<input id="{ model.name }" name="{ model.name }" type="text" onchange="{ change }" onblur="{ change }" value ="{ model.value }"></input>';
      return EmailInputView
    }(InputView);
    new EmailInputView;
    ExampleFormView = function (superClass) {
      extend(ExampleFormView, superClass);
      function ExampleFormView() {
        return ExampleFormView.__super__.constructor.apply(this, arguments)
      }
      ExampleFormView.prototype.inputConfigs = [new InputConfig('email', 'email-input', '', 'your@email.com', 'email')];
      ExampleFormView.prototype.tag = 'example-form';
      ExampleFormView.prototype.html = '<form>\n  <control input="{ inputs.email }" obs="{ obs }">\n</form>';
      return ExampleFormView
    }(FormView);
    new ExampleFormView
  });
  require('./form')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0uY29mZmVlIl0sIm5hbWVzIjpbIkVtYWlsSW5wdXRWaWV3IiwiRXhhbXBsZUZvcm1WaWV3IiwiRm9ybVZpZXciLCJJbnB1dENvbmZpZyIsIklucHV0VmlldyIsIlNvdXJjZSIsIlZpZXciLCJhcGkiLCJoZWxwZXJzIiwiZXh0ZW5kIiwiY2hpbGQiLCJwYXJlbnQiLCJrZXkiLCJoYXNQcm9wIiwiY2FsbCIsImN0b3IiLCJjb25zdHJ1Y3RvciIsInByb3RvdHlwZSIsIl9fc3VwZXJfXyIsImNyb3dkY29udHJvbCIsInZpZXciLCJkYXRhIiwiZm9ybSIsIkFwaSIsInJlZ2lzdGVyVGFnIiwiaW5wdXRDZmciLCJ0YWciLCJpbmRleE9mIiwic3VwZXJDbGFzcyIsImh0bWwiLCJpbnB1dENvbmZpZ3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUFBQSxjLEVBQUFDLGUsRUFBQUMsUSxFQUFBQyxXLEVBQUFDLFMsRUFBQUMsTSxFQUFBQyxJLEVBQUFDLEcsRUFBQUMsTyxFQUFBQyxNQUFBLGFBQUFDLEtBQUEsRUFBQUMsTUFBQTtBQUFBLGlCQUFBQyxHQUFBLElBQUFELE1BQUE7QUFBQSxjQUFBRSxPQUFBLENBQUFDLElBQUEsQ0FBQUgsTUFBQSxFQUFBQyxHQUFBO0FBQUEsWUFBQUYsS0FBQSxDQUFBRSxHQUFBLElBQUFELE1BQUEsQ0FBQUMsR0FBQTtBQUFBO0FBQUEsaUJBQUFHLElBQUE7QUFBQSxlQUFBQyxXQUFBLEdBQUFOLEtBQUE7QUFBQTtBQUFBLFFBQUFLLElBQUEsQ0FBQUUsU0FBQSxHQUFBTixNQUFBLENBQUFNLFNBQUE7QUFBQSxRQUFBUCxLQUFBLENBQUFPLFNBQUEsT0FBQUYsSUFBQTtBQUFBLFFBQUFMLEtBQUEsQ0FBQVEsU0FBQSxHQUFBUCxNQUFBLENBQUFNLFNBQUE7QUFBQSxlQUFBUCxLQUFBO0FBQUEsTztJQUFBSixJQUFBLEdBQU9hLFlBQUEsQ0FBYUMsSUFBYixDQUFrQmQsSUFBekIsQztJQUNBRCxNQUFBLEdBQVNjLFlBQUEsQ0FBYUUsSUFBYixDQUFrQmhCLE1BQTNCLEM7SUFFQUcsT0FBQSxHQUFVVyxZQUFBLENBQWFDLElBQWIsQ0FBa0JFLElBQWxCLENBQXVCZCxPQUFqQyxDO0lBQ0FOLFFBQUEsR0FBV2lCLFlBQUEsQ0FBYUMsSUFBYixDQUFrQkUsSUFBbEIsQ0FBdUJwQixRQUFsQyxDO0lBQ0FFLFNBQUEsR0FBWWUsWUFBQSxDQUFhQyxJQUFiLENBQWtCRSxJQUFsQixDQUF1QmxCLFNBQW5DLEM7SUFDQUQsV0FBQSxHQUFjZ0IsWUFBQSxDQUFhQyxJQUFiLENBQWtCRSxJQUFsQixDQUF1Qm5CLFdBQXJDLEM7SUFFQUksR0FBQSxHQUFVLElBQUFZLFlBQUEsQ0FBYUUsSUFBYixDQUFrQkUsR0FBbEIsQ0FBc0Isd0JBQXRCLENBQVYsQztJQUVBZixPQUFBLENBQVFnQixXQUFSLENBQXFCLFVBQUNDLFFBQUQ7QUFBQSxNQUFhLE9BQU9BLFFBQUEsQ0FBU0MsR0FBVCxDQUFhQyxPQUFiLENBQXFCLE9BQXJCLEtBQWlDLENBQXJEO0FBQUEsS0FBckIsRUFBOEUsYUFBOUUsRTtJQUVNM0IsY0FBQSxHLFVBQUE0QixVOzs7OzsrQkFDSkYsRyxHQUFLLGE7K0JBQ0xHLEksR0FBTSxnTTs7S0FGRixDQUF1QnpCLFNBQXZCLEU7SUFPTixJQUFJSixjQUFKLEM7SUFFTUMsZUFBQSxHLFVBQUEyQixVOzs7OztnQ0FDSkUsWSxHQUFhLENBQ1AsSUFBQTNCLFdBQUEsQ0FBWSxPQUFaLEVBQXFCLGFBQXJCLEVBQW9DLEVBQXBDLEVBQXdDLGdCQUF4QyxFQUEwRCxPQUExRCxDQURPLEM7Z0NBR2J1QixHLEdBQUssYztnQ0FDTEcsSSxHQUFNLHFFOztLQUxGLENBQXdCM0IsUUFBeEIsRTtJQVdOLElBQUlELGUiLCJzb3VyY2VSb290IjoiL2V4YW1wbGVzL2Zvcm0ifQ==