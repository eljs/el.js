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
    new ContentView;
    StreamingTable = function (superClass) {
      extend(StreamingTable, superClass);
      function StreamingTable() {
        return StreamingTable.__super__.constructor.apply(this, arguments)
      }
      StreamingTable.prototype.name = 'streaming-table';
      StreamingTable.prototype.html = '<div class="{ block: true, loading: loading }">\n  <table>\n    <thead>\n      <tr>\n        <th>Polygons in Random Order</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr each="{ model }" if="{ value != null }" class="animated flipInX">\n        <td><live-content model="{ value }"></td>\n      </tr>\n      <tr></tr>\n    </tbody>\n  </table>\n  <div class="loader">Loading...</div>\n</div>';
      StreamingTable.prototype.js = function () {
        var src;
        this.loading = false;
        src = new Source({
          name: 'table2',
          api: api,
          path: 'polygon',
          policy: streamingPolicy
        });
        src.on(Source.Events.Loading, function (_this) {
          return function () {
            _this.loading = true;
            _this.model = [];
            return _this.update()
          }
        }(this));
        src.on(Source.Events.LoadDataPartial, function (_this) {
          return function (data) {
            _this.update();
            _this.model = data;
            return console.log(_this.model)
          }
        }(this));
        return src.on(Source.Events.LoadData, function (_this) {
          return function (data) {
            _this.loading = false;
            _this.model = data;
            console.log(_this.model);
            return _this.update()
          }
        }(this))
      };
      return StreamingTable
    }(View);
    new StreamingTable
  });
  require('./table')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYmxlLmNvZmZlZSJdLCJuYW1lcyI6WyJDb250ZW50VmlldyIsIlNvdXJjZSIsIlN0cmVhbWluZ1RhYmxlIiwiVGFibGVWaWV3IiwiVmlldyIsImFwaSIsInBvbGljeSIsInN0cmVhbWluZ1BvbGljeSIsImV4dGVuZCIsImNoaWxkIiwicGFyZW50Iiwia2V5IiwiaGFzUHJvcCIsImNhbGwiLCJjdG9yIiwiY29uc3RydWN0b3IiLCJwcm90b3R5cGUiLCJfX3N1cGVyX18iLCJjcm93ZGNvbnRyb2wiLCJ2aWV3IiwiZGF0YSIsIkFwaSIsIlBvbGljeSIsImludGVydmFsVGltZSIsIlRhYnVsYXJSZXN0ZnVsU3RyZWFtaW5nUG9saWN5Iiwic3VwZXJDbGFzcyIsIm5hbWUiLCJodG1sIiwianMiLCJzcmMiLCJsb2FkaW5nIiwicGF0aCIsIm9uIiwiRXZlbnRzIiwiTG9hZGluZyIsIl90aGlzIiwidXBkYXRlIiwiTG9hZERhdGEiLCJtb2RlbCIsIkxvYWREYXRhUGFydGlhbCIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUFBQSxXLEVBQUFDLE0sRUFBQUMsYyxFQUFBQyxTLEVBQUFDLEksRUFBQUMsRyxFQUFBQyxNLEVBQUFDLGUsRUFBQUMsTUFBQSxhQUFBQyxLQUFBLEVBQUFDLE1BQUE7QUFBQSxpQkFBQUMsR0FBQSxJQUFBRCxNQUFBO0FBQUEsY0FBQUUsT0FBQSxDQUFBQyxJQUFBLENBQUFILE1BQUEsRUFBQUMsR0FBQTtBQUFBLFlBQUFGLEtBQUEsQ0FBQUUsR0FBQSxJQUFBRCxNQUFBLENBQUFDLEdBQUE7QUFBQTtBQUFBLGlCQUFBRyxJQUFBO0FBQUEsZUFBQUMsV0FBQSxHQUFBTixLQUFBO0FBQUE7QUFBQSxRQUFBSyxJQUFBLENBQUFFLFNBQUEsR0FBQU4sTUFBQSxDQUFBTSxTQUFBO0FBQUEsUUFBQVAsS0FBQSxDQUFBTyxTQUFBLE9BQUFG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