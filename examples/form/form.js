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
      throw new Error('Enter a valid email.')
    });
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0uY29mZmVlIl0sIm5hbWVzIjpbIkVtYWlsSW5wdXRWaWV3IiwiRXhhbXBsZUZvcm1WaWV3IiwiRm9ybVZpZXciLCJJbnB1dENvbmZpZyIsIklucHV0VmlldyIsIlNvdXJjZSIsIlZpZXciLCJhcGkiLCJoZWxwZXJzIiwiZXh0ZW5kIiwiY2hpbGQiLCJwYXJlbnQiLCJrZXkiLCJoYXNQcm9wIiwiY2FsbCIsImN0b3IiLCJjb25zdHJ1Y3RvciIsInByb3RvdHlwZSIsIl9fc3VwZXJfXyIsImNyb3dkY29udHJvbCIsInZpZXciLCJkYXRhIiwiZm9ybSIsInV0aWxzIiwibG9nIiwiREVCVUciLCJBcGkiLCJyZWdpc3RlclRhZyIsImlucHV0Q2ZnIiwiaGludHMiLCJpbmRleE9mIiwicmVnaXN0ZXJWYWxpZGF0b3IiLCJtb2RlbCIsIm5hbWUiLCJyZSIsInZhbHVlIiwidHJpbSIsInRvTG93ZXJDYXNlIiwibWF0Y2giLCJFcnJvciIsInN1cGVyQ2xhc3MiLCJ0YWciLCJodG1sIiwiaW5wdXRDb25maWdzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQUEsYyxFQUFBQyxlLEVBQUFDLFEsRUFBQUMsVyxFQUFBQyxTLEVBQUFDLE0sRUFBQUMsSSxFQUFBQyxHLEVBQUFDLE8sRUFBQUMsTUFBQSxhQUFBQyxLQUFBLEVBQUFDLE1BQUE7QUFBQSxpQkFBQUMsR0FBQSxJQUFBRCxNQUFBO0FBQUEsY0FBQUUsT0FBQSxDQUFBQyxJQUFBLENBQUFILE1BQUEsRUFBQUMsR0FBQTtBQUFBLFlBQUFGLEtBQUEsQ0FBQUUsR0FBQSxJQUFBRCxNQUFBLENBQUFDLEdBQUE7QUFBQTtBQUFBLGlCQUFBRyxJQUFBO0FBQUEsZUFBQUMsV0FBQSxHQUFBTixLQUFBO0FBQUE7QUFBQSxRQUFBSyxJQUFBLENBQUFFLFNBQUEsR0FBQU4sTUFBQSxDQUFBTSxTQUFBO0FBQUEsUUFBQVAsS0FBQSxDQUFBTyxTQUFBLE9BQUFGLElBQUE7QUFBQSxRQUFBTCxLQUFBLENBQUFRLFNBQUEsR0FBQVAsTUFBQSxDQUFBTSxTQUFBO0FBQUEsZUFBQVAsS0FBQTtBQUFBLE87SUFBQUosSUFBQSxHQUFPYSxZQUFBLENBQWFDLElBQWIsQ0FBa0JkLElBQXpCLEM7SUFDQUQsTUFBQSxHQUFTYyxZQUFBLENBQWFFLElBQWIsQ0FBa0JoQixNQUEzQixDO0lBRUFHLE9BQUEsR0FBVVcsWUFBQSxDQUFhQyxJQUFiLENBQWtCRSxJQUFsQixDQUF1QmQsT0FBakMsQztJQUNBTixRQUFBLEdBQVdpQixZQUFBLENBQWFDLElBQWIsQ0FBa0JFLElBQWxCLENBQXVCcEIsUUFBbEMsQztJQUNBRSxTQUFBLEdBQVllLFlBQUEsQ0FBYUMsSUFBYixDQUFrQkUsSUFBbEIsQ0FBdUJsQixTQUFuQyxDO0lBQ0FELFdBQUEsR0FBY2dCLFlBQUEsQ0FBYUMsSUFBYixDQUFrQkUsSUFBbEIsQ0FBdUJuQixXQUFyQyxDO0lBRUFnQixZQUFBLENBQWFJLEtBQWIsQ0FBbUJDLEdBQW5CLENBQXVCQyxLQUF2QixHQUErQixJQUEvQixDO0lBRUFsQixHQUFBLEdBQVUsSUFBQVksWUFBQSxDQUFhRSxJQUFiLENBQWtCSyxHQUFsQixDQUFzQix3QkFBdEIsQ0FBVixDO0lBRUFsQixPQUFBLENBQVFtQixXQUFSLENBQXFCLFVBQUNDLFFBQUQ7QUFBQSxNQUFhLE9BQU9BLFFBQUEsQ0FBU0MsS0FBVCxDQUFlQyxPQUFmLENBQXVCLE9BQXZCLEtBQW1DLENBQXZEO0FBQUEsS0FBckIsRUFBZ0YsYUFBaEYsRTtJQUNBdEIsT0FBQSxDQUFRdUIsaUJBQVIsQ0FBMkIsVUFBQ0gsUUFBRDtBQUFBLE1BQWMsT0FBT0EsUUFBQSxDQUFTQyxLQUFULENBQWVDLE9BQWYsQ0FBdUIsT0FBdkIsS0FBbUMsQ0FBeEQ7QUFBQSxLQUEzQixFQUF1RixVQUFDRSxLQUFELEVBQVFDLElBQVI7QUFBQSxNQUNyRixJQUFBQyxFQUFBLEVBQUFDLEtBQUEsQ0FEcUY7QUFBQSxNQUNyRkEsS0FBQSxHQUFRSCxLQUFBLENBQU1DLElBQU4sRUFBWUcsSUFBWixHQUFtQkMsV0FBbkIsRUFBUixDQURxRjtBQUFBLE1BRXJGSCxFQUFBLEdBQUsseUlBQUwsQ0FGcUY7QUFBQSxNLElBR2xGQyxLQUFBLENBQU1HLEtBQU4sQ0FBWUosRUFBWixDO1FBQ0QsT0FBT0MsSztPQUo0RTtBQUFBLE1BS3JGLE1BQVUsSUFBQUksS0FBQSxDQUFNLHNCQUFOLENBTDJFO0FBQUEsS0FBdkYsRTtJQU9NdkMsY0FBQSxHLFVBQUF3QyxVOzs7OzsrQkFDSkMsRyxHQUFLLGE7K0JBQ0xDLEksR0FBTSxnTTs7S0FGRixDQUF1QnRDLFNBQXZCLEU7SUFPTixJQUFJSixjQUFKLEM7SUFFTUMsZUFBQSxHLFVBQUF1QyxVOzs7OztnQ0FDSkcsWSxHQUFhLENBQ1AsSUFBQXhDLFdBQUEsQ0FBWSxPQUFaLEVBQXFCLGFBQXJCLEVBQW9DLEVBQXBDLEVBQXdDLGdCQUF4QyxFQUEwRCxPQUExRCxDQURPLEM7Z0NBR2JzQyxHLEdBQUssYztnQ0FDTEMsSSxHQUFNLHFFOztLQUxGLENBQXdCeEMsUUFBeEIsRTtJQVdOLElBQUlELGUiLCJzb3VyY2VSb290IjoiL2V4YW1wbGVzL2Zvcm0ifQ==