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
    streamingPolicy = new crowdcontrol.data.TabularRestfulStreamingPolicy({ intervalTime: 10000 });
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYmxlLmNvZmZlZSJdLCJuYW1lcyI6WyJDb250ZW50VmlldyIsIlNvdXJjZSIsIlN0cmVhbWluZ1RhYmxlIiwiVGFibGVWaWV3IiwiVmlldyIsImFwaSIsInBvbGljeSIsInN0cmVhbWluZ1BvbGljeSIsImV4dGVuZCIsImNoaWxkIiwicGFyZW50Iiwia2V5IiwiaGFzUHJvcCIsImNhbGwiLCJjdG9yIiwiY29uc3RydWN0b3IiLCJwcm90b3R5cGUiLCJfX3N1cGVyX18iLCJjcm93ZGNvbnRyb2wiLCJ2aWV3IiwiZGF0YSIsIkFwaSIsIlBvbGljeSIsImludGVydmFsVGltZSIsIlRhYnVsYXJSZXN0ZnVsU3RyZWFtaW5nUG9saWN5Iiwic3VwZXJDbGFzcyIsIm5hbWUiLCJodG1sIiwianMiLCJzcmMiLCJsb2FkaW5nIiwicGF0aCIsIm9uIiwiRXZlbnRzIiwiTG9hZGluZyIsIl90aGlzIiwidXBkYXRlIiwiTG9hZERhdGEiLCJtb2RlbCIsImFuaW1hdGVPdXQiLCJzZXRUaW1lb3V0IiwiTG9hZERhdGFQYXJ0aWFsIiwiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBQUFBLFcsRUFBQUMsTSxFQUFBQyxjLEVBQUFDLFMsRUFBQUMsSSxFQUFBQyxHLEVBQUFDLE0sRUFBQUMsZSxFQUFBQyxNQUFBLGFBQUFDLEtBQUEsRUFBQUMsTUFBQTtBQUFBLGlCQUFBQyxHQUFBLElBQUFELE1BQUE7QUFBQSxjQUFBRSxPQUFBLENBQUFDLElBQUEsQ0FBQUgsTUFBQSxFQUFBQyxHQUFBO0FBQUEsWUFBQUYsS0FBQSxDQUFBRSxHQUFBLElBQUFELE1BQUEsQ0FBQUMsR0FBQTtBQUFBO0FBQUEsaUJBQUFHLElBQUE7QUFBQSxlQUFBQyxXQUFBLEdBQUFOLEtBQUE7QUFBQTtBQUFBLFFBQUFLLElBQUEsQ0FBQUUsU0FBQSxHQUFBTixNQUFBLENBQUFNLFNBQUE7QUFBQSxR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