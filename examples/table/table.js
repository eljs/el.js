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
  // source: examples/table/table.coffee
  require.define('./table', function (module, exports, __dirname, __filename) {
    var ContentView, TableView, View, api, extend = function (child, parent) {
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
    api = new crowdcontrol.data.Api('http://localhost:12345');
    TableView = function (superClass) {
      extend(TableView, superClass);
      function TableView() {
        return TableView.__super__.constructor.apply(this, arguments)
      }
      TableView.prototype.tag = 'example-live-table';
      TableView.prototype.html = '<div class="{ block: true, loading: loading }">\n  <table>\n    <thead>\n      <tr>\n        <th>Seconds Since Server Started</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr each="{ model }" class="animated bounceIn">\n        <td><live-content model="{ value }"></td>\n      </tr>\n    </tbody>\n  </table>\n  <div class="loader">Loading...</div>\n</div>';
      TableView.prototype.js = function () {
        this.loading = false;
        return api.scheduleEvery(function (_this) {
          return function () {
            _this.loading = true;
            api.get('seconds').then(function (data) {
              _this.loading = false;
              _this.model = JSON.parse(data.responseText);
              return _this.update()
            });
            return _this.update()
          }
        }(this), 5000, true)
      };
      return TableView
    }(View);
    TableView.register();
    ContentView = function (superClass) {
      extend(ContentView, superClass);
      function ContentView() {
        return ContentView.__super__.constructor.apply(this, arguments)
      }
      ContentView.prototype.tag = 'live-content';
      ContentView.prototype.html = '<div class="text-center">{ model }</div>';
      ContentView.prototype.js = function () {
      };
      return ContentView
    }(View);
    ContentView.register()
  });
  require('./table')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYmxlLmNvZmZlZSJdLCJuYW1lcyI6WyJDb250ZW50VmlldyIsIlRhYmxlVmlldyIsIlZpZXciLCJhcGkiLCJleHRlbmQiLCJjaGlsZCIsInBhcmVudCIsImtleSIsImhhc1Byb3AiLCJjYWxsIiwiY3RvciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwiX19zdXBlcl9fIiwiY3Jvd2Rjb250cm9sIiwidmlldyIsImRhdGEiLCJBcGkiLCJzdXBlckNsYXNzIiwidGFnIiwiaHRtbCIsImpzIiwibG9hZGluZyIsInNjaGVkdWxlRXZlcnkiLCJfdGhpcyIsImdldCIsInRoZW4iLCJtb2RlbCIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsInVwZGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFBQSxXQUFBLEVBQUFDLFNBQUEsRUFBQUMsSUFBQSxFQUFBQyxHQUFBLEVBQUFDLE1BQUEsYUFBQUMsS0FBQSxFQUFBQyxNQUFBO0FBQUEsaUJBQUFDLEdBQUEsSUFBQUQsTUFBQTtBQUFBLGNBQUFFLE9BQUEsQ0FBQUMsSUFBQSxDQUFBSCxNQUFBLEVBQUFDLEdBQUE7QUFBQSxZQUFBRixLQUFBLENBQUFFLEdBQUEsSUFBQUQsTUFBQSxDQUFBQyxHQUFBO0FBQUE7QUFBQSxpQkFBQUcsSUFBQTtBQUFBLGVBQUFDLFdBQUEsR0FBQU4sS0FBQTtBQUFBO0FBQUEsUUFBQUssSUFBQSxDQUFBRSxTQUFBLEdBQUFOLE1BQUEsQ0FBQU0sU0FBQTtBQUFBLFFBQUFQLEtBQUEsQ0FBQU8sU0FBQSxPQUFBRixJQUFBO0FBQUEsUUFBQUwsS0FBQSxDQUFBUSxTQUFBLEdBQUFQLE1BQUEsQ0FBQU0sU0FBQTtBQUFBLGVBQUFQLEtBQUE7QUFBQSxTLDJCQUFBLEM7SUFBQUgsSUFBQSxHQUFPWSxZQUFBLENBQWFDLElBQWIsQ0FBa0JiLElBQXpCLEM7SUFFQUMsR0FBQSxHQUFVLElBQUFXLFlBQUEsQ0FBYUUsSUFBYixDQUFrQkMsR0FBbEIsQ0FBc0Isd0JBQXRCLENBQVYsQztJQUVNaEIsU0FBQSxhQUFBaUIsVUFBQTtBQUFBLE0sOEJBQUE7QUFBQSxNOztPQUFBO0FBQUEsTSxvQkFDSkMsRyxHQUFLLG9CLENBREQ7QUFBQSxNLG9CQUVKQyxJLEdBQU0sNlcsQ0FGRjtBQUFBLE0sb0JBbUJKQyxFLEdBQUk7QUFBQSxRQUNGLEtBQUNDLE9BQUQsR0FBVyxLQUFYLENBREU7QUFBQSxRLE9BR0ZuQixHQUFBLENBQUlvQixhQUFKLENBQWtCLFVBQUFDLEtBQUE7QUFBQSxVLE9BQUE7QUFBQSxZQUNoQkEsS0FBQSxDQUFDRixPQUFELEdBQVcsSUFBWCxDQURnQjtBQUFBLFlBRWhCbkIsR0FBQSxDQUFJc0IsR0FBSixDQUFRLFNBQVIsRUFBbUJDLElBQW5CLENBQXdCLFVBQUNWLElBQUQ7QUFBQSxjQUN0QlEsS0FBQSxDQUFDRixPQUFELEdBQVcsS0FBWCxDQURzQjtBQUFBLGNBRXRCRSxLQUFBLENBQUNHLEtBQUQsR0FBU0MsSUFBQSxDQUFLQyxLQUFMLENBQVdiLElBQUEsQ0FBS2MsWUFBaEIsQ0FBVCxDQUZzQjtBQUFBLGMsT0FHdEJOLEtBQUEsQ0FBQ08sTUFBRCxFQUhzQjtBQUFBLGFBQXhCLEVBRmdCO0FBQUEsWSxPQU1oQlAsS0FBQSxDQUFDTyxNQUFELEVBTmdCO0FBQUE7QUFBQSxlQUFsQixFQU9FLElBUEYsRUFPUSxJQVBSLENBSEU7QUFBQSxPLENBbkJBO0FBQUEsTSxnQkFBQTtBQUFBLE1BQWtCN0IsSUFBbEIsRTtJQStCTkQsU0FBQSxDQUFVK0IsUUFBVixHO0lBRU1oQyxXQUFBLGFBQUFrQixVQUFBO0FBQUEsTSxnQ0FBQTtBQUFBLE07O09BQUE7QUFBQSxNLHNCQUNKQyxHLEdBQUssYyxDQUREO0FBQUEsTSxzQkFFSkMsSSxHQUFNLDBDLENBRkY7QUFBQSxNLHNCQUtKQyxFLEdBQUk7QUFBQSxPLENBTEE7QUFBQSxNLGtCQUFBO0FBQUEsTUFBb0JuQixJQUFwQixFO0lBT05GLFdBQUEsQ0FBWWdDLFFBQVosRSIsInNvdXJjZVJvb3QiOiIvZXhhbXBsZXMvdGFibGUifQ==