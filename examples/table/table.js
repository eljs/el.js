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
  // source: /Users/dtai/work/verus/crowdcontrol/examples/table/table.coffee
  require.define('./table', function (module, exports, __dirname, __filename) {
    var ContentView, Source, TableView, View, api, policy, extend = function (child, parent) {
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
    api = new crowdcontrol.data.Api('http://localhost:12345');
    policy = new crowdcontrol.data.Policy({ intervalTime: 3000 });
    TableView = function (superClass) {
      extend(TableView, superClass);
      function TableView() {
        return TableView.__super__.constructor.apply(this, arguments)
      }
      TableView.prototype.name = 'live-table';
      TableView.prototype.html = '<div class="{ block: true, loading: loading }">\n  <table>\n    <thead>\n      <tr>\n        <th>Seconds Since Server Started</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr each="{ model }" class="animated bounceIn">\n        <td><live-content model="{ value }"></td>\n      </tr>\n    </tbody>\n  </table>\n  <div class="loader">Loading...</div>\n</div>';
      TableView.prototype.js = function () {
        var src;
        this.loading = false;
        src = new Source({
          name: 'table',
          api: api,
          path: 'seconds',
          policy: policy
        });
        src.on(Source.Events.Loading, function (_this) {
          return function () {
            return _this.update()
          }
        }(this));
        return src.on(Source.Events.LoadData, function (_this) {
          return function (res) {
            _this.loading = false;
            setTimeout(function () {
              _this.loading = true;
              return _this.update()
            }, 1000);
            _this.model = res;
            return _this.update()
          }
        }(this))
      };
      return TableView
    }(View);
    new TableView;
    ContentView = function (superClass) {
      extend(ContentView, superClass);
      function ContentView() {
        return ContentView.__super__.constructor.apply(this, arguments)
      }
      ContentView.prototype.name = 'live-content';
      ContentView.prototype.html = '<div class="text-center">{ model }</div>';
      ContentView.prototype.js = function () {
      };
      return ContentView
    }(View);
    new ContentView
  });
  require('./table')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYmxlLmNvZmZlZSJdLCJuYW1lcyI6WyJDb250ZW50VmlldyIsIlNvdXJjZSIsIlRhYmxlVmlldyIsIlZpZXciLCJhcGkiLCJwb2xpY3kiLCJleHRlbmQiLCJjaGlsZCIsInBhcmVudCIsImtleSIsImhhc1Byb3AiLCJjYWxsIiwiY3RvciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwiX19zdXBlcl9fIiwiY3Jvd2Rjb250cm9sIiwidmlldyIsImRhdGEiLCJBcGkiLCJQb2xpY3kiLCJpbnRlcnZhbFRpbWUiLCJzdXBlckNsYXNzIiwibmFtZSIsImh0bWwiLCJqcyIsInNyYyIsImxvYWRpbmciLCJwYXRoIiwib24iLCJFdmVudHMiLCJMb2FkaW5nIiwiX3RoaXMiLCJ1cGRhdGUiLCJMb2FkRGF0YSIsInJlcyIsInNldFRpbWVvdXQiLCJtb2RlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBQUFBLFcsRUFBQUMsTSxFQUFBQyxTLEVBQUFDLEksRUFBQUMsRyxFQUFBQyxNLEVBQUFDLE1BQUEsYUFBQUMsS0FBQSxFQUFBQyxNQUFBO0FBQUEsaUJBQUFDLEdBQUEsSUFBQUQsTUFBQTtBQUFBLGNBQUFFLE9BQUEsQ0FBQUMsSUFBQSxDQUFBSCxNQUFBLEVBQUFDLEdBQUE7QUFBQSxZQUFBRixLQUFBLENBQUFFLEdBQUEsSUFBQUQsTUFBQSxDQUFBQyxHQUFBO0FBQUE7QUFBQSxpQkFBQUcsSUFBQTtBQUFBLGVBQUFDLFdBQUEsR0FBQU4sS0FBQTtBQUFBO0FBQUEsUUFBQUssSUFBQSxDQUFBRSxTQUFBLEdBQUFOLE1BQUEsQ0FBQU0sU0FBQTtBQUFBLFFBQUFQLEtBQUEsQ0FBQU8sU0FBQSxPQUFBRixJQUFBO0FBQUEsUUFBQUwsS0FBQSxDQUFBUSxTQUFBLEdBQUFQLE1BQUEsQ0FBQU0sU0FBQTtBQUFBLGVBQUFQLEtBQUE7QUFBQSxPO0lBQUFKLElBQUEsR0FBT2EsWUFBQSxDQUFhQyxJQUFiLENBQWtCZCxJQUF6QixDO0lBQ0FGLE1BQUEsR0FBU2UsWUFBQSxDQUFhRSxJQUFiLENBQWtCakIsTUFBM0IsQztJQUVBRyxHQUFBLEdBQVUsSUFBQVksWUFBQSxDQUFhRSxJQUFiLENBQWtCQyxHQUFsQixDQUFzQix3QkFBdEIsQ0FBVixDO0lBQ0FkLE1BQUEsR0FBYSxJQUFBVyxZQUFBLENBQWFFLElBQWIsQ0FBa0JFLE1BQWxCLENBQXlCLEVBQUFDLFlBQUEsRUFBYyxJQUFkLEVBQXpCLENBQWIsQztJQUVNbkIsU0FBQSxHLFVBQUFvQixVOzs7OzswQkFDSkMsSSxHQUFNLFk7MEJBQ05DLEksR0FBTSw2VzswQkFpQk5DLEUsR0FBSTtBQUFBLFFBQ0YsSUFBQUMsR0FBQSxDQURFO0FBQUEsUUFDRixLQUFDQyxPQUFELEdBQVcsS0FBWCxDQURFO0FBQUEsUUFHRkQsR0FBQSxHQUFVLElBQUF6QixNQUFBLENBQ1I7QUFBQSxVQUFBc0IsSUFBQSxFQUFNLE9BQU47QUFBQSxVQUNBbkIsR0FBQSxFQUFLQSxHQURMO0FBQUEsVUFFQXdCLElBQUEsRUFBTSxTQUZOO0FBQUEsVUFHQXZCLE1BQUEsRUFBUUEsTUFIUjtBQUFBLFNBRFEsQ0FBVixDQUhFO0FBQUEsUUFTRnFCLEdBQUEsQ0FBSUcsRUFBSixDQUFPNUIsTUFBQSxDQUFPNkIsTUFBUCxDQUFjQyxPQUFyQixFQUE4QixVQUFBQyxLQUFBO0FBQUEsVSxPQUFBO0FBQUEsWSxPQUM1QkEsS0FBQSxDQUFDQyxNQUFELEVBRDRCO0FBQUE7QUFBQSxlQUE5QixFQVRFO0FBQUEsUSxPQVlGUCxHQUFBLENBQUlHLEVBQUosQ0FBTzVCLE1BQUEsQ0FBTzZCLE1BQVAsQ0FBY0ksUUFBckIsRUFBK0IsVUFBQUYsS0FBQTtBQUFBLFUsT0FBQSxVQUFDRyxHQUFEO0FBQUEsWUFDN0JILEtBQUEsQ0FBQ0wsT0FBRCxHQUFXLEtBQVgsQ0FENkI7QUFBQSxZQUc3QlMsVUFBQSxDQUFXO0FBQUEsY0FDVEosS0FBQSxDQUFDTCxPQUFELEdBQVcsSUFBWCxDQURTO0FBQUEsYyxPQUVUSyxLQUFBLENBQUNDLE1BQUQsRUFGUztBQUFBLGFBQVgsRUFHRSxJQUhGLEVBSDZCO0FBQUEsWUFPN0JELEtBQUEsQ0FBQ0ssS0FBRCxHQUFTRixHQUFULENBUDZCO0FBQUEsWSxPQVE3QkgsS0FBQSxDQUFDQyxNQUFELEVBUjZCO0FBQUE7QUFBQSxlQUEvQixDQVpFO0FBQUEsTzs7S0FuQkEsQ0FBa0I5QixJQUFsQixFO0lBeUNGLElBQUFELFNBQUEsQztJQUVFRixXQUFBLEcsVUFBQXNCLFU7Ozs7OzRCQUNKQyxJLEdBQU0sYzs0QkFDTkMsSSxHQUFNLDBDOzRCQUdOQyxFLEdBQUk7QUFBQSxPOztLQUxBLENBQW9CdEIsSUFBcEIsRTtJQU9OLElBQUlILFciLCJzb3VyY2VSb290IjoiL2V4YW1wbGVzL3RhYmxlIn0=