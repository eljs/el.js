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
  // source: examples/form/form.coffee
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm0uY29mZmVlIl0sIm5hbWVzIjpbIkJhc2ljSW5wdXRWaWV3IiwiRW1haWxJbnB1dFZpZXciLCJFeGFtcGxlRm9ybVZpZXciLCJGb3JtVmlldyIsIklucHV0Q29uZmlnIiwiSW5wdXRWaWV3IiwiU291cmNlIiwiVmlldyIsImFwaSIsImhlbHBlcnMiLCJleHRlbmQiLCJjaGlsZCIsInBhcmVudCIsImtleSIsImhhc1Byb3AiLCJjYWxsIiwiY3RvciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwiX19zdXBlcl9fIiwiY3Jvd2Rjb250cm9sIiwidmlldyIsImRhdGEiLCJmb3JtIiwidXRpbHMiLCJsb2ciLCJERUJVRyIsIkFwaSIsImRlZmF1bHRUYWdOYW1lIiwicmVnaXN0ZXJUYWciLCJpbnB1dENmZyIsImhpbnRzIiwicmVnaXN0ZXJWYWxpZGF0b3IiLCJtb2RlbCIsIm5hbWUiLCJyZSIsInZhbHVlIiwiRXJyb3IiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJtYXRjaCIsImxlbmd0aCIsImdldCIsInRoZW4iLCJyZXMiLCJzdGF0dXMiLCJzdXBlckNsYXNzIiwidGFnIiwiaHRtbCIsInJlZ2lzdGVyIiwiaW5wdXRDb25maWdzIiwiYmFzaWMiLCJleGFtcGxlIiwibmVzdGVkIiwic3RydWN0dXJlIiwiX3N1Ym1pdCIsImV2ZW50IiwiY29uc29sZSIsImFsZXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFBQSxjQUFBLEVBQUFDLGNBQUEsRUFBQUMsZUFBQSxFQUFBQyxRQUFBLEVBQUFDLFdBQUEsRUFBQUMsU0FBQSxFQUFBQyxNQUFBLEVBQUFDLElBQUEsRUFBQUMsR0FBQSxFQUFBQyxPQUFBLEVBQUFDLE1BQUEsYUFBQUMsS0FBQSxFQUFBQyxNQUFBO0FBQUEsaUJBQUFDLEdBQUEsSUFBQUQsTUFBQTtBQUFBLGNBQUFFLE9BQUEsQ0FBQUMsSUFBQSxDQUFB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Q3BDLElBQUdBLEdBQUEsQ0FBSUMsTUFBSixLQUFjLEdBQWpCO0FBQUEsWUFDRSxNQUFVLElBQUFSLEtBQUEsQ0FBTSxzQkFBTixDQURaO0FBQUEsV0FEb0M7QUFBQSxVQUdwQyxPQUFPRCxLQUg2QjtBQUFBLFNBQS9CLEVBSUw7QUFBQSxVQUNBLE9BQU9BLEtBRFA7QUFBQSxTQUpLLENBRFQ7QUFBQSxPQUZ3RTtBQUFBLE1BU3hFLE1BQVUsSUFBQUMsS0FBQSxDQUFNLHVCQUFOLENBVDhEO0FBQUEsS0FBMUUsRTtJQVlNckMsY0FBQSxhQUFBOEMsVUFBQTtBQUFBLE0sbUNBQUE7QUFBQSxNOztPQUFBO0FBQUEsTSx5QkFDSkMsRyxHQUFLLGEsQ0FERDtBQUFBLE0seUJBRUpDLEksR0FBTSxtTyxDQUZGO0FBQUEsTSxxQkFBQTtBQUFBLE1BQXVCM0MsU0FBdkIsRTtJQU1OTCxjQUFBLENBQWVpRCxRQUFmLEc7SUFFTWhELGNBQUEsYUFBQTZDLFVBQUE7QUFBQSxNLG1DQUFBO0FBQUEsTTs7T0FBQTtBQUFBLE0seUJBQ0pDLEcsR0FBSyxhLENBREQ7QUFBQSxNLHFCQUFBO0FBQUEsTUFBdUIvQyxjQUF2QixFO0lBR05DLGNBQUEsQ0FBZWdELFFBQWYsRztJQUVNL0MsZUFBQSxhQUFBNEMsVUFBQTtBQUFBLE0sb0NBQUE7QUFBQSxNOztPQUFBO0FBQUEsTSwwQkFDSkksWSxHQUFhO0FBQUEsUUFDUCxJQUFBOUMsV0FBQSxDQUFZLE9BQVosRUFBcUIsRUFBckIsRUFBeUIsNkJBQXpCLEVBQXdELGlCQUF4RCxDQURPO0FBQUEsUUFFUCxJQUFBQSxXQUFBLENBQVksT0FBWixFQUFxQixFQUFyQixFQUF5QiwyQkFBekIsQ0FGTztBQUFBLFFBR1AsSUFBQUEsV0FBQSxDQUFZLDRCQUFaLEVBQTBDLEVBQTFDLEVBQThDLHVCQUE5QyxDQUhPO0FBQUEsTyxDQURUO0FBQUEsTSwwQkFNSjZCLEssR0FDRTtBQUFBLFFBQUFrQixLQUFBLEVBQU8sb0JBQVA7QUFBQSxRQUNBQyxPQUFBLEVBQ0U7QUFBQSxVQUFBQyxNQUFBLEVBQ0U7QUFBQSxZQUFBQyxTQUFBLEVBQ0U7QUFBQSxjQUFDLGdCQUFEO0FBQUEsY0FBbUIseUJBQW5CO0FBQUEsYUFERjtBQUFBLFdBREY7QUFBQSxTQUZGO0FBQUEsTyxDQVBFO0FBQUEsTSwwQkFZSlAsRyxHQUFLLGMsQ0FaRDtBQUFBLE0sMEJBYUpDLEksR0FBTSwwUCxDQWJGO0FBQUEsTSwwQkFxQkpPLE8sR0FBUyxVQUFDQyxLQUFEO0FBQUEsUUFDUEMsT0FBQSxDQUFRaEMsR0FBUixDQUFZLEtBQUNRLEtBQWIsRUFETztBQUFBLFEsT0FFUHlCLEtBQUEsQ0FBTSxVQUFOLENBRk87QUFBQSxPLENBckJMO0FBQUEsTSxzQkFBQTtBQUFBLE1BQXdCdkQsUUFBeEIsRTtJQXlCTkQsZUFBQSxDQUFnQitDLFFBQWhCLEUiLCJzb3VyY2VSb290IjoiL2V4YW1wbGVzL2Zvcm0ifQ==