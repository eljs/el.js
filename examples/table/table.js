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
    var ContentView, Source, StreamingTable, TableView, View, api, policy, streamingPolicy, extend = function (child, parent) {
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
    policy = new crowdcontrol.data.Policy({ intervalTime: 5000 });
    streamingPolicy = new crowdcontrol.data.TabularRestfulStreamingPolicy({ intervalTime: 20000 });
    TableView = function (superClass) {
      extend(TableView, superClass);
      function TableView() {
        return TableView.__super__.constructor.apply(this, arguments)
      }
      TableView.prototype.tag = 'example-live-table';
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
            _this.loading = true;
            return _this.update()
          }
        }(this));
        return src.on(Source.Events.LoadData, function (_this) {
          return function (data) {
            _this.loading = false;
            _this.model = data;
            return _this.update()
          }
        }(this))
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
    ContentView.register();
    StreamingTable = function (superClass) {
      extend(StreamingTable, superClass);
      function StreamingTable() {
        return StreamingTable.__super__.constructor.apply(this, arguments)
      }
      StreamingTable.prototype.tag = 'example-streaming-table';
      StreamingTable.prototype.html = '<div class="{ block: true, loading: loading }">\n  <table>\n    <thead>\n      <tr>\n        <th>Polygons in Random Order</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr each="{ model }" if="{ value != null }" class="{ animated: true, flipInX: !this.parent.animateOut, flipOutX: this.parent.animateOut }">\n        <td><live-content model="{ value }"></td>\n      </tr>\n      <tr></tr>\n    </tbody>\n  </table>\n  <div class="loader">Loading...</div>\n</div>';
      StreamingTable.prototype.js = function () {
        var src;
        this.loading = false;
        this.animateOut = false;
        src = new Source({
          name: 'table2',
          api: api,
          path: 'polygon',
          policy: streamingPolicy
        });
        src.on(Source.Events.Loading, function (_this) {
          return function () {
            _this.loading = true;
            _this.animateOut = true;
            _this.update();
            return setTimeout(function () {
              _this.animateOut = false;
              _this.model = [];
              return _this.update()
            }, 500)
          }
        }(this));
        src.on(Source.Events.LoadDataPartial, function (_this) {
          return function (data) {
            _this.update();
            return _this.model = data
          }
        }(this));
        return src.on(Source.Events.LoadData, function (_this) {
          return function (data) {
            _this.loading = false;
            _this.model = data;
            return _this.update()
          }
        }(this))
      };
      return StreamingTable
    }(View);
    StreamingTable.register()
  });
  require('./table')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYmxlLmNvZmZlZSJdLCJuYW1lcyI6WyJDb250ZW50VmlldyIsIlNvdXJjZSIsIlN0cmVhbWluZ1RhYmxlIiwiVGFibGVWaWV3IiwiVmlldyIsImFwaSIsInBvbGljeSIsInN0cmVhbWluZ1BvbGljeSIsImV4dGVuZCIsImNoaWxkIiwicGFyZW50Iiwia2V5IiwiaGFzUHJvcCIsImNhbGwiLCJjdG9yIiwiY29uc3RydWN0b3IiLCJwcm90b3R5cGUiLCJfX3N1cGVyX18iLCJjcm93ZGNvbnRyb2wiLCJ2aWV3IiwiZGF0YSIsIkFwaSIsIlBvbGljeSIsImludGVydmFsVGltZSIsIlRhYnVsYXJSZXN0ZnVsU3RyZWFtaW5nUG9saWN5Iiwic3VwZXJDbGFzcyIsInRhZyIsImh0bWwiLCJqcyIsInNyYyIsImxvYWRpbmciLCJuYW1lIiwicGF0aCIsIm9uIiwiRXZlbnRzIiwiTG9hZGluZyIsIl90aGlzIiwidXBkYXRlIiwiTG9hZERhdGEiLCJtb2RlbCIsInJlZ2lzdGVyIiwiYW5pbWF0ZU91dCIsInNldFRpbWVvdXQiLCJMb2FkRGF0YVBhcnRpYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUFBQSxXLEVBQUFDLE0sRUFBQUMsYyxFQUFBQyxTLEVBQUFDLEksRUFBQUMsRyxFQUFBQyxNLEVBQUFDLGUsRUFBQUMsTUFBQSxhQUFBQyxLQUFBLEVBQUFDLE1BQUE7QUFBQSxpQkFBQUMsR0FBQSxJQUFBRCxNQUFBO0FBQUEsY0FBQUUsT0FBQSxDQUFBQyxJQUFBLENBQUFILE1BQUEsRUFBQUMsR0FBQTtBQUFBLFlBQUFGLEtBQUEsQ0FBQUUsR0FBQSxJQUFBRCxNQUFBLENBQUFDLEdBQUE7QUFBQTtBQUFBLGlCQUFBRyxJQUFBO0FBQUEsZUFBQUMsV0FBQSxHQUFBTixLQUFBO0FBQUE7QUFBQSxRQUFBSyxJQUFBLENBQUFFLFNBQUEsR0FBQU4sTUFBQSxDQUFBTSxTQUFBO0FBQUEs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